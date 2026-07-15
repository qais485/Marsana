from typing import Optional

from sqlalchemy.orm import Session

from app.models.database_models import Category
from app.repositories.catalog_repository import CategoryRepository


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.category_repo = CategoryRepository(db)

    def get_categories_tree(self) -> list[dict]:
        root_categories = self.category_repo.get_root_categories()
        return [_serialize_category_tree(cat) for cat in root_categories]

    def get_all_categories(self) -> list[dict]:
        categories = self.category_repo.get_all_active()
        return [_serialize_category(cat) for cat in categories]

    def get_category_by_slug(self, slug: str) -> Optional[dict]:
        category = self.category_repo.get_by_slug(slug)
        if not category:
            return None

        children = self.category_repo.get_children(category.id)
        product_count = len(category.products) if category.products else 0

        return {
            "category": _serialize_category_detail(category),
            "children": [_serialize_category(child) for child in children],
            "product_count": product_count,
        }

    def get_category_children(self, slug: str) -> Optional[list[dict]]:
        category = self.category_repo.get_by_slug(slug)
        if not category:
            return None

        children = self.category_repo.get_children(category.id)
        return [_serialize_category(child) for child in children]

    def get_featured_categories(self, limit: int = 6) -> list[dict]:
        categories = self.category_repo.get_root_categories()
        featured = []
        for cat in categories[:limit]:
            product_count = len(cat.products) if cat.products else 0
            featured.append({
                "id": str(cat.id),
                "name": cat.name,
                "slug": cat.slug,
                "description": cat.description,
                "image_url": cat.image_url,
                "product_count": product_count,
            })
        return featured


# ─── Serialization Helpers ───────────────────────────────────────


def _serialize_category(category: Category) -> dict:
    children_data = []
    if category.children:
        children_data = [
            {
                "id": str(child.id),
                "name": child.name,
                "slug": child.slug,
                "image_url": child.image_url,
            }
            for child in category.children
            if child.is_active
        ]

    product_count = len(category.products) if category.products else 0

    return {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "parent_id": str(category.parent_id) if category.parent_id else None,
        "sort_order": category.sort_order,
        "product_count": product_count,
        "children": children_data,
    }


def _serialize_category_tree(category: Category) -> dict:
    children_data = []
    if category.children:
        children_data = [
            _serialize_category_tree(child)
            for child in category.children
            if child.is_active
        ]

    product_count = len(category.products) if category.products else 0

    return {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "product_count": product_count,
        "children": children_data,
    }


def _serialize_category_detail(category: Category) -> dict:
    parent_data = None
    if category.parent:
        parent_data = {
            "id": str(category.parent.id),
            "name": category.parent.name,
            "slug": category.parent.slug,
        }

    return {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "parent_id": str(category.parent_id) if category.parent_id else None,
        "parent": parent_data,
        "is_active": category.is_active,
        "sort_order": category.sort_order,
        "created_at": category.created_at.isoformat() if category.created_at else None,
        "updated_at": category.updated_at.isoformat() if category.updated_at else None,
    }
