from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.services.store_setting_service import StoreSettingService

router = APIRouter(prefix="/api/v1/admin/settings", tags=["Admin Settings"])


def get_store_setting_service(db: Session = Depends(get_db)) -> StoreSettingService:
    return StoreSettingService(db)


class SettingUpdateRequest(BaseModel):
    value: Any


class SettingsBulkUpdateRequest(BaseModel):
    settings: list[dict]


@router.get("/")
def get_all_settings(
    current_user: User = Depends(get_current_admin_user),
    setting_service: StoreSettingService = Depends(get_store_setting_service),
):
    try:
        data = setting_service.get_all_settings()
        return {
            "success": True,
            "message": "Settings retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve settings",
        )


@router.get("/{category}")
def get_settings_by_category(
    category: str,
    current_user: User = Depends(get_current_admin_user),
    setting_service: StoreSettingService = Depends(get_store_setting_service),
):
    try:
        data = setting_service.get_settings_by_category(category)
        return {
            "success": True,
            "message": f"Settings for '{category}' retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve settings for '{category}'",
        )


@router.get("/key/{key}")
def get_setting_by_key(
    key: str,
    current_user: User = Depends(get_current_admin_user),
    setting_service: StoreSettingService = Depends(get_store_setting_service),
):
    try:
        data = setting_service.get_setting(key)
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Setting '{key}' not found",
            )
        return {
            "success": True,
            "message": f"Setting '{key}' retrieved",
            "data": data,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve setting '{key}'",
        )


@router.put("/key/{key}")
def update_setting(
    key: str,
    request: SettingUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    setting_service: StoreSettingService = Depends(get_store_setting_service),
):
    try:
        data = setting_service.update_setting(key, request.value)
        return {
            "success": True,
            "message": f"Setting '{key}' updated",
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
            detail=f"Failed to update setting '{key}'",
        )


@router.put("/bulk")
def update_settings_bulk(
    request: SettingsBulkUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    setting_service: StoreSettingService = Depends(get_store_setting_service),
):
    try:
        data = setting_service.update_settings_bulk(request.settings)
        return {
            "success": True,
            "message": "Settings updated",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update settings",
        )


@router.post("/initialize")
def initialize_default_settings(
    current_user: User = Depends(get_current_admin_user),
    setting_service: StoreSettingService = Depends(get_store_setting_service),
):
    try:
        data = setting_service.initialize_default_settings()
        return {
            "success": True,
            "message": "Default settings initialized",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize default settings",
        )
