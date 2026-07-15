import secrets
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import (
    AutoDiscount,
    Coupon,
    FlashSale,
    FlashSaleItem,
    LoyaltyPoint,
    LoyaltyPointTransaction,
    ReferralCode,
    ReferralReward,
)
from app.repositories.promotion_repository import (
    AutoDiscountRepository,
    CouponRepository,
    FlashSaleAdminRepository,
    LoyaltyRepository,
    ReferralRepository,
)


class CouponService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CouponRepository(db)

    def apply_coupon(
        self, code: str, subtotal: float, user_id: UUID = None
    ) -> dict:
        coupon = self.repo.get_by_code(code)
        if not coupon:
            raise ValueError("Invalid coupon code")

        if coupon.start_date and coupon.start_date > datetime.now(timezone.utc):
            raise ValueError("Coupon is not yet active")
        if coupon.end_date and coupon.end_date < datetime.now(timezone.utc):
            raise ValueError("Coupon has expired")
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise ValueError("Coupon has reached maximum usage")
        if coupon.min_order_amount and subtotal < float(coupon.min_order_amount):
            raise ValueError(
                f"Minimum order amount is ${coupon.min_order_amount}"
            )
        if user_id and coupon.per_user_limit:
            usage = self.repo.get_user_usage_count(coupon.id, user_id)
            if usage >= coupon.per_user_limit:
                raise ValueError("You have reached the usage limit for this coupon")

        if coupon.discount_type == "percentage":
            discount = subtotal * float(coupon.discount_value) / 100
        else:
            discount = min(float(coupon.discount_value), subtotal)

        return {
            "discount_amount": round(discount, 2),
            "discount_type": coupon.discount_type,
            "coupon_code": coupon.code,
            "message": f"Coupon {coupon.code} applied successfully",
        }

    def validate_coupon(self, code: str, subtotal: float) -> dict:
        coupon = self.repo.get_by_code(code)
        if not coupon:
            return {"valid": False, "message": "Invalid coupon code"}
        if coupon.start_date and coupon.start_date > datetime.now(timezone.utc):
            return {"valid": False, "message": "Coupon is not yet active"}
        if coupon.end_date and coupon.end_date < datetime.now(timezone.utc):
            return {"valid": False, "message": "Coupon has expired"}
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            return {"valid": False, "message": "Coupon has reached maximum usage"}
        if coupon.min_order_amount and subtotal < float(coupon.min_order_amount):
            return {
                "valid": False,
                "message": f"Minimum order amount is ${coupon.min_order_amount}",
            }

        if coupon.discount_type == "percentage":
            discount = subtotal * float(coupon.discount_value) / 100
        else:
            discount = min(float(coupon.discount_value), subtotal)

        return {
            "valid": True,
            "message": f"Coupon {coupon.code} is valid",
            "discount_amount": round(discount, 2),
            "discount_type": coupon.discount_type,
        }

    def create_coupon(self, data: dict) -> Coupon:
        coupon = Coupon(**data)
        return self.repo.create(coupon)

    def update_coupon(self, coupon_id: UUID, data: dict) -> Coupon:
        coupon = self.repo.get_by_id(coupon_id)
        if not coupon:
            raise ValueError("Coupon not found")
        for key, value in data.items():
            if value is not None:
                setattr(coupon, key, value)
        return self.repo.update(coupon)

    def delete_coupon(self, coupon_id: UUID) -> None:
        coupon = self.repo.get_by_id(coupon_id)
        if not coupon:
            raise ValueError("Coupon not found")
        self.repo.delete(coupon)

    def get_coupon(self, coupon_id: UUID) -> Optional[Coupon]:
        return self.repo.get_by_id(coupon_id)

    def get_all_coupons(self, page: int = 1, limit: int = 20) -> dict:
        items, total = self.repo.get_all(page, limit)
        return {
            "coupons": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def increment_usage(self, coupon_code: str) -> None:
        coupon = self.repo.get_by_code(coupon_code)
        if coupon:
            self.repo.increment_usage(coupon)


class AutoDiscountService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AutoDiscountRepository(db)

    def get_active_discounts(self) -> list[AutoDiscount]:
        return self.repo.get_active()

    def calculate_discounts(
        self, subtotal: float, items: list[dict]
    ) -> list[dict]:
        discounts = []
        active = self.repo.get_active()

        for discount in active:
            if discount.target_type == "all" and subtotal >= float(discount.min_order_amount):
                if discount.discount_type == "percentage":
                    amount = subtotal * float(discount.discount_value) / 100
                else:
                    amount = float(discount.discount_value)
                discounts.append({
                    "id": str(discount.id),
                    "name": discount.name,
                    "discount_amount": round(amount, 2),
                    "discount_type": discount.discount_type,
                })

        return discounts

    def create_discount(self, data: dict) -> AutoDiscount:
        discount = AutoDiscount(**data)
        return self.repo.create(discount)

    def update_discount(self, discount_id: UUID, data: dict) -> AutoDiscount:
        discount = self.repo.get_by_id(discount_id)
        if not discount:
            raise ValueError("Discount not found")
        for key, value in data.items():
            if value is not None:
                setattr(discount, key, value)
        return self.repo.update(discount)

    def delete_discount(self, discount_id: UUID) -> None:
        discount = self.repo.get_by_id(discount_id)
        if not discount:
            raise ValueError("Discount not found")
        self.repo.delete(discount)

    def get_all_discounts(self, page: int = 1, limit: int = 20) -> dict:
        items, total = self.repo.get_all(page, limit)
        return {
            "discounts": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }


class LoyaltyService:
    POINTS_PER_DOLLAR = 10
    REDEMPTION_RATE = 100

    def __init__(self, db: Session):
        self.db = db
        self.repo = LoyaltyRepository(db)

    def get_balance(self, user_id: UUID) -> LoyaltyPoint:
        return self.repo.get_or_create(user_id)

    def earn_points(self, user_id: UUID, order_total: float, order_id: UUID = None) -> Optional[LoyaltyPointTransaction]:
        points = int(order_total * self.POINTS_PER_DOLLAR)
        if points <= 0:
            return None
        return self.repo.add_points(
            user_id=user_id,
            points=points,
            transaction_type="earned",
            order_id=order_id,
            description=f"Earned {points} points from order",
        )

    def redeem_points(self, user_id: UUID, points: int) -> Optional[LoyaltyPointTransaction]:
        return self.repo.redeem_points(user_id, points)

    def calculate_discount(self, user_id: UUID, points_to_redeem: int) -> float:
        loyalty = self.repo.get_by_user(user_id)
        if not loyalty or loyalty.points_balance < points_to_redeem:
            return 0.0
        return round(points_to_redeem / self.REDEMPTION_RATE, 2)

    def get_transactions(
        self, user_id: UUID, page: int = 1, limit: int = 20
    ) -> dict:
        items, total = self.repo.get_transactions(user_id, page, limit)
        return {
            "transactions": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }


class ReferralService:
    REWARD_POINTS = 500

    def __init__(self, db: Session):
        self.db = db
        self.repo = ReferralRepository(db)

    def get_or_create_code(self, user_id: UUID) -> ReferralCode:
        existing = self.repo.get_by_user(user_id)
        if existing:
            return existing
        code = secrets.token_urlsafe(10).upper()[:10]
        referral = ReferralCode(user_id=user_id, code=code)
        return self.repo.create(referral)

    def apply_referral(self, code: str, referred_user_id: UUID) -> dict:
        referral = self.repo.get_by_code(code)
        if not referral:
            raise ValueError("Invalid referral code")
        if referral.user_id == referred_user_id:
            raise ValueError("You cannot refer yourself")
        if self.repo.has_referred_user(code, referred_user_id):
            raise ValueError("You have already been referred by this code")

        reward = ReferralReward(
            referrer_id=referral.user_id,
            referred_id=referred_user_id,
            referral_code=code,
            reward_type="points",
            reward_value=self.REWARD_POINTS,
            status="pending",
        )
        self.repo.create_reward(reward)
        self.repo.increment_usage(referral)

        from app.repositories.promotion_repository import LoyaltyRepository
        loyalty_repo = LoyaltyRepository(self.db)
        loyalty_repo.add_points(
            user_id=referral.user_id,
            points=self.REWARD_POINTS,
            transaction_type="earned",
            description="Referral reward for referring a friend",
        )

        return {
            "message": "Referral applied successfully",
            "reward_points": self.REWARD_POINTS,
        }

    def complete_referral(self, order_id: UUID, user_id: UUID) -> None:
        pending = (
            self.db.query(ReferralReward)
            .filter(
                ReferralReward.referred_id == user_id,
                ReferralReward.status == "pending",
            )
            .first()
        )
        if pending:
            pending.status = "completed"
            pending.order_id = order_id
            self.db.commit()

    def get_user_code(self, user_id: UUID) -> Optional[ReferralCode]:
        return self.repo.get_by_user(user_id)

    def get_rewards(
        self, user_id: UUID, page: int = 1, limit: int = 20
    ) -> dict:
        items, total = self.repo.get_rewards_by_referrer(user_id, page, limit)
        return {
            "rewards": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }


class FlashSaleAdminService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FlashSaleAdminRepository(db)

    def get_all_sales(self, page: int = 1, limit: int = 20) -> dict:
        items, total = self.repo.get_all(page, limit)
        return {
            "sales": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_sale(self, sale_id: UUID) -> Optional[FlashSale]:
        return self.repo.get_by_id(sale_id)

    def create_sale(self, data: dict) -> FlashSale:
        sale = FlashSale(**data)
        return self.repo.create(sale)

    def update_sale(self, sale_id: UUID, data: dict) -> FlashSale:
        sale = self.repo.get_by_id(sale_id)
        if not sale:
            raise ValueError("Flash sale not found")
        for key, value in data.items():
            if value is not None:
                setattr(sale, key, value)
        return self.repo.update(sale)

    def delete_sale(self, sale_id: UUID) -> None:
        sale = self.repo.get_by_id(sale_id)
        if not sale:
            raise ValueError("Flash sale not found")
        self.repo.delete(sale)

    def add_item(self, sale_id: UUID, data: dict) -> FlashSaleItem:
        sale = self.repo.get_by_id(sale_id)
        if not sale:
            raise ValueError("Flash sale not found")
        item = FlashSaleItem(flash_sale_id=sale_id, **data)
        return self.repo.add_item(item)

    def remove_item(self, item_id: UUID) -> None:
        item = self.repo.get_item_by_id(item_id)
        if not item:
            raise ValueError("Flash sale item not found")
        self.repo.remove_item(item)
