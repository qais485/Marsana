from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    ChangeEmailRequest,
    ChangePasswordRequest,
    Disable2FARequest,
    Enable2FARequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RevokeAllSessionsRequest,
    RevokeDeviceRequest,
    SendEmailVerificationRequest,
    SocialLoginRequest,
    Verify2FARequest,
    VerifyEmailRequest,
    ResetPasswordRequest,
)
from app.services.business_logic import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.register(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
        )
        return {
            "success": True,
            "message": result["message"],
            "data": {"user_id": result["user_id"]},
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login")
def login(
    request: LoginRequest,
    request_obj: Request,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        ip_address = request_obj.client.host if request_obj.client else None
        user_agent = request_obj.headers.get("user-agent")
        result = auth_service.login(
            email=request.email,
            password=request.password,
            ip_address=ip_address,
            user_agent=user_agent,
            device_name=request.device_name,
            device_type=request.device_type,
        )
        if result.get("requires_verification"):
            return {
                "success": False,
                "message": result["message"],
                "data": {"requires_verification": True, "email": result["email"]},
            }
        return {"success": True, "message": "Login successful", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/verify-2fa")
def verify_2fa(
    request: Verify2FARequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        from uuid import UUID
        from app.core.security import decode_token

        payload = decode_token(request.temp_token)
        if not payload or payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired 2FA token",
            )

        user_id = UUID(payload["sub"])
        result = auth_service.verify_2fa(user_id, request.code)
        return {
            "success": True,
            "message": "2FA verification successful",
            "data": result,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


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


@router.post("/email/verify/send")
def send_email_verification(
    request: SendEmailVerificationRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.send_email_verification(request.email)
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        if "wait" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)
        )


@router.get("/email/verification/status")
def get_email_verification_status(
    email: str,
    auth_service: AuthService = Depends(get_auth_service),
):
    result = auth_service.get_email_verification_status(email)
    return {"success": True, "message": "Status retrieved", "data": result}


@router.post("/email/verify")
def verify_email(
    request: VerifyEmailRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.verify_email(request.token, request.code)
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/email/change")
def change_email(
    request: ChangeEmailRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.change_email(
            user_id=current_user.id,
            new_email=request.new_email,
            password=request.password,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/password/forgot")
def forgot_password(
    request: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.forgot_password(request.email)
        return {"success": True, "message": result["message"]}
    except Exception:
        return {"success": True, "message": "If the email exists, a reset link has been sent"}


@router.post("/password/reset")
def reset_password(
    request: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.reset_password(request.token, request.new_password)
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/password/change")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.change_password(
            user_id=current_user.id,
            current_password=request.current_password,
            new_password=request.new_password,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/2fa/enable")
def enable_2fa(
    request: Enable2FARequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.enable_2fa(
            user_id=current_user.id,
            password=request.password,
        )
        return {"success": True, "message": "2FA setup initiated", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/2fa/verify")
def verify_and_enable_2fa(
    request: Verify2FARequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.verify_and_enable_2fa(
            user_id=current_user.id,
            code=request.code,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/2fa/disable")
def disable_2fa(
    request: Disable2FARequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.disable_2fa(
            user_id=current_user.id,
            password=request.password,
            code=request.code,
        )
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/social/login")
def social_login(
    request: SocialLoginRequest,
    request_obj: Request,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        ip_address = request_obj.client.host if request_obj.client else None
        user_agent = request_obj.headers.get("user-agent")

        social_data = _get_social_user_data(request.provider, request.access_token)

        result = auth_service.social_login(
            provider=request.provider,
            provider_user_id=social_data["id"],
            email=social_data["email"],
            first_name=social_data.get("first_name", ""),
            last_name=social_data.get("last_name", ""),
            access_token=request.access_token,
            ip_address=ip_address,
            user_agent=user_agent,
            device_name=request.device_name,
            device_type=request.device_type,
        )
        return {"success": True, "message": "Social login successful", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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
    request: RevokeAllSessionsRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = auth_service.revoke_all_sessions(current_user.id, request.password)
        return {"success": True, "message": result["message"]}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


def _get_social_user_data(provider: str, access_token: str) -> dict:
    if provider == "google":
        return _get_google_user_data(access_token)
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
    }
