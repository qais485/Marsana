from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    CancelOrderRequest,
    CheckoutRequest,
    ExchangeRequestCreate,
    GuestCheckoutRequest,
    OrderTrackingRequest,
    ReturnRequestCreate,
    ShippingAddressRequest,
)
from app.services.order_service import OrderService

router = APIRouter(prefix="/api/v1", tags=["Checkout"])


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(db)


@router.post("/checkout", status_code=status.HTTP_201_CREATED)
def place_order(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    if not request.terms_agreed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must agree to the terms and conditions",
        )

    if request.payment_method == "credit_card" and not request.payment_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment details are required for credit card payments",
        )

    try:
        result = order_service.place_order(
            user_id=current_user.id,
            email=request.email,
            shipping_address=request.shipping_address.model_dump(),
            billing_address=request.billing_address.model_dump()
            if request.billing_address
            else None,
            billing_same_as_shipping=request.billing_same_as_shipping,
            shipping_method=request.shipping_method,
            payment_method=request.payment_method,
            payment_details=request.payment_details.model_dump()
            if request.payment_details
            else None,
            notes=request.notes,
            coupon_code=request.coupon_code,
            gift_card_code=request.gift_card_code,
        )
        return {
            "success": True,
            "message": "Order placed successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post("/checkout/guest", status_code=status.HTTP_201_CREATED)
def place_guest_order(
    request: GuestCheckoutRequest,
    order_service: OrderService = Depends(get_order_service),
):
    if not request.terms_agreed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must agree to the terms and conditions",
        )

    if request.payment_method == "credit_card" and not request.payment_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment details are required for credit card payments",
        )

    try:
        result = order_service.place_guest_order(
            email=request.email,
            shipping_address=request.shipping_address.model_dump(),
            billing_address=request.billing_address.model_dump()
            if request.billing_address
            else None,
            billing_same_as_shipping=request.billing_same_as_shipping,
            shipping_method=request.shipping_method,
            payment_method=request.payment_method,
            payment_details=request.payment_details.model_dump()
            if request.payment_details
            else None,
            notes=request.notes,
            coupon_code=request.coupon_code,
            gift_card_code=request.gift_card_code,
            cart_items_data=[item.model_dump() for item in request.cart_items],
        )
        return {
            "success": True,
            "message": "Order placed successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/orders")
def get_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    result = order_service.get_customer_orders(
        user_id=current_user.id, page=page, limit=limit
    )
    return {
        "success": True,
        "message": "Orders retrieved",
        "data": result["orders"],
        "pagination": result["pagination"],
    }


@router.get("/orders/{order_id}")
def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.get_customer_order(
            user_id=current_user.id, order_id=order_id
        )
        return {
            "success": True,
            "message": "Order retrieved",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.post("/orders/track")
def track_order(
    request: OrderTrackingRequest,
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.track_order(
            email=request.email, order_number=request.order_number
        )
        return {
            "success": True,
            "message": "Order found",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.post("/orders/{order_id}/cancel")
def cancel_order(
    order_id: UUID,
    request: CancelOrderRequest,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.cancel_order(
            user_id=current_user.id, order_id=order_id, reason=request.reason
        )
        return {
            "success": True,
            "message": "Order cancelled successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post("/orders/{order_id}/return")
def request_return(
    order_id: UUID,
    request: ReturnRequestCreate,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.request_return(
            user_id=current_user.id, order_id=order_id, data=request.model_dump()
        )
        return {
            "success": True,
            "message": "Return request submitted successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post("/orders/{order_id}/exchange")
def request_exchange(
    order_id: UUID,
    request: ExchangeRequestCreate,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.request_exchange(
            user_id=current_user.id, order_id=order_id, data=request.model_dump()
        )
        return {
            "success": True,
            "message": "Exchange request submitted successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/orders/{order_id}/invoice")
def get_invoice(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.get_invoice(
            user_id=current_user.id, order_id=order_id
        )
        return {
            "success": True,
            "message": "Invoice retrieved",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.post("/shipping/methods")
def get_shipping_methods(
    address: ShippingAddressRequest,
    subtotal: float = Query(default=0, ge=0),
    order_service: OrderService = Depends(get_order_service),
):
    result = order_service.get_available_shipping_methods(
        address=address.model_dump(),
        subtotal=subtotal,
    )
    return {
        "success": True,
        "message": "Shipping methods retrieved",
        "data": result,
    }


@router.get("/shipping/pickup-locations")
def get_pickup_locations(
    order_service: OrderService = Depends(get_order_service),
):
    result = order_service.get_pickup_locations()
    return {
        "success": True,
        "message": "Pickup locations retrieved",
        "data": result,
    }


@router.get("/orders/{order_id}/tracking")
def get_order_tracking(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    order_service: OrderService = Depends(get_order_service),
):
    try:
        result = order_service.get_delivery_tracking(
            user_id=current_user.id, order_id=order_id
        )
        return {
            "success": True,
            "message": "Tracking retrieved",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
