import pytest
from uuid import uuid4
from app.models.database_models import Product, User, Cart, CartItem


class TestGuestCheckout:
    def test_guest_checkout_requires_cart_items(self, client, db_session):
        response = client.post(
            "/api/v1/checkout/guest",
            json={
                "email": "guest@example.com",
                "shipping_address": {
                    "first_name": "Guest",
                    "last_name": "User",
                    "address_line_1": "123 Guest Street",
                    "city": "Guestville",
                    "state": "GS",
                    "postal_code": "12345",
                    "country": "US",
                },
                "shipping_method": "standard",
                "payment_method": "cod",
                "terms_agreed": True,
                "cart_items": [],
            },
        )
        assert response.status_code == 400
        assert "No items" in response.json()["detail"]

    def test_guest_checkout_with_valid_items(self, client, db_session):
        product_id = uuid4()
        product = Product(
            id=product_id,
            name="Test Product",
            slug=f"test-product-{product_id}",
            price=25.00,
            stock_quantity=10,
            is_active=True,
        )
        db_session.add(product)
        db_session.commit()

        response = client.post(
            "/api/v1/checkout/guest",
            json={
                "email": "guest@example.com",
                "shipping_address": {
                    "first_name": "Guest",
                    "last_name": "User",
                    "address_line_1": "123 Guest Street",
                    "city": "Guestville",
                    "state": "GS",
                    "postal_code": "12345",
                    "country": "US",
                },
                "shipping_method": "standard",
                "payment_method": "cod",
                "terms_agreed": True,
                "cart_items": [
                    {
                        "product_id": str(product.id),
                        "quantity": 2,
                    }
                ],
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "order_number" in data["data"]


class TestAuthenticatedCheckout:
    def test_checkout_requires_cart(self, client, db_session):
        user = User(
            email="checkout@example.com",
            password_hash="$2b$12$LJ3m4ys4Pz4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy",
            first_name="Checkout",
            last_name="User",
            is_active=True,
            is_email_verified=True,
        )
        db_session.add(user)
        db_session.commit()

        from app.core.security import create_access_token
        token = create_access_token(subject=str(user.id))

        response = client.post(
            "/api/v1/checkout",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "email": "checkout@example.com",
                "shipping_address": {
                    "first_name": "Checkout",
                    "last_name": "User",
                    "address_line_1": "123 Checkout Street",
                    "city": "Checkoutville",
                    "state": "CS",
                    "postal_code": "12345",
                    "country": "US",
                },
                "shipping_method": "standard",
                "payment_method": "cod",
                "terms_agreed": True,
            },
        )
        assert response.status_code == 400
        assert "Cart is empty" in response.json()["detail"]
