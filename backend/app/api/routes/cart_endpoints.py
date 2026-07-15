from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    CartAddRequest,
    CartApplyCouponRequest,
    CartApplyGiftCardRequest,
    CartShippingRequest,
    CartUpdateQuantityRequest,
)
from app.services.cart_service import CartService

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


def get_cart_service(db: Session = Depends(get_db)) -> CartService:
    return CartService(db)


@router.get("")
def get_cart(
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    result = cart_service.get_cart(current_user.id)
    return {"success": True, "message": "Cart retrieved", "data": result}


@router.post("/items", status_code=status.HTTP_201_CREATED)
def add_to_cart(
    request: CartAddRequest,
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.add_to_cart(
            user_id=current_user.id,
            product_id=request.product_id,
            quantity=request.quantity,
            variant_id=request.variant_id,
        )
        return {"success": True, "message": "Item added to cart", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/items/{item_id}")
def update_quantity(
    item_id: UUID = Path(..., description="Cart Item ID"),
    request: CartUpdateQuantityRequest = Body(...),
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.update_quantity(
            user_id=current_user.id,
            item_id=item_id,
            quantity=request.quantity,
        )
        return {"success": True, "message": "Quantity updated", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/items/{item_id}")
def remove_from_cart(
    item_id: UUID = Path(..., description="Cart Item ID"),
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.remove_from_cart(
            user_id=current_user.id,
            item_id=item_id,
        )
        return {"success": True, "message": "Item removed from cart", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("")
def clear_cart(
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    result = cart_service.clear_cart(current_user.id)
    return {"success": True, "message": "Cart cleared", "data": result}


@router.post("/coupon")
def apply_coupon(
    request: CartApplyCouponRequest,
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.apply_coupon(
            user_id=current_user.id,
            coupon_code=request.coupon_code,
        )
        return {"success": True, "message": "Coupon applied", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/coupon")
def remove_coupon(
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    result = cart_service.remove_coupon(current_user.id)
    return {"success": True, "message": "Coupon removed", "data": result}


@router.post("/gift-card")
def apply_gift_card(
    request: CartApplyGiftCardRequest,
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.apply_gift_card(
            user_id=current_user.id,
            gift_card_code=request.gift_card_code,
        )
        return {"success": True, "message": "Gift card applied", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/gift-card")
def remove_gift_card(
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    result = cart_service.remove_gift_card(current_user.id)
    return {"success": True, "message": "Gift card removed", "data": result}


@router.post("/shipping")
def set_shipping_method(
    request: CartShippingRequest,
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.set_shipping_method(
            user_id=current_user.id,
            shipping_method=request.shipping_method,
        )
        return {"success": True, "message": "Shipping method updated", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/shipping-methods")
def get_shipping_methods(
    cart_service: CartService = Depends(get_cart_service),
):
    methods = cart_service.get_shipping_methods()
    return {"success": True, "message": "Shipping methods retrieved", "data": methods}


@router.post("/save-for-later/{item_id}")
def save_for_later(
    item_id: UUID = Path(..., description="Cart Item ID"),
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.save_for_later(
            user_id=current_user.id,
            item_id=item_id,
        )
        return {"success": True, "message": "Item saved for later", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/move-to-cart/{saved_item_id}")
def move_to_cart(
    saved_item_id: UUID = Path(..., description="Saved Item ID"),
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.move_to_cart(
            user_id=current_user.id,
            saved_item_id=saved_item_id,
        )
        return {"success": True, "message": "Item moved to cart", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/saved/{saved_item_id}")
def remove_saved_item(
    saved_item_id: UUID = Path(..., description="Saved Item ID"),
    current_user: User = Depends(get_current_active_user),
    cart_service: CartService = Depends(get_cart_service),
):
    try:
        result = cart_service.remove_saved_item(
            user_id=current_user.id,
            saved_item_id=saved_item_id,
        )
        return {"success": True, "message": "Saved item removed", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
