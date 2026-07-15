from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    ContactMessageUpdateRequest,
    FAQItemCreateRequest,
    FAQItemUpdateRequest,
    HelpArticleCreateRequest,
    HelpArticleUpdateRequest,
)
from app.services.customer_support_service import CustomerSupportService

router = APIRouter(prefix="/api/v1/admin/support", tags=["Admin Customer Support"])


def get_customer_support_service(db: Session = Depends(get_db)) -> CustomerSupportService:
    return CustomerSupportService(db)


# ─── Contact Messages ─────────────────────────────────────────────


@router.get("/contact-messages")
def get_contact_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        data = support_service.get_contact_messages(page=page, limit=limit, status=status_filter)
        return {
            "success": True,
            "message": "Contact messages retrieved",
            "data": data["messages"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contact messages",
        )


@router.get("/contact-messages/stats")
def get_contact_stats(
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        stats = support_service.get_contact_stats()
        return {
            "success": True,
            "message": "Contact stats retrieved",
            "data": stats,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contact stats",
        )


@router.get("/contact-messages/{message_id}")
def get_contact_message(
    message_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        message = support_service.get_contact_message(message_id)
        return {
            "success": True,
            "message": "Contact message retrieved",
            "data": message,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contact message",
        )


@router.put("/contact-messages/{message_id}")
def update_contact_message(
    message_id: UUID,
    request: ContactMessageUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        data = request.model_dump(exclude_unset=True)
        message = support_service.update_contact_message(message_id, data)
        return {
            "success": True,
            "message": "Contact message updated",
            "data": message,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update contact message",
        )


@router.delete("/contact-messages/{message_id}")
def delete_contact_message(
    message_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        support_service.delete_contact_message(message_id)
        return {
            "success": True,
            "message": "Contact message deleted",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete contact message",
        )


# ─── FAQ Items ────────────────────────────────────────────────────


@router.get("/faq")
def get_faq_items(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        data = support_service.get_faq_items(page=page, limit=limit, category=category)
        return {
            "success": True,
            "message": "FAQ items retrieved",
            "data": data["faqs"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve FAQ items",
        )


@router.get("/faq/categories")
def get_faq_categories(
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        categories = support_service.get_faq_categories()
        return {
            "success": True,
            "message": "FAQ categories retrieved",
            "data": categories,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve FAQ categories",
        )


@router.get("/faq/{faq_id}")
def get_faq_item(
    faq_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        faq = support_service.get_faq_item(faq_id)
        return {
            "success": True,
            "message": "FAQ item retrieved",
            "data": faq,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve FAQ item",
        )


@router.post("/faq", status_code=status.HTTP_201_CREATED)
def create_faq_item(
    request: FAQItemCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        faq = support_service.create_faq_item(request.model_dump())
        return {
            "success": True,
            "message": "FAQ item created",
            "data": faq,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create FAQ item",
        )


@router.put("/faq/{faq_id}")
def update_faq_item(
    faq_id: UUID,
    request: FAQItemUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        data = request.model_dump(exclude_unset=True)
        faq = support_service.update_faq_item(faq_id, data)
        return {
            "success": True,
            "message": "FAQ item updated",
            "data": faq,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update FAQ item",
        )


@router.delete("/faq/{faq_id}")
def delete_faq_item(
    faq_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        support_service.delete_faq_item(faq_id)
        return {
            "success": True,
            "message": "FAQ item deleted",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete FAQ item",
        )


# ─── Help Articles ────────────────────────────────────────────────


@router.get("/help-articles")
def get_help_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        data = support_service.get_help_articles(page=page, limit=limit, category=category)
        return {
            "success": True,
            "message": "Help articles retrieved",
            "data": data["articles"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve help articles",
        )


@router.get("/help-articles/categories")
def get_help_categories(
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        categories = support_service.get_help_categories()
        return {
            "success": True,
            "message": "Help categories retrieved",
            "data": categories,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve help categories",
        )


@router.get("/help-articles/{article_id}")
def get_help_article(
    article_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        article = support_service.get_help_article(article_id)
        return {
            "success": True,
            "message": "Help article retrieved",
            "data": article,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve help article",
        )


@router.post("/help-articles", status_code=status.HTTP_201_CREATED)
def create_help_article(
    request: HelpArticleCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        article = support_service.create_help_article(request.model_dump())
        return {
            "success": True,
            "message": "Help article created",
            "data": article,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create help article",
        )


@router.put("/help-articles/{article_id}")
def update_help_article(
    article_id: UUID,
    request: HelpArticleUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        data = request.model_dump(exclude_unset=True)
        article = support_service.update_help_article(article_id, data)
        return {
            "success": True,
            "message": "Help article updated",
            "data": article,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update help article",
        )


@router.delete("/help-articles/{article_id}")
def delete_help_article(
    article_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        support_service.delete_help_article(article_id)
        return {
            "success": True,
            "message": "Help article deleted",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete help article",
        )
