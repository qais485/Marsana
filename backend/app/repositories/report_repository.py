from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func, case, and_, extract
from sqlalchemy.orm import Session

from app.models.database_models import (
    Order,
    OrderItem,
    Product,
    User,
    Category,
    Cart,
    CartItem,
)


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_sales_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        query = self.db.query(Order)

        if start_date:
            query = query.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))

        total_orders = query.count()
        total_revenue = query.filter(Order.status != "cancelled").with_entities(
            func.coalesce(func.sum(Order.total_amount), 0)
        ).scalar()
        average_order_value = total_revenue / max(total_orders, 1)

        total_items_sold = self.db.query(func.coalesce(func.sum(OrderItem.quantity), 0)).join(
            Order
        )
        if start_date:
            total_items_sold = total_items_sold.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            total_items_sold = total_items_sold.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))
        total_items_sold = total_items_sold.scalar()

        orders_by_status = {}
        status_query = query.with_entities(Order.status, func.count(Order.id)).group_by(Order.status)
        for status, count in status_query.all():
            orders_by_status[status] = count

        revenue_by_period = []
        period_query = (
            query.filter(Order.status != "cancelled")
            .with_entities(
                func.date_trunc("day", Order.created_at).label("period"),
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
                func.count(Order.id).label("orders"),
            )
            .group_by(func.date_trunc("day", Order.created_at))
            .order_by(func.date_trunc("day", Order.created_at))
        )
        for period, revenue, orders in period_query.all():
            revenue_by_period.append({
                "date": period.isoformat() if period else None,
                "revenue": float(revenue),
                "orders": orders,
            })

        return {
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "average_order_value": float(average_order_value),
            "total_items_sold": total_items_sold,
            "orders_by_status": orders_by_status,
            "revenue_by_period": revenue_by_period,
        }

    def get_product_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        total_products = self.db.query(Product).filter(Product.is_active).count()
        active_products = self.db.query(Product).filter(Product.is_active).count()
        out_of_stock = self.db.query(Product).filter(
            Product.is_active, Product.stock_quantity == 0
        ).count()
        low_stock = self.db.query(Product).filter(
            Product.is_active, Product.stock_quantity > 0, Product.stock_quantity <= 10
        ).count()

        top_selling_query = (
            self.db.query(
                Product.id,
                Product.name,
                func.coalesce(func.sum(OrderItem.quantity), 0).label("total_sold"),
            )
            .join(OrderItem, Product.id == OrderItem.product_id)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(Order.status != "cancelled")
        )
        if start_date:
            top_selling_query = top_selling_query.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            top_selling_query = top_selling_query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))

        top_selling = (
            top_selling_query.group_by(Product.id, Product.name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(10)
            .all()
        )

        category_distribution = (
            self.db.query(
                Category.name,
                func.count(Product.id).label("product_count"),
            )
            .join(Product, Category.id == Product.category_id)
            .filter(Product.is_active)
            .group_by(Category.name)
            .order_by(func.count(Product.id).desc())
            .all()
        )

        revenue_by_product_query = (
            self.db.query(
                Product.id,
                Product.name,
                func.coalesce(func.sum(OrderItem.quantity * OrderItem.price), 0).label("revenue"),
            )
            .join(OrderItem, Product.id == OrderItem.product_id)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(Order.status != "cancelled")
        )
        if start_date:
            revenue_by_product_query = revenue_by_product_query.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            revenue_by_product_query = revenue_by_product_query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))

        revenue_by_product = (
            revenue_by_product_query.group_by(Product.id, Product.name)
            .order_by(func.sum(OrderItem.quantity * OrderItem.price).desc())
            .limit(10)
            .all()
        )

        return {
            "total_products": total_products,
            "active_products": active_products,
            "out_of_stock": out_of_stock,
            "low_stock": low_stock,
            "top_selling": [
                {"id": str(pid), "name": name, "total_sold": int(sold)}
                for pid, name, sold in top_selling
            ],
            "category_distribution": [
                {"name": name, "count": count}
                for name, count in category_distribution
            ],
            "revenue_by_product": [
                {"id": str(pid), "name": name, "revenue": float(revenue)}
                for pid, name, revenue in revenue_by_product
            ],
        }

    def get_customer_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        total_customers = self.db.query(User).filter(User.role == "user").count()
        active_customers = self.db.query(User).filter(
            User.role == "user", User.is_active
        ).count()

        new_customers_query = self.db.query(User).filter(User.role == "user")
        if start_date:
            new_customers_query = new_customers_query.filter(
                User.created_at >= datetime.combine(start_date, datetime.min.time())
            )
        if end_date:
            new_customers_query = new_customers_query.filter(
                User.created_at <= datetime.combine(end_date, datetime.max.time())
            )
        new_customers = new_customers_query.count()

        customers_by_role = {}
        role_query = (
            self.db.query(User.role, func.count(User.id))
            .group_by(User.role)
        )
        for role, count in role_query.all():
            customers_by_role[role] = count

        top_customers_query = (
            self.db.query(
                User.id,
                User.first_name,
                User.last_name,
                User.email,
                func.coalesce(func.count(Order.id), 0).label("order_count"),
                func.coalesce(func.sum(Order.total_amount), 0).label("total_spent"),
            )
            .join(Order, User.id == Order.user_id)
            .filter(User.role == "user", Order.status != "cancelled")
        )
        if start_date:
            top_customers_query = top_customers_query.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            top_customers_query = top_customers_query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))

        top_customers = (
            top_customers_query.group_by(User.id, User.first_name, User.last_name, User.email)
            .order_by(func.sum(Order.total_amount).desc())
            .limit(10)
            .all()
        )

        registration_trend = []
        trend_query = (
            self.db.query(
                func.date_trunc("day", User.created_at).label("date"),
                func.count(User.id).label("count"),
            )
            .filter(User.role == "user")
        )
        if start_date:
            trend_query = trend_query.filter(User.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            trend_query = trend_query.filter(User.created_at <= datetime.combine(end_date, datetime.max.time()))

        trend_data = (
            trend_query.group_by(func.date_trunc("day", User.created_at))
            .order_by(func.date_trunc("day", User.created_at))
            .all()
        )
        for dt, count in trend_data:
            registration_trend.append({
                "date": dt.isoformat() if dt else None,
                "count": count,
            })

        return {
            "total_customers": total_customers,
            "active_customers": active_customers,
            "new_customers": new_customers,
            "customers_by_role": customers_by_role,
            "top_customers": [
                {
                    "id": str(uid),
                    "name": f"{first} {last}",
                    "email": email,
                    "order_count": orders,
                    "total_spent": float(spent),
                }
                for uid, first, last, email, orders, spent in top_customers
            ],
            "registration_trend": registration_trend,
        }

    def get_inventory_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        total_items = self.db.query(Product).filter(Product.is_active).count()
        total_value = self.db.query(
            func.coalesce(func.sum(Product.price * Product.stock_quantity), 0)
        ).filter(Product.is_active).scalar()

        low_stock_items = (
            self.db.query(Product)
            .filter(Product.is_active, Product.stock_quantity > 0, Product.stock_quantity <= 10)
            .order_by(Product.stock_quantity.asc())
            .limit(20)
            .all()
        )

        out_of_stock_items = (
            self.db.query(Product)
            .filter(Product.is_active, Product.stock_quantity == 0)
            .order_by(Product.name)
            .limit(20)
            .all()
        )

        stock_by_category = (
            self.db.query(
                Category.name,
                func.coalesce(func.sum(Product.stock_quantity), 0).label("total_stock"),
                func.coalesce(func.sum(Product.price * Product.stock_quantity), 0).label("total_value"),
            )
            .join(Product, Category.id == Product.category_id)
            .filter(Product.is_active)
            .group_by(Category.name)
            .order_by(func.sum(Product.stock_quantity).desc())
            .all()
        )

        return {
            "total_items": total_items,
            "total_value": float(total_value),
            "low_stock_items": [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "stock_quantity": p.stock_quantity,
                    "price": float(p.price),
                }
                for p in low_stock_items
            ],
            "out_of_stock_items": [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "price": float(p.price),
                }
                for p in out_of_stock_items
            ],
            "stock_by_category": [
                {"name": name, "total_stock": int(stock), "total_value": float(value)}
                for name, stock, value in stock_by_category
            ],
            "inventory_movement": [],
        }

    def get_financial_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        revenue_query = self.db.query(
            func.coalesce(func.sum(Order.total_amount), 0)
        ).filter(Order.status != "cancelled")
        if start_date:
            revenue_query = revenue_query.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            revenue_query = revenue_query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))
        total_revenue = revenue_query.scalar()

        total_costs = float(total_revenue) * 0.6
        gross_profit = float(total_revenue) - total_costs
        profit_margin = (gross_profit / max(float(total_revenue), 1)) * 100

        revenue_by_period = []
        period_query = (
            self.db.query(
                func.date_trunc("day", Order.created_at).label("period"),
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            )
            .filter(Order.status != "cancelled")
        )
        if start_date:
            period_query = period_query.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            period_query = period_query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))

        period_data = (
            period_query.group_by(func.date_trunc("day", Order.created_at))
            .order_by(func.date_trunc("day", Order.created_at))
            .all()
        )
        for period, revenue in period_data:
            revenue_by_period.append({
                "date": period.isoformat() if period else None,
                "revenue": float(revenue),
            })

        refund_summary = {
            "total_refunds": 0,
            "refund_amount": 0,
        }
        cancelled_orders = self.db.query(Order).filter(Order.status == "cancelled")
        if start_date:
            cancelled_orders = cancelled_orders.filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            cancelled_orders = cancelled_orders.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))
        refund_summary["total_refunds"] = cancelled_orders.count()
        refund_summary["refund_amount"] = float(
            cancelled_orders.with_entities(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
        )

        return {
            "total_revenue": float(total_revenue),
            "total_costs": total_costs,
            "gross_profit": gross_profit,
            "profit_margin": profit_margin,
            "revenue_by_period": revenue_by_period,
            "payment_method_distribution": [],
            "refund_summary": refund_summary,
        }
