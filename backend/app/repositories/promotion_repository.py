from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func
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


def utcnow():
    return datetime.now(timezone.utc)


class CouponRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_code(self, code: str) -> Optional[Coupon]:
        return (
            self.db.query(Coupon)
            .filter(Coupon.code == code.upper(), Coupon.is_active)
            .first()
        )

    def get_all(self, page: int = 1, limit: int = 20) -> tuple[list, int]:
        query = self.db.query(Coupon)
        total = query.count()
        items = (
            query.order_by(Coupon.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def create(self, coupon: Coupon) -> Coupon:
        coupon.code = coupon.code.upper()
        self.db.add(coupon)
        self.db.commit()
        self.db.refresh(coupon)
        return coupon

    def update(self, coupon: Coupon) -> Coupon:
        self.db.commit()
        self.db.refresh(coupon)
        return coupon

    def delete(self, coupon: Coupon) -> None:
        self.db.delete(coupon)
        self.db.commit()

    def increment_usage(self, coupon: Coupon) -> None:
        coupon.used_count += 1
        self.db.commit()

    def get_user_usage_count(self, coupon_id: UUID, user_id: UUID) -> int:
        from app.models.database_models import Coupon as CouponModel, Order

        coupon = self.db.query(CouponModel).filter(CouponModel.id == coupon_id).first()
        if not coupon:
            return 0

        return (
            self.db.query(func.count(Order.id))
            .filter(
                Order.user_id == user_id,
                Order.coupon_code == coupon.code,
            )
            .scalar()
        )


class AutoDiscountRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active(self) -> list[AutoDiscount]:
        now = utcnow()
        return (
            self.db.query(AutoDiscount)
            .filter(
                AutoDiscount.is_active,
                (AutoDiscount.start_date.is_(None) | (AutoDiscount.start_date <= now)),
                (AutoDiscount.end_date.is_(None) | (AutoDiscount.end_date >= now)),
            )
            .order_by(AutoDiscount.priority.desc())
            .all()
        )

    def get_all(self, page: int = 1, limit: int = 20) -> tuple[list, int]:
        query = self.db.query(AutoDiscount)
        total = query.count()
        items = (
            query.order_by(AutoDiscount.priority.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, discount_id: UUID) -> Optional[AutoDiscount]:
        return self.db.query(AutoDiscount).filter(AutoDiscount.id == discount_id).first()

    def create(self, discount: AutoDiscount) -> AutoDiscount:
        self.db.add(discount)
        self.db.commit()
        self.db.refresh(discount)
        return discount

    def update(self, discount: AutoDiscount) -> AutoDiscount:
        self.db.commit()
        self.db.refresh(discount)
        return discount

    def delete(self, discount: AutoDiscount) -> None:
        self.db.delete(discount)
        self.db.commit()


class LoyaltyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> Optional[LoyaltyPoint]:
        return (
            self.db.query(LoyaltyPoint)
            .filter(LoyaltyPoint.user_id == user_id)
            .first()
        )

    def get_or_create(self, user_id: UUID) -> LoyaltyPoint:
        points = self.get_by_user(user_id)
        if not points:
            points = LoyaltyPoint(user_id=user_id)
            self.db.add(points)
            self.db.commit()
            self.db.refresh(points)
        return points

    def add_points(
        self, user_id: UUID, points: int, transaction_type: str,
        order_id: UUID = None, description: str = None
    ) -> LoyaltyPointTransaction:
        if points <= 0:
            raise ValueError("Points must be positive")
        loyalty = self.get_or_create(user_id)
        loyalty.points_balance += points
        if transaction_type == "earned":
            loyalty.lifetime_earned += points
        elif transaction_type == "redeemed":
            loyalty.lifetime_redeemed += points

        tx = LoyaltyPointTransaction(
            user_id=user_id,
            order_id=order_id,
            points=points,
            transaction_type=transaction_type,
            description=description,
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)
        return tx

    def redeem_points(self, user_id: UUID, points: int) -> Optional[LoyaltyPointTransaction]:
        loyalty = self.get_by_user(user_id)
        if not loyalty or loyalty.points_balance < points:
            return None
        loyalty.points_balance -= points
        loyalty.lifetime_redeemed += points

        tx = LoyaltyPointTransaction(
            user_id=user_id,
            points=points,
            transaction_type="redeemed",
            description=f"Redeemed {points} points",
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)
        return tx

    def get_transactions(
        self, user_id: UUID, page: int = 1, limit: int = 20
    ) -> tuple[list, int]:
        query = (
            self.db.query(LoyaltyPointTransaction)
            .filter(LoyaltyPointTransaction.user_id == user_id)
        )
        total = query.count()
        items = (
            query.order_by(LoyaltyPointTransaction.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total


class ReferralRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> Optional[ReferralCode]:
        return (
            self.db.query(ReferralCode)
            .filter(ReferralCode.user_id == user_id)
            .first()
        )

    def get_by_code(self, code: str) -> Optional[ReferralCode]:
        return (
            self.db.query(ReferralCode)
            .filter(ReferralCode.code == code.upper(), ReferralCode.is_active)
            .first()
        )

    def create(self, referral: ReferralCode) -> ReferralCode:
        referral.code = referral.code.upper()
        self.db.add(referral)
        self.db.commit()
        self.db.refresh(referral)
        return referral

    def increment_usage(self, referral: ReferralCode) -> None:
        referral.usage_count += 1
        self.db.commit()

    def create_reward(self, reward: ReferralReward) -> ReferralReward:
        self.db.add(reward)
        self.db.commit()
        self.db.refresh(reward)
        return reward

    def get_rewards_by_referrer(
        self, user_id: UUID, page: int = 1, limit: int = 20
    ) -> tuple[list, int]:
        query = (
            self.db.query(ReferralReward)
            .filter(ReferralReward.referrer_id == user_id)
        )
        total = query.count()
        items = (
            query.order_by(ReferralReward.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def has_referred_user(self, referral_code: str, user_id: UUID) -> bool:
        return (
            self.db.query(ReferralReward)
            .filter(
                ReferralReward.referral_code == referral_code,
                ReferralReward.referred_id == user_id,
            )
            .first()
            is not None
        )


class FlashSaleAdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20) -> tuple[list, int]:
        query = self.db.query(FlashSale)
        total = query.count()
        items = (
            query.order_by(FlashSale.start_date.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, sale_id: UUID) -> Optional[FlashSale]:
        return self.db.query(FlashSale).filter(FlashSale.id == sale_id).first()

    def create(self, sale: FlashSale) -> FlashSale:
        self.db.add(sale)
        self.db.commit()
        self.db.refresh(sale)
        return sale

    def update(self, sale: FlashSale) -> FlashSale:
        self.db.commit()
        self.db.refresh(sale)
        return sale

    def delete(self, sale: FlashSale) -> None:
        self.db.delete(sale)
        self.db.commit()

    def add_item(self, item: FlashSaleItem) -> FlashSaleItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def remove_item(self, item: FlashSaleItem) -> None:
        self.db.delete(item)
        self.db.commit()

    def get_item_by_id(self, item_id: UUID) -> Optional[FlashSaleItem]:
        return self.db.query(FlashSaleItem).filter(FlashSaleItem.id == item_id).first()
