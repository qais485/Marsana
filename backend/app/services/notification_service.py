import html
import logging
import re
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.database_models import NotificationLog, NotificationTemplate, UserNotification, UserAccountSetting
from app.repositories.notification_repository import NotificationLogRepository, NotificationTemplateRepository
from app.repositories.profile_repository import NotificationRepository
from app.utils.email import send_email, EmailSendError

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_repo = NotificationRepository(db)
        self.template_repo = NotificationTemplateRepository(db)
        self.log_repo = NotificationLogRepository(db)

    # ─── Template Management ──────────────────────────────────────

    def get_templates(
        self,
        page: int = 1,
        limit: int = 20,
        notification_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> dict:
        templates, total = self.template_repo.get_all(page, limit, notification_type, is_active)
        return {
            "templates": [self._serialize_template(t) for t in templates],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_template(self, template_id: UUID) -> dict:
        template = self.template_repo.get_by_id(template_id)
        if not template:
            raise ValueError("Template not found")
        return self._serialize_template(template)

    def create_template(self, data: dict) -> dict:
        existing = self.template_repo.get_by_slug(data["slug"])
        if existing:
            raise ValueError("A template with this slug already exists")

        template = NotificationTemplate(
            id=uuid4(),
            name=data["name"],
            slug=data["slug"],
            description=data.get("description"),
            subject=data["subject"],
            title_template=data["title_template"],
            message_template=data["message_template"],
            notification_type=data["notification_type"],
            channel=data.get("channel", "all"),
            is_active=data.get("is_active", True),
            send_email=data.get("send_email", True),
            send_push=data.get("send_push", True),
            send_in_app=data.get("send_in_app", True),
        )
        created = self.template_repo.create(template)
        return self._serialize_template(created)

    def update_template(self, template_id: UUID, data: dict) -> dict:
        template = self.template_repo.get_by_id(template_id)
        if not template:
            raise ValueError("Template not found")
        updated = self.template_repo.update(template, data)
        return self._serialize_template(updated)

    def delete_template(self, template_id: UUID) -> dict:
        template = self.template_repo.get_by_id(template_id)
        if not template:
            raise ValueError("Template not found")
        self.template_repo.delete(template)
        return {"deleted": True}

    def toggle_template(self, template_id: UUID) -> dict:
        template = self.template_repo.get_by_id(template_id)
        if not template:
            raise ValueError("Template not found")
        updated = self.template_repo.update(template, {"is_active": not template.is_active})
        return self._serialize_template(updated)

    # ─── Notification Management ──────────────────────────────────

    def get_admin_notifications(
        self,
        page: int = 1,
        limit: int = 20,
        notification_type: Optional[str] = None,
        is_read: Optional[bool] = None,
    ) -> dict:
        notifications, total = self.notification_repo.get_all_admin(page, limit, notification_type, is_read)
        return {
            "notifications": [self._serialize_notification(n) for n in notifications],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_notification_stats(self) -> dict:
        in_app_stats = self.notification_repo.get_stats()
        log_stats = self.log_repo.get_stats()
        return {
            "in_app": in_app_stats,
            "logs": log_stats,
        }

    def create_notification(self, data: dict, admin_id: Optional[UUID] = None) -> dict:
        user_id = data.get("user_id")
        title = data["title"]
        message = data["message"]
        notification_type = data["notification_type"]

        results = {"in_app": False, "email": False, "push": False}

        if data.get("send_in_app", True) and user_id:
            self._create_in_app_notification(user_id, title, message, notification_type)
            results["in_app"] = True

        if data.get("send_email") and user_id:
            results["email"] = self._send_email_to_user(user_id, title, message)

        if data.get("send_push") and user_id:
            self._create_in_app_notification(user_id, f"[Push] {title}", message, "system")
            results["push"] = True

        return {"results": results}

    def broadcast_notification(self, data: dict) -> dict:
        target = data.get("target", "all")
        title = data["title"]
        message = data["message"]
        notification_type = data["notification_type"]

        if target == "active":
            user_ids = self.notification_repo.get_active_user_ids()
        elif target == "inactive":
            user_ids = self.notification_repo.get_inactive_user_ids()
        else:
            user_ids = self.notification_repo.get_all_user_ids()

        count = 0
        email_count = 0
        for user_id in user_ids:
            if data.get("send_in_app", True):
                notification = UserNotification(
                    id=uuid4(),
                    user_id=user_id,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                )
                self.db.add(notification)
                count += 1

            if data.get("send_email"):
                if self._send_email_to_user(user_id, title, message):
                    email_count += 1

        if count > 0:
            try:
                self.db.commit()
            except Exception:
                self.db.rollback()
                logger.exception("Failed to commit broadcast notifications")

        return {
            "total_users": len(user_ids),
            "in_app_sent": count,
            "email_sent": email_count,
        }

    def delete_notification(self, notification_id: UUID) -> dict:
        notification = self.notification_repo.get_by_id_admin(notification_id)
        if not notification:
            raise ValueError("Notification not found")
        self.notification_repo.delete(notification)
        return {"deleted": True}

    # ─── Event Dispatcher (reusable) ──────────────────────────────

    def dispatch(self, event_type: str, context: dict, user_id: Optional[UUID] = None) -> None:
        template = self.template_repo.get_by_slug(event_type)
        if not template or not template.is_active:
            return

        title = self._interpolate_template(template.title_template, context)
        message = self._interpolate_template(template.message_template, context)
        subject = self._interpolate_template(template.subject, context)
        notification_type = template.notification_type

        if user_id is None:
            user_id = context.get("user_id")
        if user_id is None:
            return

        preferences = self._get_user_preferences(user_id)

        if template.send_in_app and preferences.get("in_app_enabled", True):
            self._create_in_app_notification(user_id, title, message, notification_type)

        if template.send_email and preferences.get("email_enabled", True):
            self._send_email_notification(user_id, subject, message, template_id=template.id)

        if template.send_push and preferences.get("push_enabled", True):
            self._create_in_app_notification(user_id, f"[Push] {title}", message, "system")

    def _interpolate_template(self, template_str: str, context: dict) -> str:
        def replacer(match):
            key = match.group(1).strip()
            return str(context.get(key, f"{{{key}}}"))
        return re.sub(r"\{\{(\w+)\}\}", replacer, template_str)

    def _get_user_preferences(self, user_id: UUID) -> dict:
        settings = (
            self.db.query(UserAccountSetting)
            .filter(UserAccountSetting.user_id == user_id)
            .first()
        )
        if not settings:
            return {
                "email_enabled": True,
                "push_enabled": True,
                "in_app_enabled": True,
            }
        return {
            "email_enabled": settings.email_notifications,
            "push_enabled": True,
            "in_app_enabled": True,
        }

    def _create_in_app_notification(
        self,
        user_id: UUID,
        title: str,
        message: str,
        notification_type: str,
    ) -> UserNotification:
        notification = UserNotification(
            id=uuid4(),
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
        )
        created = self.notification_repo.create(notification)

        self.log_repo.create(
            NotificationLog(
                id=uuid4(),
                user_id=user_id,
                channel="in_app",
                title=title,
                message=message,
                status="sent",
            )
        )
        return created

    def _send_email_to_user(self, user_id: UUID, subject: str, message: str) -> bool:
        from app.repositories.user_repository import UserRepository
        user_repo = UserRepository(self.db)
        user = user_repo.get_by_id(user_id)
        if not user or not user.email:
            return False
        return self._send_email_notification(user_id, subject, message, to_email=user.email)

    def _send_email_notification(
        self,
        user_id: UUID,
        subject: str,
        message: str,
        to_email: Optional[str] = None,
        template_id: Optional[UUID] = None,
    ) -> bool:
        if to_email is None:
            from app.repositories.user_repository import UserRepository
            user_repo = UserRepository(self.db)
            user = user_repo.get_by_id(user_id)
            if not user or not user.email:
                self.log_repo.create(
                    NotificationLog(
                        id=uuid4(),
                        user_id=user_id,
                        template_id=template_id,
                        channel="email",
                        title=subject,
                        message=message,
                        status="failed",
                        error_message="User email not found",
                    )
                )
                return False
            to_email = user.email

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h1 style="color: #333;">E-Commerce</h1>
            </div>
            <div style="padding: 20px;">
                <h2>{html.escape(subject)}</h2>
                <p>{html.escape(message)}</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                <p>This is an automated notification from E-Commerce.</p>
            </div>
        </body>
        </html>
        """
        try:
            send_email(to_email, subject, html_content)
            self.log_repo.create(
                NotificationLog(
                    id=uuid4(),
                    user_id=user_id,
                    template_id=template_id,
                    channel="email",
                    title=subject,
                    message=message,
                    status="sent",
                )
            )
            return True
        except EmailSendError as e:
            logger.error("Failed to send email to %s: %s", to_email, e)
            self.log_repo.create(
                NotificationLog(
                    id=uuid4(),
                    user_id=user_id,
                    template_id=template_id,
                    channel="email",
                    title=subject,
                    message=message,
                    status="failed",
                    error_message=str(e),
                )
            )
            return False

    # ─── Serialization Helpers ────────────────────────────────────

    def _serialize_template(self, template: NotificationTemplate) -> dict:
        return {
            "id": str(template.id),
            "name": template.name,
            "slug": template.slug,
            "description": template.description,
            "subject": template.subject,
            "title_template": template.title_template,
            "message_template": template.message_template,
            "notification_type": template.notification_type,
            "channel": template.channel,
            "is_active": template.is_active,
            "send_email": template.send_email,
            "send_push": template.send_push,
            "send_in_app": template.send_in_app,
            "created_at": template.created_at.isoformat() if template.created_at else None,
            "updated_at": template.updated_at.isoformat() if template.updated_at else None,
        }

    def _serialize_notification(self, notification: UserNotification) -> dict:
        return {
            "id": str(notification.id),
            "user_id": str(notification.user_id),
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None,
        }
