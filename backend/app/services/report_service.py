import logging
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.report_repository import ReportRepository

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.report_repo = ReportRepository(db)

    def get_sales_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        return self.report_repo.get_sales_summary(start_date, end_date)

    def get_product_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        return self.report_repo.get_product_summary(start_date, end_date)

    def get_customer_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        return self.report_repo.get_customer_summary(start_date, end_date)

    def get_inventory_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        return self.report_repo.get_inventory_summary(start_date, end_date)

    def get_financial_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        return self.report_repo.get_financial_summary(start_date, end_date)
