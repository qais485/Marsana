import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from slugify import slugify
from sqlalchemy.orm import Session

from app.models.database_models import Product
from app.repositories.catalog_repository import AdminProductRepository, AdminRepository, CategoryRepository, OrderRepository

logger = logging.getLogger(__name__)


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.admin_repo = AdminRepository(db)
        self.product_repo = AdminProductRepository(db)
        self.category_repo = CategoryRepository(db)
        self.order_repo = OrderRepository(db)
        self._notification_service = None

    @property
    def notification_service(self):
        if self._notification_service is None:
            from app.services.notification_service import NotificationService
            self._notification_service = NotificationService(self.db)
        return self._notification_service

    def get_dashboard_overview(self) -> dict:
        user_stats = self.admin_repo.get_user_stats()
        product_stats = self.admin_repo.get_product_stats()
        review_stats = self.admin_repo.get_review_stats()
        revenue_stats = self.admin_repo.get_revenue_stats()
        return {
            "users": user_stats,
            "products": product_stats,
            "reviews": review_stats,
            "revenue": revenue_stats,
        }

    def get_user_stats(self) -> dict:
        stats = self.admin_repo.get_user_stats()
        recent_users = self.admin_repo.get_recent_users(10)
        monthly_registrations = self.admin_repo.get_monthly_registrations(12)
        return {
            "stats": stats,
            "recent_users": recent_users,
            "monthly_registrations": monthly_registrations,
        }

    def get_product_stats(self) -> dict:
        stats = self.admin_repo.get_product_stats()
        top_products = self.admin_repo.get_top_products(10)
        return {
            "stats": stats,
            "top_products": top_products,
        }

    def get_sales_stats(self) -> dict:
        by_category = self.admin_repo.get_sales_by_category()
        by_brand = self.admin_repo.get_sales_by_brand()
        top_products = self.admin_repo.get_top_products(10)
        return {
            "by_category": by_category,
            "by_brand": by_brand,
            "top_products": top_products,
        }

    def get_revenue_stats(self) -> dict:
        revenue = self.admin_repo.get_revenue_stats()
        monthly = self.admin_repo.get_monthly_revenue(12)
        return {
            "summary": revenue,
            "monthly": monthly,
        }

    # ─── Admin Product Management ──────────────────────────────────

    def get_admin_products(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        category_id: Optional[UUID] = None,
        brand_id: Optional[UUID] = None,
        is_active: Optional[bool] = None,
    ) -> dict:
        products, total = self.product_repo.get_all_products(
            page=page, limit=limit, search=search,
            category_id=category_id, brand_id=brand_id, is_active=is_active,
        )
        return {
            "products": [self._serialize_admin_product(p) for p in products],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_admin_product(self, product_id: UUID) -> dict:
        product = self.product_repo.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        return self._serialize_admin_product(product)

    def create_product(self, data: dict) -> dict:
        if data.get("sku"):
            existing = self.product_repo.get_product_by_sku(data["sku"])
            if existing:
                raise ValueError("SKU already exists")

        if data.get("category_id") and not self.product_repo.category_exists(data["category_id"]):
            raise ValueError("Category not found")

        if data.get("brand_id") and not self.product_repo.brand_exists(data["brand_id"]):
            raise ValueError("Brand not found")

        slug = slugify(data["name"])
        counter = 1
        while True:
            from sqlalchemy import func as sa_func
            from app.models.database_models import Product as ProductModel
            slug_exists = self.product_repo.db.query(
                sa_func.count(ProductModel.id)
            ).filter(ProductModel.slug == slug, ProductModel.deleted_at.is_(None)).scalar()
            if not slug_exists:
                break
            slug = f"{slugify(data['name'])}-{counter}"
            counter += 1

        product = Product(
            id=uuid4(),
            name=data["name"],
            slug=slug,
            description=data.get("description"),
            short_description=data.get("short_description"),
            price=data["price"],
            discount_price=data.get("discount_price"),
            images=data.get("images"),
            category_id=data.get("category_id"),
            brand_id=data.get("brand_id"),
            stock_quantity=data.get("stock_quantity", 0),
            sku=data.get("sku"),
            barcode=data.get("barcode"),
            is_active=data.get("is_active", True),
            is_featured=data.get("is_featured", False),
            is_new_arrival=data.get("is_new_arrival", False),
            is_best_seller=data.get("is_best_seller", False),
        )
        self.product_repo.create_product(product)
        return self._serialize_admin_product(product)

    def update_product(self, product_id: UUID, data: dict) -> dict:
        product = self.product_repo.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        if "sku" in data and data["sku"]:
            existing = self.product_repo.get_product_by_sku(data["sku"])
            if existing and existing.id != product_id:
                raise ValueError("SKU already exists")

        if "category_id" in data and data["category_id"]:
            if not self.product_repo.category_exists(data["category_id"]):
                raise ValueError("Category not found")

        if "brand_id" in data and data["brand_id"]:
            if not self.product_repo.brand_exists(data["brand_id"]):
                raise ValueError("Brand not found")

        if "name" in data and data["name"] != product.name:
            slug = slugify(data["name"])
            counter = 1
            while True:
                from sqlalchemy import func as sa_func
                from app.models.database_models import Product as ProductModel
                slug_exists = self.product_repo.db.query(
                    sa_func.count(ProductModel.id)
                ).filter(
                    ProductModel.slug == slug,
                    ProductModel.id != product_id,
                    ProductModel.deleted_at.is_(None),
                ).scalar()
                if not slug_exists:
                    break
                slug = f"{slugify(data['name'])}-{counter}"
                counter += 1
            product.slug = slug

        for field in [
            "name", "description", "short_description", "price", "discount_price",
            "images", "category_id", "brand_id", "stock_quantity", "sku", "barcode",
            "is_active", "is_featured", "is_new_arrival", "is_best_seller",
        ]:
            if field in data:
                setattr(product, field, data[field])

        self.product_repo.update_product(product)
        return self._serialize_admin_product(product)

    def delete_product(self, product_id: UUID) -> dict:
        product = self.product_repo.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        self.product_repo.delete_product(product)
        return {"message": "Product deleted successfully"}

    def update_inventory(self, product_id: UUID, stock_quantity: int) -> dict:
        product = self.product_repo.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        self.product_repo.update_stock(product, stock_quantity)
        return {"message": "Inventory updated successfully", "stock_quantity": stock_quantity}

    def import_products(self, products_data: list[dict]) -> dict:
        imported = 0
        errors = []
        for i, row in enumerate(products_data):
            try:
                self.create_product(row)
                imported += 1
            except ValueError as e:
                errors.append({"row": i + 1, "error": str(e), "name": row.get("name", "")})
        return {"imported": imported, "errors": errors, "total": len(products_data)}

    def export_products(
        self,
        category_id: Optional[UUID] = None,
        brand_id: Optional[UUID] = None,
        is_active: Optional[bool] = None,
    ) -> list[dict]:
        products = self.product_repo.get_all_active_products_for_export(
            category_id=category_id, brand_id=brand_id, is_active=is_active,
        )
        return [self._serialize_admin_product(p) for p in products]

    def _serialize_admin_product(self, product: Product) -> dict:
        return {
            "id": str(product.id),
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "short_description": product.short_description,
            "price": float(product.price),
            "discount_price": float(product.discount_price) if product.discount_price is not None else None,
            "images": product.images,
            "category_id": str(product.category_id) if product.category_id else None,
            "category_name": product.category.name if product.category else None,
            "brand_id": str(product.brand_id) if product.brand_id else None,
            "brand_name": product.brand.name if product.brand else None,
            "stock_quantity": product.stock_quantity,
            "sku": product.sku,
            "barcode": product.barcode,
            "is_active": product.is_active,
            "is_featured": product.is_featured,
            "is_new_arrival": product.is_new_arrival,
            "is_best_seller": product.is_best_seller,
            "rating": float(product.rating) if product.rating is not None else 0,
            "review_count": product.review_count,
            "sold_count": product.sold_count,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "updated_at": product.updated_at.isoformat() if product.updated_at else None,
        }

    # ─── Category Management ──────────────────────────────────────

    def get_admin_categories(self) -> list[dict]:
        categories = self.category_repo.get_all()
        return [self._serialize_admin_category(c) for c in categories]

    def get_admin_category(self, category_id: UUID) -> dict:
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise ValueError("Category not found")
        return self._serialize_admin_category(category)

    def create_category(self, data: dict) -> dict:
        if data.get("name"):
            slug = slugify(data["name"])
            existing = self.category_repo.get_by_slug(slug)
            if existing:
                raise ValueError("Category with this name already exists")
            data["slug"] = slug

        if data.get("parent_id"):
            parent = self.category_repo.get_by_id(data["parent_id"])
            if not parent:
                raise ValueError("Parent category not found")

        category = self.category_repo.create(data)
        return self._serialize_admin_category(category)

    def update_category(self, category_id: UUID, data: dict) -> dict:
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise ValueError("Category not found")

        if data.get("name"):
            slug = slugify(data["name"])
            existing = self.category_repo.get_by_slug(slug)
            if existing and existing.id != category_id:
                raise ValueError("Category with this name already exists")
            data["slug"] = slug

        if data.get("parent_id"):
            if data["parent_id"] == category_id:
                raise ValueError("Category cannot be its own parent")
            parent = self.category_repo.get_by_id(data["parent_id"])
            if not parent:
                raise ValueError("Parent category not found")

        updated = self.category_repo.update(category, data)
        return self._serialize_admin_category(updated)

    def delete_category(self, category_id: UUID) -> dict:
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise ValueError("Category not found")

        product_count = self.category_repo.get_product_count(category_id)
        if product_count > 0:
            raise ValueError(
                f"Cannot delete category with {product_count} products. "
                "Reassign or remove products first."
            )

        children = self.category_repo.get_children(category_id)
        if children:
            raise ValueError(
                f"Cannot delete category with {len(children)} subcategories. "
                "Remove subcategories first."
            )

        self.category_repo.delete(category)
        return {"message": "Category deleted successfully"}

    def _serialize_admin_category(self, category) -> dict:
        product_count = self.category_repo.get_product_count(category.id)
        return {
            "id": str(category.id),
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "image_url": category.image_url,
            "parent_id": str(category.parent_id) if category.parent_id else None,
            "is_active": category.is_active,
            "sort_order": category.sort_order,
            "product_count": product_count,
            "created_at": category.created_at.isoformat() if category.created_at else None,
            "updated_at": category.updated_at.isoformat() if category.updated_at else None,
        }

    # ─── Order Management ─────────────────────────────────────────

    def get_admin_orders(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> dict:
        orders, total = self.order_repo.get_all(
            page=page, limit=limit, status=status,
            payment_status=payment_status, search=search,
        )
        return {
            "orders": [self._serialize_admin_order(o) for o in orders],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_admin_order(self, order_id: UUID) -> dict:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")
        return self._serialize_admin_order_detail(order)

    def update_order_status(self, order_id: UUID, data: dict, admin_id: UUID) -> dict:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        new_status = data.get("status")
        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

        update_data = {"status": new_status}
        if data.get("tracking_number"):
            update_data["tracking_number"] = data["tracking_number"]
        if data.get("shipping_carrier"):
            update_data["shipping_carrier"] = data["shipping_carrier"]

        self.order_repo.update(order, update_data)
        self.order_repo.add_status_history(
            order_id=order_id,
            status=new_status,
            note=data.get("note"),
            created_by=admin_id,
        )

        try:
            template_slug = f"order_{new_status}"
            self.notification_service.dispatch(template_slug, {
                "order_number": order.order_number,
                "status": new_status,
                "tracking_number": data.get("tracking_number", ""),
                "shipping_carrier": data.get("shipping_carrier", ""),
                "user_id": order.user_id,
            }, user_id=order.user_id)
        except Exception as e:
            logger.warning("Failed to dispatch order status notification: %s", e)

        return self._serialize_admin_order_detail(order)

    def refund_order(self, order_id: UUID, data: dict) -> dict:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        if order.status in ["cancelled", "refunded"]:
            raise ValueError("Order is already cancelled or refunded")

        refund_amount = data.get("refund_amount", 0)
        if refund_amount <= 0:
            raise ValueError("Refund amount must be positive")
        if refund_amount > float(order.total_amount):
            raise ValueError("Refund amount cannot exceed order total")

        self.order_repo.update(order, {
            "status": "refunded",
            "payment_status": "refunded",
            "refund_amount": refund_amount,
            "refund_reason": data.get("refund_reason"),
            "refunded_at": datetime.now(timezone.utc),
        })
        self.order_repo.add_status_history(
            order_id=order_id,
            status="refunded",
            note=f"Refunded ${refund_amount}: {data.get('refund_reason', 'No reason provided')}",
        )

        try:
            self.notification_service.dispatch("refund_issued", {
                "order_number": order.order_number,
                "refund_amount": str(refund_amount),
                "reason": data.get("refund_reason", ""),
                "user_id": order.user_id,
            }, user_id=order.user_id)
        except Exception as e:
            logger.warning("Failed to dispatch refund_issued notification: %s", e)

        return self._serialize_admin_order_detail(order)

    def update_order_notes(self, order_id: UUID, data: dict) -> dict:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")
        self.order_repo.update(order, {"admin_notes": data.get("admin_notes")})
        return {"message": "Notes updated successfully"}

    def get_order_stats(self) -> dict:
        return self.order_repo.get_stats()

    def _serialize_admin_order(self, order) -> dict:
        return {
            "id": str(order.id),
            "user_id": str(order.user_id) if order.user_id else None,
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "total_amount": float(order.total_amount),
            "shipping_name": order.shipping_name,
            "tracking_number": order.tracking_number,
            "item_count": len(order.items) if order.items else 0,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        }

    def _serialize_admin_order_detail(self, order) -> dict:
        items = []
        for item in order.items:
            items.append({
                "id": str(item.id),
                "product_id": str(item.product_id) if item.product_id else None,
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            })

        status_history = []
        for h in order.status_history:
            status_history.append({
                "id": str(h.id),
                "status": h.status,
                "note": h.note,
                "created_at": h.created_at.isoformat() if h.created_at else None,
            })

        return {
            "id": str(order.id),
            "user_id": str(order.user_id) if order.user_id else None,
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "subtotal": float(order.subtotal),
            "tax_amount": float(order.tax_amount),
            "shipping_cost": float(order.shipping_cost),
            "discount_amount": float(order.discount_amount),
            "total_amount": float(order.total_amount),
            "shipping_name": order.shipping_name,
            "shipping_address": order.shipping_address,
            "shipping_city": order.shipping_city,
            "shipping_state": order.shipping_state,
            "shipping_postal_code": order.shipping_postal_code,
            "shipping_country": order.shipping_country,
            "shipping_phone": order.shipping_phone,
            "tracking_number": order.tracking_number,
            "shipping_carrier": order.shipping_carrier,
            "notes": order.notes,
            "admin_notes": order.admin_notes,
            "refund_amount": float(order.refund_amount),
            "refund_reason": order.refund_reason,
            "refunded_at": order.refunded_at.isoformat() if order.refunded_at else None,
            "items": items,
            "status_history": status_history,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        }
