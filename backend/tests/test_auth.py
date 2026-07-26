import pytest
from unittest.mock import patch, MagicMock
from app.services.business_logic import AuthService
from app.models.database_models import User


class TestGoogleOAuthLogin:
    def test_social_login_creates_new_user(self, client, db_session):
        from app.core.security import create_access_token

        mock_google_data = {
            "id": "google-123",
            "email": "newuser@gmail.com",
            "first_name": "New",
            "last_name": "User",
            "avatar_url": "https://lh3.googleusercontent.com/photo.jpg",
        }

        with patch("app.api.routes.endpoints._get_social_user_data", return_value=mock_google_data):
            response = client.post(
                "/api/v1/auth/social/login",
                json={
                    "provider": "google",
                    "access_token": "mock-google-token",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
        assert data["data"]["user"]["email"] == "newuser@gmail.com"

    def test_social_login_existing_user(self, client, db_session):
        user = User(
            email="existing@gmail.com",
            first_name="Existing",
            last_name="User",
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        from app.models.database_models import SocialAccount
        social = SocialAccount(
            user_id=user.id,
            provider="google",
            provider_user_id="google-existing",
        )
        db_session.add(social)
        db_session.commit()

        mock_google_data = {
            "id": "google-existing",
            "email": "existing@gmail.com",
            "first_name": "Existing",
            "last_name": "User",
        }

        with patch("app.api.routes.endpoints._get_social_user_data", return_value=mock_google_data):
            response = client.post(
                "/api/v1/auth/social/login",
                json={
                    "provider": "google",
                    "access_token": "mock-google-token",
                },
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
