from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.request_response_models import (
    NewsletterSubscribeRequest,
)
from app.services.homepage_service import (
    BlogService,
    HomepageService,
    NewsletterService,
    ProductService,
)

router = APIRouter(prefix="/api/v1", tags=["Homepage"])


def get_homepage_service(db: Session = Depends(get_db)) -> HomepageService:
    return HomepageService(db)


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)


def get_newsletter_service(db: Session = Depends(get_db)) -> NewsletterService:
    return NewsletterService(db)


def get_blog_service(db: Session = Depends(get_db)) -> BlogService:
    return BlogService(db)


# ─── Homepage ────────────────────────────────────────────────────


@router.get("/home")
def get_homepage_data(
    homepage_service: HomepageService = Depends(get_homepage_service),
):
    try:
        data = homepage_service.get_homepage_data()
        return {
            "success": True,
            "message": "Homepage data retrieved",
            "data": data,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve homepage data",
        )


# ─── Products ────────────────────────────────────────────────────


@router.get("/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    brand: str = Query(None),
    search: str = Query(None),
    sort: str = Query(None),
    min_price: float = Query(None, ge=0),
    max_price: float = Query(None, ge=0),
    min_rating: float = Query(None, ge=0, le=5),
    in_stock: bool = Query(None),
    on_sale: bool = Query(None),
    sizes: str = Query(None),
    colors: str = Query(None),
    category_ids: str = Query(None),
    brand_ids: str = Query(None),
    product_service: ProductService = Depends(get_product_service),
):
    try:
        category_id = None
        brand_id = None

        if category:
            try:
                category_id = UUID(category)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid category ID format",
                )

        if brand:
            try:
                brand_id = UUID(brand)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid brand ID format",
                )

        parsed_sizes = [s.strip() for s in sizes.split(",") if s.strip()] if sizes else None
        parsed_colors = [c.strip() for c in colors.split(",") if c.strip()] if colors else None

        parsed_category_ids = None
        if category_ids:
            parsed_category_ids = []
            for cid in category_ids.split(","):
                cid = cid.strip()
                if cid:
                    try:
                        parsed_category_ids.append(UUID(cid))
                    except ValueError:
                        pass

        parsed_brand_ids = None
        if brand_ids:
            parsed_brand_ids = []
            for bid in brand_ids.split(","):
                bid = bid.strip()
                if bid:
                    try:
                        parsed_brand_ids.append(UUID(bid))
                    except ValueError:
                        pass

        result = product_service.get_products(
            page=page,
            limit=limit,
            category_id=category_id,
            brand_id=brand_id,
            search=search,
            sort=sort,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            in_stock=in_stock,
            on_sale=on_sale,
            sizes=parsed_sizes,
            colors=parsed_colors,
            category_ids=parsed_category_ids,
            brand_ids=parsed_brand_ids,
        )
        return {
            "success": True,
            "message": "Products retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve products",
        )


@router.get("/products/filters")
def get_product_filters(
    product_service: ProductService = Depends(get_product_service),
):
    try:
        options = product_service.get_filter_options()
        return {
            "success": True,
            "message": "Filter options retrieved",
            "data": options,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve filter options",
        )


# ─── Newsletter ──────────────────────────────────────────────────


@router.post("/newsletter/subscribe")
def subscribe_newsletter(
    request: NewsletterSubscribeRequest,
    newsletter_service: NewsletterService = Depends(get_newsletter_service),
):
    try:
        result = newsletter_service.subscribe(email=request.email)
        return {
            "success": True,
            "message": result["message"],
            "data": {"email": result["email"]},
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to newsletter",
        )


# ─── Blog ────────────────────────────────────────────────────────


@router.get("/blog/posts")
def get_blog_posts(
    limit: int = Query(3, ge=1, le=20),
    blog_service: BlogService = Depends(get_blog_service),
):
    try:
        posts = blog_service.get_posts(limit=limit)
        return {
            "success": True,
            "message": "Blog posts retrieved",
            "data": posts,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve blog posts",
        )
