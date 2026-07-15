from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.database_models import (
    Address,
    RecentlyViewedProduct,
    UserAccountSetting,
    UserNotification,
    UserProfile,
    UserPrivacySetting,
    WishlistItem,
)


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_profile_by_user(self, user_id: UUID) -> Optional[UserProfile]:
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    def create_profile(self, profile: UserProfile) -> UserProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_profile(self, profile: UserProfile) -> UserProfile:
        self.db.commit()
        self.db.refresh(profile)
        return profile


class AddressRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, address_id: UUID, user_id: UUID) -> Optional[Address]:
        return (
            self.db.query(Address)
            .filter(
                Address.id == address_id,
                Address.user_id == user_id,
            )
            .first()
        )

    def get_all_by_user(self, user_id: UUID) -> list[Address]:
        return self.db.query(Address).filter(Address.user_id == user_id).all()

    def get_by_type(self, user_id: UUID, address_type: str) -> list[Address]:
        return (
            self.db.query(Address)
            .filter(
                Address.user_id == user_id,
                Address.address_type == address_type,
            )
            .all()
        )

    def get_default(self, user_id: UUID, address_type: str) -> Optional[Address]:
        return (
            self.db.query(Address)
            .filter(
                Address.user_id == user_id,
                Address.address_type == address_type,
                Address.is_default,
            )
            .first()
        )

    def create(self, address: Address) -> Address:
        self.db.add(address)
        self.db.commit()
        self.db.refresh(address)
        return address

    def update(self, address: Address) -> Address:
        self.db.commit()
        self.db.refresh(address)
        return address

    def delete(self, address: Address) -> None:
        self.db.delete(address)
        self.db.commit()

    def clear_default(self, user_id: UUID, address_type: str) -> None:
        self.db.query(Address).filter(
            Address.user_id == user_id,
            Address.address_type == address_type,
            Address.is_default,
        ).update({"is_default": False})
        self.db.commit()


class WishlistRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> list[WishlistItem]:
        return (
            self.db.query(WishlistItem)
            .filter(
                WishlistItem.user_id == user_id,
            )
            .order_by(WishlistItem.created_at.desc())
            .all()
        )

    def get_by_product(self, user_id: UUID, product_id: UUID) -> Optional[WishlistItem]:
        return (
            self.db.query(WishlistItem)
            .filter(
                WishlistItem.user_id == user_id,
                WishlistItem.product_id == product_id,
            )
            .first()
        )

    def get_by_share_token(self, share_token: str) -> Optional[WishlistItem]:
        return (
            self.db.query(WishlistItem)
            .filter(WishlistItem.share_token == share_token)
            .first()
        )

    def create(self, item: WishlistItem) -> WishlistItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: WishlistItem) -> WishlistItem:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: WishlistItem) -> None:
        self.db.delete(item)
        self.db.commit()

    def delete_all_by_user(self, user_id: UUID) -> None:
        # NOTE: Bulk delete via .delete() bypasses ORM cascade events.
        self.db.query(WishlistItem).filter(WishlistItem.user_id == user_id).delete()
        self.db.commit()


class RecentlyViewedRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(
        self, user_id: UUID, limit: int = 20
    ) -> list[RecentlyViewedProduct]:
        return (
            self.db.query(RecentlyViewedProduct)
            .filter(
                RecentlyViewedProduct.user_id == user_id,
            )
            .order_by(RecentlyViewedProduct.viewed_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_product(
        self, user_id: UUID, product_id: UUID
    ) -> Optional[RecentlyViewedProduct]:
        return (
            self.db.query(RecentlyViewedProduct)
            .filter(
                RecentlyViewedProduct.user_id == user_id,
                RecentlyViewedProduct.product_id == product_id,
            )
            .first()
        )

    def create(self, item: RecentlyViewedProduct) -> RecentlyViewedProduct:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: RecentlyViewedProduct) -> RecentlyViewedProduct:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete_all_by_user(self, user_id: UUID) -> None:
        self.db.query(RecentlyViewedProduct).filter(
            RecentlyViewedProduct.user_id == user_id,
        ).delete()
        self.db.commit()


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> list[UserNotification]:
        return (
            self.db.query(UserNotification)
            .filter(
                UserNotification.user_id == user_id,
            )
            .order_by(UserNotification.created_at.desc())
            .all()
        )

    def get_by_id(
        self, notification_id: UUID, user_id: UUID
    ) -> Optional[UserNotification]:
        return (
            self.db.query(UserNotification)
            .filter(
                UserNotification.id == notification_id,
                UserNotification.user_id == user_id,
            )
            .first()
        )

    def get_unread_count(self, user_id: UUID) -> int:
        return (
            self.db.query(UserNotification)
            .filter(
                UserNotification.user_id == user_id,
                UserNotification.is_read.is_(False),
            )
            .count()
        )

    def create(self, notification: UserNotification) -> UserNotification:
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_as_read(self, notification: UserNotification) -> None:
        notification.is_read = True
        self.db.commit()

    def mark_all_as_read(self, user_id: UUID) -> None:
        self.db.query(UserNotification).filter(
            UserNotification.user_id == user_id,
            UserNotification.is_read.is_(False),
        ).update({"is_read": True})
        self.db.commit()

    def delete(self, notification: UserNotification) -> None:
        self.db.delete(notification)
        self.db.commit()

    def get_by_id_admin(self, notification_id: UUID) -> Optional[UserNotification]:
        return self.db.query(UserNotification).filter(UserNotification.id == notification_id).first()

    def get_all_admin(
        self,
        page: int = 1,
        limit: int = 20,
        notification_type: Optional[str] = None,
        is_read: Optional[bool] = None,
    ) -> tuple[list[UserNotification], int]:
        query = self.db.query(UserNotification)
        if notification_type:
            query = query.filter(UserNotification.notification_type == notification_type)
        if is_read is not None:
            query = query.filter(UserNotification.is_read == is_read)
        total = query.count()
        items = (
            query.order_by(UserNotification.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_active_user_ids(self) -> list[UUID]:
        from app.models.database_models import User
        users = self.db.query(User.id).filter(User.is_active.is_(True)).all()
        return [u.id for u in users]

    def get_inactive_user_ids(self) -> list[UUID]:
        from app.models.database_models import User
        users = self.db.query(User.id).filter(User.is_active.is_(False)).all()
        return [u.id for u in users]

    def get_all_user_ids(self) -> list[UUID]:
        from app.models.database_models import User
        users = self.db.query(User.id).all()
        return [u.id for u in users]

    def get_stats(self) -> dict:
        total = self.db.query(UserNotification).count()
        unread = self.db.query(UserNotification).filter(UserNotification.is_read.is_(False)).count()
        by_type = (
            self.db.query(UserNotification.notification_type, func.count(UserNotification.id))
            .group_by(UserNotification.notification_type)
            .all()
        )
        return {
            "total": total,
            "unread": unread,
            "by_type": {t: c for t, c in by_type},
        }

    def bulk_create(self, notifications: list[UserNotification]) -> int:
        self.db.add_all(notifications)
        self.db.commit()
        return len(notifications)


class PrivacyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> Optional[UserPrivacySetting]:
        return (
            self.db.query(UserPrivacySetting)
            .filter(
                UserPrivacySetting.user_id == user_id,
            )
            .first()
        )

    def create(self, setting: UserPrivacySetting) -> UserPrivacySetting:
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update(self, setting: UserPrivacySetting) -> UserPrivacySetting:
        self.db.commit()
        self.db.refresh(setting)
        return setting


class AccountSettingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> Optional[UserAccountSetting]:
        return (
            self.db.query(UserAccountSetting)
            .filter(
                UserAccountSetting.user_id == user_id,
            )
            .first()
        )

    def create(self, setting: UserAccountSetting) -> UserAccountSetting:
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update(self, setting: UserAccountSetting) -> UserAccountSetting:
        self.db.commit()
        self.db.refresh(setting)
        return setting
