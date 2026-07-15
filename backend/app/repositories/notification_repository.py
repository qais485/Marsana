from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.database_models import NotificationLog, NotificationTemplate


class NotificationTemplateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        notification_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> tuple[list[NotificationTemplate], int]:
        query = self.db.query(NotificationTemplate)
        if notification_type:
            query = query.filter(NotificationTemplate.notification_type == notification_type)
        if is_active is not None:
            query = query.filter(NotificationTemplate.is_active == is_active)
        total = query.count()
        items = (
            query.order_by(NotificationTemplate.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, template_id: UUID) -> Optional[NotificationTemplate]:
        return self.db.query(NotificationTemplate).filter(NotificationTemplate.id == template_id).first()

    def get_by_slug(self, slug: str) -> Optional[NotificationTemplate]:
        return self.db.query(NotificationTemplate).filter(NotificationTemplate.slug == slug).first()

    def create(self, template: NotificationTemplate) -> NotificationTemplate:
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def update(self, template: NotificationTemplate, data: dict) -> NotificationTemplate:
        for key, value in data.items():
            if value is not None and hasattr(template, key):
                setattr(template, key, value)
        self.db.commit()
        self.db.refresh(template)
        return template

    def delete(self, template: NotificationTemplate) -> None:
        self.db.delete(template)
        self.db.commit()


class NotificationLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, log: NotificationLog) -> NotificationLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        channel: Optional[str] = None,
        status: Optional[str] = None,
        user_id: Optional[UUID] = None,
    ) -> tuple[list[NotificationLog], int]:
        query = self.db.query(NotificationLog)
        if channel:
            query = query.filter(NotificationLog.channel == channel)
        if status:
            query = query.filter(NotificationLog.status == status)
        if user_id:
            query = query.filter(NotificationLog.user_id == user_id)
        total = query.count()
        items = (
            query.order_by(NotificationLog.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_stats(self) -> dict:
        total = self.db.query(NotificationLog).count()
        today = func.date(NotificationLog.created_at)
        sent_today = (
            self.db.query(NotificationLog)
            .filter(today == func.current_date())
            .count()
        )
        by_channel = (
            self.db.query(NotificationLog.channel, func.count(NotificationLog.id))
            .group_by(NotificationLog.channel)
            .all()
        )
        by_status = (
            self.db.query(NotificationLog.status, func.count(NotificationLog.id))
            .group_by(NotificationLog.status)
            .all()
        )
        return {
            "total": total,
            "sent_today": sent_today,
            "by_channel": {ch: cnt for ch, cnt in by_channel},
            "by_status": {st: cnt for st, cnt in by_status},
        }
