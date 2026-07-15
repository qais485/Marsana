import pytest
from unittest.mock import patch, MagicMock
from app.services.business_logic import AuthService
from app.models.database_models import User, UserTwoFactor


# NOTE: Auth tests are organized by feature (2FA, login, register).
# Consider splitting into separate files per feature for maintainability.


class TestTwoFactorAuth:
    def test_enable_2fa_returns_secret(self, client, db_session):
        from app.core.security import pwd_context

        password = "TestPass123!"
        password_hash = pwd_context.hash(password)

        user = User(
            email="2fa@example.com",
            password_hash=password_hash,
            first_name="Test",
            last_name="User",
            is_active=True,
            is_email_verified=True,
        )
        db_session.add(user)
        db_session.commit()

        from app.core.security import create_access_token
        token = create_access_token(subject=str(user.id))

        response = client.post(
            "/api/v1/auth/2fa/enable",
            headers={"Authorization": f"Bearer {token}"},
            json={"password": password},
        )
        assert response.status_code == 200
        data = response.json()
        assert "secret" in data["data"]
        assert "backup_codes" in data["data"]

    def test_verify_2fa_with_temp_token(self, client, db_session):
        user = User(
            email="verify2fa@example.com",
            password_hash="$2b$12$LJ3m4ys4Pz4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy",
            first_name="Test",
            last_name="User",
            is_active=True,
            is_email_verified=True,
            is_2fa_enabled=True,
        )
        db_session.add(user)
        db_session.flush()

        two_factor = UserTwoFactor(
            user_id=user.id,
            secret="JBSWY3DPEHPK3PXP",
            is_enabled=True,
        )
        db_session.add(two_factor)
        db_session.commit()

        from app.core.security import create_access_token
        temp_token = create_access_token(subject=str(user.id))

        import pyotp
        totp = pyotp.TOTP("JBSWY3DPEHPK3PXP")
        valid_code = totp.now()

        response = client.post(
            "/api/v1/auth/verify-2fa",
            json={"temp_token": temp_token, "code": valid_code},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]


class TestSearchPublic:
    def test_search_without_auth(self, client):
        response = client.get("/api/v1/search", params={"q": "test"})
        assert response.status_code == 200

    def test_search_requires_query(self, client):
        response = client.get("/api/v1/search")
        assert response.status_code == 422


class TestOrderTracking:
    def test_track_order_with_email(self, client, db_session):
        from app.models.database_models import Order
        from datetime import datetime, timezone

        order = Order(
            order_number="ORD-20260715-1234",
            status="shipped",
            payment_status="paid",
            payment_method="credit_card",
            subtotal=100.00,
            tax_amount=8.00,
            shipping_cost=5.00,
            discount_amount=0.00,
            total_amount=113.00,
            shipping_name="Test User",
            shipping_email="track@example.com",
            shipping_address="123 Test Street",
            shipping_city="Testville",
            shipping_state="TS",
            shipping_postal_code="12345",
            shipping_country="US",
        )
        db_session.add(order)
        db_session.commit()

        response = client.post(
            "/api/v1/orders/track",
            json={"email": "track@example.com", "order_number": "ORD-20260715-1234"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["order_number"] == "ORD-20260715-1234"

    def test_track_order_wrong_email(self, client, db_session):
        from app.models.database_models import Order

        order = Order(
            order_number="ORD-20260715-5678",
            status="pending",
            payment_status="pending",
            subtotal=50.00,
            total_amount=50.00,
            shipping_name="Test User",
            shipping_email="correct@example.com",
            shipping_address="123 Test Street",
            shipping_city="Testville",
            shipping_state="TS",
            shipping_postal_code="12345",
            shipping_country="US",
        )
        db_session.add(order)
        db_session.commit()

        response = client.post(
            "/api/v1/orders/track",
            json={"email": "wrong@example.com", "order_number": "ORD-20260715-5678"},
        )
        assert response.status_code == 404
