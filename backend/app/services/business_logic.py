import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.database_models import (
    SocialAccount,
    User,
    UserDevice,
    UserSession,
)
from app.repositories.session_repository import DeviceRepository, SessionRepository
from app.repositories.user_repository import UserRepository
from app.repositories.verification_repository import VerificationRepository

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.session_repo = SessionRepository(db)
        self.device_repo = DeviceRepository(db)
        self.verification_repo = VerificationRepository(db)

    def social_login(
        self,
        provider: str,
        provider_user_id: str,
        email: str,
        first_name: str,
        last_name: str,
        avatar_url: Optional[str] = None,
        access_token: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_name: Optional[str] = None,
        device_type: Optional[str] = None,
    ) -> dict:
        social_account = self.verification_repo.get_social_account(
            provider, provider_user_id
        )

        if social_account:
            user = self.user_repo.get_by_id(social_account.user_id)
            if not user:
                raise ValueError("User not found")
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
                self.user_repo.update(user)
            return self._create_session(
                user, ip_address, user_agent, device_name, device_type
            )

        user = self.user_repo.get_by_email(email)
        if not user:
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar_url=avatar_url,
                is_active=True,
            )
            self.user_repo.create(user)
        else:
            updated = False
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
                updated = True
            if not user.is_active:
                user.is_active = True
                updated = True
            if updated:
                self.user_repo.update(user)

        social_account = SocialAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
            access_token=access_token,
        )
        self.verification_repo.create_social_account(social_account)

        return self._create_session(
            user, ip_address, user_agent, device_name, device_type
        )

    def logout(self, refresh_token: str) -> dict:
        session = self.session_repo.get_by_refresh_token(refresh_token)
        if session:
            self.session_repo.deactivate(session)
        return {"message": "Logged out successfully"}

    def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        session = self.session_repo.get_by_refresh_token(refresh_token)
        if not session:
            raise ValueError("Refresh token not found or revoked")

        if session.expires_at < datetime.now(timezone.utc):
            self.session_repo.deactivate(session)
            raise ValueError("Refresh token expired")

        user = self.user_repo.get_by_id(UUID(payload["sub"]))
        if not user:
            raise ValueError("User not found")

        self.session_repo.deactivate(session)

        return self._create_session(user)

    def get_devices(self, user_id: UUID) -> list[UserDevice]:
        return self.device_repo.get_by_user(user_id)

    def get_sessions(self, user_id: UUID) -> list[UserSession]:
        return self.session_repo.get_active_sessions_by_user(user_id)

    def revoke_device(self, user_id: UUID, device_id: UUID) -> dict:
        device = self.device_repo.get_by_id(device_id)
        if not device or device.user_id != user_id:
            raise ValueError("Device not found")

        self.session_repo.deactivate_by_device(device_id)
        self.device_repo.delete(device)

        return {"message": "Device revoked successfully"}

    def revoke_all_sessions(self, user_id: UUID) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        self.session_repo.deactivate_all_by_user(user_id)
        self.device_repo.delete_all_by_user(user_id)

        return {"message": "All sessions revoked successfully"}

    def _create_session(
        self,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_name: Optional[str] = None,
        device_type: Optional[str] = None,
    ) -> dict:
        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))

        device = None
        if device_name and device_type:
            device = UserDevice(
                user_id=user.id,
                device_name=device_name,
                device_type=device_type,
                ip_address=ip_address,
            )
            self.device_repo.create(device)

        session = UserSession(
            user_id=user.id,
            refresh_token=refresh_token,
            ip_address=ip_address,
            user_agent=user_agent,
            device_id=device.id if device else None,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self.session_repo.create(session)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "avatar_url": user.avatar_url,
            },
        }
