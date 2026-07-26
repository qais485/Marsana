from typing import Optional

from sqlalchemy.orm import Session

from app.models.database_models import SocialAccount


class VerificationRepository:
    def __init__(self, db: Session):
        self.db = db

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
