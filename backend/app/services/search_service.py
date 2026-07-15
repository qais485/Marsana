from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.catalog_repository import SearchRepository


def _serialize_suggestion(item: dict) -> dict:
    return {
        "type": item["type"],
        "id": str(item["id"]),
        "name": item["name"],
        "slug": item.get("slug"),
        "image_url": item.get("image_url"),
    }


def _serialize_popular_search(search) -> dict:
    return {
        "id": str(search.id),
        "query": search.query,
        "count": search.count,
    }


def _serialize_history_item(item) -> dict:
    return {
        "id": str(item.id),
        "query": item.query,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def _serialize_product(product) -> dict:
    first_image = product.images.split(",")[0].strip() if product.images else None
    return {
        "type": "product",
        "id": str(product.id),
        "name": product.name,
        "slug": product.slug,
        "description": product.short_description or product.description,
        "image_url": first_image,
        "price": float(product.discount_price or product.price),
        "rating": float(product.rating) if product.rating is not None else 0.0,
        "review_count": product.review_count,
    }


def _serialize_category(category) -> dict:
    return {
        "type": "category",
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
    }


class SearchService:
    def __init__(self, db: Session):
        self.search_repo = SearchRepository(db)

    def get_suggestions(self, query: str) -> list[dict]:
        if not query or not query.strip():
            return []
        results = self.search_repo.get_suggestions(query.strip(), limit=10)
        return [_serialize_suggestion(item) for item in results]

    def search(
        self, query: str, page: int = 1, limit: int = 20, user_id: UUID = None
    ) -> dict:
        if not query or not query.strip():
            return {"results": [], "pagination": _pagination_meta(0, page, limit)}

        clean_query = query.strip()

        products, total = self.search_repo.search_products(clean_query, page, limit)
        results = [_serialize_product(p) for p in products]

        if total == 0:
            categories = self.search_repo.search_categories(clean_query, limit=5)
            results = [_serialize_category(c) for c in categories]
            total = len(results)
            page = 1

        if user_id:
            self.search_repo.add_to_history(user_id, clean_query)

        self.search_repo.add_popular_search(clean_query)

        return {
            "results": results,
            "pagination": _pagination_meta(total, page, limit),
        }

    def get_popular_searches(self, limit: int = 10) -> list[dict]:
        searches = self.search_repo.get_popular_searches(limit)
        return [_serialize_popular_search(s) for s in searches]

    def get_history(self, user_id: UUID, limit: int = 20) -> list[dict]:
        items = self.search_repo.get_user_history(user_id, limit)
        return [_serialize_history_item(item) for item in items]

    def add_to_history(self, user_id: UUID, query: str) -> None:
        if not query or not query.strip():
            return
        self.search_repo.add_to_history(user_id, query.strip())

    def remove_from_history(self, user_id: UUID, history_id: UUID) -> bool:
        return self.search_repo.remove_from_history(user_id, history_id)

    def clear_history(self, user_id: UUID) -> int:
        return self.search_repo.clear_history(user_id)


def _pagination_meta(total: int, page: int, limit: int) -> dict:
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }
