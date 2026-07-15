from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    AutoDiscountCreateRequest,
    AutoDiscountUpdateRequest,
    CouponCreateRequest,
    CouponUpdateRequest,
    FlashSaleCreateRequest,
    FlashSaleItemCreateRequest,
    FlashSaleUpdateRequest,
    LoyaltyRedeemRequest,
    ReferralApplyRequest,
)
from app.services.promotion_service import (
    AutoDiscountService,
    CouponService,
    FlashSaleAdminService,
    LoyaltyService,
    ReferralService,
)

router = APIRouter(prefix="/api/v1/promotions", tags=["Promotions"])


def get_coupon_service(db: Session = Depends(get_db)) -> CouponService:
    return CouponService(db)


def get_discount_service(db: Session = Depends(get_db)) -> AutoDiscountService:
    return AutoDiscountService(db)


def get_loyalty_service(db: Session = Depends(get_db)) -> LoyaltyService:
    return LoyaltyService(db)


def get_referral_service(db: Session = Depends(get_db)) -> ReferralService:
    return ReferralService(db)


def get_flash_sale_service(db: Session = Depends(get_db)) -> FlashSaleAdminService:
    return FlashSaleAdminService(db)


# ─── Public Coupon Endpoints ───────────────────────────────────


@router.post("/coupon/validate")
def validate_coupon(
    code: str = Query(...),
    subtotal: float = Query(..., ge=0),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    result = coupon_service.validate_coupon(code, subtotal)
    return {"success": True, "data": result}


# ─── Admin Coupon Endpoints ────────────────────────────────────


@router.get("/admin/coupons")
def get_all_coupons(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _admin: User = Depends(get_current_admin_user),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    result = coupon_service.get_all_coupons(page, limit)
    return {
        "success": True,
        "data": [_serialize_coupon(c) for c in result["coupons"]],
        "pagination": result["pagination"],
    }


@router.post("/admin/coupons", status_code=status.HTTP_201_CREATED)
def create_coupon(
    request: CouponCreateRequest,
    _admin: User = Depends(get_current_admin_user),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    try:
        coupon = coupon_service.create_coupon(request.model_dump())
        return {
            "success": True,
            "message": "Coupon created",
            "data": _serialize_coupon(coupon),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.put("/admin/coupons/{coupon_id}")
def update_coupon(
    coupon_id: UUID,
    request: CouponUpdateRequest,
    _admin: User = Depends(get_current_admin_user),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    try:
        data = request.model_dump(exclude_unset=True)
        coupon = coupon_service.update_coupon(coupon_id, data)
        return {
            "success": True,
            "message": "Coupon updated",
            "data": _serialize_coupon(coupon),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.delete("/admin/coupons/{coupon_id}")
def delete_coupon(
    coupon_id: UUID,
    _admin: User = Depends(get_current_admin_user),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    try:
        coupon_service.delete_coupon(coupon_id)
        return {"success": True, "message": "Coupon deleted"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


# ─── Admin Auto-Discount Endpoints ─────────────────────────────


@router.get("/admin/discounts")
def get_all_discounts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _admin: User = Depends(get_current_admin_user),
    discount_service: AutoDiscountService = Depends(get_discount_service),
):
    result = discount_service.get_all_discounts(page, limit)
    return {
        "success": True,
        "data": [_serialize_discount(d) for d in result["discounts"]],
        "pagination": result["pagination"],
    }


@router.post("/admin/discounts", status_code=status.HTTP_201_CREATED)
def create_discount(
    request: AutoDiscountCreateRequest,
    _admin: User = Depends(get_current_admin_user),
    discount_service: AutoDiscountService = Depends(get_discount_service),
):
    try:
        discount = discount_service.create_discount(request.model_dump())
        return {
            "success": True,
            "message": "Discount created",
            "data": _serialize_discount(discount),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.put("/admin/discounts/{discount_id}")
def update_discount(
    discount_id: UUID,
    request: AutoDiscountUpdateRequest,
    _admin: User = Depends(get_current_admin_user),
    discount_service: AutoDiscountService = Depends(get_discount_service),
):
    try:
        data = request.model_dump(exclude_unset=True)
        discount = discount_service.update_discount(discount_id, data)
        return {
            "success": True,
            "message": "Discount updated",
            "data": _serialize_discount(discount),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.delete("/admin/discounts/{discount_id}")
def delete_discount(
    discount_id: UUID,
    _admin: User = Depends(get_current_admin_user),
    discount_service: AutoDiscountService = Depends(get_discount_service),
):
    try:
        discount_service.delete_discount(discount_id)
        return {"success": True, "message": "Discount deleted"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


# ─── Admin Flash Sale Endpoints ────────────────────────────────


@router.get("/admin/flash-sales")
def get_all_flash_sales(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _admin: User = Depends(get_current_admin_user),
    flash_sale_service: FlashSaleAdminService = Depends(get_flash_sale_service),
):
    result = flash_sale_service.get_all_sales(page, limit)
    return {
        "success": True,
        "data": [_serialize_flash_sale(s) for s in result["sales"]],
        "pagination": result["pagination"],
    }


@router.post("/admin/flash-sales", status_code=status.HTTP_201_CREATED)
def create_flash_sale(
    request: FlashSaleCreateRequest,
    _admin: User = Depends(get_current_admin_user),
    flash_sale_service: FlashSaleAdminService = Depends(get_flash_sale_service),
):
    try:
        sale = flash_sale_service.create_sale(request.model_dump())
        return {
            "success": True,
            "message": "Flash sale created",
            "data": _serialize_flash_sale(sale),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.put("/admin/flash-sales/{sale_id}")
def update_flash_sale(
    sale_id: UUID,
    request: FlashSaleUpdateRequest,
    _admin: User = Depends(get_current_admin_user),
    flash_sale_service: FlashSaleAdminService = Depends(get_flash_sale_service),
):
    try:
        data = request.model_dump(exclude_unset=True)
        sale = flash_sale_service.update_sale(sale_id, data)
        return {
            "success": True,
            "message": "Flash sale updated",
            "data": _serialize_flash_sale(sale),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.delete("/admin/flash-sales/{sale_id}")
def delete_flash_sale(
    sale_id: UUID,
    _admin: User = Depends(get_current_admin_user),
    flash_sale_service: FlashSaleAdminService = Depends(get_flash_sale_service),
):
    try:
        flash_sale_service.delete_sale(sale_id)
        return {"success": True, "message": "Flash sale deleted"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.post("/admin/flash-sales/{sale_id}/items", status_code=status.HTTP_201_CREATED)
def add_flash_sale_item(
    sale_id: UUID,
    request: FlashSaleItemCreateRequest,
    _admin: User = Depends(get_current_admin_user),
    flash_sale_service: FlashSaleAdminService = Depends(get_flash_sale_service),
):
    try:
        item = flash_sale_service.add_item(sale_id, request.model_dump())
        return {
            "success": True,
            "message": "Item added to flash sale",
            "data": {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "sale_price": float(item.sale_price),
                "stock_limit": item.stock_limit,
                "stock_sold": item.stock_sold,
            },
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.delete("/admin/flash-sales/items/{item_id}")
def remove_flash_sale_item(
    item_id: UUID,
    _admin: User = Depends(get_current_admin_user),
    flash_sale_service: FlashSaleAdminService = Depends(get_flash_sale_service),
):
    try:
        flash_sale_service.remove_item(item_id)
        return {"success": True, "message": "Item removed from flash sale"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


# ─── User Loyalty Endpoints ────────────────────────────────────


@router.get("/loyalty/balance")
def get_loyalty_balance(
    current_user: User = Depends(get_current_active_user),
    loyalty_service: LoyaltyService = Depends(get_loyalty_service),
):
    loyalty = loyalty_service.get_balance(current_user.id)
    return {
        "success": True,
        "data": {
            "points_balance": loyalty.points_balance,
            "lifetime_earned": loyalty.lifetime_earned,
            "lifetime_redeemed": loyalty.lifetime_redeemed,
        },
    }


@router.post("/loyalty/redeem")
def redeem_loyalty_points(
    request: LoyaltyRedeemRequest,
    current_user: User = Depends(get_current_active_user),
    loyalty_service: LoyaltyService = Depends(get_loyalty_service),
):
    discount = loyalty_service.calculate_discount(current_user.id, request.points)
    if discount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient points",
        )
    tx = loyalty_service.redeem_points(current_user.id, request.points)
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to redeem points",
        )
    return {
        "success": True,
        "message": f"Redeemed {request.points} points for ${discount} discount",
        "data": {
            "discount_amount": discount,
            "points_redeemed": request.points,
        },
    }


@router.get("/loyalty/transactions")
def get_loyalty_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    loyalty_service: LoyaltyService = Depends(get_loyalty_service),
):
    result = loyalty_service.get_transactions(current_user.id, page, limit)
    return {
        "success": True,
        "data": [_serialize_transaction(t) for t in result["transactions"]],
        "pagination": result["pagination"],
    }


# ─── User Referral Endpoints ───────────────────────────────────


@router.get("/referral/code")
def get_referral_code(
    current_user: User = Depends(get_current_active_user),
    referral_service: ReferralService = Depends(get_referral_service),
):
    code = referral_service.get_or_create_code(current_user.id)
    return {
        "success": True,
        "data": {
            "code": code.code,
            "usage_count": code.usage_count,
            "max_uses": code.max_uses,
            "is_active": code.is_active,
            "created_at": code.created_at.isoformat() if code.created_at else None,
        },
    }


@router.post("/referral/apply")
def apply_referral(
    request: ReferralApplyRequest,
    current_user: User = Depends(get_current_active_user),
    referral_service: ReferralService = Depends(get_referral_service),
):
    try:
        result = referral_service.apply_referral(
            request.referral_code, current_user.id
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/referral/rewards")
def get_referral_rewards(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    referral_service: ReferralService = Depends(get_referral_service),
):
    result = referral_service.get_rewards(current_user.id, page, limit)
    return {
        "success": True,
        "data": [_serialize_referral_reward(r) for r in result["rewards"]],
        "pagination": result["pagination"],
    }


# ─── Serialization Helpers ─────────────────────────────────────


def _serialize_coupon(coupon) -> dict:
    return {
        "id": str(coupon.id),
        "code": coupon.code,
        "description": coupon.description,
        "discount_type": coupon.discount_type,
        "discount_value": float(coupon.discount_value),
        "min_order_amount": float(coupon.min_order_amount) if coupon.min_order_amount else None,
        "max_uses": coupon.max_uses,
        "used_count": coupon.used_count,
        "per_user_limit": coupon.per_user_limit,
        "is_active": coupon.is_active,
        "start_date": coupon.start_date.isoformat() if coupon.start_date else None,
        "end_date": coupon.end_date.isoformat() if coupon.end_date else None,
        "created_at": coupon.created_at.isoformat() if coupon.created_at else None,
    }


def _serialize_discount(discount) -> dict:
    return {
        "id": str(discount.id),
        "name": discount.name,
        "description": discount.description,
        "discount_type": discount.discount_type,
        "discount_value": float(discount.discount_value),
        "min_order_amount": float(discount.min_order_amount) if discount.min_order_amount else None,
        "min_quantity": discount.min_quantity,
        "target_type": discount.target_type,
        "is_active": discount.is_active,
        "priority": discount.priority,
        "start_date": discount.start_date.isoformat() if discount.start_date else None,
        "end_date": discount.end_date.isoformat() if discount.end_date else None,
        "created_at": discount.created_at.isoformat() if discount.created_at else None,
    }


def _serialize_flash_sale(sale) -> dict:
    return {
        "id": str(sale.id),
        "name": sale.name,
        "description": sale.description,
        "start_date": sale.start_date.isoformat() if sale.start_date else None,
        "end_date": sale.end_date.isoformat() if sale.end_date else None,
        "is_active": sale.is_active,
        "created_at": sale.created_at.isoformat() if sale.created_at else None,
    }


def _serialize_transaction(tx) -> dict:
    return {
        "id": str(tx.id),
        "points": tx.points,
        "transaction_type": tx.transaction_type,
        "description": tx.description,
        "created_at": tx.created_at.isoformat() if tx.created_at else None,
    }


def _serialize_referral_reward(reward) -> dict:
    return {
        "id": str(reward.id),
        "referrer_id": str(reward.referrer_id),
        "referred_id": str(reward.referred_id) if reward.referred_id else None,
        "referral_code": reward.referral_code,
        "reward_type": reward.reward_type,
        "reward_value": reward.reward_value,
        "status": reward.status,
        "created_at": reward.created_at.isoformat() if reward.created_at else None,
    }
