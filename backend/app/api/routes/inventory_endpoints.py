from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    InventoryAdjustRequest,
    InventoryBulkAdjustRequest,
    InventoryTransferRequest,
    StockAlertResolveRequest,
    WarehouseCreateRequest,
    WarehouseUpdateRequest,
    AdminProductInventoryUpdateRequest,
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/api/v1/admin/inventory", tags=["Admin Inventory"])


def get_inventory_service(db: Session = Depends(get_db)) -> InventoryService:
    return InventoryService(db)


# ─── Warehouse Endpoints ──────────────────────────────────────────


@router.get("/warehouses")
def list_warehouses(
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_warehouses(is_active=is_active)
        return {
            "success": True,
            "message": "Warehouses retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve warehouses",
        )


@router.get("/warehouses/{warehouse_id}")
def get_warehouse(
    warehouse_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_warehouse(warehouse_id)
        return {
            "success": True,
            "message": "Warehouse retrieved",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve warehouse",
        )


@router.post("/warehouses", status_code=status.HTTP_201_CREATED)
def create_warehouse(
    request: WarehouseCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.create_warehouse(request.model_dump())
        return {
            "success": True,
            "message": "Warehouse created successfully",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create warehouse",
        )


@router.put("/warehouses/{warehouse_id}")
def update_warehouse(
    warehouse_id: UUID,
    request: WarehouseUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.update_warehouse(
            warehouse_id, request.model_dump(exclude_unset=True)
        )
        return {
            "success": True,
            "message": "Warehouse updated successfully",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update warehouse",
        )


@router.delete("/warehouses/{warehouse_id}")
def delete_warehouse(
    warehouse_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        result = inventory_service.delete_warehouse(warehouse_id)
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
            detail="Failed to delete warehouse",
        )


# ─── Stock Control Endpoints ──────────────────────────────────────


@router.post("/adjust")
def adjust_stock(
    request: InventoryAdjustRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.adjust_stock(
            product_id=request.product_id,
            quantity=request.quantity,
            reason=request.reason,
            warehouse_id=request.warehouse_id,
            variant_id=request.variant_id,
            user_id=current_user.id,
            notes=request.notes,
        )
        return {
            "success": True,
            "message": data["message"],
            "data": {
                "product_id": data["product_id"],
                "previous_quantity": data["previous_quantity"],
                "new_quantity": data["new_quantity"],
                "adjustment": data["adjustment"],
            },
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to adjust stock",
        )


@router.post("/adjust/bulk")
def bulk_adjust_stock(
    request: InventoryBulkAdjustRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.bulk_adjust_stock(
            adjustments=[adj.model_dump() for adj in request.adjustments],
            user_id=current_user.id,
        )
        return {
            "success": True,
            "message": f"Adjusted {data['adjusted']} of {data['total']} items",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk adjust stock",
        )


@router.post("/transfer")
def transfer_stock(
    request: InventoryTransferRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.transfer_stock(
            product_id=request.product_id,
            from_warehouse_id=request.from_warehouse_id,
            to_warehouse_id=request.to_warehouse_id,
            quantity=request.quantity,
            variant_id=request.variant_id,
            user_id=current_user.id,
            notes=request.notes,
        )
        return {
            "success": True,
            "message": data["message"],
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to transfer stock",
        )


# ─── Product Inventory Endpoints ──────────────────────────────────


@router.get("/products")
def list_product_inventory(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_product_inventory(page=page, limit=limit, search=search)
        return {
            "success": True,
            "message": "Product inventory retrieved",
            "data": data["products"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve product inventory",
        )


@router.patch("/products/{product_id}")
def update_product_inventory(
    product_id: UUID,
    request: AdminProductInventoryUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.update_product_inventory(
            product_id=product_id,
            stock_quantity=request.stock_quantity,
            low_stock_threshold=request.low_stock_threshold,
        )
        return {
            "success": True,
            "message": data["message"],
            "data": {
                "product_id": data["product_id"],
                "stock_quantity": data["stock_quantity"],
                "low_stock_threshold": data["low_stock_threshold"],
            },
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product inventory",
        )


@router.get("/warehouses/{warehouse_id}/inventory")
def get_warehouse_inventory(
    warehouse_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_warehouse_inventory(
            warehouse_id=warehouse_id, page=page, limit=limit
        )
        return {
            "success": True,
            "message": "Warehouse inventory retrieved",
            "data": {
                "warehouse": data["warehouse"],
                "items": data["items"],
                "pagination": data["pagination"],
            },
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve warehouse inventory",
        )


# ─── Low Stock & Out of Stock Endpoints ───────────────────────────


@router.get("/low-stock")
def get_low_stock_items(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_low_stock_items(page=page, limit=limit)
        return {
            "success": True,
            "message": "Low stock items retrieved",
            "data": data["items"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve low stock items",
        )


@router.get("/out-of-stock")
def get_out_of_stock_items(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_out_of_stock_items(page=page, limit=limit)
        return {
            "success": True,
            "message": "Out of stock items retrieved",
            "data": data["items"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve out of stock items",
        )


# ─── Stock Alerts Endpoints ───────────────────────────────────────


@router.get("/alerts")
def get_stock_alerts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    is_resolved: Optional[bool] = None,
    product_id: Optional[UUID] = None,
    alert_type: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_stock_alerts(
            page=page, limit=limit, is_resolved=is_resolved,
            product_id=product_id, alert_type=alert_type,
        )
        return {
            "success": True,
            "message": "Stock alerts retrieved",
            "data": data["alerts"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve stock alerts",
        )


@router.patch("/alerts/{alert_id}/resolve")
def resolve_stock_alert(
    alert_id: UUID,
    request: StockAlertResolveRequest,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.resolve_alert(
            alert_id=alert_id,
            user_id=current_user.id,
            notes=request.notes,
        )
        return {
            "success": True,
            "message": "Alert resolved successfully",
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resolve alert",
        )


# ─── Inventory History Endpoints ──────────────────────────────────


@router.get("/history")
def get_inventory_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    product_id: Optional[UUID] = None,
    warehouse_id: Optional[UUID] = None,
    change_type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_inventory_history(
            page=page, limit=limit, product_id=product_id,
            warehouse_id=warehouse_id, change_type=change_type, search=search,
        )
        return {
            "success": True,
            "message": "Inventory history retrieved",
            "data": data["history"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve inventory history",
        )


# ─── Summary Endpoint ─────────────────────────────────────────────


@router.get("/summary")
def get_inventory_summary(
    current_user: User = Depends(get_current_admin_user),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    try:
        data = inventory_service.get_inventory_summary()
        return {
            "success": True,
            "message": "Inventory summary retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve inventory summary",
        )
