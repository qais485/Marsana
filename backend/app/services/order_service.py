import logging
import random
import string
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import TAX_RATE, FREE_SHIPPING_THRESHOLD, LOYALTY_POINTS_PER_DOLLAR
from app.models.database_models import Cart, CartItem, Order, OrderItem, Product, ProductVariant
from app.repositories.cart_repository import CartItemRepository, CartRepository
from app.repositories.catalog_repository import OrderRepository, ShippingRepository
from app.models.database_models import GiftCard
from app.repositories.promotion_repository import CouponRepository, LoyaltyRepository, ReferralRepository

logger = logging.getLogger(__name__)


def _lookup_gift_card_amount(db, gift_card_code: str) -> Decimal:
    if not gift_card_code:
        return Decimal("0.00")
    gift_card = db.query(GiftCard).filter(
        GiftCard.code == gift_card_code.upper(),
        GiftCard.is_active.is_(True),
    ).first()
    if not gift_card:
        return Decimal("0.00")
    if gift_card.expires_at and gift_card.expires_at < datetime.now(timezone.utc):
        return Decimal("0.00")
    return gift_card.remaining_amount


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.cart_repo = CartRepository(db)
        self.cart_item_repo = CartItemRepository(db)
        self.shipping_repo = ShippingRepository(db)
        self.coupon_repo = CouponRepository(db)
        self.loyalty_repo = LoyaltyRepository(db)
        self.referral_repo = ReferralRepository(db)
        self._notification_service = None

    @property
    def notification_service(self):
        if self._notification_service is None:
            from app.services.notification_service import NotificationService
            self._notification_service = NotificationService(self.db)
        return self._notification_service

    def _validate_coupon(self, coupon_code: str, subtotal: Decimal, user_id: UUID = None) -> tuple[Decimal, str]:
        coupon = self.coupon_repo.get_by_code(coupon_code)
        if not coupon:
            raise ValueError("Invalid coupon code")

        now = datetime.now(timezone.utc)
        if coupon.start_date and now < coupon.start_date.replace(tzinfo=timezone.utc):
            raise ValueError("Coupon is not yet active")
        if coupon.end_date and now > coupon.end_date.replace(tzinfo=timezone.utc):
            raise ValueError("Coupon has expired")
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise ValueError("Coupon usage limit reached")
        if coupon.min_order_amount and subtotal < Decimal(str(coupon.min_order_amount)):
            raise ValueError(f"Minimum order amount of ${coupon.min_order_amount} required")
        if coupon.per_user_limit and user_id:
            user_usage = self.coupon_repo.get_user_usage_count(coupon.id, user_id)
            if user_usage >= coupon.per_user_limit:
                raise ValueError("You have exceeded the usage limit for this coupon")

        if coupon.discount_type == "percentage":
            discount = (subtotal * Decimal(str(coupon.discount_value)) / Decimal("100")).quantize(Decimal("0.01"))
            discount = min(discount, subtotal)
        else:
            discount = min(Decimal(str(coupon.discount_value)), subtotal)

        return discount, coupon.code

    def _get_shipping_cost(self, shipping_method: str, discounted_subtotal: Decimal) -> Decimal:
        if discounted_subtotal >= FREE_SHIPPING_THRESHOLD:
            return Decimal("0.00")

        fallback_costs = {
            "standard": Decimal("5.99"),
            "express": Decimal("12.99"),
            "overnight": Decimal("24.99"),
            "pickup": Decimal("0.00"),
        }
        return fallback_costs.get(shipping_method, Decimal("5.99"))

    def place_order(
        self,
        user_id: UUID,
        email: str,
        shipping_address: dict,
        billing_address: Optional[dict],
        billing_same_as_shipping: bool,
        shipping_method: str,
        payment_method: str,
        payment_details: Optional[dict],
        notes: Optional[str],
        coupon_code: Optional[str],
        gift_card_code: Optional[str],
    ) -> dict:
        cart = self.cart_repo.get_by_user(user_id)
        if not cart:
            raise ValueError("Cart is empty")

        items = self.cart_item_repo.get_by_cart(cart.id)
        if not items:
            raise ValueError("Cart is empty")

        return self._create_order(
            user_id=user_id,
            email=email,
            cart=cart,
            items=items,
            shipping_address=shipping_address,
            billing_address=billing_address,
            billing_same_as_shipping=billing_same_as_shipping,
            shipping_method=shipping_method,
            payment_method=payment_method,
            notes=notes,
            coupon_code=coupon_code or cart.coupon_code,
            gift_card_code=gift_card_code or cart.gift_card_code,
        )

    def place_guest_order(
        self,
        email: str,
        shipping_address: dict,
        billing_address: Optional[dict],
        billing_same_as_shipping: bool,
        shipping_method: str,
        payment_method: str,
        payment_details: Optional[dict],
        notes: Optional[str],
        coupon_code: Optional[str],
        gift_card_code: Optional[str],
        cart_items_data: list[dict],
    ) -> dict:
        if not cart_items_data:
            raise ValueError("No items to checkout")

        validated_items = []
        for item_data in cart_items_data:
            product = self.db.query(Product).filter(
                Product.id == item_data["product_id"]
            ).first()
            if not product or product.deleted_at is not None or not product.is_active:
                raise ValueError(f"Product not found: {item_data['product_id']}")

            stock_quantity = product.stock_quantity
            price = float(product.discount_price if product.discount_price else product.price)
            product_name = product.name
            product_image = product.images.split(",")[0] if product.images else None
            product_sku = product.sku
            variant_id = item_data.get("variant_id")

            if variant_id:
                variant = self.db.query(ProductVariant).filter(
                    ProductVariant.id == variant_id
                ).first()
                if not variant or not variant.is_active:
                    raise ValueError(f"Variant not found: {variant_id}")
                stock_quantity = variant.stock_quantity
                price = float(variant.discount_price if variant.discount_price else variant.price)
                product_name = f"{product.name} - {variant.name}"
                product_sku = variant.sku

            quantity = item_data.get("quantity", 1)
            if quantity > stock_quantity:
                raise ValueError(f"Insufficient stock for {product_name}")

            validated_items.append({
                "product_id": product.id,
                "variant_id": variant_id,
                "quantity": quantity,
                "product_name": product_name,
                "product_price": Decimal(str(price)),
                "product_image": product_image,
                "product_sku": product_sku,
            })

        subtotal = sum(
            item["product_price"] * item["quantity"] for item in validated_items
        )

        discount_amount = Decimal("0.00")
        applied_coupon_code = None
        if coupon_code:
            discount_amount, applied_coupon_code = self._validate_coupon(coupon_code, subtotal)

        after_discount = max(subtotal - discount_amount, Decimal("0.00"))
        estimated_tax = (after_discount * TAX_RATE).quantize(Decimal("0.01"))
        shipping_cost = self._get_shipping_cost(shipping_method, after_discount)

        gift_card_amount = _lookup_gift_card_amount(self.db, gift_card_code)

        total = max(
            after_discount + estimated_tax + shipping_cost - gift_card_amount,
            Decimal("0.00"),
        )

        order_number = self._generate_order_number()

        billing = billing_address if not billing_same_as_shipping and billing_address else shipping_address

        payment_status = "paid" if payment_method in ("credit_card", "paypal") else "pending"

        order = Order(
            user_id=None,
            order_number=order_number,
            status="pending",
            payment_status=payment_status,
            payment_method=payment_method,
            subtotal=float(subtotal),
            tax_amount=float(estimated_tax),
            shipping_cost=float(shipping_cost),
            discount_amount=float(discount_amount),
            total_amount=float(total),
            shipping_name=f"{shipping_address['first_name']} {shipping_address['last_name']}",
            shipping_email=email,
            shipping_address=shipping_address.get("address_line_1", "")
            + (f", {shipping_address['address_line_2']}" if shipping_address.get("address_line_2") else ""),
            shipping_city=shipping_address["city"],
            shipping_state=shipping_address["state"],
            shipping_postal_code=shipping_address["postal_code"],
            shipping_country=shipping_address["country"],
            shipping_phone=shipping_address.get("phone_number"),
            billing_name=f"{billing['first_name']} {billing['last_name']}",
            billing_address=billing.get("address_line_1", "")
            + (f", {billing['address_line_2']}" if billing.get("address_line_2") else ""),
            billing_city=billing["city"],
            billing_state=billing["state"],
            billing_postal_code=billing["postal_code"],
            billing_country=billing["country"],
            notes=notes,
        )

        order_items = [
            {
                "product_id": item["product_id"],
                "variant_id": item.get("variant_id"),
                "product_name": item["product_name"],
                "product_sku": item["product_sku"],
                "product_image": item["product_image"],
                "quantity": item["quantity"],
                "unit_price": float(item["product_price"]),
                "total_price": float(item["product_price"] * item["quantity"]),
            }
            for item in validated_items
        ]

        self.order_repo.decrement_stock(
            [
                {
                    "product_id": item["product_id"],
                    "variant_id": item.get("variant_id"),
                    "quantity": item["quantity"],
                }
                for item in validated_items
            ]
        )

        created_order = self.order_repo.create_order(order, order_items)

        if applied_coupon_code:
            coupon = self.coupon_repo.get_by_code(applied_coupon_code)
            if coupon:
                self.coupon_repo.increment_usage(coupon)

        try:
            self.notification_service.dispatch("order_placed", {
                "order_number": order_number,
                "customer_name": f"{shipping_address.get('first_name', '')} {shipping_address.get('last_name', '')}".strip(),
                "total_amount": str(total),
                "item_count": str(len(order_items)),
                "user_id": order.user_id,
            }, user_id=order.user_id)
        except Exception as e:
            logger.warning("Failed to dispatch order_placed notification: %s", e)

        return self._serialize_order(created_order)

    def get_customer_orders(
        self, user_id: UUID, page: int = 1, limit: int = 20
    ) -> dict:
        orders, total = self.order_repo.get_by_user(user_id, page, limit)
        return {
            "orders": [self._serialize_order_summary(o) for o in orders],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_customer_order(self, user_id: UUID, order_id: UUID) -> dict:
        order = self.order_repo.get_user_order(user_id, order_id)
        if not order:
            raise ValueError("Order not found")
        return self._serialize_order(order)

    def track_order(self, email: str, order_number: str) -> dict:
        order = self.order_repo.get_by_order_number(order_number)
        if not order:
            raise ValueError("Order not found")

        if order.shipping_email and order.shipping_email.lower() != email.lower():
            raise ValueError("Order not found")

        return self._serialize_order_summary(order)

    def _create_order(
        self,
        user_id: UUID,
        email: str,
        cart: Cart,
        items: list[CartItem],
        shipping_address: dict,
        billing_address: Optional[dict],
        billing_same_as_shipping: bool,
        shipping_method: str,
        payment_method: str,
        notes: Optional[str],
        coupon_code: Optional[str],
        gift_card_code: Optional[str],
    ) -> dict:
        subtotal = sum(
            Decimal(str(item.product_price)) * item.quantity for item in items
        )

        discount_amount = Decimal("0.00")
        applied_coupon_code = None
        if coupon_code:
            discount_amount, applied_coupon_code = self._validate_coupon(coupon_code, subtotal, user_id)

        after_discount = max(subtotal - discount_amount, Decimal("0.00"))
        estimated_tax = (after_discount * TAX_RATE).quantize(Decimal("0.01"))
        shipping_cost = self._get_shipping_cost(shipping_method, after_discount)

        gift_card_amount = _lookup_gift_card_amount(self.db, gift_card_code)

        total = max(
            after_discount + estimated_tax + shipping_cost - gift_card_amount,
            Decimal("0.00"),
        )

        order_number = self._generate_order_number()

        billing = billing_address if not billing_same_as_shipping and billing_address else shipping_address

        payment_status = "paid" if payment_method in ("credit_card", "paypal") else "pending"

        order = Order(
            user_id=user_id,
            order_number=order_number,
            status="pending",
            payment_status=payment_status,
            payment_method=payment_method,
            subtotal=float(subtotal),
            tax_amount=float(estimated_tax),
            shipping_cost=float(shipping_cost),
            discount_amount=float(discount_amount),
            total_amount=float(total),
            shipping_name=f"{shipping_address['first_name']} {shipping_address['last_name']}",
            shipping_email=email,
            shipping_address=shipping_address.get("address_line_1", "")
            + (f", {shipping_address['address_line_2']}" if shipping_address.get("address_line_2") else ""),
            shipping_city=shipping_address["city"],
            shipping_state=shipping_address["state"],
            shipping_postal_code=shipping_address["postal_code"],
            shipping_country=shipping_address["country"],
            shipping_phone=shipping_address.get("phone_number"),
            billing_name=f"{billing['first_name']} {billing['last_name']}",
            billing_address=billing.get("address_line_1", "")
            + (f", {billing['address_line_2']}" if billing.get("address_line_2") else ""),
            billing_city=billing["city"],
            billing_state=billing["state"],
            billing_postal_code=billing["postal_code"],
            billing_country=billing["country"],
            notes=notes,
        )

        order_items = [
            {
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": float(item.product_price),
                "total_price": Decimal(str(item.product_price)) * item.quantity,
            }
            for item in items
        ]

        self.order_repo.decrement_stock(
            [
                {
                    "product_id": item.product_id,
                    "variant_id": item.variant_id,
                    "quantity": item.quantity,
                }
                for item in items
            ]
        )

        created_order = self.order_repo.create_order(order, order_items)

        if applied_coupon_code:
            coupon = self.coupon_repo.get_by_code(applied_coupon_code)
            if coupon:
                self.coupon_repo.increment_usage(coupon)

        self._award_loyalty_points(user_id, subtotal, created_order.id)
        self._process_referral_reward(user_id, total)

        self.cart_item_repo.delete_all_by_cart(cart.id)

        return self._serialize_order(created_order)

    def _award_loyalty_points(self, user_id: UUID, subtotal: Decimal, order_id: UUID) -> None:
        try:
            points = int(subtotal * LOYALTY_POINTS_PER_DOLLAR)
            if points > 0:
                self.loyalty_repo.add_points(
                    user_id=user_id,
                    points=points,
                    transaction_type="earned",
                    order_id=order_id,
                    description=f"Earned {points} points for order",
                )
        except Exception:
            logger.exception("Failed to award loyalty points for user %s", user_id)

    def _process_referral_reward(self, user_id: UUID, order_total: Decimal) -> None:
        try:
            referral = self.referral_repo.get_by_user(user_id)
            if not referral:
                return
            if order_total < Decimal("50.00"):
                return
            from app.models.database_models import ReferralReward
            existing_reward = self.referral_repo.db.query(ReferralReward).filter(
                ReferralReward.referred_id == user_id,
                ReferralReward.reward_type == "first_order",
            ).first()
            if existing_reward:
                return
            reward = ReferralReward(
                referrer_id=referral.user_id,
                referred_id=user_id,
                referral_code=referral.code,
                reward_value=500,
                reward_type="first_order",
                status="pending",
            )
            self.referral_repo.create_reward(reward)
            self.referral_repo.increment_usage(referral)
        except Exception:
            logger.exception("Failed to process referral reward for user %s", user_id)

    def _generate_order_number(self) -> str:
        now = datetime.now(timezone.utc)
        date_part = now.strftime("%Y%m%d")
        random_part = "".join(random.choices(string.digits, k=6))
        return f"ORD-{date_part}-{random_part}"

    def _serialize_order(self, order: Order) -> dict:
        items = [
            {
                "id": str(item.id),
                "product_id": str(item.product_id) if item.product_id else None,
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            }
            for item in order.items
        ]

        status_history = [
            {
                "id": str(h.id),
                "status": h.status,
                "note": h.note,
                "created_at": h.created_at.isoformat(),
            }
            for h in order.status_history
        ]

        return {
            "id": str(order.id),
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "subtotal": float(order.subtotal),
            "tax_amount": float(order.tax_amount),
            "shipping_cost": float(order.shipping_cost),
            "discount_amount": float(order.discount_amount),
            "gift_card_amount": float(getattr(order, 'gift_card_amount', 0) or 0),
            "total_amount": float(order.total_amount),
            "email": order.shipping_email,
            "shipping_name": order.shipping_name,
            "shipping_address": order.shipping_address,
            "shipping_city": order.shipping_city,
            "shipping_state": order.shipping_state,
            "shipping_postal_code": order.shipping_postal_code,
            "shipping_country": order.shipping_country,
            "shipping_phone": order.shipping_phone,
            "billing_name": order.billing_name,
            "billing_address": order.billing_address,
            "billing_city": order.billing_city,
            "billing_state": order.billing_state,
            "billing_postal_code": order.billing_postal_code,
            "billing_country": order.billing_country,
            "tracking_number": order.tracking_number,
            "shipping_carrier": order.shipping_carrier,
            "notes": order.notes,
            "items": items,
            "status_history": status_history,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
        }

    def _serialize_order_summary(self, order: Order) -> dict:
        item_count = sum(item.quantity for item in order.items)
        first_image = None
        if order.items:
            first_image = order.items[0].product_image

        return {
            "id": str(order.id),
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "total_amount": float(order.total_amount),
            "item_count": item_count,
            "first_item_image": first_image,
            "created_at": order.created_at.isoformat(),
        }

    def cancel_order(self, user_id: UUID, order_id: UUID, reason: str) -> dict:
        order = self.order_repo.get_user_order(user_id, order_id)
        if not order:
            raise ValueError("Order not found")

        if order.status not in ["pending", "processing"]:
            raise ValueError("Order cannot be cancelled. Only pending or processing orders can be cancelled.")

        try:
            self.order_repo.cancel_order(order, reason)
            self.order_repo.add_status_history(order_id, "cancelled", f"Cancelled by customer: {reason}", user_id)
            self.db.commit()
            self.db.refresh(order)
        except Exception:
            self.db.rollback()
            raise

        try:
            self.notification_service.dispatch("order_cancelled", {
                "order_number": order.order_number,
                "reason": reason,
                "user_id": user_id,
            }, user_id=user_id)
        except Exception as e:
            logger.warning("Failed to dispatch order_cancelled notification: %s", e)

        return self._serialize_order(order)

    def request_return(self, user_id: UUID, order_id: UUID, data: dict) -> dict:
        order = self.order_repo.get_user_order(user_id, order_id)
        if not order:
            raise ValueError("Order not found")

        if order.status != "delivered":
            raise ValueError("Return requests can only be made for delivered orders.")

        from datetime import datetime, timedelta, timezone
        if order.updated_at and (datetime.now(timezone.utc) - order.updated_at) > timedelta(days=30):
            raise ValueError("Return requests must be made within 30 days of delivery.")

        return_request = self.order_repo.create_return_request(
            order_id=order_id,
            user_id=user_id,
            reason=data["reason"],
            description=data["description"],
            order_item_id=data.get("order_item_id"),
        )

        self.order_repo.add_status_history(order_id, "return_requested", f"Return requested: {data['reason']}", user_id)
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {
            "id": str(return_request.id),
            "order_id": str(return_request.order_id),
            "reason": return_request.reason,
            "description": return_request.description,
            "status": return_request.status,
            "created_at": return_request.created_at.isoformat(),
        }

    def request_exchange(self, user_id: UUID, order_id: UUID, data: dict) -> dict:
        order = self.order_repo.get_user_order(user_id, order_id)
        if not order:
            raise ValueError("Order not found")

        if order.status != "delivered":
            raise ValueError("Exchange requests can only be made for delivered orders.")

        from datetime import datetime, timedelta, timezone
        if order.updated_at and (datetime.now(timezone.utc) - order.updated_at) > timedelta(days=30):
            raise ValueError("Exchange requests must be made within 30 days of delivery.")

        order_item = self.db.query(OrderItem).filter(
            OrderItem.id == data["order_item_id"],
            OrderItem.order_id == order_id,
        ).first()
        if not order_item:
            raise ValueError("Order item not found.")

        exchange_request = self.order_repo.create_exchange_request(
            order_id=order_id,
            user_id=user_id,
            order_item_id=data["order_item_id"],
            reason=data["reason"],
            description=data["description"],
        )

        self.order_repo.add_status_history(order_id, "exchange_requested", f"Exchange requested: {data['reason']}", user_id)
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {
            "id": str(exchange_request.id),
            "order_id": str(exchange_request.order_id),
            "order_item_id": str(exchange_request.order_item_id),
            "reason": exchange_request.reason,
            "description": exchange_request.description,
            "status": exchange_request.status,
            "created_at": exchange_request.created_at.isoformat(),
        }

    def get_invoice(self, user_id: UUID, order_id: UUID) -> dict:
        order = self.order_repo.get_user_order(user_id, order_id)
        if not order:
            raise ValueError("Order not found")

        items = []
        for item in order.items:
            items.append({
                "id": str(item.id),
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            })

        return {
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "created_at": order.created_at.isoformat(),
            "subtotal": float(order.subtotal),
            "tax_amount": float(order.tax_amount),
            "shipping_cost": float(order.shipping_cost),
            "discount_amount": float(order.discount_amount),
            "total_amount": float(order.total_amount),
            "shipping_name": order.shipping_name,
            "shipping_address": order.shipping_address,
            "shipping_city": order.shipping_city,
            "shipping_state": order.shipping_state,
            "shipping_postal_code": order.shipping_postal_code,
            "shipping_country": order.shipping_country,
            "billing_name": order.billing_name,
            "billing_address": order.billing_address,
            "billing_city": order.billing_city,
            "billing_state": order.billing_state,
            "billing_postal_code": order.billing_postal_code,
            "billing_country": order.billing_country,
            "items": items,
        }

    def get_available_shipping_methods(self, address: dict, subtotal: float) -> list[dict]:
        country = address.get("country", "")
        state = address.get("state")
        postal_code = address.get("postal_code")

        zone = self.shipping_repo.get_zone_for_address(country, state, postal_code)
        if not zone:
            methods = self.shipping_repo.get_active_methods()
            return [
                {
                    "id": str(m.id),
                    "name": m.name,
                    "description": m.description,
                    "carrier": m.carrier,
                    "estimated_days_min": m.estimated_days_min,
                    "estimated_days_max": m.estimated_days_max,
                    "is_express": m.is_express,
                    "cost": 0.0,
                    "free_shipping": subtotal >= float(FREE_SHIPPING_THRESHOLD),
                }
                for m in methods
            ]

        rates = self.shipping_repo.get_rates_for_zone(zone.id)
        methods = []
        for rate in rates:
            method = self.shipping_repo.get_method_by_id(rate.method_id)
            if not method or not method.is_active:
                continue

            cost = float(rate.base_rate)
            free_shipping = False
            if rate.free_shipping_threshold and subtotal >= float(rate.free_shipping_threshold):
                cost = 0.0
                free_shipping = True
            elif subtotal >= float(FREE_SHIPPING_THRESHOLD):
                cost = 0.0
                free_shipping = True

            methods.append({
                "id": str(method.id),
                "name": method.name,
                "description": method.description,
                "carrier": method.carrier,
                "estimated_days_min": method.estimated_days_min,
                "estimated_days_max": method.estimated_days_max,
                "is_express": method.is_express,
                "cost": cost,
                "free_shipping": free_shipping,
            })

        if not methods:
            methods = [
                {
                    "id": "standard",
                    "name": "Standard Shipping",
                    "description": "Standard delivery",
                    "carrier": None,
                    "estimated_days_min": 5,
                    "estimated_days_max": 7,
                    "is_express": False,
                    "cost": float(Decimal("5.99")),
                    "free_shipping": subtotal >= float(FREE_SHIPPING_THRESHOLD),
                }
            ]

        return methods

    def get_pickup_locations(self) -> list[dict]:
        locations = self.shipping_repo.get_active_pickup_locations()
        return [
            {
                "id": str(loc.id),
                "name": loc.name,
                "address_line_1": loc.address_line_1,
                "address_line_2": loc.address_line_2,
                "city": loc.city,
                "state": loc.state,
                "postal_code": loc.postal_code,
                "country": loc.country,
                "phone_number": loc.phone_number,
                "email": loc.email,
                "working_hours": loc.working_hours,
                "instructions": loc.instructions,
            }
            for loc in locations
        ]

    def get_delivery_tracking(self, user_id: UUID, order_id: UUID) -> dict:
        order = self.order_repo.get_user_order(user_id, order_id)
        if not order:
            raise ValueError("Order not found")

        tracking = self.shipping_repo.get_delivery_tracking(order_id)
        if not tracking:
            return {
                "order_id": str(order_id),
                "status": order.status,
                "tracking_number": order.tracking_number,
                "carrier": order.shipping_carrier,
                "estimated_delivery": None,
                "events": [],
            }

        events = self.shipping_repo.get_tracking_events(tracking.id)
        return {
            "id": str(tracking.id),
            "order_id": str(tracking.order_id),
            "tracking_number": tracking.tracking_number,
            "carrier": tracking.carrier,
            "status": tracking.status,
            "status_description": tracking.status_description,
            "location": tracking.location,
            "estimated_delivery": tracking.estimated_delivery.isoformat() if tracking.estimated_delivery else None,
            "actual_delivery": tracking.actual_delivery.isoformat() if tracking.actual_delivery else None,
            "shipped_at": tracking.shipped_at.isoformat() if tracking.shipped_at else None,
            "out_for_delivery_at": tracking.out_for_delivery_at.isoformat() if tracking.out_for_delivery_at else None,
            "delivered_at": tracking.delivered_at.isoformat() if tracking.delivered_at else None,
            "events": [
                {
                    "id": str(evt.id),
                    "status": evt.status,
                    "description": evt.description,
                    "location": evt.location,
                    "event_time": evt.event_time.isoformat(),
                }
                for evt in events
            ],
        }
