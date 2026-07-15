from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    SearchHistoryCreateRequest,
)
from app.services.search_service import SearchService

router = APIRouter(prefix="/api/v1/search", tags=["Search"])


def get_search_service(db: Session = Depends(get_db)) -> SearchService:
    return SearchService(db)


@router.get("/suggestions")
def get_search_suggestions(
    q: str = Query(..., min_length=1, max_length=255),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        results = search_service.get_suggestions(q)
        return {
            "success": True,
            "message": "Search suggestions retrieved",
            "data": results,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve search suggestions",
        )


@router.get("/popular")
def get_popular_searches(
    limit: int = Query(10, ge=1, le=20),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        results = search_service.get_popular_searches(limit)
        return {
            "success": True,
            "message": "Popular searches retrieved",
            "data": results,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve popular searches",
        )


@router.get("")
def search(
    q: str = Query(..., min_length=1, max_length=255),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        result = search_service.search(
            query=q, page=page, limit=limit
        )
        return {
            "success": True,
            "message": "Search results retrieved",
            "data": result["results"],
            "pagination": result["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform search",
        )


@router.get("/history")
def get_search_history(
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        results = search_service.get_history(current_user.id, limit)
        return {
            "success": True,
            "message": "Search history retrieved",
            "data": results,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve search history",
        )


@router.post("/history", status_code=status.HTTP_201_CREATED)
def add_to_search_history(
    request: SearchHistoryCreateRequest,
    current_user: User = Depends(get_current_active_user),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        search_service.add_to_history(current_user.id, request.query)
        return {
            "success": True,
            "message": "Added to search history",
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add to search history",
        )


@router.delete("/history/{history_id}")
def remove_from_search_history(
    history_id: str,
    current_user: User = Depends(get_current_active_user),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        from uuid import UUID

        removed = search_service.remove_from_history(
            current_user.id, UUID(history_id)
        )
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="History item not found",
            )
        return {
            "success": True,
            "message": "Removed from search history",
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove from search history",
        )


@router.delete("/history")
def clear_search_history(
    current_user: User = Depends(get_current_active_user),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        search_service.clear_history(current_user.id)
        return {
            "success": True,
            "message": "Search history cleared",
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear search history",
        )
