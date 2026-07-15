from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.request_response_models import ContactMessageCreateRequest
from app.services.customer_support_service import CustomerSupportService

router = APIRouter(prefix="/api/v1/support", tags=["Customer Support"])


def get_customer_support_service(db: Session = Depends(get_db)) -> CustomerSupportService:
    return CustomerSupportService(db)


@router.post("/contact", status_code=status.HTTP_201_CREATED)
def submit_contact_form(
    request: ContactMessageCreateRequest,
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        message = support_service.create_contact_message(request.model_dump())
        return {
            "success": True,
            "message": "Your message has been submitted. We will get back to you soon.",
            "data": message,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact message",
        )


@router.get("/faq")
def get_faq(
    category: Optional[str] = None,
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        faqs = support_service.get_active_faqs(category=category)
        return {
            "success": True,
            "message": "FAQ items retrieved",
            "data": faqs,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve FAQ items",
        )


@router.get("/faq/categories")
def get_faq_categories(
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


@router.get("/help")
def get_help_articles(
    category: Optional[str] = None,
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        articles = support_service.get_published_articles(category=category)
        return {
            "success": True,
            "message": "Help articles retrieved",
            "data": articles,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve help articles",
        )


@router.get("/help/categories")
def get_help_categories(
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


@router.get("/help/{slug}")
def get_help_article_by_slug(
    slug: str,
    support_service: CustomerSupportService = Depends(get_customer_support_service),
):
    try:
        article = support_service.get_help_article_by_slug(slug)
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
