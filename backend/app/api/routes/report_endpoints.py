from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


def get_report_service(db: Session = Depends(get_db)) -> ReportService:
    return ReportService(db)


@router.get("/sales")
def get_sales_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    report_service: ReportService = Depends(get_report_service),
):
    try:
        data = report_service.get_sales_report(start_date, end_date)
        return {
            "success": True,
            "message": "Sales report retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve sales report",
        )


@router.get("/products")
def get_product_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    report_service: ReportService = Depends(get_report_service),
):
    try:
        data = report_service.get_product_report(start_date, end_date)
        return {
            "success": True,
            "message": "Product report retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve product report",
        )


@router.get("/customers")
def get_customer_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    report_service: ReportService = Depends(get_report_service),
):
    try:
        data = report_service.get_customer_report(start_date, end_date)
        return {
            "success": True,
            "message": "Customer report retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer report",
        )


@router.get("/inventory")
def get_inventory_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    report_service: ReportService = Depends(get_report_service),
):
    try:
        data = report_service.get_inventory_report(start_date, end_date)
        return {
            "success": True,
            "message": "Inventory report retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve inventory report",
        )


@router.get("/financial")
def get_financial_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    report_service: ReportService = Depends(get_report_service),
):
    try:
        data = report_service.get_financial_report(start_date, end_date)
        return {
            "success": True,
            "message": "Financial report retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve financial report",
        )
