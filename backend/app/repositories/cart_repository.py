from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import Cart, CartItem, SavedForLater


class CartRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> Optional[Cart]:
        return self.db.query(Cart).filter(Cart.user_id == user_id).first()

    def get_or_create(self, user_id: UUID) -> Cart:
        cart = self.get_by_user(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)
        return cart

    def update(self, cart: Cart) -> Cart:
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def delete(self, cart: Cart) -> None:
        self.db.delete(cart)
        self.db.commit()


class CartItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_cart(self, cart_id: UUID) -> list[CartItem]:
        return (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart_id)
            .order_by(CartItem.created_at.desc())
            .all()
        )

    def get_by_cart_and_product(
        self, cart_id: UUID, product_id: UUID, variant_id: Optional[UUID] = None
    ) -> Optional[CartItem]:
        query = self.db.query(CartItem).filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
        if variant_id:
            query = query.filter(CartItem.variant_id == variant_id)
        else:
            query = query.filter(CartItem.variant_id.is_(None))
        return query.first()

    def get_by_id(self, item_id: UUID, cart_id: UUID) -> Optional[CartItem]:
        return (
            self.db.query(CartItem)
            .filter(CartItem.id == item_id, CartItem.cart_id == cart_id)
            .first()
        )

    def create(self, item: CartItem) -> CartItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: CartItem) -> CartItem:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: CartItem) -> None:
        self.db.delete(item)
        self.db.commit()

    def delete_all_by_cart(self, cart_id: UUID) -> None:
        # NOTE: Bulk delete via .delete() bypasses ORM cascade events and
        # Python-level __init__ hooks. If cascading side-effects are needed,
        # iterate and use db.delete() per row instead.
        self.db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        self.db.commit()

    def count_items(self, cart_id: UUID) -> int:
        result = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart_id)
            .with_entities(CartItem.quantity)
            .all()
        )
        return sum(r[0] for r in result)


class SavedForLaterRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> list[SavedForLater]:
        return (
            self.db.query(SavedForLater)
            .filter(SavedForLater.user_id == user_id)
            .order_by(SavedForLater.created_at.desc())
            .all()
        )

    def get_by_product(
        self, user_id: UUID, product_id: UUID, variant_id: Optional[UUID] = None
    ) -> Optional[SavedForLater]:
        query = self.db.query(SavedForLater).filter(
            SavedForLater.user_id == user_id,
            SavedForLater.product_id == product_id,
        )
        if variant_id:
            query = query.filter(SavedForLater.variant_id == variant_id)
        else:
            query = query.filter(SavedForLater.variant_id.is_(None))
        return query.first()

    def get_by_id(self, item_id: UUID, user_id: UUID) -> Optional[SavedForLater]:
        return (
            self.db.query(SavedForLater)
            .filter(SavedForLater.id == item_id, SavedForLater.user_id == user_id)
            .first()
        )

    def create(self, item: SavedForLater) -> SavedForLater:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: SavedForLater) -> None:
        self.db.delete(item)
        self.db.commit()

    def delete_all_by_user(self, user_id: UUID) -> None:
        self.db.query(SavedForLater).filter(SavedForLater.user_id == user_id).delete()
        self.db.commit()
