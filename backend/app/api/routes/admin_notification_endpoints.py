from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    NotificationBroadcastRequest,
    NotificationCreateRequest,
    NotificationTemplateCreateRequest,
    NotificationTemplateUpdateRequest,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Notifications"])


def get_notification_service(db: Session = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


# ─── Template Management ─────────────────────────────────────────


@router.get("/notification-templates")
def get_notification_templates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    notification_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.get_templates(page, limit, notification_type, is_active)
        return {
            "success": True,
            "message": "Notification templates retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification templates",
        )


@router.get("/notification-templates/{template_id}")
def get_notification_template(
    template_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.get_template(template_id)
        return {
            "success": True,
            "message": "Notification template retrieved",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification template",
        )


@router.post("/notification-templates", status_code=status.HTTP_201_CREATED)
def create_notification_template(
    request: NotificationTemplateCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.create_template(request.model_dump())
        return {
            "success": True,
            "message": "Notification template created",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification template",
        )


@router.put("/notification-templates/{template_id}")
def update_notification_template(
    template_id: UUID,
    request: NotificationTemplateUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.update_template(template_id, request.model_dump(exclude_unset=True))
        return {
            "success": True,
            "message": "Notification template updated",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification template",
        )


@router.patch("/notification-templates/{template_id}/toggle")
def toggle_notification_template(
    template_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.toggle_template(template_id)
        return {
            "success": True,
            "message": "Notification template toggled",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle notification template",
        )


@router.delete("/notification-templates/{template_id}")
def delete_notification_template(
    template_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        notification_service.delete_template(template_id)
        return {
            "success": True,
            "message": "Notification template deleted",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification template",
        )


# ─── Notification Management ─────────────────────────────────────
# NOTE: Route ordering matters here. This "/notifications" endpoint must be
# defined before any "/notifications/{id}" routes to avoid path conflicts.


@router.get("/notifications")
def get_admin_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    notification_type: Optional[str] = Query(None),
    is_read: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.get_admin_notifications(page, limit, notification_type, is_read)
        return {
            "success": True,
            "message": "Notifications retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications",
        )


@router.get("/notifications/stats")
def get_notification_stats(
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.get_notification_stats()
        return {
            "success": True,
            "message": "Notification statistics retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification statistics",
        )


@router.post("/notifications", status_code=status.HTTP_201_CREATED)
def create_notification(
    request: NotificationCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.create_notification(
            request.model_dump(),
            admin_id=current_user.id,
        )
        return {
            "success": True,
            "message": "Notification created",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification",
        )


@router.post("/notifications/broadcast", status_code=status.HTTP_201_CREATED)
def broadcast_notification(
    request: NotificationBroadcastRequest,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        data = notification_service.broadcast_notification(request.model_dump())
        return {
            "success": True,
            "message": "Notification broadcasted",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to broadcast notification",
        )


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    try:
        notification_service.delete_notification(notification_id)
        return {
            "success": True,
            "message": "Notification deleted",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification",
        )
