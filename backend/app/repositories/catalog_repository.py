from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.database_models import (
    Banner,
    BlogPost,
    Brand,
    Category,
    DeliveryTracking,
    ExchangeRequest,
    FlashSale,
    NewsletterSubscriber,
    Order,
    OrderItem,
    OrderStatusHistory,
    PickupLocation,
    PopularSearch,
    Product,
    ProductAttribute,
    ProductImage,
    ProductReview,
    ProductSpecification,
    ProductTag,
    ProductVariant,
    ReturnRequest,
    ReviewHelpful,
    ReviewReport,
    SearchHistory,
    ShippingMethod,
    ShippingRate,
    ShippingZone,
    Testimonial,
    TrackingEvent,
    User,
)


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_active(self) -> list[Category]:
        return (
            self.db.query(Category)
            .filter(Category.is_active)
            .order_by(Category.sort_order, Category.name)
            .all()
        )

    def get_by_id(self, category_id: UUID) -> Optional[Category]:
        return self.db.query(Category).filter(Category.id == category_id).first()

    def get_by_slug(self, slug: str) -> Optional[Category]:
        return self.db.query(Category).filter(Category.slug == slug).first()

    def get_root_categories(self) -> list[Category]:
        return (
            self.db.query(Category)
            .filter(Category.is_active, Category.parent_id.is_(None))
            .order_by(Category.sort_order, Category.name)
            .all()
        )

    def get_children(self, parent_id: UUID) -> list[Category]:
        return (
            self.db.query(Category)
            .filter(Category.is_active, Category.parent_id == parent_id)
            .order_by(Category.sort_order, Category.name)
            .all()
        )

    def get_all(self) -> list[Category]:
        return (
            self.db.query(Category)
            .order_by(Category.sort_order, Category.name)
            .all()
        )

    def create(self, data: dict) -> Category:
        category = Category(**data)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category: Category, data: dict) -> Category:
        for key, value in data.items():
            if value is not None:
                setattr(category, key, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()

    def get_product_count(self, category_id: UUID) -> int:
        from app.models.database_models import Product
        return self.db.query(Product).filter(
            Product.category_id == category_id,
            Product.is_active,
        ).count()


class BrandRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_active(self) -> list[Brand]:
        return (
            self.db.query(Brand)
            .filter(Brand.is_active)
            .order_by(Brand.sort_order, Brand.name)
            .all()
        )

    def get_by_id(self, brand_id: UUID) -> Optional[Brand]:
        return self.db.query(Brand).filter(Brand.id == brand_id).first()

    def get_by_slug(self, slug: str) -> Optional[Brand]:
        return self.db.query(Brand).filter(Brand.slug == slug).first()


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_featured(self, limit: int = 8) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.is_active, Product.is_featured)
            .order_by(Product.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_best_sellers(self, limit: int = 8) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.is_active, Product.is_best_seller)
            .order_by(Product.sold_count.desc())
            .limit(limit)
            .all()
        )

    def get_new_arrivals(self, limit: int = 8) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.is_active, Product.is_new_arrival)
            .order_by(Product.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_recommended(self, limit: int = 8) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.is_active, Product.rating >= 4.0)
            .order_by(Product.rating.desc(), Product.review_count.desc())
            .limit(limit)
            .all()
        )

    def get_by_id(self, product_id: UUID) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_by_slug(self, slug: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.slug == slug).first()

    def get_paginated(
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
    ) -> tuple[list[Product], int]:
        query = self.db.query(Product).filter(Product.is_active)

        if category_id:
            query = query.filter(Product.category_id == category_id)
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        if category_ids:
            query = query.filter(Product.category_id.in_(category_ids))
        if brand_ids:
            query = query.filter(Product.brand_id.in_(brand_ids))
        if search:
            escaped_search = search.replace("%", "\\%").replace("_", "\\_")
            query = query.filter(Product.name.ilike(f"%{escaped_search}%"))
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if min_rating is not None:
            query = query.filter(Product.rating >= min_rating)
        if in_stock is not None:
            if in_stock:
                query = query.filter(Product.stock_quantity > 0)
            else:
                query = query.filter(Product.stock_quantity == 0)
        if on_sale is not None:
            if on_sale:
                query = query.filter(Product.discount_price.isnot(None))
            else:
                query = query.filter(Product.discount_price.is_(None))

        if sizes:
            size_conditions = []
            for size in sizes:
                size_conditions.append(
                    ProductVariant.option_values.ilike(f"%{size}%")
                )
            query = query.filter(
                Product.id.in_(
                    self.db.query(ProductVariant.product_id).filter(
                        ProductVariant.is_active,
                        *size_conditions,
                    )
                )
            )

        if colors:
            color_conditions = []
            for color in colors:
                color_conditions.append(
                    ProductVariant.option_values.ilike(f"%{color}%")
                )
            query = query.filter(
                Product.id.in_(
                    self.db.query(ProductVariant.product_id).filter(
                        ProductVariant.is_active,
                        *color_conditions,
                    )
                )
            )

        total = query.count()

        if sort == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort == "newest":
            query = query.order_by(Product.created_at.desc())
        elif sort == "best_selling":
            query = query.order_by(Product.sold_count.desc())
        elif sort == "rating":
            query = query.order_by(Product.rating.desc())
        elif sort == "popular":
            query = query.order_by(Product.review_count.desc())
        elif sort == "alpha_asc":
            query = query.order_by(Product.name.asc())
        elif sort == "alpha_desc":
            query = query.order_by(Product.name.desc())
        else:
            query = query.order_by(Product.created_at.desc())

        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()

        return products, total

    def get_filter_options(self) -> dict:
        brands = (
            self.db.query(Brand.id, Brand.name, Brand.slug, func.count(Product.id).label("count"))
            .outerjoin(Product, (Product.brand_id == Brand.id) & Product.is_active)
            .filter(Brand.is_active)
            .group_by(Brand.id, Brand.name, Brand.slug)
            .order_by(Brand.name)
            .all()
        )

        categories = (
            self.db.query(Category.id, Category.name, Category.slug, func.count(Product.id).label("count"))
            .outerjoin(Product, (Product.category_id == Category.id) & Product.is_active)
            .filter(Category.is_active)
            .group_by(Category.id, Category.name, Category.slug)
            .order_by(Category.name)
            .all()
        )

        price_range = self.db.query(
            func.min(Product.price),
            func.max(Product.price),
        ).filter(Product.is_active).first()

        raw_sizes = (
            self.db.query(ProductVariant.option_values)
            .filter(ProductVariant.is_active, ProductVariant.option_values.isnot(None))
            .all()
        )
        sizes = set()
        for (oval,) in raw_sizes:
            if oval:
                for part in oval.split(","):
                    part = part.strip()
                    if part and any(
                        s in part.lower()
                        for s in ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "small", "medium", "large"]
                    ):
                        sizes.add(part)

        raw_colors = (
            self.db.query(ProductVariant.option_values)
            .filter(ProductVariant.is_active, ProductVariant.option_values.isnot(None))
            .all()
        )
        colors = set()
        known_colors = [
            "black", "white", "red", "blue", "green", "yellow", "orange", "purple",
            "pink", "brown", "gray", "grey", "navy", "beige", "gold", "silver",
            "teal", "maroon", "olive", "cyan", "magenta", "coral", "ivory", "charcoal",
        ]
        for (oval,) in raw_colors:
            if oval:
                for part in oval.split(","):
                    part = part.strip()
                    if part and any(c in part.lower() for c in known_colors):
                        colors.add(part)

        return {
            "brands": [
                {"id": str(b.id), "name": b.name, "slug": b.slug, "count": b.count}
                for b in brands
            ],
            "categories": [
                {"id": str(c.id), "name": c.name, "slug": c.slug, "count": c.count}
                for c in categories
            ],
            "price_range": {
                "min": float(price_range[0]) if price_range[0] is not None else None,
                "max": float(price_range[1]) if price_range[1] is not None else None,
            },
            "sizes": sorted(sizes),
            "colors": sorted(colors),
        }


class FlashSaleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_sale(self) -> Optional[FlashSale]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(FlashSale)
            .filter(
                FlashSale.is_active,
                FlashSale.start_date <= now,
                FlashSale.end_date >= now,
            )
            .first()
        )

    def get_by_id(self, sale_id: UUID) -> Optional[FlashSale]:
        return self.db.query(FlashSale).filter(FlashSale.id == sale_id).first()


class BannerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_position(self, position: str) -> list[Banner]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(Banner)
            .filter(
                Banner.is_active,
                Banner.position == position,
                Banner.start_date <= now,
                Banner.end_date >= now,
            )
            .order_by(Banner.sort_order)
            .all()
        )

    def get_hero_banners(self) -> list[Banner]:
        return self.get_by_position("hero")

    def get_promotional_banners(self) -> list[Banner]:
        return self.get_by_position("promo")


class TestimonialRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_active(self) -> list[Testimonial]:
        return (
            self.db.query(Testimonial)
            .filter(Testimonial.is_active)
            .order_by(Testimonial.sort_order)
            .all()
        )


class BlogRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_published(self, limit: int = 3) -> list[BlogPost]:
        return (
            self.db.query(BlogPost)
            .filter(BlogPost.is_published)
            .order_by(BlogPost.published_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_slug(self, slug: str) -> Optional[BlogPost]:
        return self.db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True).first()


class NewsletterRepository:
    def __init__(self, db: Session):
        self.db = db

    def subscribe(self, email: str) -> NewsletterSubscriber:
        existing = (
            self.db.query(NewsletterSubscriber)
            .filter(NewsletterSubscriber.email == email)
            .first()
        )
        if existing:
            if not existing.is_active:
                existing.is_active = True
                self.db.commit()
                self.db.refresh(existing)
            return existing

        subscriber = NewsletterSubscriber(email=email)
        self.db.add(subscriber)
        self.db.commit()
        self.db.refresh(subscriber)
        return subscriber

    def is_subscribed(self, email: str) -> bool:
        subscriber = (
            self.db.query(NewsletterSubscriber)
            .filter(NewsletterSubscriber.email == email, NewsletterSubscriber.is_active)
            .first()
        )
        return subscriber is not None


class ProductImageRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_product(self, product_id: UUID) -> list[ProductImage]:
        return (
            self.db.query(ProductImage)
            .filter(ProductImage.product_id == product_id)
            .order_by(ProductImage.sort_order, ProductImage.created_at)
            .all()
        )

    def get_by_id(self, image_id: UUID) -> Optional[ProductImage]:
        return self.db.query(ProductImage).filter(ProductImage.id == image_id).first()


class ProductVariantRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_product(self, product_id: UUID) -> list:
        return (
            self.db.query(ProductVariant)
            .filter(ProductVariant.product_id == product_id, ProductVariant.is_active)
            .order_by(ProductVariant.created_at)
            .all()
        )

    def get_by_id(self, variant_id: UUID):
        return (
            self.db.query(ProductVariant)
            .filter(ProductVariant.id == variant_id)
            .first()
        )


class ProductAttributeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_product(self, product_id: UUID) -> list[ProductAttribute]:
        return (
            self.db.query(ProductAttribute)
            .filter(ProductAttribute.product_id == product_id)
            .order_by(ProductAttribute.sort_order, ProductAttribute.attribute_name)
            .all()
        )


class ProductSpecificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_product(self, product_id: UUID) -> list[ProductSpecification]:
        return (
            self.db.query(ProductSpecification)
            .filter(ProductSpecification.product_id == product_id)
            .order_by(
                ProductSpecification.sort_order,
                ProductSpecification.section_name,
                ProductSpecification.spec_name,
            )
            .all()
        )


class ProductTagRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[ProductTag]:
        return (
            self.db.query(ProductTag)
            .order_by(ProductTag.name)
            .all()
        )

    def get_by_product(self, product_id: UUID) -> list[ProductTag]:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return []
        return product.tags

    def get_by_slug(self, slug: str) -> Optional[ProductTag]:
        return self.db.query(ProductTag).filter(ProductTag.slug == slug).first()

    def get_by_ids(self, tag_ids: list[UUID]) -> list[ProductTag]:
        return self.db.query(ProductTag).filter(ProductTag.id.in_(tag_ids)).all()


class ProductReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_product(
        self, product_id: UUID, page: int = 1, limit: int = 10
    ) -> tuple[list, int]:
        query = (
            self.db.query(ProductReview)
            .filter(
                ProductReview.product_id == product_id,
                ProductReview.is_approved,
            )
        )
        total = query.count()
        reviews = (
            query.order_by(ProductReview.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return reviews, total

    def get_by_id(self, review_id: UUID) -> Optional[ProductReview]:
        return (
            self.db.query(ProductReview)
            .filter(ProductReview.id == review_id)
            .first()
        )

    def get_by_user_and_product(
        self, user_id: UUID, product_id: UUID
    ) -> Optional[ProductReview]:
        return (
            self.db.query(ProductReview)
            .filter(
                ProductReview.user_id == user_id,
                ProductReview.product_id == product_id,
            )
            .first()
        )

    def create(self, review: ProductReview) -> ProductReview:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def get_rating_summary(self, product_id: UUID) -> dict:
        from sqlalchemy import func

        result = (
            self.db.query(
                ProductReview.rating,
                func.count(ProductReview.id).label("count"),
            )
            .filter(
                ProductReview.product_id == product_id,
                ProductReview.is_approved,
            )
            .group_by(ProductReview.rating)
            .all()
        )
        summary = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        total = 0
        weighted_sum = 0
        for rating, count in result:
            summary[rating] = count
            total += count
            weighted_sum += rating * count
        average = weighted_sum / total if total > 0 else 0
        return {
            "average": round(average, 2),
            "total": total,
            "breakdown": summary,
        }

    def toggle_helpful(self, review_id: UUID, user_id: UUID) -> tuple[int, bool]:
        existing = (
            self.db.query(ReviewHelpful)
            .filter(
                ReviewHelpful.review_id == review_id,
                ReviewHelpful.user_id == user_id,
            )
            .first()
        )
        if existing:
            self.db.delete(existing)
            review = self.db.query(ProductReview).filter(ProductReview.id == review_id).first()
            if review is not None:
                review.helpful_count = max(0, review.helpful_count - 1)
            self.db.commit()
            return review.helpful_count if review is not None else 0, False
        else:
            vote = ReviewHelpful(review_id=review_id, user_id=user_id)
            self.db.add(vote)
            review = self.db.query(ProductReview).filter(ProductReview.id == review_id).first()
            if review is not None:
                review.helpful_count += 1
            self.db.commit()
            return review.helpful_count if review is not None else 0, True

    def is_helpful_by_user(self, review_id: UUID, user_id: UUID) -> bool:
        return (
            self.db.query(ReviewHelpful)
            .filter(
                ReviewHelpful.review_id == review_id,
                ReviewHelpful.user_id == user_id,
            )
            .first()
            is not None
        )

    def create_report(
        self, review_id: UUID, user_id: UUID, reason: str, description: str = None
    ) -> ReviewReport:
        report = ReviewReport(
            review_id=review_id,
            user_id=user_id,
            reason=reason,
            description=description,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def has_user_reported(self, review_id: UUID, user_id: UUID) -> bool:
        return (
            self.db.query(ReviewReport)
            .filter(
                ReviewReport.review_id == review_id,
                ReviewReport.user_id == user_id,
            )
            .first()
            is not None
        )


class SearchRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_suggestions(self, query: str, limit: int = 10) -> list[dict]:
        pattern = f"%{query}%"
        results = []

        products = (
            self.db.query(Product)
            .filter(Product.is_active, Product.name.ilike(pattern))
            .limit(limit)
            .all()
        )
        for p in products:
            first_image = p.images.split(",")[0].strip() if p.images else None
            results.append(
                {
                    "type": "product",
                    "id": p.id,
                    "name": p.name,
                    "slug": p.slug,
                    "image_url": first_image,
                }
            )

        if len(results) < limit:
            categories = (
                self.db.query(Category)
                .filter(Category.is_active, Category.name.ilike(pattern))
                .limit(limit - len(results))
                .all()
            )
            for c in categories:
                results.append(
                    {
                        "type": "category",
                        "id": c.id,
                        "name": c.name,
                        "slug": c.slug,
                        "image_url": c.image_url,
                    }
                )

        return results[:limit]

    def search_products(
        self, query: str, page: int = 1, limit: int = 20
    ) -> tuple[list[Product], int]:
        pattern = f"%{query}%"
        base_query = self.db.query(Product).filter(
            Product.is_active,
            Product.name.ilike(pattern),
        )
        total = base_query.count()
        products = (
            base_query.order_by(Product.name)
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return products, total

    def search_categories(self, query: str, limit: int = 10) -> list[Category]:
        pattern = f"%{query}%"
        return (
            self.db.query(Category)
            .filter(Category.is_active, Category.name.ilike(pattern))
            .limit(limit)
            .all()
        )

    def get_popular_searches(self, limit: int = 10) -> list[PopularSearch]:
        return (
            self.db.query(PopularSearch)
            .order_by(PopularSearch.count.desc())
            .limit(limit)
            .all()
        )

    def add_popular_search(self, query: str) -> None:
        normalized = query.strip().lower()
        existing = (
            self.db.query(PopularSearch)
            .filter(PopularSearch.query == normalized)
            .first()
        )
        if existing:
            existing.count += 1
        else:
            self.db.add(PopularSearch(query=normalized, count=1))
        self.db.commit()

    def get_user_history(self, user_id: UUID, limit: int = 20) -> list[SearchHistory]:
        return (
            self.db.query(SearchHistory)
            .filter(SearchHistory.user_id == user_id)
            .order_by(SearchHistory.created_at.desc())
            .limit(limit)
            .all()
        )

    def add_to_history(self, user_id: UUID, query: str) -> None:
        self.db.add(SearchHistory(user_id=user_id, query=query.strip()))
        self.db.commit()

    def remove_from_history(self, user_id: UUID, history_id: UUID) -> bool:
        deleted = (
            self.db.query(SearchHistory)
            .filter(
                SearchHistory.user_id == user_id,
                SearchHistory.id == history_id,
            )
            .delete()
        )
        self.db.commit()
        return deleted > 0

    def clear_history(self, user_id: UUID) -> int:
        deleted = (
            self.db.query(SearchHistory)
            .filter(SearchHistory.user_id == user_id)
            .delete()
        )
        self.db.commit()
        return deleted


class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_stats(self) -> dict:
        from datetime import timedelta

        now = datetime.now(timezone.utc)
        month_ago = now - timedelta(days=30)
        week_ago = now - timedelta(days=7)

        total = self.db.query(func.count(User.id)).scalar()
        active = self.db.query(func.count(User.id)).filter(User.is_active).scalar()
        admins = self.db.query(func.count(User.id)).filter(User.role == "admin").scalar()
        new_month = (
            self.db.query(func.count(User.id))
            .filter(User.created_at >= month_ago)
            .scalar()
        )
        new_week = (
            self.db.query(func.count(User.id))
            .filter(User.created_at >= week_ago)
            .scalar()
        )
        verified = (
            self.db.query(func.count(User.id))
            .filter(User.is_email_verified)
            .scalar()
        )
        return {
            "total": total,
            "active": active,
            "inactive": total - active,
            "admins": admins,
            "new_this_month": new_month,
            "new_this_week": new_week,
            "verified": verified,
            "unverified": total - verified,
        }

    def get_product_stats(self) -> dict:
        total = self.db.query(func.count(Product.id)).scalar()
        active = (
            self.db.query(func.count(Product.id)).filter(Product.is_active).scalar()
        )
        low_stock = (
            self.db.query(func.count(Product.id))
            .filter(Product.is_active, Product.stock_quantity > 0, Product.stock_quantity <= 10)
            .scalar()
        )
        out_of_stock = (
            self.db.query(func.count(Product.id))
            .filter(Product.is_active, Product.stock_quantity == 0)
            .scalar()
        )
        featured = (
            self.db.query(func.count(Product.id))
            .filter(Product.is_active, Product.is_featured)
            .scalar()
        )
        total_value = (
            self.db.query(
                func.sum(Product.price * Product.stock_quantity)
            )
            .filter(Product.is_active)
            .scalar()
        ) or 0
        total_sold = (
            self.db.query(func.sum(Product.sold_count))
            .filter(Product.is_active)
            .scalar()
        ) or 0
        avg_price = (
            self.db.query(func.avg(Product.price))
            .filter(Product.is_active)
            .scalar()
        ) or 0
        return {
            "total": total,
            "active": active,
            "inactive": total - active,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "featured": featured,
            "total_inventory_value": float(total_value),
            "total_sold": int(total_sold),
            "average_price": float(avg_price),
        }

    def get_review_stats(self) -> dict:
        total = self.db.query(func.count(ProductReview.id)).scalar()
        approved = (
            self.db.query(func.count(ProductReview.id))
            .filter(ProductReview.is_approved)
            .scalar()
        )
        avg_rating = (
            self.db.query(func.avg(ProductReview.rating))
            .filter(ProductReview.is_approved)
            .scalar()
        ) or 0
        return {
            "total": total,
            "approved": approved,
            "pending": total - approved,
            "average_rating": round(float(avg_rating), 2),
        }

    def get_revenue_stats(self) -> dict:
        revenue_data = (
            self.db.query(
                func.sum(Product.discount_price * Product.sold_count),
                func.sum(Product.price * Product.sold_count),
            )
            .filter(Product.is_active)
            .first()
        )
        discount_revenue = float(revenue_data[0]) if revenue_data[0] else 0
        full_revenue = float(revenue_data[1]) if revenue_data[1] else 0

        return {
            "estimated_total_revenue": full_revenue,
            "estimated_discounted_revenue": discount_revenue,
            "estimated_savings_given": full_revenue - discount_revenue,
        }

    def get_sales_by_category(self) -> list[dict]:
        results = (
            self.db.query(
                Category.name,
                func.sum(Product.sold_count).label("total_sold"),
                func.count(Product.id).label("product_count"),
            )
            .join(Product, Product.category_id == Category.id)
            .filter(Product.is_active, Category.is_active)
            .group_by(Category.id, Category.name)
            .order_by(func.sum(Product.sold_count).desc())
            .all()
        )
        return [
            {"category": r.name, "sold": int(r.total_sold or 0), "products": r.product_count}
            for r in results
        ]

    def get_sales_by_brand(self) -> list[dict]:
        results = (
            self.db.query(
                Brand.name,
                func.sum(Product.sold_count).label("total_sold"),
                func.count(Product.id).label("product_count"),
            )
            .join(Product, Product.brand_id == Brand.id)
            .filter(Product.is_active, Brand.is_active)
            .group_by(Brand.id, Brand.name)
            .order_by(func.sum(Product.sold_count).desc())
            .all()
        )
        return [
            {"brand": r.name, "sold": int(r.total_sold or 0), "products": r.product_count}
            for r in results
        ]

    def get_top_products(self, limit: int = 10) -> list[dict]:
        products = (
            self.db.query(Product)
            .filter(Product.is_active)
            .order_by(Product.sold_count.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "sold_count": p.sold_count,
                "stock_quantity": p.stock_quantity,
                "rating": float(p.rating),
                "review_count": p.review_count,
                "images": p.images,
            }
            for p in products
        ]

    def get_recent_users(self, limit: int = 10) -> list[dict]:
        users = (
            self.db.query(User)
            .order_by(User.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role,
                "is_active": u.is_active,
                "is_email_verified": u.is_email_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]

    def get_monthly_registrations(self, months: int = 12) -> list[dict]:
        import calendar

        now = datetime.now(timezone.utc)
        results = []
        for i in range(months - 1, -1, -1):
            year = now.year
            month = now.month - i
            while month <= 0:
                month += 12
                year -= 1
            month_start = datetime(year, month, 1, tzinfo=timezone.utc)
            last_day = calendar.monthrange(year, month)[1]
            if i > 0:
                month_end = month_start.replace(day=last_day)
            else:
                month_end = now
            count = (
                self.db.query(func.count(User.id))
                .filter(User.created_at >= month_start, User.created_at < month_end)
                .scalar()
            )
            results.append({
                "month": month_start.strftime("%b %Y"),
                "count": count,
            })
        return results

    def get_monthly_revenue(self, months: int = 12) -> list[dict]:
        import calendar

        now = datetime.now(timezone.utc)
        results = []
        for i in range(months - 1, -1, -1):
            year = now.year
            month = now.month - i
            while month <= 0:
                month += 12
                year -= 1
            month_start = datetime(year, month, 1, tzinfo=timezone.utc)
            last_day = calendar.monthrange(year, month)[1]
            if i > 0:
                month_end = month_start.replace(day=last_day)
            else:
                month_end = now
            revenue = (
                self.db.query(func.sum(Product.price * Product.sold_count))
                .filter(
                    Product.is_active,
                    Product.created_at >= month_start,
                    Product.created_at < month_end,
                )
                .scalar()
            ) or 0
            results.append({
                "month": month_start.strftime("%b %Y"),
                "revenue": float(revenue),
            })
        return results


class AdminProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_products(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        category_id: Optional[UUID] = None,
        brand_id: Optional[UUID] = None,
        is_active: Optional[bool] = None,
    ) -> tuple[list[Product], int]:
        query = self.db.query(Product).filter(Product.deleted_at.is_(None))

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Product.name.ilike(search_term)) | (Product.sku.ilike(search_term))
            )
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        total = query.count()
        products = (
            query.order_by(Product.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return products, total

    def get_product_by_id(self, product_id: UUID) -> Optional[Product]:
        return (
            self.db.query(Product)
            .filter(Product.id == product_id, Product.deleted_at.is_(None))
            .first()
        )

    def get_product_by_sku(self, sku: str) -> Optional[Product]:
        return (
            self.db.query(Product)
            .filter(Product.sku == sku, Product.deleted_at.is_(None))
            .first()
        )

    def create_product(self, product: Product) -> Product:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, product: Product) -> Product:
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete_product(self, product: Product) -> None:
        product.deleted_at = datetime.now(timezone.utc)
        self.db.commit()

    def update_stock(self, product: Product, quantity: int) -> Product:
        product.stock_quantity = quantity
        self.db.commit()
        self.db.refresh(product)
        return product

    def get_products_by_ids(self, product_ids: list[UUID]) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.id.in_(product_ids), Product.deleted_at.is_(None))
            .all()
        )

    def category_exists(self, category_id: UUID) -> bool:
        return self.db.query(Category.id).filter(Category.id == category_id).first() is not None

    def brand_exists(self, brand_id: UUID) -> bool:
        return self.db.query(Brand.id).filter(Brand.id == brand_id).first() is not None

    def get_category_by_name(self, name: str) -> Optional[Category]:
        return self.db.query(Category).filter(Category.name.ilike(name)).first()

    def get_brand_by_name(self, name: str) -> Optional[Brand]:
        return self.db.query(Brand).filter(Brand.name.ilike(name)).first()

    def get_all_active_products_for_export(
        self,
        category_id: Optional[UUID] = None,
        brand_id: Optional[UUID] = None,
        is_active: Optional[bool] = None,
    ) -> list[Product]:
        query = self.db.query(Product).filter(Product.deleted_at.is_(None))
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        return query.order_by(Product.name).all()


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Order], int]:
        query = self.db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        if payment_status:
            query = query.filter(Order.payment_status == payment_status)
        if search:
            query = query.filter(
                Order.order_number.ilike(f"%{search}%")
                | Order.shipping_name.ilike(f"%{search}%")
            )
        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return orders, total

    def get_by_id(self, order_id: UUID) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_by_order_number(self, order_number: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.order_number == order_number).first()

    def get_by_user(self, user_id: UUID, page: int = 1, limit: int = 20) -> tuple[list[Order], int]:
        query = self.db.query(Order).filter(Order.user_id == user_id)
        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return orders, total

    def get_user_order(self, user_id: UUID, order_id: UUID) -> Optional[Order]:
        return (
            self.db.query(Order)
            .filter(Order.id == order_id, Order.user_id == user_id)
            .first()
        )

    def get_by_email_and_order_number(self, email: str, order_number: str) -> Optional[Order]:
        return (
            self.db.query(Order)
            .filter(
                Order.shipping_name.ilike(f"%{email}%")
                & Order.order_number == order_number
            )
            .first()
        )

    def create_order(
        self,
        order: Order,
        items: list[dict],
        status: str = "pending",
    ) -> Order:
        self.db.add(order)
        self.db.flush()

        for item_data in items:
            valid_fields = {
                "product_id",
                "product_name",
                "product_sku",
                "product_image",
                "quantity",
                "unit_price",
                "total_price",
            }
            filtered = {k: v for k, v in item_data.items() if k in valid_fields}
            item = OrderItem(order_id=order.id, **filtered)
            self.db.add(item)

        history = OrderStatusHistory(
            order_id=order.id,
            status=status,
            note="Order placed",
        )
        self.db.add(history)

        self.db.commit()
        self.db.refresh(order)
        return order

    def decrement_stock(self, items: list[dict]) -> None:
        for item_data in items:
            product_id = item_data.get("product_id")
            variant_id = item_data.get("variant_id")
            quantity = item_data.get("quantity", 1)

            if variant_id:
                variant = self.db.query(ProductVariant).filter(
                    ProductVariant.id == variant_id
                ).first()
                if variant:
                    variant.stock_quantity = max(variant.stock_quantity - quantity, 0)
            elif product_id:
                product = self.db.query(Product).filter(
                    Product.id == product_id
                ).first()
                if product:
                    product.stock_quantity = max(product.stock_quantity - quantity, 0)
                    product.sold_count = product.sold_count + quantity

        self.db.commit()

    def update(self, order: Order, data: dict) -> Order:
        for key, value in data.items():
            if value is not None:
                setattr(order, key, value)
        self.db.commit()
        self.db.refresh(order)
        return order

    def add_status_history(self, order_id: UUID, status: str, note: Optional[str] = None, created_by: Optional[UUID] = None) -> OrderStatusHistory:
        history = OrderStatusHistory(
            order_id=order_id,
            status=status,
            note=note,
            created_by=created_by,
        )
        self.db.add(history)
        self.db.flush()
        return history

    def get_stats(self) -> dict:
        total = self.db.query(Order).count()
        pending = self.db.query(Order).filter(Order.status == "pending").count()
        processing = self.db.query(Order).filter(Order.status == "processing").count()
        shipped = self.db.query(Order).filter(Order.status == "shipped").count()
        delivered = self.db.query(Order).filter(Order.status == "delivered").count()
        cancelled = self.db.query(Order).filter(Order.status == "cancelled").count()
        refunded = self.db.query(Order).filter(Order.status == "refunded").count()

        total_revenue = self.db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.status.in_(["processing", "shipped", "delivered"]),
        ).scalar()
        total_refunds = self.db.query(func.coalesce(func.sum(Order.refund_amount), 0)).scalar()

        return {
            "total": total,
            "pending": pending,
            "processing": processing,
            "shipped": shipped,
            "delivered": delivered,
            "cancelled": cancelled,
            "refunded": refunded,
            "total_revenue": float(total_revenue),
            "total_refunds": float(total_refunds),
        }

    def cancel_order(self, order: Order, reason: str) -> Order:
        order.status = "cancelled"
        order.admin_notes = (order.admin_notes or "") + f"\nCancellation reason: {reason}"
        self.db.flush()
        return order

    def create_return_request(
        self, order_id: UUID, user_id: UUID, reason: str, description: str, order_item_id: Optional[UUID] = None
    ) -> ReturnRequest:
        request = ReturnRequest(
            order_id=order_id,
            user_id=user_id,
            reason=reason,
            description=description,
            status="pending",
        )
        self.db.add(request)
        self.db.flush()
        self.db.refresh(request)
        return request

    def create_exchange_request(
        self, order_id: UUID, user_id: UUID, order_item_id: UUID, reason: str, description: str
    ) -> ExchangeRequest:
        request = ExchangeRequest(
            order_id=order_id,
            user_id=user_id,
            order_item_id=order_item_id,
            reason=reason,
            description=description,
            status="pending",
        )
        self.db.add(request)
        self.db.flush()
        self.db.refresh(request)
        return request

    def get_return_requests_by_order(self, order_id: UUID) -> list[ReturnRequest]:
        return self.db.query(ReturnRequest).filter(ReturnRequest.order_id == order_id).all()

    def get_exchange_requests_by_order(self, order_id: UUID) -> list[ExchangeRequest]:
        return self.db.query(ExchangeRequest).filter(ExchangeRequest.order_id == order_id).all()


class ShippingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_methods(self) -> list[ShippingMethod]:
        return (
            self.db.query(ShippingMethod)
            .filter(ShippingMethod.is_active)
            .order_by(ShippingMethod.sort_order, ShippingMethod.name)
            .all()
        )

    def get_method_by_id(self, method_id: UUID) -> Optional[ShippingMethod]:
        return self.db.query(ShippingMethod).filter(ShippingMethod.id == method_id).first()

    def get_zone_for_address(self, country: str, state: Optional[str] = None, postal_code: Optional[str] = None) -> Optional[ShippingZone]:
        zones = (
            self.db.query(ShippingZone)
            .filter(ShippingZone.is_active)
            .order_by(ShippingZone.sort_order)
            .all()
        )
        for zone in zones:
            countries = [c.strip().lower() for c in zone.countries.split(",")]
            if country.lower() not in countries:
                continue
            if zone.states:
                states = [s.strip().lower() for s in zone.states.split(",")]
                if state and state.lower() not in states:
                    continue
            if zone.postal_codes:
                codes = [c.strip() for c in zone.postal_codes.split(",")]
                if postal_code and postal_code not in codes:
                    continue
            return zone
        return None

    def get_rates_for_zone(self, zone_id: UUID) -> list[ShippingRate]:
        return (
            self.db.query(ShippingRate)
            .filter(ShippingRate.zone_id == zone_id, ShippingRate.is_active)
            .all()
        )

    def get_rate_for_zone_and_method(self, zone_id: UUID, method_id: UUID) -> Optional[ShippingRate]:
        return (
            self.db.query(ShippingRate)
            .filter(
                ShippingRate.zone_id == zone_id,
                ShippingRate.method_id == method_id,
                ShippingRate.is_active,
            )
            .first()
        )

    def get_active_pickup_locations(self) -> list[PickupLocation]:
        return (
            self.db.query(PickupLocation)
            .filter(PickupLocation.is_active)
            .order_by(PickupLocation.name)
            .all()
        )

    def get_pickup_location_by_id(self, location_id: UUID) -> Optional[PickupLocation]:
        return self.db.query(PickupLocation).filter(PickupLocation.id == location_id).first()

    def get_delivery_tracking(self, order_id: UUID) -> Optional[DeliveryTracking]:
        return (
            self.db.query(DeliveryTracking)
            .filter(DeliveryTracking.order_id == order_id)
            .first()
        )

    def create_delivery_tracking(self, order_id: UUID, tracking_number: Optional[str] = None, carrier: Optional[str] = None, estimated_delivery=None) -> DeliveryTracking:
        tracking = DeliveryTracking(
            order_id=order_id,
            tracking_number=tracking_number,
            carrier=carrier,
            status="pending",
            estimated_delivery=estimated_delivery,
        )
        self.db.add(tracking)
        self.db.flush()
        self.db.refresh(tracking)
        return tracking

    def add_tracking_event(self, tracking_id: UUID, status: str, description: Optional[str] = None, location: Optional[str] = None, event_time=None) -> TrackingEvent:
        event = TrackingEvent(
            tracking_id=tracking_id,
            status=status,
            description=description,
            location=location,
            event_time=event_time or datetime.now(timezone.utc),
        )
        self.db.add(event)
        self.db.flush()
        self.db.refresh(event)
        return event

    def get_tracking_events(self, tracking_id: UUID) -> list[TrackingEvent]:
        return (
            self.db.query(TrackingEvent)
            .filter(TrackingEvent.tracking_id == tracking_id)
            .order_by(TrackingEvent.event_time.desc())
            .all()
        )
