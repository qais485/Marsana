from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import Product
from app.repositories.catalog_repository import (
    BannerRepository,
    BlogRepository,
    BrandRepository,
    CategoryRepository,
    FlashSaleRepository,
    NewsletterRepository,
    ProductRepository,
    TestimonialRepository,
)


class HomepageService:
    def __init__(self, db: Session):
        self.db = db
        self.category_repo = CategoryRepository(db)
        self.brand_repo = BrandRepository(db)
        self.product_repo = ProductRepository(db)
        self.flash_sale_repo = FlashSaleRepository(db)
        self.banner_repo = BannerRepository(db)
        self.testimonial_repo = TestimonialRepository(db)
        self.blog_repo = BlogRepository(db)

    def get_homepage_data(self) -> dict:
        hero_banners = self.banner_repo.get_hero_banners()
        featured_products = self.product_repo.get_featured(limit=8)
        best_sellers = self.product_repo.get_best_sellers(limit=8)
        new_arrivals = self.product_repo.get_new_arrivals(limit=8)
        categories = self.category_repo.get_root_categories()
        flash_sale = self.flash_sale_repo.get_active_sale()
        recommended = self.product_repo.get_recommended(limit=8)
        brands = self.brand_repo.get_all_active()
        testimonials = self.testimonial_repo.get_all_active()
        blog_posts = self.blog_repo.get_published(limit=3)
        promo_banners = self.banner_repo.get_promotional_banners()

        return {
            "hero_banners": [_serialize_banner(b) for b in hero_banners],
            "featured_products": [_serialize_product(p) for p in featured_products],
            "best_sellers": [_serialize_product(p) for p in best_sellers],
            "new_arrivals": [_serialize_product(p) for p in new_arrivals],
            "categories": [_serialize_category(c) for c in categories],
            "flash_sale": _serialize_flash_sale(flash_sale) if flash_sale else None,
            "recommended_products": [_serialize_product(p) for p in recommended],
            "brands": [_serialize_brand(b) for b in brands],
            "testimonials": [_serialize_testimonial(t) for t in testimonials],
            "blog_posts": [_serialize_blog_post(b) for b in blog_posts],
            "promotional_banners": [_serialize_banner(b) for b in promo_banners],
        }


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(db)

    def get_products(
        self,
        page: int = 1,
        limit: int = 20,
        category_id: Optional[UUID] = None,
        brand_id: Optional[UUID] = None,
        search: Optional[str] = None,
        sort: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        in_stock: Optional[bool] = None,
        on_sale: Optional[bool] = None,
        sizes: Optional[list[str]] = None,
        colors: Optional[list[str]] = None,
        category_ids: Optional[list[UUID]] = None,
        brand_ids: Optional[list[UUID]] = None,
    ) -> dict:
        products, total = self.product_repo.get_paginated(
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
            sizes=sizes,
            colors=colors,
            category_ids=category_ids,
            brand_ids=brand_ids,
        )
        return {
            "products": [_serialize_product(p) for p in products],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_filter_options(self) -> dict:
        return self.product_repo.get_filter_options()


class NewsletterService:
    def __init__(self, db: Session):
        self.db = db
        self.newsletter_repo = NewsletterRepository(db)

    def subscribe(self, email: str) -> dict:
        subscriber = self.newsletter_repo.subscribe(email)
        return {
            "message": "Successfully subscribed to newsletter",
            "email": subscriber.email,
        }


class BlogService:
    def __init__(self, db: Session):
        self.db = db
        self.blog_repo = BlogRepository(db)

    def get_posts(self, limit: int = 3) -> list[dict]:
        posts = self.blog_repo.get_published(limit=limit)
        return [_serialize_blog_post(p) for p in posts]


# ─── Serialization Helpers ───────────────────────────────────────


def _serialize_product(product: Product) -> dict:
    return {
        "id": str(product.id),
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "short_description": product.short_description,
        "price": float(product.price),
        "discount_price": float(product.discount_price)
        if product.discount_price
        else None,
        "images": product.images,
        "category_id": str(product.category_id) if product.category_id else None,
        "brand_id": str(product.brand_id) if product.brand_id else None,
        "stock_quantity": product.stock_quantity,
        "sku": product.sku,
        "is_featured": product.is_featured,
        "is_new_arrival": product.is_new_arrival,
        "is_best_seller": product.is_best_seller,
        "rating": float(product.rating) if product.rating is not None else 0.0,
        "review_count": product.review_count,
        "sold_count": product.sold_count,
        "created_at": product.created_at.isoformat() if product.created_at else None,
    }


def _serialize_category(category) -> dict:
    return {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "parent_id": str(category.parent_id) if category.parent_id else None,
    }


def _serialize_brand(brand) -> dict:
    return {
        "id": str(brand.id),
        "name": brand.name,
        "slug": brand.slug,
        "logo_url": brand.logo_url,
        "description": brand.description,
    }


def _serialize_banner(banner) -> dict:
    return {
        "id": str(banner.id),
        "title": banner.title,
        "subtitle": banner.subtitle,
        "image_url": banner.image_url,
        "link_url": banner.link_url,
        "button_text": banner.button_text,
        "position": banner.position,
    }


def _serialize_flash_sale(sale) -> dict:
    items = []
    for item in sale.items:
        product = item.product
        items.append(
            {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "product_name": product.name if product else None,
                "product_image": product.images if product else None,
                "product_price": float(product.price) if product else None,
                "sale_price": float(item.sale_price),
                "stock_limit": item.stock_limit,
                "stock_sold": item.stock_sold,
            }
        )

    return {
        "id": str(sale.id),
        "name": sale.name,
        "description": sale.description,
        "start_date": sale.start_date.isoformat() if sale.start_date else None,
        "end_date": sale.end_date.isoformat() if sale.end_date else None,
        "items": items,
    }


def _serialize_testimonial(testimonial) -> dict:
    return {
        "id": str(testimonial.id),
        "customer_name": testimonial.customer_name,
        "customer_avatar": testimonial.customer_avatar,
        "customer_title": testimonial.customer_title,
        "content": testimonial.content,
        "rating": testimonial.rating,
    }


def _serialize_blog_post(post) -> dict:
    return {
        "id": str(post.id),
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "cover_image": post.cover_image,
        "author_name": post.author_name,
        "author_avatar": post.author_avatar,
        "category": post.category,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "view_count": post.view_count,
    }
