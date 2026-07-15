from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.category_service import CategoryService

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    return CategoryService(db)


@router.get("")
def get_categories(
    category_service: CategoryService = Depends(get_category_service),
):
    try:
        categories = category_service.get_categories_tree()
        return {
            "success": True,
            "message": "Categories retrieved",
            "data": categories,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve categories",
        )


@router.get("/all")
def get_all_categories(
    category_service: CategoryService = Depends(get_category_service),
):
    try:
        categories = category_service.get_all_categories()
        return {
            "success": True,
            "message": "All categories retrieved",
            "data": categories,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve categories",
        )


@router.get("/featured")
def get_featured_categories(
    limit: int = Query(6, ge=1, le=20),
    category_service: CategoryService = Depends(get_category_service),
):
    try:
        categories = category_service.get_featured_categories(limit=limit)
        return {
            "success": True,
            "message": "Featured categories retrieved",
            "data": categories,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve featured categories",
        )


@router.get("/{slug}")
def get_category_by_slug(
    slug: str,
    category_service: CategoryService = Depends(get_category_service),
):
    try:
        result = category_service.get_category_by_slug(slug)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )
        return {
            "success": True,
            "message": "Category retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve category",
        )


@router.get("/{slug}/children")
def get_category_children(
    slug: str,
    category_service: CategoryService = Depends(get_category_service),
):
    try:
        children = category_service.get_category_children(slug)
        if children is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )
        return {
            "success": True,
            "message": "Category children retrieved",
            "data": children,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve category children",
        )
