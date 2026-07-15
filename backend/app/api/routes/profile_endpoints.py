from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    AccountSettingsUpdateRequest,
    AddressCreateRequest,
    AddressUpdateRequest,
    DeleteAccountRequest,
    PrivacySettingsUpdateRequest,
    ProfileUpdateRequest,
    RecentlyViewedAddRequest,
    WishlistAddRequest,
    WishlistMoveToCartRequest,
)
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])


def get_profile_service(db: Session = Depends(get_db)) -> ProfileService:
    return ProfileService(db)


# ─── Profile Information ──────────────────────────────────────────


@router.get("")
def get_profile(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.get_profile(current_user.id)
        return {"success": True, "message": "Profile retrieved", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("")
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.update_profile(
            user_id=current_user.id,
            first_name=request.first_name,
            last_name=request.last_name,
            phone_number=request.phone_number,
            date_of_birth=request.date_of_birth,
            bio=request.bio,
            gender=request.gender,
            avatar_url=request.avatar_url,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("")
def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.delete_account(
            user_id=current_user.id,
            password=request.password,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ─── Address Management ───────────────────────────────────────────


@router.get("/addresses")
def get_addresses(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    addresses = profile_service.get_addresses(current_user.id)
    return {
        "success": True,
        "message": "Addresses retrieved",
        "data": addresses,
    }


@router.post("/addresses", status_code=status.HTTP_201_CREATED)
def create_address(
    request: AddressCreateRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.create_address(
            user_id=current_user.id,
            address_type=request.address_type,
            label=request.label,
            first_name=request.first_name,
            last_name=request.last_name,
            phone_number=request.phone_number,
            address_line_1=request.address_line_1,
            address_line_2=request.address_line_2,
            city=request.city,
            state=request.state,
            postal_code=request.postal_code,
            country=request.country,
            is_default=request.is_default,
        )
        return {
            "success": True,
            "message": result["message"],
            "data": {"id": result["id"]},
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/addresses/{address_id}")
def update_address(
    address_id: UUID = Path(..., description="Address ID"),
    current_user: User = Depends(get_current_active_user),
    request: AddressUpdateRequest = Body(...),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.update_address(
            user_id=current_user.id,
            address_id=address_id,
            address_type=request.address_type,
            label=request.label,
            first_name=request.first_name,
            last_name=request.last_name,
            phone_number=request.phone_number,
            address_line_1=request.address_line_1,
            address_line_2=request.address_line_2,
            city=request.city,
            state=request.state,
            postal_code=request.postal_code,
            country=request.country,
            is_default=request.is_default,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: UUID = Path(..., description="Address ID"),
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.delete_address(
            user_id=current_user.id,
            address_id=address_id,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ─── Wishlist ─────────────────────────────────────────────────────


@router.get("/wishlist")
def get_wishlist(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    items = profile_service.get_wishlist(current_user.id)
    return {
        "success": True,
        "message": "Wishlist retrieved",
        "data": items,
    }


@router.post("/wishlist", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    request: WishlistAddRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.add_to_wishlist(
            user_id=current_user.id,
            product_id=request.product_id,
            product_name=request.product_name,
            product_price=request.product_price,
            product_image=request.product_image,
        )
        return {
            "success": True,
            "message": result["message"],
            "data": {"id": result["id"]},
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/wishlist/{product_id}")
def remove_from_wishlist(
    product_id: UUID = Path(..., description="Product ID"),
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.remove_from_wishlist(
            user_id=current_user.id,
            product_id=product_id,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/wishlist")
def clear_wishlist(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.clear_wishlist(current_user.id)
    return {"success": True, "message": result["message"]}


@router.post("/wishlist/{product_id}/share")
def share_wishlist_item(
    product_id: UUID = Path(..., description="Product ID"),
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.share_wishlist_item(
            user_id=current_user.id,
            product_id=product_id,
        )
        return {
            "success": True,
            "message": "Share link generated",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/wishlist/{product_id}/move-to-cart")
def move_to_cart(
    product_id: UUID = Path(..., description="Product ID"),
    request: WishlistMoveToCartRequest = None,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        quantity = request.quantity if request else 1
        result = profile_service.move_to_cart(
            user_id=current_user.id,
            product_id=product_id,
            quantity=quantity,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ─── Recently Viewed ─────────────────────────────────────────────


@router.get("/recently-viewed")
def get_recently_viewed(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    items = profile_service.get_recently_viewed(current_user.id, limit)
    return {
        "success": True,
        "message": "Recently viewed products retrieved",
        "data": items,
    }


@router.post("/recently-viewed", status_code=status.HTTP_201_CREATED)
def add_recently_viewed(
    request: RecentlyViewedAddRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.add_recently_viewed(
        user_id=current_user.id,
        product_id=request.product_id,
        product_name=request.product_name,
        product_price=request.product_price,
        product_image=request.product_image,
    )
    return {"success": True, "message": result["message"]}


@router.delete("/recently-viewed")
def clear_recently_viewed(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.clear_recently_viewed(current_user.id)
    return {"success": True, "message": result["message"]}


# ─── Notifications ────────────────────────────────────────────────


@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.get_notifications(current_user.id)
    return {
        "success": True,
        "message": "Notifications retrieved",
        "data": {
            "notifications": result["notifications"],
            "unread_count": result["unread_count"],
        },
    }


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID = Path(..., description="Notification ID"),
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.mark_notification_read(
            user_id=current_user.id,
            notification_id=notification_id,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/notifications/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.mark_all_notifications_read(current_user.id)
    return {"success": True, "message": result["message"]}


# ─── Privacy Settings ─────────────────────────────────────────────


@router.get("/privacy")
def get_privacy_settings(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.get_privacy_settings(current_user.id)
    return {
        "success": True,
        "message": "Privacy settings retrieved",
        "data": result,
    }


@router.patch("/privacy")
def update_privacy_settings(
    request: PrivacySettingsUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.update_privacy_settings(
        user_id=current_user.id,
        show_email=request.show_email,
        show_phone=request.show_phone,
        show_address=request.show_address,
        profile_visible=request.profile_visible,
    )
    return {"success": True, "message": result["message"]}


# ─── Account Settings ─────────────────────────────────────────────


@router.get("/settings")
def get_account_settings(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.get_account_settings(current_user.id)
    return {
        "success": True,
        "message": "Account settings retrieved",
        "data": result,
    }


@router.patch("/settings")
def update_account_settings(
    request: AccountSettingsUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    result = profile_service.update_account_settings(
        user_id=current_user.id,
        email_notifications=request.email_notifications,
        order_updates=request.order_updates,
        promotional_emails=request.promotional_emails,
        security_alerts=request.security_alerts,
        language=request.language,
        currency=request.currency,
    )
    return {"success": True, "message": result["message"]}


# ─── Public Shared Wishlist ──────────────────────────────────────

public_router = APIRouter(prefix="/api/v1/wishlist", tags=["Wishlist"])


@public_router.get("/shared/{share_token}")
def get_shared_wishlist(
    share_token: str = Path(..., description="Share token"),
    profile_service: ProfileService = Depends(get_profile_service),
):
    try:
        result = profile_service.get_shared_wishlist(share_token)
        return {
            "success": True,
            "message": "Shared wishlist retrieved",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
