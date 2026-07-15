import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

import pyotp
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_token,
    generate_verification_code,
    hash_password,
    verify_password,
)
from app.utils.email import send_email
from app.models.database_models import (
    EmailVerification,
    PasswordReset,
    SocialAccount,
    User,
    UserDevice,
    UserSession,
    UserTwoFactor,
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

    def register(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
    ) -> dict:
        if self.user_repo.get_by_email(email):
            raise ValueError("Email already registered")

        user = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
        )
        try:
            self.user_repo.create(user)
        except Exception:
            self.db.rollback()
            if self.user_repo.get_by_email(email):
                raise ValueError("Email already registered")
            raise

        try:
            self._send_email_verification(user, "registration")
        except ValueError:
            self.db.rollback()
            raise

        return {
            "user_id": str(user.id),
            "message": "Registration successful. Please verify your email.",
        }

    def login(
        self,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_name: Optional[str] = None,
        device_type: Optional[str] = None,
    ) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user or not user.password_hash:
            raise ValueError("Invalid credentials")

        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid credentials")

        if not user.is_active:
            raise ValueError("Invalid credentials")

        if user.is_2fa_enabled:
            temp_token = create_access_token(str(user.id))
            return {
                "requires_2fa": True,
                "temp_token": temp_token,
                "message": "Two-factor authentication required",
            }

        return self._create_session(
            user, ip_address, user_agent, device_name, device_type
        )

    def verify_2fa(self, user_id: UUID, code: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        two_factor = self.verification_repo.get_two_factor_by_user(user_id)
        if not two_factor or not two_factor.is_enabled:
            raise ValueError("Two-factor authentication not enabled")

        totp = pyotp.TOTP(two_factor.secret)
        if not totp.verify(code):
            backup_codes = self._parse_backup_codes(two_factor.backup_codes)
            import hashlib
            code_hash = hashlib.sha256(code.encode()).hexdigest()
            if code_hash in backup_codes:
                backup_codes.remove(code_hash)
                two_factor.backup_codes = self._hash_backup_codes_from_hashes(backup_codes)
                self.verification_repo.update_two_factor(two_factor)
            else:
                raise ValueError("Invalid verification code")

        return self._create_session(user)

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

    def send_email_verification(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            return {"message": "If the email exists, a verification link has been sent"}

        if user.is_email_verified:
            return {"message": "Email is already verified"}

        latest = self.verification_repo.get_latest_email_verification(
            user.id, "registration"
        )
        if latest:
            created_at = latest.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            elapsed = datetime.now(timezone.utc) - created_at
            if elapsed < timedelta(seconds=60):
                remaining = 60 - int(elapsed.total_seconds())
                raise ValueError(
                    f"Please wait {remaining} seconds before requesting a new code"
                )

        self._send_email_verification(user, "registration")
        return {"message": "Verification email sent successfully"}

    def get_email_verification_status(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            return {"can_resend": True, "cooldown_seconds": 0}

        if user.is_email_verified:
            return {"can_resend": False, "cooldown_seconds": 0, "is_verified": True}

        latest = self.verification_repo.get_latest_email_verification(
            user.id, "registration"
        )
        if not latest:
            return {"can_resend": True, "cooldown_seconds": 0}

        elapsed = datetime.now(timezone.utc) - latest.created_at
        if elapsed >= timedelta(seconds=60):
            return {"can_resend": True, "cooldown_seconds": 0}

        remaining = 60 - int(elapsed.total_seconds())
        return {"can_resend": False, "cooldown_seconds": remaining}

    def verify_email(self, token: str, code: str) -> dict:
        verification = self.verification_repo.get_email_verification(
            token, "registration"
        )
        if not verification:
            raise ValueError("Invalid or expired verification token")

        import hashlib
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        if verification.code != code and verification.code != code_hash:
            raise ValueError("Invalid verification code")

        if verification.expires_at < datetime.now(timezone.utc):
            raise ValueError("Verification code expired")

        user = self.user_repo.get_by_id(verification.user_id)
        if not user:
            raise ValueError("User not found")

        user.is_email_verified = True
        user.is_active = True
        self.user_repo.update(user)
        self.verification_repo.mark_email_verification_used(verification)

        return {"message": "Email verified successfully"}

    def change_email(self, user_id: UUID, new_email: str, password: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.password_hash or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")

        if self.user_repo.get_by_email(new_email):
            raise ValueError("Email already in use")

        self._send_email_verification(user, "email_change", new_email=new_email)
        return {"message": "Verification link sent to new email"}

    def forgot_password(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            return {"message": "If the email exists, a reset link has been sent"}

        token = generate_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        reset = PasswordReset(user_id=user.id, token=token, expires_at=expires_at)
        self.verification_repo.create_password_reset(reset)

        return {"message": "If the email exists, a reset link has been sent"}

    def reset_password(self, token: str, new_password: str) -> dict:
        reset = self.verification_repo.get_password_reset(token)
        if not reset:
            raise ValueError("Invalid or expired reset token")

        if reset.expires_at < datetime.now(timezone.utc):
            raise ValueError("Reset token expired")

        user = self.user_repo.get_by_id(reset.user_id)
        if not user:
            raise ValueError("User not found")

        user.password_hash = hash_password(new_password)
        self.user_repo.update(user)
        self.verification_repo.mark_password_reset_used(reset)
        self.session_repo.deactivate_all_by_user(user.id)

        return {"message": "Password reset successfully"}

    def change_password(
        self, user_id: UUID, current_password: str, new_password: str
    ) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.password_hash or not verify_password(
            current_password, user.password_hash
        ):
            raise ValueError("Invalid current password")

        user.password_hash = hash_password(new_password)
        self.user_repo.update(user)

        return {"message": "Password changed successfully"}

    def enable_2fa(self, user_id: UUID, password: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.password_hash or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")

        existing = self.verification_repo.get_two_factor_by_user(user_id)
        if existing and existing.is_enabled:
            raise ValueError("Two-factor authentication already enabled")

        secret = pyotp.random_base32()
        backup_codes = [secrets.token_hex(4) for _ in range(8)]
        hashed_codes = self._hash_backup_codes(backup_codes)

        if existing:
            existing.secret = secret
            existing.backup_codes = hashed_codes
            self.verification_repo.update_two_factor(existing)
            two_factor = existing
        else:
            two_factor = UserTwoFactor(
                user_id=user_id, secret=secret, backup_codes=hashed_codes
            )
            self.verification_repo.create_two_factor(two_factor)

        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email, issuer_name=settings.APP_NAME
        )

        return {
            "secret": secret,
            "provisioning_uri": provisioning_uri,
            "backup_codes": backup_codes,
        }

    def verify_and_enable_2fa(self, user_id: UUID, code: str) -> dict:
        two_factor = self.verification_repo.get_two_factor_by_user(user_id)
        if not two_factor:
            raise ValueError("Two-factor setup not initiated")

        totp = pyotp.TOTP(two_factor.secret)
        if not totp.verify(code):
            raise ValueError("Invalid verification code")

        two_factor.is_enabled = True
        self.verification_repo.update_two_factor(two_factor)

        user = self.user_repo.get_by_id(user_id)
        if user:
            user.is_2fa_enabled = True
            self.user_repo.update(user)

        return {"message": "Two-factor authentication enabled successfully"}

    def disable_2fa(self, user_id: UUID, password: str, code: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.password_hash or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")

        two_factor = self.verification_repo.get_two_factor_by_user(user_id)
        if not two_factor or not two_factor.is_enabled:
            raise ValueError("Two-factor authentication not enabled")

        totp = pyotp.TOTP(two_factor.secret)
        if not totp.verify(code):
            raise ValueError("Invalid verification code")

        two_factor.is_enabled = False
        self.verification_repo.update_two_factor(two_factor)

        user.is_2fa_enabled = False
        self.user_repo.update(user)

        return {"message": "Two-factor authentication disabled successfully"}

    def social_login(
        self,
        provider: str,
        provider_user_id: str,
        email: str,
        first_name: str,
        last_name: str,
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
            return self._create_session(
                user, ip_address, user_agent, device_name, device_type
            )

        user = self.user_repo.get_by_email(email)
        if not user:
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                password_hash=hash_password(secrets.token_hex(16)),
                is_email_verified=True,
                is_active=True,
            )
            self.user_repo.create(user)

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

    def revoke_all_sessions(self, user_id: UUID, password: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.password_hash or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")

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
                "is_email_verified": user.is_email_verified,
                "is_2fa_enabled": user.is_2fa_enabled,
            },
        }

    def _send_email_verification(
        self, user: User, purpose: str, new_email: Optional[str] = None
    ) -> None:
        token = generate_token()
        code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

        verification = EmailVerification(
            user_id=user.id,
            token=token,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
        )
        self.verification_repo.create_email_verification(verification)

        recipient = new_email or user.email
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}&code={code}"
        subject = "Verify your email address"
        html = f"""
        <h2>Email Verification</h2>
        <p>Hello {user.first_name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="{verify_url}">Verify Email</a></p>
        <p>Or enter this code: <strong>{code}</strong></p>
        <p>This link expires in 24 hours.</p>
        """

        try:
            send_email(recipient, subject, html)
        except Exception as e:
            logger.error("Email send failed for %s: %s", recipient, e)
            raise ValueError(f"Failed to send verification email: {e}") from e

    def _parse_backup_codes(self, hashed_codes: Optional[str]) -> list[str]:
        if not hashed_codes:
            return []
        codes = hashed_codes.split(",")
        return [c for c in codes if c]

    def _hash_backup_codes(self, codes: list[str]) -> str:
        import hashlib

        hashed = [hashlib.sha256(c.encode()).hexdigest() for c in codes]
        return ",".join(hashed)

    def _hash_backup_codes_from_hashes(self, hashed_codes: list[str]) -> str:
        return ",".join(hashed_codes)
