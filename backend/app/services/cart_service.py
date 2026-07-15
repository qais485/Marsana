from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import TAX_RATE, FREE_SHIPPING_THRESHOLD
from app.models.database_models import CartItem, GiftCard, Product, ProductVariant, SavedForLater
from app.repositories.cart_repository import (
    CartItemRepository,
    CartRepository,
    SavedForLaterRepository,
)

SHIPPING_METHODS = {
    "standard": {"name": "Standard Shipping", "cost": Decimal("5.99"), "days": "5-7"},
    "express": {"name": "Express Shipping", "cost": Decimal("12.99"), "days": "2-3"},
    "overnight": {"name": "Overnight Shipping", "cost": Decimal("24.99"), "days": "1"},
}


class CartService:
    def __init__(self, db: Session):
        self.db = db
        self.cart_repo = CartRepository(db)
        self.cart_item_repo = CartItemRepository(db)
        self.saved_repo = SavedForLaterRepository(db)

    def get_cart(self, user_id: UUID) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        items = self.cart_item_repo.get_by_cart(cart.id)
        saved_items = self.saved_repo.get_by_user(user_id)

        serialized_items = [self._serialize_cart_item(item) for item in items]
        serialized_saved = [self._serialize_saved_item(item) for item in saved_items]
        summary = self._calculate_summary(cart, items)

        return {
            "id": str(cart.id),
            "items": serialized_items,
            "summary": summary,
            "saved_items": serialized_saved,
            "created_at": cart.created_at.isoformat(),
            "updated_at": cart.updated_at.isoformat(),
        }

    def add_to_cart(
        self,
        user_id: UUID,
        product_id: UUID,
        quantity: int = 1,
        variant_id: Optional[UUID] = None,
    ) -> dict:
        cart = self.cart_repo.get_or_create(user_id)

        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product or product.deleted_at is not None or not product.is_active:
            raise ValueError("Product not found")

        stock_quantity = product.stock_quantity
        price = product.discount_price if product.discount_price else product.price
        product_name = product.name
        product_image = product.images.split(",")[0] if product.images else None
        product_sku = product.sku

        if variant_id:
            variant = (
                self.db.query(ProductVariant)
                .filter(
                    ProductVariant.id == variant_id,
                    ProductVariant.product_id == product_id,
                )
                .first()
            )
            if not variant or not variant.is_active:
                raise ValueError("Product variant not found")

            stock_quantity = variant.stock_quantity
            price = variant.discount_price if variant.discount_price else variant.price
            product_name = f"{product.name} - {variant.name}"
            product_sku = variant.sku

        if stock_quantity <= 0:
            raise ValueError("Product is out of stock")

        existing_item = self.cart_item_repo.get_by_cart_and_product(
            cart.id, product_id, variant_id
        )

        if existing_item:
            new_quantity = existing_item.quantity + quantity
            if new_quantity > stock_quantity:
                raise ValueError(
                    f"Only {stock_quantity} items available in stock"
                )
            existing_item.quantity = new_quantity
            self.cart_item_repo.update(existing_item)
        else:
            if quantity > stock_quantity:
                raise ValueError(
                    f"Only {stock_quantity} items available in stock"
                )

            item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                variant_id=variant_id,
                quantity=quantity,
                product_name=product_name,
                product_price=price,
                product_image=product_image,
                product_sku=product_sku,
            )
            self.cart_item_repo.create(item)

        return self.get_cart(user_id)

    def update_quantity(
        self, user_id: UUID, item_id: UUID, quantity: int
    ) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        item = self.cart_item_repo.get_by_id(item_id, cart.id)
        if not item:
            raise ValueError("Cart item not found")

        stock_quantity = self._get_stock(item.product_id, item.variant_id)
        if quantity > stock_quantity:
            raise ValueError(f"Only {stock_quantity} items available in stock")

        if quantity <= 0:
            self.cart_item_repo.delete(item)
        else:
            item.quantity = quantity
            self.cart_item_repo.update(item)

        return self.get_cart(user_id)

    def remove_from_cart(self, user_id: UUID, item_id: UUID) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        item = self.cart_item_repo.get_by_id(item_id, cart.id)
        if not item:
            raise ValueError("Cart item not found")

        self.cart_item_repo.delete(item)
        return self.get_cart(user_id)

    def clear_cart(self, user_id: UUID) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        self.cart_item_repo.delete_all_by_cart(cart.id)
        return self.get_cart(user_id)

    def apply_coupon(self, user_id: UUID, coupon_code: str) -> dict:
        cart = self.cart_repo.get_or_create(user_id)

        from app.services.promotion_service import CouponService
        coupon_service = CouponService(self.db)
        subtotal = float(sum(
            Decimal(str(item.product_price)) * item.quantity
            for item in self.cart_item_repo.get_by_cart(cart.id)
        ))
        result = coupon_service.validate_coupon(coupon_code, subtotal)
        if not result["valid"]:
            raise ValueError(result["message"])

        cart.coupon_code = coupon_code.upper()
        self.cart_repo.update(cart)
        return self.get_cart(user_id)

    def remove_coupon(self, user_id: UUID) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        cart.coupon_code = None
        self.cart_repo.update(cart)
        return self.get_cart(user_id)

    def apply_gift_card(self, user_id: UUID, gift_card_code: str) -> dict:
        cart = self.cart_repo.get_or_create(user_id)

        upper_code = gift_card_code.upper()
        gift_card = self.db.query(GiftCard).filter(
            GiftCard.code == upper_code,
            GiftCard.is_active.is_(True),
        ).first()

        if not gift_card:
            raise ValueError("Invalid gift card code")

        from datetime import datetime, timezone
        if gift_card.expires_at and gift_card.expires_at < datetime.now(timezone.utc):
            raise ValueError("Gift card has expired")

        if gift_card.remaining_amount <= 0:
            raise ValueError("Gift card has no remaining balance")

        cart.gift_card_code = upper_code
        self.cart_repo.update(cart)
        return self.get_cart(user_id)

    def remove_gift_card(self, user_id: UUID) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        cart.gift_card_code = None
        self.cart_repo.update(cart)
        return self.get_cart(user_id)

    def set_shipping_method(self, user_id: UUID, shipping_method: str) -> dict:
        cart = self.cart_repo.get_or_create(user_id)

        if shipping_method not in SHIPPING_METHODS:
            raise ValueError("Invalid shipping method")

        cart.shipping_method = shipping_method
        self.cart_repo.update(cart)
        return self.get_cart(user_id)

    def get_shipping_methods(self) -> list[dict]:
        return [
            {
                "id": key,
                "name": method["name"],
                "cost": float(method["cost"]),
                "estimated_days": method["days"],
            }
            for key, method in SHIPPING_METHODS.items()
        ]

    def save_for_later(self, user_id: UUID, item_id: UUID) -> dict:
        cart = self.cart_repo.get_or_create(user_id)
        item = self.cart_item_repo.get_by_id(item_id, cart.id)
        if not item:
            raise ValueError("Cart item not found")

        existing_saved = self.saved_repo.get_by_product(
            user_id, item.product_id, item.variant_id
        )
        if existing_saved:
            self.cart_item_repo.delete(item)
            return self.get_cart(user_id)

        saved_item = SavedForLater(
            user_id=user_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            product_name=item.product_name,
            product_price=item.product_price,
            product_image=item.product_image,
            product_sku=item.product_sku,
        )
        self.saved_repo.create(saved_item)
        self.cart_item_repo.delete(item)
        return self.get_cart(user_id)

    def move_to_cart(self, user_id: UUID, saved_item_id: UUID) -> dict:
        saved_item = self.saved_repo.get_by_id(saved_item_id, user_id)
        if not saved_item:
            raise ValueError("Saved item not found")

        stock_quantity = self._get_stock(
            saved_item.product_id, saved_item.variant_id
        )
        if stock_quantity <= 0:
            raise ValueError("Product is out of stock")

        self.add_to_cart(
            user_id=user_id,
            product_id=saved_item.product_id,
            quantity=1,
            variant_id=saved_item.variant_id,
        )
        self.saved_repo.delete(saved_item)
        return self.get_cart(user_id)

    def remove_saved_item(self, user_id: UUID, saved_item_id: UUID) -> dict:
        saved_item = self.saved_repo.get_by_id(saved_item_id, user_id)
        if not saved_item:
            raise ValueError("Saved item not found")

        self.saved_repo.delete(saved_item)
        return self.get_cart(user_id)

    def _get_stock(self, product_id: UUID, variant_id: Optional[UUID] = None) -> int:
        if variant_id:
            variant = (
                self.db.query(ProductVariant)
                .filter(ProductVariant.id == variant_id)
                .first()
            )
            if variant:
                return variant.stock_quantity
        product = self.db.query(Product).filter(Product.id == product_id).first()
        return product.stock_quantity if product else 0

    def _calculate_summary(self, cart, items: list[CartItem]) -> dict:
        subtotal = sum(
            Decimal(str(item.product_price)) * item.quantity for item in items
        )

        discount_amount = Decimal("0.00")
        if cart.coupon_code:
            from app.services.promotion_service import CouponService
            coupon_service = CouponService(self.db)
            try:
                result = coupon_service.apply_coupon(
                    cart.coupon_code, float(subtotal)
                )
                discount_amount = Decimal(str(result["discount_amount"]))
            except ValueError:
                pass

        gift_card_amount = Decimal("0.00")
        if cart.gift_card_code:
            gift_card = self.db.query(GiftCard).filter(
                GiftCard.code == cart.gift_card_code,
                GiftCard.is_active.is_(True),
            ).first()
            if gift_card and gift_card.remaining_amount > 0:
                gift_card_amount = min(gift_card.remaining_amount, after_discount + estimated_tax + Decimal("0.01"))

        after_discount = max(subtotal - discount_amount, Decimal("0.00"))

        estimated_tax = (after_discount * TAX_RATE).quantize(Decimal("0.01"))

        shipping_cost = Decimal("0.00")
        if after_discount < FREE_SHIPPING_THRESHOLD:
            method = cart.shipping_method or "standard"
            if method in SHIPPING_METHODS:
                shipping_cost = SHIPPING_METHODS[method]["cost"]

        total = max(after_discount + estimated_tax + shipping_cost - gift_card_amount, Decimal("0.00"))

        item_count = sum(item.quantity for item in items)

        return {
            "subtotal": float(subtotal),
            "discount_amount": float(discount_amount),
            "estimated_tax": float(estimated_tax),
            "estimated_shipping": float(shipping_cost),
            "gift_card_amount": float(gift_card_amount),
            "total": float(total),
            "coupon_code": cart.coupon_code,
            "gift_card_code": cart.gift_card_code,
            "shipping_method": cart.shipping_method or "standard",
            "item_count": item_count,
        }

    def _serialize_cart_item(self, item: CartItem) -> dict:
        product = self.db.query(Product).filter(Product.id == item.product_id).first()
        in_stock = False
        max_qty = 99
        if product:
            if item.variant_id:
                variant = (
                    self.db.query(ProductVariant)
                    .filter(ProductVariant.id == item.variant_id)
                    .first()
                )
                if variant:
                    in_stock = variant.stock_quantity > 0
                    max_qty = min(variant.stock_quantity, 99)
            else:
                in_stock = product.stock_quantity > 0
                max_qty = min(product.stock_quantity, 99)

        return {
            "id": str(item.id),
            "product_id": str(item.product_id),
            "variant_id": str(item.variant_id) if item.variant_id else None,
            "quantity": item.quantity,
            "product_name": item.product_name,
            "product_price": float(item.product_price),
            "product_image": item.product_image,
            "product_sku": item.product_sku,
            "product_in_stock": in_stock,
            "product_max_quantity": max_qty,
            "created_at": item.created_at.isoformat(),
        }

    def _serialize_saved_item(self, item: SavedForLater) -> dict:
        return {
            "id": str(item.id),
            "product_id": str(item.product_id),
            "variant_id": str(item.variant_id) if item.variant_id else None,
            "product_name": item.product_name,
            "product_price": float(item.product_price),
            "product_image": item.product_image,
            "product_sku": item.product_sku,
            "created_at": item.created_at.isoformat(),
        }
