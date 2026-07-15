from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import Product, ProductReview
from app.repositories.catalog_repository import (
    ProductAttributeRepository,
    ProductImageRepository,
    ProductRepository,
    ProductReviewRepository,
    ProductSpecificationRepository,
    ProductTagRepository,
    ProductVariantRepository,
)


class ProductCatalogService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.image_repo = ProductImageRepository(db)
        self.variant_repo = ProductVariantRepository(db)
        self.attribute_repo = ProductAttributeRepository(db)
        self.specification_repo = ProductSpecificationRepository(db)
        self.tag_repo = ProductTagRepository(db)
        self.review_repo = ProductReviewRepository(db)

    def get_product_detail(self, slug: str) -> Optional[dict]:
        product = self.product_repo.get_by_slug(slug)
        if not product:
            return None

        images = self.image_repo.get_by_product(product.id)
        variants = self.variant_repo.get_by_product(product.id)
        attributes = self.attribute_repo.get_by_product(product.id)
        specifications = self.specification_repo.get_by_product(product.id)
        tags = self.tag_repo.get_by_product(product.id)
        reviews, review_count = self.review_repo.get_by_product(
            product.id, page=1, limit=5
        )
        rating_summary = self.review_repo.get_rating_summary(product.id)

        related_products = self._get_related_products(
            product.category_id, product.id, limit=4
        )
        similar_products = self._get_similar_products(
            product.brand_id, product.id, limit=4
        )

        return {
            "product": _serialize_product_detail(product),
            "images": [_serialize_image(img) for img in images],
            "variants": [_serialize_variant(v) for v in variants],
            "attributes": [_serialize_attribute(a) for a in attributes],
            "specifications": _serialize_specifications(specifications),
            "tags": [_serialize_tag(t) for t in tags],
            "reviews": [_serialize_review(r) for r in reviews],
            "rating_summary": rating_summary,
            "related_products": [_serialize_product_card(p) for p in related_products],
            "similar_products": [_serialize_product_card(p) for p in similar_products],
        }

    def get_product_by_id(self, product_id: UUID) -> Optional[dict]:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            return None

        images = self.image_repo.get_by_product(product.id)
        variants = self.variant_repo.get_by_product(product.id)
        attributes = self.attribute_repo.get_by_product(product.id)
        specifications = self.specification_repo.get_by_product(product.id)
        tags = self.tag_repo.get_by_product(product.id)

        return {
            "product": _serialize_product_detail(product),
            "images": [_serialize_image(img) for img in images],
            "variants": [_serialize_variant(v) for v in variants],
            "attributes": [_serialize_attribute(a) for a in attributes],
            "specifications": _serialize_specifications(specifications),
            "tags": [_serialize_tag(t) for t in tags],
        }

    def get_product_reviews(
        self, product_id: UUID, page: int = 1, limit: int = 10
    ) -> dict:
        reviews, total = self.review_repo.get_by_product(
            product_id, page=page, limit=limit
        )
        rating_summary = self.review_repo.get_rating_summary(product_id)
        return {
            "reviews": [_serialize_review(r) for r in reviews],
            "rating_summary": rating_summary,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def create_review(
        self,
        product_id: UUID,
        user_id: UUID,
        rating: int,
        title: Optional[str] = None,
        content: Optional[str] = None,
    ) -> dict:
        existing = self.review_repo.get_by_user_and_product(user_id, product_id)
        if existing:
            raise ValueError("You have already reviewed this product")

        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        review = ProductReview(
            product_id=product_id,
            user_id=user_id,
            rating=rating,
            title=title,
            content=content,
        )
        created_review = self.review_repo.create(review)

        rating_summary = self.review_repo.get_rating_summary(product_id)
        product.rating = rating_summary["average"]
        product.review_count = rating_summary["total"]
        self.review_repo.db.commit()

        return _serialize_review(created_review)

    def toggle_review_helpful(
        self, product_id: UUID, review_id: UUID, user_id: UUID
    ) -> dict:
        review = self.review_repo.get_by_id(review_id)
        if not review or review.product_id != product_id:
            raise ValueError("Review not found")
        helpful_count, is_helpful = self.review_repo.toggle_helpful(
            review_id, user_id
        )
        return {"helpful_count": helpful_count, "is_helpful": is_helpful}

    def report_review(
        self,
        product_id: UUID,
        review_id: UUID,
        user_id: UUID,
        reason: str,
        description: str = None,
    ) -> dict:
        review = self.review_repo.get_by_id(review_id)
        if not review or review.product_id != product_id:
            raise ValueError("Review not found")
        if review.user_id == user_id:
            raise ValueError("You cannot report your own review")
        if self.review_repo.has_user_reported(review_id, user_id):
            raise ValueError("You have already reported this review")
        self.review_repo.create_report(
            review_id=review_id,
            user_id=user_id,
            reason=reason,
            description=description,
        )
        return {"message": "Review reported successfully"}

    def get_related_products(
        self, product_id: UUID, limit: int = 4
    ) -> list[dict]:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            return []
        related = self._get_related_products(
            product.category_id, product.id, limit=limit
        )
        return [_serialize_product_card(p) for p in related]

    def get_similar_products(
        self, product_id: UUID, limit: int = 4
    ) -> list[dict]:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            return []
        similar = self._get_similar_products(
            product.brand_id, product.id, limit=limit
        )
        return [_serialize_product_card(p) for p in similar]

    def _get_related_products(
        self,
        category_id: Optional[UUID],
        exclude_product_id: UUID,
        limit: int = 4,
    ) -> list[Product]:
        if not category_id:
            return self.product_repo.get_featured(limit=limit)
        from sqlalchemy import or_

        query = (
            self.db.query(Product)
            .filter(
                Product.is_active,
                Product.id != exclude_product_id,
                or_(
                    Product.category_id == category_id,
                    Product.is_featured,
                ),
            )
            .order_by(Product.rating.desc(), Product.review_count.desc())
            .limit(limit)
        )
        return query.all()

    def _get_similar_products(
        self,
        brand_id: Optional[UUID],
        exclude_product_id: UUID,
        limit: int = 4,
    ) -> list[Product]:
        if not brand_id:
            return self.product_repo.get_recommended(limit=limit)
        from sqlalchemy import or_

        query = (
            self.db.query(Product)
            .filter(
                Product.is_active,
                Product.id != exclude_product_id,
                or_(
                    Product.brand_id == brand_id,
                    Product.rating >= 4.0,
                ),
            )
            .order_by(Product.rating.desc(), Product.sold_count.desc())
            .limit(limit)
        )
        return query.all()


# ─── Serialization Helpers ───────────────────────────────────────


def _serialize_product_detail(product: Product) -> dict:
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
        "category_name": product.category.name if product.category else None,
        "brand_id": str(product.brand_id) if product.brand_id else None,
        "brand_name": product.brand.name if product.brand else None,
        "stock_quantity": product.stock_quantity,
        "sku": product.sku,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "is_new_arrival": product.is_new_arrival,
        "is_best_seller": product.is_best_seller,
        "rating": float(product.rating) if product.rating is not None else 0.0,
        "review_count": product.review_count,
        "sold_count": product.sold_count,
        "video_url": getattr(product, "video_url", None),
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None,
    }


