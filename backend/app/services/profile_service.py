from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.database_models import (
    Address,
    Cart,
    CartItem,
    Product,
    ProductVariant,
    RecentlyViewedProduct,
    UserAccountSetting,
    UserProfile,
    UserPrivacySetting,
    WishlistItem,
)
from app.repositories.profile_repository import (
    AccountSettingRepository,
    AddressRepository,
    NotificationRepository,
    PrivacyRepository,
    ProfileRepository,
    RecentlyViewedRepository,
    WishlistRepository,
)
from app.repositories.user_repository import UserRepository


class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.address_repo = AddressRepository(db)
        self.wishlist_repo = WishlistRepository(db)
        self.recently_viewed_repo = RecentlyViewedRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.privacy_repo = PrivacyRepository(db)
        self.account_setting_repo = AccountSettingRepository(db)

    def get_profile(self, user_id: UUID) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        profile = self.profile_repo.get_profile_by_user(user_id)
        if not profile:
            profile = UserProfile(user_id=user_id)
            self.profile_repo.create_profile(profile)

        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_email_verified": user.is_email_verified,
                "is_2fa_enabled": user.is_2fa_enabled,
            },
            "profile": {
                "id": str(profile.id),
                "user_id": str(profile.user_id),
                "avatar_url": profile.avatar_url,
                "phone_number": profile.phone_number,
                "date_of_birth": profile.date_of_birth.isoformat()
                if profile.date_of_birth
                else None,
                "bio": profile.bio,
                "gender": profile.gender,
                "created_at": profile.created_at.isoformat(),
                "updated_at": profile.updated_at.isoformat(),
            },
        }

    def update_profile(
        self,
        user_id: UUID,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        phone_number: Optional[str] = None,
        date_of_birth: Optional[date] = None,
        bio: Optional[str] = None,
        gender: Optional[str] = None,
        avatar_url: Optional[str] = None,
    ) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        self.user_repo.update(user)

        profile = self.profile_repo.get_profile_by_user(user_id)
        if not profile:
            profile = UserProfile(user_id=user_id)
            self.profile_repo.create_profile(profile)

        if phone_number is not None:
            profile.phone_number = phone_number
        if date_of_birth is not None:
            profile.date_of_birth = date_of_birth
        if bio is not None:
            profile.bio = bio
        if gender is not None:
            profile.gender = gender
        if avatar_url is not None:
            profile.avatar_url = avatar_url
        self.profile_repo.update_profile(profile)

        return {"message": "Profile updated successfully"}

    def delete_account(self, user_id: UUID, password: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.password_hash or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")

        self.user_repo.delete(user)
        return {"message": "Account deleted successfully"}

    # ─── Address Management ────────────────────────────────────────

    def get_addresses(self, user_id: UUID) -> list[dict]:
        addresses = self.address_repo.get_all_by_user(user_id)
        return [
            {
                "id": str(a.id),
                "user_id": str(a.user_id),
                "address_type": a.address_type,
                "label": a.label,
                "first_name": a.first_name,
                "last_name": a.last_name,
                "phone_number": a.phone_number,
                "address_line_1": a.address_line_1,
                "address_line_2": a.address_line_2,
                "city": a.city,
                "state": a.state,
                "postal_code": a.postal_code,
                "country": a.country,
                "is_default": a.is_default,
                "created_at": a.created_at.isoformat(),
                "updated_at": a.updated_at.isoformat(),
            }
            for a in addresses
        ]

    def create_address(self, user_id: UUID, **kwargs) -> dict:
        if kwargs.get("is_default"):
            self.address_repo.clear_default(user_id, kwargs["address_type"])

        address = Address(user_id=user_id, **kwargs)
        self.address_repo.create(address)

        return {
            "id": str(address.id),
            "message": "Address created successfully",
        }

    def update_address(self, user_id: UUID, address_id: UUID, **kwargs) -> dict:
        address = self.address_repo.get_by_id(address_id, user_id)
        if not address:
            raise ValueError("Address not found")

        address_type = kwargs.get("address_type", address.address_type)
        is_default = kwargs.get("is_default")

        if is_default:
            self.address_repo.clear_default(user_id, address_type)

        for key, value in kwargs.items():
            if value is not None:
                setattr(address, key, value)

        self.address_repo.update(address)
        return {"message": "Address updated successfully"}

    def delete_address(self, user_id: UUID, address_id: UUID) -> dict:
        address = self.address_repo.get_by_id(address_id, user_id)
        if not address:
            raise ValueError("Address not found")

        self.address_repo.delete(address)
        return {"message": "Address deleted successfully"}

    # ─── Wishlist ──────────────────────────────────────────────────

    def get_wishlist(self, user_id: UUID) -> list[dict]:
        items = self.wishlist_repo.get_by_user(user_id)
        return [
            {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "product_name": item.product_name,
                "product_price": item.product_price,
                "product_image": item.product_image,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ]

    def add_to_wishlist(
        self,
        user_id: UUID,
        product_id: UUID,
        product_name: str,
        product_price: str,
        product_image: Optional[str] = None,
    ) -> dict:
        existing = self.wishlist_repo.get_by_product(user_id, product_id)
        if existing:
            raise ValueError("Product already in wishlist")

        item = WishlistItem(
            user_id=user_id,
            product_id=product_id,
            product_name=product_name,
            product_price=product_price,
            product_image=product_image,
        )
        self.wishlist_repo.create(item)

        return {
            "id": str(item.id),
            "message": "Product added to wishlist",
        }

    def remove_from_wishlist(self, user_id: UUID, product_id: UUID) -> dict:
        item = self.wishlist_repo.get_by_product(user_id, product_id)
        if not item:
            raise ValueError("Product not found in wishlist")

        self.wishlist_repo.delete(item)
        return {"message": "Product removed from wishlist"}

    def clear_wishlist(self, user_id: UUID) -> dict:
        self.wishlist_repo.delete_all_by_user(user_id)
        return {"message": "Wishlist cleared"}

    def share_wishlist_item(self, user_id: UUID, product_id: UUID) -> dict:
        item = self.wishlist_repo.get_by_product(user_id, product_id)
        if not item:
            raise ValueError("Product not found in wishlist")

        import secrets
        if not item.share_token:
            item.share_token = secrets.token_urlsafe(32)
            self.wishlist_repo.update(item)

        share_url = f"/wishlist/shared/{item.share_token}"
        return {
            "share_url": share_url,
            "share_token": item.share_token,
        }

    def get_shared_wishlist(self, share_token: str) -> dict:
        item = self.wishlist_repo.get_by_share_token(share_token)
        if not item:
            raise ValueError("Shared wishlist not found")

        user = self.user_repo.get_by_id(item.user_id)
        all_items = self.wishlist_repo.get_by_user(item.user_id)

        product_ids = [i.product_id for i in all_items]
        products = self.db.query(Product).filter(Product.id.in_(product_ids)).all() if product_ids else []
        product_map = {str(p.id): p.slug for p in products}

        return {
            "owner_name": f"{user.first_name} {user.last_name[0]}." if user and user.last_name else "User",
            "items": [
                {
                    "id": str(i.id),
                    "product_id": str(i.product_id),
                    "product_slug": product_map.get(str(i.product_id)),
                    "product_name": i.product_name,
                    "product_price": i.product_price,
                    "product_image": i.product_image,
                }
                for i in all_items
            ],
            "item_count": len(all_items),
            "shared_at": item.created_at.isoformat(),
        }

    def move_to_cart(self, user_id: UUID, product_id: UUID, quantity: int = 1) -> dict:
        item = self.wishlist_repo.get_by_product(user_id, product_id)
        if not item:
            raise ValueError("Product not found in wishlist")

        product = self.db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.deleted_at is not None or not product.is_active:
            raise ValueError("Product is no longer available")

        stock_quantity = product.stock_quantity
        price = float(product.discount_price if product.discount_price else product.price)

        if item.variant_id:
            variant = self.db.query(ProductVariant).filter(
                ProductVariant.id == item.variant_id
            ).first()
            if not variant or not variant.is_active:
                raise ValueError("Product variant is no longer available")
            stock_quantity = variant.stock_quantity
            price = float(variant.discount_price if variant.discount_price else variant.price)

        if quantity > stock_quantity:
            raise ValueError("Insufficient stock")

        cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            try:
                cart = Cart(user_id=user_id)
                self.db.add(cart)
                self.db.commit()
                self.db.refresh(cart)
            except Exception:
                self.db.rollback()
                raise

        existing_cart_item = self.db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item.product_id,
            CartItem.variant_id == item.variant_id,
        ).first()

        if existing_cart_item:
            existing_cart_item.quantity += quantity
            self.db.commit()
        else:
            product_name = product.name
            product_image = product.images.split(",")[0] if product.images else None
            product_sku = product.sku

            if item.variant_id:
                variant = self.db.query(ProductVariant).filter(
                    ProductVariant.id == item.variant_id
                ).first()
                if variant:
                    product_name = f"{product.name} - {variant.name}"
                    product_sku = variant.sku

            cart_item = CartItem(
                cart_id=cart.id,
                product_id=item.product_id,
                variant_id=item.variant_id,
                quantity=quantity,
                product_name=product_name,
                product_price=price,
                product_image=product_image,
                product_sku=product_sku,
            )
            self.db.add(cart_item)
            self.db.commit()

        self.wishlist_repo.delete(item)

        return {"message": "Product moved to cart"}

    # ─── Recently Viewed ──────────────────────────────────────────

    def get_recently_viewed(self, user_id: UUID, limit: int = 20) -> list[dict]:
        items = self.recently_viewed_repo.get_by_user(user_id, limit)
        return [
            {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "product_name": item.product_name,
                "product_price": item.product_price,
                "product_image": item.product_image,
                "viewed_at": item.viewed_at.isoformat(),
            }
            for item in items
        ]

    def add_recently_viewed(
        self,
        user_id: UUID,
        product_id: UUID,
        product_name: str,
        product_price: str,
        product_image: Optional[str] = None,
    ) -> dict:
        existing = self.recently_viewed_repo.get_by_product(user_id, product_id)
        if existing:
            existing.viewed_at = datetime.now(timezone.utc)
            self.recently_viewed_repo.update(existing)
        else:
            item = RecentlyViewedProduct(
                user_id=user_id,
                product_id=product_id,
                product_name=product_name,
                product_price=product_price,
                product_image=product_image,
            )
            self.recently_viewed_repo.create(item)

        return {"message": "Product added to recently viewed"}

    def clear_recently_viewed(self, user_id: UUID) -> dict:
        self.recently_viewed_repo.delete_all_by_user(user_id)
        return {"message": "Recently viewed products cleared"}

    # ─── Notifications ─────────────────────────────────────────────

    def get_notifications(self, user_id: UUID) -> dict:
        notifications = self.notification_repo.get_by_user(user_id)
        unread_count = self.notification_repo.get_unread_count(user_id)
        return {
            "notifications": [
                {
                    "id": str(n.id),
                    "title": n.title,
                    "message": n.message,
                    "notification_type": n.notification_type,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notifications
            ],
            "unread_count": unread_count,
        }

    def mark_notification_read(self, user_id: UUID, notification_id: UUID) -> dict:
        notification = self.notification_repo.get_by_id(notification_id, user_id)
        if not notification:
            raise ValueError("Notification not found")

        self.notification_repo.mark_as_read(notification)
        return {"message": "Notification marked as read"}

    def mark_all_notifications_read(self, user_id: UUID) -> dict:
        self.notification_repo.mark_all_as_read(user_id)
        return {"message": "All notifications marked as read"}

    # ─── Privacy Settings ──────────────────────────────────────────

    def get_privacy_settings(self, user_id: UUID) -> dict:
        settings = self.privacy_repo.get_by_user(user_id)
        if not settings:
            settings = UserPrivacySetting(user_id=user_id)
            self.privacy_repo.create(settings)

        return {
            "id": str(settings.id),
            "user_id": str(settings.user_id),
            "show_email": settings.show_email,
            "show_phone": settings.show_phone,
            "show_address": settings.show_address,
            "profile_visible": settings.profile_visible,
            "created_at": settings.created_at.isoformat(),
            "updated_at": settings.updated_at.isoformat(),
        }

    def update_privacy_settings(
        self,
        user_id: UUID,
        show_email: Optional[bool] = None,
        show_phone: Optional[bool] = None,
        show_address: Optional[bool] = None,
        profile_visible: Optional[bool] = None,
    ) -> dict:
        settings = self.privacy_repo.get_by_user(user_id)
        if not settings:
            settings = UserPrivacySetting(user_id=user_id)
            self.privacy_repo.create(settings)

        if show_email is not None:
            settings.show_email = show_email
        if show_phone is not None:
            settings.show_phone = show_phone
        if show_address is not None:
            settings.show_address = show_address
        if profile_visible is not None:
            settings.profile_visible = profile_visible

        self.privacy_repo.update(settings)
        return {"message": "Privacy settings updated successfully"}

    # ─── Account Settings ──────────────────────────────────────────

    def get_account_settings(self, user_id: UUID) -> dict:
        settings = self.account_setting_repo.get_by_user(user_id)
        if not settings:
            settings = UserAccountSetting(user_id=user_id)
            self.account_setting_repo.create(settings)

        return {
            "id": str(settings.id),
            "user_id": str(settings.user_id),
            "email_notifications": settings.email_notifications,
            "order_updates": settings.order_updates,
            "promotional_emails": settings.promotional_emails,
            "security_alerts": settings.security_alerts,
            "language": settings.language,
            "currency": settings.currency,
            "created_at": settings.created_at.isoformat(),
            "updated_at": settings.updated_at.isoformat(),
        }

    def update_account_settings(
        self,
        user_id: UUID,
        email_notifications: Optional[bool] = None,
        order_updates: Optional[bool] = None,
        promotional_emails: Optional[bool] = None,
        security_alerts: Optional[bool] = None,
        language: Optional[str] = None,
        currency: Optional[str] = None,
    ) -> dict:
        settings = self.account_setting_repo.get_by_user(user_id)
        if not settings:
            settings = UserAccountSetting(user_id=user_id)
            self.account_setting_repo.create(settings)

        if email_notifications is not None:
            settings.email_notifications = email_notifications
        if order_updates is not None:
            settings.order_updates = order_updates
        if promotional_emails is not None:
            settings.promotional_emails = promotional_emails
        if security_alerts is not None:
            settings.security_alerts = security_alerts
        if language is not None:
            settings.language = language
        if currency is not None:
            settings.currency = currency

        self.account_setting_repo.update(settings)
        return {"message": "Account settings updated successfully"}
