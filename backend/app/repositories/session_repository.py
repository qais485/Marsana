from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import UserSession, UserDevice


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, session: UserSession) -> UserSession:
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_by_refresh_token(self, refresh_token: str) -> Optional[UserSession]:
        return (
            self.db.query(UserSession)
            .filter(
                UserSession.refresh_token == refresh_token,
                UserSession.is_active,
            )
            .first()
        )

    def get_active_sessions_by_user(self, user_id: UUID) -> list[UserSession]:
        return (
            self.db.query(UserSession)
            .filter(
                UserSession.user_id == user_id,
                UserSession.is_active,
            )
            .all()
        )

    def deactivate(self, session: UserSession) -> None:
        session.is_active = False
        self.db.commit()

    def deactivate_all_by_user(self, user_id: UUID) -> None:
        self.db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active,
        ).update({"is_active": False})
        self.db.commit()

    def deactivate_by_device(self, device_id: UUID) -> None:
        self.db.query(UserSession).filter(
            UserSession.device_id == device_id,
            UserSession.is_active,
        ).update({"is_active": False})
        self.db.commit()


class DeviceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, device: UserDevice) -> UserDevice:
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        return device

    def get_by_id(self, device_id: UUID) -> Optional[UserDevice]:
        return self.db.query(UserDevice).filter(UserDevice.id == device_id).first()

    def get_by_user(self, user_id: UUID) -> list[UserDevice]:
        return self.db.query(UserDevice).filter(UserDevice.user_id == user_id).all()

    def update_last_active(self, device: UserDevice) -> None:
        from datetime import datetime, timezone

        device.last_active_at = datetime.now(timezone.utc)
        self.db.commit()

    def delete(self, device: UserDevice) -> None:
        self.db.delete(device)
        self.db.commit()

    def delete_all_by_user(self, user_id: UUID) -> None:
        # NOTE: Bulk delete via .delete() bypasses ORM cascade events.
        self.db.query(UserDevice).filter(UserDevice.user_id == user_id).delete()
        self.db.commit()
