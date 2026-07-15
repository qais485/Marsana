from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import ProductReviewCreateRequest, ReviewReportRequest
from app.services.product_catalog_service import ProductCatalogService

router = APIRouter(prefix="/api/v1/products", tags=["Product Catalog"])


def get_product_catalog_service(db: Session = Depends(get_db)) -> ProductCatalogService:
    return ProductCatalogService(db)


@router.get("/{product_id}/reviews")
def get_product_reviews(
    product_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        result = catalog_service.get_product_reviews(
            product_id=product_id, page=page, limit=limit
        )
        return {
            "success": True,
            "message": "Product reviews retrieved",
            "data": result["reviews"],
            "rating_summary": result["rating_summary"],
            "pagination": result["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve product reviews",
        )


@router.post("/{product_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: UUID,
    request: ProductReviewCreateRequest,
    current_user: User = Depends(get_current_active_user),
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        result = catalog_service.create_review(
            product_id=product_id,
            user_id=current_user.id,
            rating=request.rating,
            title=request.title,
            content=request.content,
        )
        return {
            "success": True,
            "message": "Review created successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create review",
        )


@router.post("/{product_id}/reviews/{review_id}/helpful")
def toggle_review_helpful(
    product_id: UUID,
    review_id: UUID,
    current_user: User = Depends(get_current_active_user),
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        result = catalog_service.toggle_review_helpful(
            product_id=product_id,
            review_id=review_id,
            user_id=current_user.id,
        )
        return {
            "success": True,
            "message": "Helpful status updated",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update helpful status",
        )


@router.post("/{product_id}/reviews/{review_id}/report")
def report_review(
    product_id: UUID,
    review_id: UUID,
    request: ReviewReportRequest,
    current_user: User = Depends(get_current_active_user),
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        result = catalog_service.report_review(
            product_id=product_id,
            review_id=review_id,
            user_id=current_user.id,
            reason=request.reason,
            description=request.description,
        )
        return {
            "success": True,
            "message": result["message"],
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to report review",
        )


@router.get("/{product_id}/related")
def get_related_products(
    product_id: UUID,
    limit: int = Query(4, ge=1, le=20),
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        products = catalog_service.get_related_products(
            product_id=product_id, limit=limit
        )
        return {
            "success": True,
            "message": "Related products retrieved",
            "data": products,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve related products",
        )


@router.get("/{product_id}/similar")
def get_similar_products(
    product_id: UUID,
    limit: int = Query(4, ge=1, le=20),
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        products = catalog_service.get_similar_products(
            product_id=product_id, limit=limit
        )
        return {
            "success": True,
            "message": "Similar products retrieved",
            "data": products,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve similar products",
        )


@router.get("/{slug}")
def get_product_detail(
    slug: str,
    catalog_service: ProductCatalogService = Depends(get_product_catalog_service),
):
    try:
        result = catalog_service.get_product_detail(slug)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found",
            )
        return {
            "success": True,
            "message": "Product detail retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve product detail",
        )
