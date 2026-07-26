from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    LogoutRequest,
    RefreshTokenRequest,
    RevokeDeviceRequest,
    SocialLoginRequest,
)
from app.services.business_logic import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/social/login")
async def social_login(
    request: SocialLoginRequest,
    request_obj: Request,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        ip_address = request_obj.client.host if request_obj.client else None
        user_agent = request_obj.headers.get("user-agent")

        social_data = await _get_social_user_data(request.provider, request.access_token)

        result = auth_service.social_login(
            provider=request.provider,
            provider_user_id=social_data["id"],
            email=social_data["email"],
            first_name=social_data.get("first_name", ""),
            last_name=social_data.get("last_name", ""),
            avatar_url=social_data.get("avatar_url"),
            access_token=request.access_token,
            ip_address=ip_address,
            user_agent=user_agent,
            device_name=request.device_name,
            device_type=request.device_type,
        )
        return {"success": True, "message": "Login successful", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/logout")
def logout(
    request: LogoutRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.logout(request.refresh_token)
        return {"success": True, "message": result["message"]}
    except Exception:
        return {"success": True, "message": "Logged out successfully"}


@router.post("/refresh")
def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.refresh_token(request.refresh_token)
        return {"success": True, "message": "Token refreshed", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/devices")
def get_devices(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    devices = auth_service.get_devices(current_user.id)
    return {
        "success": True,
        "message": "Devices retrieved",
        "data": [
            {
                "id": str(d.id),
                "device_name": d.device_name,
                "device_type": d.device_type,
                "device_os": d.device_os,
                "browser": d.browser,
                "ip_address": d.ip_address,
                "last_active_at": d.last_active_at.isoformat() if d.last_active_at else None,
                "is_trusted": d.is_trusted,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in devices
        ],
    }


@router.get("/sessions")
def get_sessions(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    sessions = auth_service.get_sessions(current_user.id)
    return {
        "success": True,
        "message": "Sessions retrieved",
        "data": [
            {
                "id": str(s.id),
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat(),
                "expires_at": s.expires_at.isoformat(),
            }
            for s in sessions
        ],
    }


@router.post("/devices/revoke")
def revoke_device(
    request: RevokeDeviceRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.revoke_device(current_user.id, request.device_id)
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/sessions/revoke-all")
def revoke_all_sessions(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.revoke_all_sessions(current_user.id)
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


async def _get_social_user_data(provider: str, access_token: str) -> dict:
    if provider == "google":
        return await _get_google_user_data(access_token)
    raise ValueError(f"Unsupported provider: {provider}")


async def _get_google_user_data(access_token: str) -> dict:
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise ValueError("Failed to authenticate with Google")
    data = response.json()
    return {
        "id": data["id"],
        "email": data["email"],
        "first_name": data.get("given_name", ""),
        "last_name": data.get("family_name", ""),
        "avatar_url": data.get("picture"),
    }
