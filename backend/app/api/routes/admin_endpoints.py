from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import User
from app.schemas.request_response_models import (
    AdminCategoryCreateRequest,
    AdminCategoryUpdateRequest,
    AdminOrderNotesRequest,
    AdminOrderRefundRequest,
    AdminOrderStatusUpdateRequest,
    AdminProductCreateRequest,
    AdminProductImportRow,
    AdminProductInventoryRequest,
    AdminProductUpdateRequest,
)
from app.services.admin_service import AdminService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def get_admin_service(db: Session = Depends(get_db)) -> AdminService:
    return AdminService(db)


@router.get("/dashboard")
def get_dashboard_overview(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_dashboard_overview()
        return {
            "success": True,
            "message": "Dashboard overview retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard overview",
        )


@router.get("/users")
def get_user_stats(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_user_stats()
        return {
            "success": True,
            "message": "User statistics retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user statistics",
        )


@router.get("/products")
def get_product_stats(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_product_stats()
        return {
            "success": True,
            "message": "Product statistics retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve product statistics",
        )


@router.get("/sales")
def get_sales_stats(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_sales_stats()
        return {
            "success": True,
            "message": "Sales statistics retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve sales statistics",
        )


@router.get("/revenue")
def get_revenue_stats(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_revenue_stats()
        return {
            "success": True,
            "message": "Revenue statistics retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve revenue statistics",
        )


# ─── Admin Product Management Endpoints ─────────────────────────


@router.get("/products/list")
def admin_list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[UUID] = None,
    brand_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_admin_products(
            page=page, limit=limit, search=search,
            category_id=category_id, brand_id=brand_id, is_active=is_active,
        )
        return {
            "success": True,
            "message": "Products retrieved",
            "data": data["products"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve products",
        )


@router.get("/products/{product_id}")
def admin_get_product(
    product_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_admin_product(product_id)
        return {
            "success": True,
            "message": "Product retrieved",
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
            detail="Failed to retrieve product",
        )


@router.post("/products", status_code=status.HTTP_201_CREATED)
def admin_create_product(
    request: AdminProductCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.create_product(request.model_dump())
        return {
            "success": True,
            "message": "Product created successfully",
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
            detail="Failed to create product",
        )


@router.put("/products/{product_id}")
def admin_update_product(
    product_id: UUID,
    request: AdminProductUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.update_product(product_id, request.model_dump(exclude_unset=True))
        return {
            "success": True,
            "message": "Product updated successfully",
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
            detail="Failed to update product",
        )


@router.delete("/products/{product_id}")
def admin_delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        result = admin_service.delete_product(product_id)
        return {
            "success": True,
            "message": result["message"],
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product",
        )


@router.patch("/products/{product_id}/inventory")
def admin_update_inventory(
    product_id: UUID,
    request: AdminProductInventoryRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        result = admin_service.update_inventory(product_id, request.stock_quantity)
        return {
            "success": True,
            "message": result["message"],
            "data": {"stock_quantity": result["stock_quantity"]},
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update inventory",
        )


@router.post("/products/import")
def admin_import_products(
    products: list[AdminProductImportRow],
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.import_products([p.model_dump() for p in products])
        return {
            "success": True,
            "message": f"Imported {data['imported']} of {data['total']} products",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import products",
        )


@router.get("/products/export/csv")
def admin_export_products_csv(
    category_id: Optional[UUID] = None,
    brand_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    import csv
    import io

    try:
        products = admin_service.export_products(
            category_id=category_id, brand_id=brand_id, is_active=is_active,
        )
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "name", "description", "short_description", "price", "discount_price",
            "category_name", "brand_name", "stock_quantity", "sku", "barcode",
            "is_active", "is_featured", "is_new_arrival", "is_best_seller",
        ])
        writer.writeheader()
        for p in products:
            writer.writerow({
                "name": p["name"],
                "description": p["description"] or "",
                "short_description": p["short_description"] or "",
                "price": p["price"],
                "discount_price": p["discount_price"] or "",
                "category_name": p["category_name"] or "",
                "brand_name": p["brand_name"] or "",
                "stock_quantity": p["stock_quantity"],
                "sku": p["sku"] or "",
                "barcode": p["barcode"] or "",
                "is_active": p["is_active"],
                "is_featured": p["is_featured"],
                "is_new_arrival": p["is_new_arrival"],
                "is_best_seller": p["is_best_seller"],
            })

        from fastapi.responses import StreamingResponse
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=products_export.csv"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export products",
        )


# ─── Admin Category Management Endpoints ─────────────────────────


@router.get("/categories")
def admin_list_categories(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_admin_categories()
        return {
            "success": True,
            "message": "Categories retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve categories",
        )


@router.get("/categories/{category_id}")
def admin_get_category(
    category_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_admin_category(category_id)
        return {
            "success": True,
            "message": "Category retrieved",
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
            detail="Failed to retrieve category",
        )


@router.post("/categories", status_code=status.HTTP_201_CREATED)
def admin_create_category(
    request: AdminCategoryCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.create_category(request.model_dump())
        return {
            "success": True,
            "message": "Category created successfully",
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
            detail="Failed to create category",
        )


@router.put("/categories/{category_id}")
def admin_update_category(
    category_id: UUID,
    request: AdminCategoryUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.update_category(category_id, request.model_dump(exclude_unset=True))
        return {
            "success": True,
            "message": "Category updated successfully",
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
            detail="Failed to update category",
        )


@router.delete("/categories/{category_id}")
def admin_delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        result = admin_service.delete_category(category_id)
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
            detail="Failed to delete category",
        )


# ─── Admin Order Management Endpoints ────────────────────────────


@router.get("/orders")
def admin_list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_admin_orders(
            page=page, limit=limit, status=status,
            payment_status=payment_status, search=search,
        )
        return {
            "success": True,
            "message": "Orders retrieved",
            "data": data["orders"],
            "pagination": data["pagination"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve orders",
        )


@router.get("/orders/stats")
def admin_order_stats(
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_order_stats()
        return {
            "success": True,
            "message": "Order statistics retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve order statistics",
        )


@router.get("/orders/{order_id}")
def admin_get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.get_admin_order(order_id)
        return {
            "success": True,
            "message": "Order retrieved",
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
            detail="Failed to retrieve order",
        )


@router.patch("/orders/{order_id}/status")
def admin_update_order_status(
    order_id: UUID,
    request: AdminOrderStatusUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.update_order_status(order_id, request.model_dump(), current_user.id)
        return {
            "success": True,
            "message": "Order status updated",
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
            detail="Failed to update order status",
        )


@router.post("/orders/{order_id}/refund")
def admin_refund_order(
    order_id: UUID,
    request: AdminOrderRefundRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        data = admin_service.refund_order(order_id, request.model_dump())
        return {
            "success": True,
            "message": "Order refunded successfully",
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
            detail="Failed to refund order",
        )


@router.patch("/orders/{order_id}/notes")
def admin_update_order_notes(
    order_id: UUID,
    request: AdminOrderNotesRequest,
    current_user: User = Depends(get_current_admin_user),
    admin_service: AdminService = Depends(get_admin_service),
):
    try:
        result = admin_service.update_order_notes(order_id, request.model_dump())
        return {
            "success": True,
            "message": result["message"],
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order notes",
        )