def _serialize_product_card(product: Product) -> dict:
    return {
        "id": str(product.id),
        "name": product.name,
        "slug": product.slug,
        "short_description": product.short_description,
        "price": float(product.price),
        "discount_price": float(product.discount_price)
        if product.discount_price
        else None,
        "images": product.images,
        "rating": float(product.rating) if product.rating is not None else 0.0,
        "review_count": product.review_count,
        "is_new_arrival": product.is_new_arrival,
        "is_best_seller": product.is_best_seller,
    }


def _serialize_image(image) -> dict:
    return {
        "id": str(image.id),
        "product_id": str(image.product_id),
        "url": image.url,
        "alt_text": image.alt_text,
        "sort_order": image.sort_order,
        "is_primary": image.is_primary,
    }


def _serialize_variant(variant) -> dict:
    return {
        "id": str(variant.id),
        "product_id": str(variant.product_id),
        "name": variant.name,
        "sku": variant.sku,
        "price": float(variant.price),
        "discount_price": float(variant.discount_price)
        if variant.discount_price
        else None,
        "stock_quantity": variant.stock_quantity,
        "option_values": variant.option_values,
        "is_active": variant.is_active,
    }


def _serialize_attribute(attribute) -> dict:
    return {
        "id": str(attribute.id),
        "product_id": str(attribute.product_id),
        "attribute_name": attribute.attribute_name,
        "attribute_value": attribute.attribute_value,
        "sort_order": attribute.sort_order,
    }


def _serialize_specifications(specifications) -> dict:
    grouped = {}
    for spec in specifications:
        section = spec.section_name
        if section not in grouped:
            grouped[section] = []
        grouped[section].append(
            {
                "name": spec.spec_name,
                "value": spec.spec_value,
            }
        )
    return grouped


def _serialize_tag(tag) -> dict:
    return {
        "id": str(tag.id),
        "name": tag.name,
        "slug": tag.slug,
    }


def _serialize_review(review) -> dict:
    user_name = None
    user_avatar = None
    if review.user:
        user_name = f"{review.user.first_name} {review.user.last_name}"
        if review.user.profile:
            user_avatar = review.user.profile.avatar_url

    return {
        "id": str(review.id),
        "product_id": str(review.product_id),
        "user_id": str(review.user_id),
        "user_name": user_name,
        "user_avatar": user_avatar,
        "rating": review.rating,
        "title": review.title,
        "content": review.content,
        "is_verified_purchase": review.is_verified_purchase,
        "is_approved": review.is_approved,
        "helpful_count": review.helpful_count,
        "created_at": review.created_at.isoformat() if review.created_at else None,
        "updated_at": review.updated_at.isoformat() if review.updated_at else None,
    }
