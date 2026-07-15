# E-Commerce Platform Code Review Report

**Date:** July 15, 2026  
**Reviewer:** AI Assistant  
**Project:** E-Commerce Platform (FastAPI + React)

---

## Summary

Identified and fixed **10 critical bugs** across the backend codebase. The issues span authentication, order processing, data integrity, and database migrations. Additionally, implemented all recommendations: integration tests, order email tracking, rate limiting, and migration consolidation.

---

## Bugs Fixed

### 1. 2FA Verification Broken (CRITICAL)
**File:** `backend/app/api/routes/endpoints.py:83-108`  
**Issue:** The verify-2fa endpoint attempted to decode the TOTP code as a JWT token, causing all 2FA logins to fail.  
**Fix:** Added `temp_token` field to `Verify2FARequest` schema and updated endpoint to properly identify user via temp token before verifying TOTP code.

### 2. Backup Code Comparison Failed (CRITICAL)
**File:** `backend/app/services/business_logic.py:160-167`  
**Issue:** Backup codes were compared raw against hashed values, making backup code authentication impossible.  
**Fix:** Hash the input code before comparison and added `_hash_backup_codes_from_hashes` helper method.

### 3. Order Email Returns Wrong Field (HIGH)
**File:** `backend/app/services/order_service.py:414`  
**Issue:** `_serialize_order` returned `order.shipping_name` instead of email.  
**Fix:** Added `shipping_email` column to Order model and updated serialization to use it.

### 4. Track Order Email Comparison Bug (HIGH)
**File:** `backend/app/services/order_service.py:256`  
**Issue:** `track_order` compared email against `shipping_name` (a person's name), causing all tracking to fail.  
**Fix:** Updated to compare against `shipping_email` field on order.

### 5. Guest Checkout Passes Empty Cart (HIGH)
**File:** `backend/app/api/routes/checkout_endpoints.py:107`  
**Issue:** Guest checkout sent `cart_items_data=[]` instead of actual cart items.  
**Fix:** Added `GuestCartItem` schema and updated endpoint to pass cart items from request.

### 6. Missing OrderItem Import (HIGH)
**File:** `backend/app/services/order_service.py:10`  
**Issue:** `OrderItem` used in `request_exchange` but not imported.  
**Fix:** Added `OrderItem` to imports.

### 7. Search Endpoint Requires Auth (MEDIUM)
**File:** `backend/app/api/routes/search_endpoints.py:66`  
**Issue:** Public search endpoint required authentication, blocking unauthenticated users.  
**Fix:** Removed `get_current_active_user` dependency.

### 8. Duplicate Alembic Migrations (MEDIUM)
**File:** `backend/alembic/versions/`  
**Issue:** Two empty migration files created confusing migration chain.  
**Fix:** Removed empty migrations and consolidated chain.

### 9. Product Slug Uniqueness Check Bug (MEDIUM)
**File:** `backend/app/services/admin_service.py:112`  
**Issue:** `create_product` queried non-existent product ID instead of checking slug uniqueness.  
**Fix:** Removed incorrect query, relying on while loop for slug uniqueness.

### 10. Deprecated datetime.utcnow() (LOW)
**File:** `backend/app/services/order_service.py:479,511`  
**Issue:** Used deprecated `datetime.utcnow()` instead of `datetime.now(timezone.utc)`.  
**Fix:** Updated to use timezone-aware datetime.

---

## Recommendations Implemented

### 1. Integration Tests
**Status:** COMPLETED  
**Files:** `backend/tests/conftest.py`, `backend/tests/test_auth.py`, `backend/tests/test_checkout.py`  
**Tests:** 9 tests covering 2FA, search, order tracking, and checkout flows.

### 2. Email Field for Order Tracking
**Status:** COMPLETED  
**Files:** `backend/app/models/database_models.py`, `backend/app/services/order_service.py`, `backend/alembic/versions/b2c3d4e5f6a7_add_shipping_email.py`  
**Changes:** Added `shipping_email` column to Order model, updated order creation and tracking.

### 3. Rate Limiting
**Status:** COMPLETED  
**Files:** `backend/app/middleware/rate_limit.py`, `backend/app/main.py`  
**Changes:** Added in-memory rate limiter (60 requests/minute per IP) as middleware.

### 4. Migration Consolidation
**Status:** COMPLETED  
**Files:** `backend/alembic/versions/`  
**Changes:** Removed 2 empty migrations, consolidated linear chain:
```
33197c605d26 → f1a2b3c4d5e6 → a1b2c3d4e5f6 → b2c3d4e5f6a7
```

---

## Files Modified

| File | Changes |
|------|---------|
| `backend/app/api/routes/endpoints.py` | Fixed 2FA verification endpoint |
| `backend/app/schemas/request_response_models.py` | Added `temp_token`, `GuestCartItem` schemas |
| `backend/app/services/business_logic.py` | Fixed backup code comparison |
| `backend/app/services/order_service.py` | Fixed email field, track_order, imports, datetime |
| `backend/app/api/routes/checkout_endpoints.py` | Fixed guest checkout cart items |
| `backend/app/api/routes/search_endpoints.py` | Made search public |
| `backend/app/services/admin_service.py` | Fixed slug uniqueness check |
| `backend/app/models/database_models.py` | Added `shipping_email` to Order |
| `backend/app/middleware/rate_limit.py` | New rate limiting middleware |
| `backend/app/main.py` | Added rate limit middleware |
| `backend/tests/` | New test suite (9 tests) |
| `backend/alembic/versions/` | Consolidated migrations |

---

## Test Results

```
tests/test_auth.py::TestTwoFactorAuth::test_enable_2fa_returns_secret PASSED
tests/test_auth.py::TestTwoFactorAuth::test_verify_2fa_with_temp_token PASSED
tests/test_auth.py::TestSearchPublic::test_search_without_auth PASSED
tests/test_auth.py::TestSearchPublic::test_search_requires_query PASSED
tests/test_auth.py::TestOrderTracking::test_track_order_with_email PASSED
tests/test_auth.py::TestOrderTracking::test_track_order_wrong_email PASSED
tests/test_checkout.py::TestGuestCheckout::test_guest_checkout_requires_cart_items PASSED
tests/test_checkout.py::TestGuestCheckout::test_guest_checkout_with_valid_items PASSED
tests/test_checkout.py::TestAuthenticatedCheckout::test_checkout_requires_cart PASSED

9 passed
```

---

## Conclusion

The platform had critical authentication and order processing bugs that would prevent core functionality from working. All issues have been fixed, integration tests added, and the codebase is now stable for development.
