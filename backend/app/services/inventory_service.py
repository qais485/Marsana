import logging
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.database_models import (
    InventoryHistory,
    Product,
    StockAlert,
    Warehouse,
    WarehouseInventory,
)
from app.repositories.inventory_repository import (
    InventoryHistoryRepository,
    StockAlertRepository,
    WarehouseInventoryRepository,
    WarehouseRepository,
)
from app.repositories.catalog_repository import AdminProductRepository

logger = logging.getLogger(__name__)


class InventoryService:
    def __init__(self, db: Session):
        self.db = db
        self.warehouse_repo = WarehouseRepository(db)
        self.inventory_repo = WarehouseInventoryRepository(db)
        self.history_repo = InventoryHistoryRepository(db)
        self.alert_repo = StockAlertRepository(db)
        self.product_repo = AdminProductRepository(db)

    # ─── Warehouse Management ────────────────────────────────────

    def get_warehouses(self, is_active: Optional[bool] = None) -> list[dict]:
        warehouses = self.warehouse_repo.get_all(is_active=is_active)
        return [self._serialize_warehouse(w) for w in warehouses]

    def get_warehouse(self, warehouse_id: UUID) -> dict:
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")
        return self._serialize_warehouse(warehouse)

    def create_warehouse(self, data: dict) -> dict:
        if self.warehouse_repo.get_by_code(data["code"]):
            raise ValueError("Warehouse code already exists")

        if data.get("is_default"):
            existing_default = self.warehouse_repo.get_default()
            if existing_default:
                self.warehouse_repo.update(existing_default, {"is_default": False})

        warehouse = Warehouse(id=uuid4(), **data)
        warehouse = self.warehouse_repo.create(warehouse)
        return self._serialize_warehouse(warehouse)

    def update_warehouse(self, warehouse_id: UUID, data: dict) -> dict:
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")

        if "code" in data and data["code"] != warehouse.code:
            existing = self.warehouse_repo.get_by_code(data["code"])
            if existing:
                raise ValueError("Warehouse code already exists")

        if data.get("is_default"):
            existing_default = self.warehouse_repo.get_default()
            if existing_default and existing_default.id != warehouse_id:
                self.warehouse_repo.update(existing_default, {"is_default": False})

        warehouse = self.warehouse_repo.update(warehouse, data)
        return self._serialize_warehouse(warehouse)

    def delete_warehouse(self, warehouse_id: UUID) -> dict:
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")

        if warehouse.is_default:
            raise ValueError("Cannot delete the default warehouse")

        inventory_count = len(self.inventory_repo.get_by_warehouse(warehouse_id)[0])
        if inventory_count > 0:
            raise ValueError(
                f"Cannot delete warehouse with {inventory_count} inventory items. "
                "Transfer or remove inventory first."
            )

        self.warehouse_repo.delete(warehouse)
        return {"message": "Warehouse deleted successfully"}

    def _serialize_warehouse(self, warehouse: Warehouse) -> dict:
        return {
            "id": str(warehouse.id),
            "name": warehouse.name,
            "code": warehouse.code,
            "address_line_1": warehouse.address_line_1,
            "address_line_2": warehouse.address_line_2,
            "city": warehouse.city,
            "state": warehouse.state,
            "postal_code": warehouse.postal_code,
            "country": warehouse.country,
            "phone_number": warehouse.phone_number,
            "email": warehouse.email,
            "is_active": warehouse.is_active,
            "is_default": warehouse.is_default,
            "created_at": warehouse.created_at.isoformat() if warehouse.created_at else None,
            "updated_at": warehouse.updated_at.isoformat() if warehouse.updated_at else None,
        }

    # ─── Stock Control ───────────────────────────────────────────

    def adjust_stock(
        self,
        product_id: UUID,
        quantity: int,
        reason: str,
        warehouse_id: Optional[UUID] = None,
        variant_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        notes: Optional[str] = None,
    ) -> dict:
        product = self.product_repo.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        target_warehouse_id = warehouse_id
        if not target_warehouse_id:
            default_warehouse = self.warehouse_repo.get_default()
            if default_warehouse:
                target_warehouse_id = default_warehouse.id

        if target_warehouse_id:
            inventory = self.inventory_repo.get_or_create(
                product_id, target_warehouse_id, variant_id
            )
            previous_quantity = inventory.quantity
            new_quantity = max(previous_quantity + quantity, 0)
            actual_change = new_quantity - previous_quantity

            self.inventory_repo.set_quantity(inventory, new_quantity)

            self.history_repo.create(
                InventoryHistory(
                    id=uuid4(),
                    product_id=product_id,
                    variant_id=variant_id,
                    warehouse_id=target_warehouse_id,
                    change_type="adjustment",
                    quantity_change=actual_change,
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    reason=reason,
                    reference_type="manual",
                    performed_by=user_id,
                    notes=notes,
                )
            )

            self._check_stock_alerts(product_id, target_warehouse_id, variant_id, new_quantity)

        total_quantity = self.inventory_repo.get_total_quantity_for_product(product_id)
        self.product_repo.update_stock(product, total_quantity)

        return {
            "message": "Stock adjusted successfully",
            "product_id": str(product_id),
            "previous_quantity": previous_quantity if target_warehouse_id else product.stock_quantity,
            "new_quantity": total_quantity,
            "adjustment": quantity,
        }

    def bulk_adjust_stock(self, adjustments: list[dict], user_id: Optional[UUID] = None) -> dict:
        results = []
        errors = []
        for i, adj in enumerate(adjustments):
            try:
                result = self.adjust_stock(
                    product_id=adj["product_id"],
                    quantity=adj["quantity"],
                    reason=adj["reason"],
                    warehouse_id=adj.get("warehouse_id"),
                    variant_id=adj.get("variant_id"),
                    user_id=user_id,
                    notes=adj.get("notes"),
                )
                results.append(result)
            except ValueError as e:
                errors.append({"index": i, "error": str(e), "product_id": str(adj["product_id"])})

        return {"adjusted": len(results), "errors": errors, "total": len(adjustments)}

    def transfer_stock(
        self,
        product_id: UUID,
        from_warehouse_id: UUID,
        to_warehouse_id: UUID,
        quantity: int,
        variant_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        notes: Optional[str] = None,
    ) -> dict:
        if from_warehouse_id == to_warehouse_id:
            raise ValueError("Source and destination warehouses must be different")

        from_warehouse = self.warehouse_repo.get_by_id(from_warehouse_id)
        if not from_warehouse:
            raise ValueError("Source warehouse not found")

        to_warehouse = self.warehouse_repo.get_by_id(to_warehouse_id)
        if not to_warehouse:
            raise ValueError("Destination warehouse not found")

        from_inventory = self.inventory_repo.get_by_product_and_warehouse(
            product_id, from_warehouse_id, variant_id
        )
        if not from_inventory or from_inventory.quantity < quantity:
            available = from_inventory.quantity if from_inventory else 0
            raise ValueError(f"Insufficient stock. Available: {available}")

        to_inventory = self.inventory_repo.get_or_create(
            product_id, to_warehouse_id, variant_id
        )

        from_previous = from_inventory.quantity
        from_new = from_previous - quantity
        self.inventory_repo.set_quantity(from_inventory, from_new)

        to_previous = to_inventory.quantity
        to_new = to_previous + quantity
        self.inventory_repo.set_quantity(to_inventory, to_new)

        transfer_reason = f"Transfer from {from_warehouse.name} to {to_warehouse.name}"

        self.history_repo.create(
            InventoryHistory(
                id=uuid4(),
                product_id=product_id,
                variant_id=variant_id,
                warehouse_id=from_warehouse_id,
                change_type="transfer_out",
                quantity_change=-quantity,
                previous_quantity=from_previous,
                new_quantity=from_new,
                reason=transfer_reason,
                reference_type="transfer",
                performed_by=user_id,
                notes=notes,
            )
        )

        self.history_repo.create(
            InventoryHistory(
                id=uuid4(),
                product_id=product_id,
                variant_id=variant_id,
                warehouse_id=to_warehouse_id,
                change_type="transfer_in",
                quantity_change=quantity,
                previous_quantity=to_previous,
                new_quantity=to_new,
                reason=transfer_reason,
                reference_type="transfer",
                performed_by=user_id,
                notes=notes,
            )
        )

        self._check_stock_alerts(product_id, from_warehouse_id, variant_id, from_new)
        self._check_stock_alerts(product_id, to_warehouse_id, variant_id, to_new)

        total_quantity = self.inventory_repo.get_total_quantity_for_product(product_id)
        product = self.product_repo.get_product_by_id(product_id)
        if product:
            self.product_repo.update_stock(product, total_quantity)

        return {
            "message": "Stock transferred successfully",
            "from_warehouse": from_warehouse.name,
            "to_warehouse": to_warehouse.name,
            "quantity_transferred": quantity,
        }

    # ─── Low Stock Alert ─────────────────────────────────────────

    def _check_stock_alerts(
        self,
        product_id: UUID,
        warehouse_id: UUID,
        variant_id: Optional[UUID],
        current_quantity: int,
    ) -> None:
        inventory = self.inventory_repo.get_by_product_and_warehouse(
            product_id, warehouse_id, variant_id
        )
        if not inventory:
            return

        threshold = inventory.low_stock_threshold

        existing_low = self.alert_repo.get_active_alert(
            product_id, "low_stock", warehouse_id
        )
        existing_out = self.alert_repo.get_active_alert(
            product_id, "out_of_stock", warehouse_id
        )

        if current_quantity == 0:
            if not existing_out:
                self.alert_repo.create(
                    StockAlert(
                        id=uuid4(),
                        product_id=product_id,
                        variant_id=variant_id,
                        warehouse_id=warehouse_id,
                        alert_type="out_of_stock",
                        threshold=threshold,
                        current_quantity=current_quantity,
                    )
                )
                logger.warning(
                    "Out of stock alert created for product %s at warehouse %s",
                    product_id, warehouse_id,
                )
            if existing_low and not existing_low.is_resolved:
                self.alert_repo.resolve(existing_low, None)
        elif current_quantity <= threshold:
            if not existing_low:
                self.alert_repo.create(
                    StockAlert(
                        id=uuid4(),
                        product_id=product_id,
                        variant_id=variant_id,
                        warehouse_id=warehouse_id,
                        alert_type="low_stock",
                        threshold=threshold,
                        current_quantity=current_quantity,
                    )
                )
                logger.warning(
                    "Low stock alert created for product %s at warehouse %s (qty=%d, threshold=%d)",
                    product_id, warehouse_id, current_quantity, threshold,
                )
            if existing_out and not existing_out.is_resolved:
                self.alert_repo.resolve(existing_out, None)
        else:
            if existing_low and not existing_low.is_resolved:
                self.alert_repo.resolve(existing_low, None)
            if existing_out and not existing_out.is_resolved:
                self.alert_repo.resolve(existing_out, None)

    def get_low_stock_items(self, page: int = 1, limit: int = 20) -> dict:
        items, total = self.inventory_repo.get_low_stock_items(page=page, limit=limit)
        return {
            "items": [self._serialize_inventory_item(i) for i in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_out_of_stock_items(self, page: int = 1, limit: int = 20) -> dict:
        items, total = self.inventory_repo.get_out_of_stock_items(page=page, limit=limit)
        return {
            "items": [self._serialize_inventory_item(i) for i in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_stock_alerts(
        self,
        page: int = 1,
        limit: int = 20,
        is_resolved: Optional[bool] = None,
        product_id: Optional[UUID] = None,
        alert_type: Optional[str] = None,
    ) -> dict:
        items, total = self.alert_repo.get_all(
            page=page, limit=limit, is_resolved=is_resolved,
            product_id=product_id, alert_type=alert_type,
        )
        return {
            "alerts": [self._serialize_alert(a) for a in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def resolve_alert(self, alert_id: UUID, user_id: UUID, notes: Optional[str] = None) -> dict:
        alert = self.alert_repo.db.query(StockAlert).filter(StockAlert.id == alert_id).first()
        if not alert:
            raise ValueError("Alert not found")
        if alert.is_resolved:
            raise ValueError("Alert is already resolved")

        alert = self.alert_repo.resolve(alert, user_id)
        return self._serialize_alert(alert)

    # ─── Inventory History ───────────────────────────────────────

    def get_inventory_history(
        self,
        page: int = 1,
        limit: int = 20,
        product_id: Optional[UUID] = None,
        warehouse_id: Optional[UUID] = None,
        change_type: Optional[str] = None,
        search: Optional[str] = None,
    ) -> dict:
        items, total = self.history_repo.get_all(
            page=page, limit=limit, product_id=product_id,
            warehouse_id=warehouse_id, change_type=change_type, search=search,
        )
        return {
            "history": [self._serialize_history(h) for h in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    # ─── Inventory Overview ──────────────────────────────────────

    def get_inventory_summary(self) -> dict:
        total_products = self.db.query(Product).filter(
            Product.is_active, Product.deleted_at.is_(None)
        ).count()

        total_stock_value = self.db.query(
            self.db.query(
                Product.price * Product.stock_quantity
            ).filter(Product.is_active, Product.deleted_at.is_(None)).subquery()
        ).scalar() or 0

        low_stock_count = self.alert_repo.count_unresolved()

        total_warehouses = self.warehouse_repo.count()

        out_of_stock_count = (
            self.db.query(Product)
            .filter(
                Product.is_active,
                Product.deleted_at.is_(None),
                Product.stock_quantity == 0,
            )
            .count()
        )

        return {
            "total_products": total_products,
            "total_stock_value": float(total_stock_value),
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
            "total_warehouses": total_warehouses,
        }

    def get_product_inventory(self, page: int = 1, limit: int = 20, search: Optional[str] = None) -> dict:
        query = self.db.query(Product).filter(
            Product.is_active, Product.deleted_at.is_(None)
        )
        if search:
            search_term = f"%{search}%"
            query = query.filter(Product.name.ilike(search_term) | Product.sku.ilike(search_term))

        total = query.count()
        products = query.offset((page - 1) * limit).limit(limit).all()

        result = []
        for product in products:
            warehouse_stock = self.inventory_repo.get_by_product(product.id)
            total_qty = sum(w.quantity for w in warehouse_stock)
            threshold = product.low_stock_threshold or 10

            result.append({
                "product_id": str(product.id),
                "product_name": product.name,
                "sku": product.sku,
                "total_quantity": total_qty,
                "low_stock_threshold": threshold,
                "is_low_stock": 0 < total_qty <= threshold,
                "is_out_of_stock": total_qty == 0,
                "warehouse_stock": [self._serialize_inventory_item(w) for w in warehouse_stock],
            })

        return {
            "products": result,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_warehouse_inventory(
        self, warehouse_id: UUID, page: int = 1, limit: int = 20
    ) -> dict:
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")

        items, total = self.inventory_repo.get_by_warehouse(warehouse_id, page=page, limit=limit)
        return {
            "warehouse": self._serialize_warehouse(warehouse),
            "items": [self._serialize_inventory_item(i) for i in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    # ─── Product Inventory Update ────────────────────────────────

    def update_product_inventory(
        self,
        product_id: UUID,
        stock_quantity: int,
        low_stock_threshold: Optional[int] = None,
    ) -> dict:
        product = self.product_repo.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        previous_quantity = product.stock_quantity
        self.product_repo.update_stock(product, stock_quantity)

        if low_stock_threshold is not None:
            product.low_stock_threshold = low_stock_threshold
            self.db.commit()

        self.history_repo.create(
            InventoryHistory(
                id=uuid4(),
                product_id=product_id,
                change_type="direct_update",
                quantity_change=stock_quantity - previous_quantity,
                previous_quantity=previous_quantity,
                new_quantity=stock_quantity,
                reason="Direct inventory update",
                reference_type="admin",
            )
        )

        default_warehouse = self.warehouse_repo.get_default()
        if default_warehouse:
            self._check_stock_alerts(
                product_id, default_warehouse.id, None, stock_quantity
            )

        return {
            "message": "Product inventory updated",
            "product_id": str(product_id),
            "stock_quantity": stock_quantity,
            "low_stock_threshold": product.low_stock_threshold,
        }

    # ─── Serialization ───────────────────────────────────────────

    def _serialize_inventory_item(self, item: WarehouseInventory) -> dict:
        return {
            "id": str(item.id),
            "warehouse_id": str(item.warehouse_id),
            "warehouse_name": item.warehouse.name if item.warehouse else None,
            "product_id": str(item.product_id),
            "product_name": item.product.name if item.product else None,
            "variant_id": str(item.variant_id) if item.variant_id else None,
            "variant_name": item.variant.name if item.variant else None,
            "quantity": item.quantity,
            "reserved_quantity": item.reserved_quantity,
            "available_quantity": item.quantity - item.reserved_quantity,
            "low_stock_threshold": item.low_stock_threshold,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        }

    def _serialize_history(self, history: InventoryHistory) -> dict:
        return {
            "id": str(history.id),
            "product_id": str(history.product_id) if history.product_id else None,
            "product_name": history.product.name if history.product else None,
            "variant_id": str(history.variant_id) if history.variant_id else None,
            "variant_name": history.variant.name if history.variant else None,
            "warehouse_id": str(history.warehouse_id) if history.warehouse_id else None,
            "warehouse_name": history.warehouse.name if history.warehouse else None,
            "change_type": history.change_type,
            "quantity_change": history.quantity_change,
            "previous_quantity": history.previous_quantity,
            "new_quantity": history.new_quantity,
            "reason": history.reason,
            "reference_type": history.reference_type,
            "reference_id": history.reference_id,
            "performed_by": str(history.performed_by) if history.performed_by else None,
            "performer_name": f"{history.performer.first_name} {history.performer.last_name}" if history.performer else None,
            "notes": history.notes,
            "created_at": history.created_at.isoformat() if history.created_at else None,
        }

    def _serialize_alert(self, alert: StockAlert) -> dict:
        return {
            "id": str(alert.id),
            "product_id": str(alert.product_id),
            "product_name": alert.product.name if alert.product else None,
            "variant_id": str(alert.variant_id) if alert.variant_id else None,
            "variant_name": alert.variant.name if alert.variant else None,
            "warehouse_id": str(alert.warehouse_id) if alert.warehouse_id else None,
            "warehouse_name": alert.warehouse.name if alert.warehouse else None,
            "alert_type": alert.alert_type,
            "threshold": alert.threshold,
            "current_quantity": alert.current_quantity,
            "is_resolved": alert.is_resolved,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
            "created_at": alert.created_at.isoformat() if alert.created_at else None,
        }
