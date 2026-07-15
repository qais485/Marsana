from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import (
    EmailVerification,
    PasswordReset,
    UserTwoFactor,
    SocialAccount,
)


class VerificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_email_verification(
        self, verification: EmailVerification
    ) -> EmailVerification:
        self.db.add(verification)
        self.db.commit()
        self.db.refresh(verification)
        return verification

    def get_email_verification(
        self, token: str, purpose: str
    ) -> Optional[EmailVerification]:
        verification = (
            self.db.query(EmailVerification)
            .filter(
                EmailVerification.token == token,
                EmailVerification.purpose == purpose,
                EmailVerification.is_used.is_(False),
            )
            .first()
        )
        if verification and verification.expires_at < datetime.now(timezone.utc):
            return None
        return verification

    def mark_email_verification_used(self, verification: EmailVerification) -> None:
        verification.is_used = True
        self.db.commit()

    def get_latest_email_verification(
        self, user_id: UUID, purpose: str
    ) -> Optional[EmailVerification]:
        return (
            self.db.query(EmailVerification)
            .filter(
                EmailVerification.user_id == user_id,
                EmailVerification.purpose == purpose,
            )
            .order_by(EmailVerification.created_at.desc())
            .first()
        )

    def create_password_reset(self, reset: PasswordReset) -> PasswordReset:
        self.db.add(reset)
        self.db.commit()
        self.db.refresh(reset)
        return reset

    def get_password_reset(self, token: str) -> Optional[PasswordReset]:
        reset = (
            self.db.query(PasswordReset)
            .filter(
                PasswordReset.token == token,
                PasswordReset.is_used.is_(False),
            )
            .first()
        )
        if reset and reset.expires_at < datetime.now(timezone.utc):
            return None
        return reset

    def mark_password_reset_used(self, reset: PasswordReset) -> None:
        reset.is_used = True
        self.db.commit()

    def get_two_factor_by_user(self, user_id: UUID) -> Optional[UserTwoFactor]:
        return (
            self.db.query(UserTwoFactor)
            .filter(UserTwoFactor.user_id == user_id)
            .first()
        )

    def create_two_factor(self, two_factor: UserTwoFactor) -> UserTwoFactor:
        self.db.add(two_factor)
        self.db.commit()
        self.db.refresh(two_factor)
        return two_factor

    def update_two_factor(self, two_factor: UserTwoFactor) -> UserTwoFactor:
        self.db.commit()
        self.db.refresh(two_factor)
        return two_factor

    def get_social_account(
        self, provider: str, provider_user_id: str
    ) -> Optional[SocialAccount]:
        return (
            self.db.query(SocialAccount)
            .filter(
                SocialAccount.provider == provider,
                SocialAccount.provider_user_id == provider_user_id,
            )
            .first()
        )

    def create_social_account(self, account: SocialAccount) -> SocialAccount:
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account
