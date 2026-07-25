from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func, IntegrityError
from sqlalchemy.orm import Session

from app.models.database_models import (
    InventoryHistory,
    Product,
    ProductVariant,
    StockAlert,
    User,
    Warehouse,
    WarehouseInventory,
)


class WarehouseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, is_active: Optional[bool] = None) -> list[Warehouse]:
        query = self.db.query(Warehouse)
        if is_active is not None:
            query = query.filter(Warehouse.is_active == is_active)
        return query.order_by(Warehouse.name).all()

    def get_by_id(self, warehouse_id: UUID) -> Optional[Warehouse]:
        return self.db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

    def get_by_code(self, code: str) -> Optional[Warehouse]:
        return self.db.query(Warehouse).filter(Warehouse.code == code).first()

    def get_default(self) -> Optional[Warehouse]:
        return self.db.query(Warehouse).filter(Warehouse.is_default).first()

    def create(self, warehouse: Warehouse) -> Warehouse:
        if warehouse.is_default:
            self.db.query(Warehouse).update({"is_default": False})
        self.db.add(warehouse)
        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def update(self, warehouse: Warehouse, data: dict) -> Warehouse:
        for key, value in data.items():
            if value is not None:
                setattr(warehouse, key, value)
        if data.get("is_default"):
            self.db.query(Warehouse).filter(
                Warehouse.id != warehouse.id
            ).update({"is_default": False})
        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def delete(self, warehouse: Warehouse) -> None:
        self.db.delete(warehouse)
        self.db.commit()

    def count(self) -> int:
        return self.db.query(func.count(Warehouse.id)).scalar()


class WarehouseInventoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_warehouse(
        self, warehouse_id: UUID, page: int = 1, limit: int = 20
    ) -> tuple[list[WarehouseInventory], int]:
        query = self.db.query(WarehouseInventory).filter(
            WarehouseInventory.warehouse_id == warehouse_id
        )
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_by_product(self, product_id: UUID) -> list[WarehouseInventory]:
        return (
            self.db.query(WarehouseInventory)
            .filter(WarehouseInventory.product_id == product_id)
            .all()
        )

    def get_by_product_and_warehouse(
        self, product_id: UUID, warehouse_id: UUID, variant_id: Optional[UUID] = None
    ) -> Optional[WarehouseInventory]:
        query = self.db.query(WarehouseInventory).filter(
            WarehouseInventory.product_id == product_id,
            WarehouseInventory.warehouse_id == warehouse_id,
        )
        if variant_id:
            query = query.filter(WarehouseInventory.variant_id == variant_id)
        else:
            query = query.filter(WarehouseInventory.variant_id.is_(None))
        return query.first()

    def get_or_create(
        self, product_id: UUID, warehouse_id: UUID, variant_id: Optional[UUID] = None
    ) -> WarehouseInventory:
        """
        Get or create inventory record with race condition protection.
        Uses unique constraint on warehouse_id and product_id to prevent duplicates.
        """
        existing = self.get_by_product_and_warehouse(product_id, warehouse_id, variant_id)
        if existing:
            return existing
        
        try:
            inventory = WarehouseInventory(
                product_id=product_id,
                warehouse_id=warehouse_id,
                variant_id=variant_id,
                quantity=0,
                reserved_quantity=0,
            )
            self.db.add(inventory)
            self.db.flush()
            self.db.refresh(inventory)
            return inventory
        except IntegrityError:
            # Another request created the inventory concurrently
            self.db.rollback()
            existing = self.get_by_product_and_warehouse(product_id, warehouse_id, variant_id)
            if existing:
                return existing
            raise RuntimeError("Failed to create or retrieve inventory record")

    def update_quantity(
        self, inventory: WarehouseInventory, quantity_change: int
    ) -> WarehouseInventory:
        inventory.quantity = max(inventory.quantity + quantity_change, 0)
        self.db.commit()
        self.db.refresh(inventory)
        return inventory

    def set_quantity(
        self, inventory: WarehouseInventory, quantity: int
    ) -> WarehouseInventory:
        inventory.quantity = max(quantity, 0)
        self.db.commit()
        self.db.refresh(inventory)
        return inventory

    def get_total_quantity_for_product(self, product_id: UUID) -> int:
        result = self.db.query(
            func.coalesce(func.sum(WarehouseInventory.quantity), 0)
        ).filter(WarehouseInventory.product_id == product_id).scalar()
        return int(result)

    def get_low_stock_items(
        self, page: int = 1, limit: int = 20
    ) -> tuple[list[WarehouseInventory], int]:
        query = self.db.query(WarehouseInventory).join(Product).filter(
            WarehouseInventory.quantity <= WarehouseInventory.low_stock_threshold,
            WarehouseInventory.quantity > 0,
            Product.is_active,
            Product.deleted_at.is_(None),
        )
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_out_of_stock_items(
        self, page: int = 1, limit: int = 20
    ) -> tuple[list[WarehouseInventory], int]:
        query = self.db.query(WarehouseInventory).join(Product).filter(
            WarehouseInventory.quantity == 0,
            Product.is_active,
            Product.deleted_at.is_(None),
        )
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_all_with_filters(
        self,
        page: int = 1,
        limit: int = 20,
        warehouse_id: Optional[UUID] = None,
        product_id: Optional[UUID] = None,
        low_stock_only: bool = False,
        out_of_stock_only: bool = False,
        search: Optional[str] = None,
    ) -> tuple[list[WarehouseInventory], int]:
        query = self.db.query(WarehouseInventory).join(Product).outerjoin(Warehouse)

        if warehouse_id:
            query = query.filter(WarehouseInventory.warehouse_id == warehouse_id)
        if product_id:
            query = query.filter(WarehouseInventory.product_id == product_id)
        if low_stock_only:
            query = query.filter(
                WarehouseInventory.quantity <= WarehouseInventory.low_stock_threshold,
                WarehouseInventory.quantity > 0,
            )
        if out_of_stock_only:
            query = query.filter(WarehouseInventory.quantity == 0)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                Product.name.ilike(search_term) | Product.sku.ilike(search_term)
            )

        total = query.count()
        items = (
            query.order_by(Product.name)
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total


class InventoryHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, history: InventoryHistory) -> InventoryHistory:
        self.db.add(history)
        self.db.flush()
        self.db.refresh(history)
        return history

    def get_by_product(
        self, product_id: UUID, page: int = 1, limit: int = 20
    ) -> tuple[list[InventoryHistory], int]:
        query = self.db.query(InventoryHistory).filter(
            InventoryHistory.product_id == product_id
        )
        total = query.count()
        items = (
            query.order_by(InventoryHistory.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_warehouse(
        self, warehouse_id: UUID, page: int = 1, limit: int = 20
    ) -> tuple[list[InventoryHistory], int]:
        query = self.db.query(InventoryHistory).filter(
            InventoryHistory.warehouse_id == warehouse_id
        )
        total = query.count()
        items = (
            query.order_by(InventoryHistory.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        product_id: Optional[UUID] = None,
        warehouse_id: Optional[UUID] = None,
        change_type: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[list[InventoryHistory], int]:
        query = self.db.query(InventoryHistory).outerjoin(Product).outerjoin(Warehouse)

        if product_id:
            query = query.filter(InventoryHistory.product_id == product_id)
        if warehouse_id:
            query = query.filter(InventoryHistory.warehouse_id == warehouse_id)
        if change_type:
            query = query.filter(InventoryHistory.change_type == change_type)
        if search:
            search_term = f"%{search}%"
            query = query.filter(Product.name.ilike(search_term))

        total = query.count()
        items = (
            query.order_by(InventoryHistory.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total


class StockAlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, alert: StockAlert) -> StockAlert:
        self.db.add(alert)
        self.db.flush()
        self.db.refresh(alert)
        return alert

    def get_unresolved(
        self, page: int = 1, limit: int = 20
    ) -> tuple[list[StockAlert], int]:
        query = self.db.query(StockAlert).filter(StockAlert.is_resolved == False)
        total = query.count()
        items = (
            query.order_by(StockAlert.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        is_resolved: Optional[bool] = None,
        product_id: Optional[UUID] = None,
        alert_type: Optional[str] = None,
    ) -> tuple[list[StockAlert], int]:
        query = self.db.query(StockAlert)

        if is_resolved is not None:
            query = query.filter(StockAlert.is_resolved == is_resolved)
        if product_id:
            query = query.filter(StockAlert.product_id == product_id)
        if alert_type:
            query = query.filter(StockAlert.alert_type == alert_type)

        total = query.count()
        items = (
            query.order_by(StockAlert.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def resolve(self, alert: StockAlert, user_id: UUID) -> StockAlert:
        alert.is_resolved = True
        alert.resolved_at = datetime.now(timezone.utc)
        alert.resolved_by = user_id
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_active_alert(
        self, product_id: UUID, alert_type: str, warehouse_id: Optional[UUID] = None
    ) -> Optional[StockAlert]:
        query = self.db.query(StockAlert).filter(
            StockAlert.product_id == product_id,
            StockAlert.alert_type == alert_type,
            StockAlert.is_resolved == False,
        )
        if warehouse_id:
            query = query.filter(StockAlert.warehouse_id == warehouse_id)
        return query.first()

    def count_unresolved(self) -> int:
        return (
            self.db.query(func.count(StockAlert.id))
            .filter(StockAlert.is_resolved == False)
            .scalar()
        )
