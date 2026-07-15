# E-Commerce Platform Comprehensive Bug Report

**Date:** July 15, 2026
**Reviewer:** AI Code Review
**Project:** E-Commerce Platform (FastAPI + React/Vite)
**Scope:** Full codebase review — backend, frontend, tests

---

## Executive Summary

A comprehensive code review of the entire e-commerce platform identified **~180 bugs** across the backend and frontend codebases. The most critical issues include security vulnerabilities (XSS, 2FA bypass, CVV storage), runtime crashes (null pointer dereferences, undefined access), logic errors (wrong operators, stale state), and missing error handling throughout.

| Severity | Count |
|----------|-------|
| Critical | 12 |
| High | 38 |
| Medium | 82 |
| Low | 48 |
| **Total** | **~180** |

---

## Table of Contents

1. [Backend — Core / Config / Security](#backend--core--config--security)
2. [Backend — Models & Schemas](#backend--models--schemas)
3. [Backend — Repositories](#backend--repositories)
4. [Backend — Services](#backend--services)
5. [Backend — API Routes](#backend--api-routes)
6. [Backend — Tests](#backend--tests)
7. [Frontend — Core / Context / Routing](#frontend--core--context--routing)
8. [Frontend — API Services](#frontend--api-services)
9. [Frontend — Common Components](#frontend--common-components)
10. [Frontend — Cart Components](#frontend--cart-components)
11. [Frontend — Catalog Components](#frontend--catalog-components)
12. [Frontend — Homepage Components](#frontend--homepage-components)
13. [Frontend — Pages](#frontend--pages)
14. [Frontend — Auth Pages](#frontend--auth-pages)
15. [Frontend — Admin Components](#frontend--admin-components)
16. [Frontend — Profile / Other Components](#frontend--profile--other-components)

---

## Backend — Core / Config / Security

### CRITICAL

**BUG-001: 2FA Token Type Check Allows Bypass**
- **File:** `backend/app/api/routes/endpoints.py:93`
- **Description:** `verify_2fa` checks `payload.get("type") != "access"` for a temporary 2FA token. Any valid access token could be reused as a 2FA temp token, bypassing the 2FA flow entirely. A temporary token should have a distinct type (e.g., `"2fa_temp"`).
- **Severity:** Critical
- **Category:** Security / Logic Error

### HIGH

**BUG-002: Blocking Synchronous HTTP Call in Async Context**
- **File:** `backend/app/api/routes/endpoints.py:389-392`
- **Description:** `_get_google_user_data()` uses `httpx.get()` (synchronous) inside an async FastAPI framework, blocking the entire event loop during the Google API call and degrading concurrent request performance.
- **Severity:** High
- **Category:** Runtime Error / Performance

**BUG-003: Verification Tokens Never Checked for Expiration**
- **File:** `backend/app/repositories/verification_repository.py:26-37, 62-70`
- **Description:** `get_email_verification` and `get_password_reset` only check `is_used` but never check if `expires_at` has passed. Expired tokens remain usable indefinitely, allowing password resets or email verifications long after expiration.
- **Severity:** High
- **Category:** Security / Missing Error Handling

**BUG-004: LIKE Wildcard Injection in Search**
- **File:** `backend/app/repositories/catalog_repository.py:204`
- **Description:** The `search` parameter is interpolated directly into a LIKE pattern (`f"%{search}%"`) without escaping. Users can inject `%`, `_`, or other LIKE wildcards to manipulate query results.
- **Severity:** High
- **Category:** Security

**BUG-005: Order Lookup Uses OR Instead of AND**
- **File:** `backend/app/repositories/catalog_repository.py:1223-1231`
- **Description:** `get_by_email_and_order_number` uses `|` (OR) instead of `&` (AND). An attacker who knows a victim's email can retrieve any of their orders by providing a guessed email with any order number.
- **Severity:** High
- **Category:** Logic Error / Security

### MEDIUM

**BUG-006: Rate Limiter IP Spoofing via X-Forwarded-For**
- **File:** `backend/app/middleware/rate_limit.py:14-16`
- **Description:** Client IP resolution trusts `X-Forwarded-For` header without validation. An attacker can spoof their IP address to bypass rate limiting.
- **Severity:** Medium
- **Category:** Security

**BUG-007: Rate Limiter Memory Leak**
- **File:** `backend/app/middleware/rate_limit.py:11`
- **Description:** `self.requests` dict stores timestamps for every unique client IP but never cleans up old entries. Over time, this causes unbounded memory growth.
- **Severity:** Medium
- **Category:** Resource Leak

**BUG-008: Weak Verification Code Entropy**
- **File:** `backend/app/core/security.py:52`
- **Description:** `generate_verification_code` returns only 6 hex characters (24 bits of entropy), which is weak and vulnerable to brute-force attacks.
- **Severity:** Medium
- **Category:** Security

**BUG-009: Missing TypeError in UUID Conversion**
- **File:** `backend/app/core/dependencies.py:38`
- **Description:** Converting `user_id` to UUID catches `ValueError` but not `TypeError`, which can be raised if the input is not a string/bytes/int.
- **Severity:** Medium
- **Category:** Runtime Error / Missing Error Handling

### LOW

**BUG-010: No Pool Configuration for Database Engine**
- **File:** `backend/app/database/session.py:6`
- **Description:** `create_engine` does not specify `pool_size` or `max_overflow`. Default pool settings may be insufficient for production.
- **Severity:** Low
- **Category:** Configuration / Performance

---

## Backend — Models & Schemas

### CRITICAL

**BUG-011: CVV/Credit Card Data Collected Server-Side**
- **File:** `backend/app/schemas/request_response_models.py:1222-1226`
- **Description:** `CreditCardDetails` schema collects raw `card_number`, `cvv`, and `expiry`. CVV must never be stored or transmitted to a backend server. Card details should be tokenized client-side via a payment processor.
- **Severity:** Critical
- **Category:** Security (PCI DSS Violation)

### HIGH

**BUG-012: OrderResponse References Non-Existent Model Field `gift_card_amount`**
- **File:** `backend/app/schemas/request_response_models.py:1298`
- **Description:** `OrderResponse` declares `gift_card_amount: float`, but the `Order` model has no `gift_card_amount` column. Using `model_validate(order_obj, from_attributes=True)` will raise `AttributeError`.
- **Severity:** High
- **Category:** Runtime Error

**BUG-013: OrderResponse References Non-Existent Model Field `email`**
- **File:** `backend/app/schemas/request_response_models.py:1300`
- **Description:** `OrderResponse` declares `email: Optional[str]`, but the `Order` model has `shipping_email`, not `email`. Using `from_attributes=True` will raise `AttributeError`.
- **Severity:** High
- **Category:** Runtime Error

**BUG-014: SessionResponse References Non-Existent Model Field `device_name`**
- **File:** `backend/app/schemas/request_response_models.py:138`
- **Description:** `SessionResponse` declares `device_name: Optional[str]`, but the `UserSession` model has `device_id`, not `device_name`. The `device_name` lives on the `UserDevice` model.
- **Severity:** High
- **Category:** Runtime Error

**BUG-015: ReviewHelpful Missing Unique Constraint**
- **File:** `backend/app/models/database_models.py:750-767`
- **Description:** No unique constraint on `(review_id, user_id)` allows a user to insert multiple `ReviewHelpful` rows for the same review, inflating `helpful_count` arbitrarily.
- **Severity:** High
- **Category:** Logic Error / Data Integrity

**BUG-016: ReviewReport Missing Unique Constraint**
- **File:** `backend/app/models/database_models.py:770-790`
- **Description:** No unique constraint on `(review_id, user_id)` allows a user to submit multiple reports against the same review.
- **Severity:** High
- **Category:** Logic Error / Data Integrity

### MEDIUM

**BUG-017: ReturnRequestCreate Schema Has Non-Existent `order_item_id` Field**
- **File:** `backend/app/schemas/request_response_models.py:1349` vs `backend/app/models/database_models.py:1022-1048`
- **Description:** The `ReturnRequestCreate` schema includes `order_item_id: Optional[UUID]`, but the `ReturnRequest` database model has no `order_item_id` column. Persisting this field will fail.
- **Severity:** Medium
- **Category:** Logic Error / Mismatch

**BUG-018: Product.rating Numeric(3,2) Allows Out-of-Range Values**
- **File:** `backend/app/models/database_models.py:478`
- **Description:** `Numeric(3,2)` allows values from -9.99 to 9.99, but product ratings should be 0-5. No database-level check constraint exists.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-019: WishlistItem.product_id Missing ForeignKey**
- **File:** `backend/app/models/database_models.py:284`
- **Description:** `product_id = Column(UUID(as_uuid=True), nullable=False)` has no `ForeignKey("products.id")`, unlike `CartItem.product_id` and `SavedForLater.product_id`. The database won't enforce referential integrity.
- **Severity:** Medium
- **Category:** Missing Error Handling / Data Integrity

**BUG-020: RecentlyViewedProduct.product_id Missing ForeignKey**
- **File:** `backend/app/models/database_models.py:302`
- **Description:** Same issue as BUG-019. No FK to `products.id`.
- **Severity:** Medium
- **Category:** Missing Error Handling / Data Integrity

**BUG-021: NotificationLog.reference_id String Without Length**
- **File:** `backend/app/models/database_models.py:359`
- **Description:** `Column(String, nullable=True)` omits the length argument. In MySQL/SQLite this can cause errors.
- **Severity:** Medium
- **Category:** Runtime Error (Portability)

**BUG-022: Dual Image Storage (Text + Relationship)**
- **File:** `backend/app/models/database_models.py:462, 488-490`
- **Description:** The `Product` model has both `images = Column(Text)` (JSON string) and `images_list = relationship("ProductImage")` (normalized table) that can easily become out of sync.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-023: Inconsistent Price Storage Types**
- **File:** `backend/app/models/database_models.py:287, 304` vs `database_models.py:460, 642, 866, 897, 991`
- **Description:** `WishlistItem.product_price` and `RecentlyViewedProduct.product_price` store price as `String(20)`, while `Product.price`, `CartItem.product_price`, etc. use `Numeric(10,2)`. String prices can't be used in arithmetic.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-024: AdminOrderStatusUpdateRequest No Validation**
- **File:** `backend/app/schemas/request_response_models.py:1107`
- **Description:** `status: str = Field(min_length=1, max_length=50)` accepts any arbitrary string. Invalid order statuses can be persisted.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-025: CouponCreateRequest.discount_type No Validation**
- **File:** `backend/app/schemas/request_response_models.py:1461`
- **Description:** `discount_type: str = Field(default="percentage")` accepts any string. Should be constrained to valid values.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-026: AutoDiscountCreateRequest.target_type No Validation**
- **File:** `backend/app/schemas/request_response_models.py:1512`
- **Description:** `target_type: str = Field(default="all")` accepts any string. Should be constrained to valid values.
- **Severity:** Medium
- **Category:** Missing Error Handling

### LOW

**BUG-027: SocialLoginRequest.provider Only Allows "google"**
- **File:** `backend/app/schemas/request_response_models.py:112`
- **Description:** `pattern=r"^google$"` means only Google is supported. If Apple, Facebook, etc. are planned, this is a hard blocker.
- **Severity:** Low
- **Category:** Logic Error (potential)

**BUG-028: ProductReview Auto-Approved by Default**
- **File:** `backend/app/models/database_models.py:741`
- **Description:** `is_approved = Column(Boolean, default=True)` means all reviews are approved without moderation. Spam risk.
- **Severity:** Low
- **Category:** Logic Error

**BUG-029: Verify2FARequest.code No Format Constraint**
- **File:** `backend/app/schemas/request_response_models.py:96`
- **Description:** TOTP codes are always 6 digits, but the field has no `pattern=r"^\d{6}$"` or `max_length=6` constraint.
- **Severity:** Low
- **Category:** Missing Error Handling

**BUG-030: CartResponse.from_attributes = True on Composite Fields**
- **File:** `backend/app/schemas/request_response_models.py:1191-1200`
- **Description:** `CartResponse` has nested `summary` and `saved_items` fields, but the `Cart` model has no such attributes. Using `from_attributes=True` will fail.
- **Severity:** Low
- **Category:** Runtime Error

---

## Backend — Repositories

### HIGH

**BUG-031: Banner Date Filtering Not Applied**
- **File:** `backend/app/repositories/catalog_repository.py:379`
- **Description:** `BannerRepository.get_by_position` computes `datetime.now(timezone.utc)` but never uses it. Banners with expired `end_date` or not-yet-started `start_date` are returned.
- **Severity:** High
- **Category:** Logic Error

**BUG-032: Unpublished Blog Posts Accessible by Slug**
- **File:** `backend/app/repositories/catalog_repository.py:423-424`
- **Description:** `BlogRepository.get_by_slug` does not filter by `is_published`. Draft posts can be retrieved by anyone who knows the slug.
- **Severity:** High
- **Category:** Logic Error / Security

**BUG-033: Price Range Zero Treated as Falsy**
- **File:** `backend/app/repositories/catalog_repository.py:346-347`
- **Description:** `if price_range[0]` evaluates to `False` when the minimum price is `0.0`, which is a valid price. Should be `if price_range[0] is not None`.
- **Severity:** High
- **Category:** Logic Error

**BUG-034: Negative Loyalty Points Not Rejected**
- **File:** `backend/app/repositories/promotion_repository.py:150-155`
- **Description:** `add_points` accepts any `int` for `points` with no validation. A negative value with `transaction_type="earned"` would decrease `lifetime_earned` and `points_balance`.
- **Severity:** High
- **Category:** Logic Error / Missing Error Handling

### MEDIUM

**BUG-035: Support Stats Missing "archived" Status**
- **File:** `backend/app/repositories/customer_support_repository.py:50-60`
- **Description:** `ContactMessageRepository.get_stats` counts `new`, `read`, and `replied` statuses but omits `archived`. The total won't equal the sum.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-036: Database-Specific `func.current_date()` in Notification Stats**
- **File:** `backend/app/repositories/notification_repository.py:96-101`
- **Description:** `func.current_date()` is SQLite-specific. On PostgreSQL this may fail or behave differently.
- **Severity:** Medium
- **Category:** Runtime Error / Portability

**BUG-037: Coupon Usage Count Race Condition**
- **File:** `backend/app/repositories/promotion_repository.py:62-64, 73-80`
- **Description:** `increment_usage` reads `used_count`, increments in Python, then writes back. Under concurrent requests, `used_count` can become stale.
- **Severity:** Medium
- **Category:** Logic Error / Race Condition

**BUG-038: Monthly Registration/Revenue Date Calculation Inaccuracy**
- **File:** `backend/app/repositories/catalog_repository.py:1028-1043, 1045-1069`
- **Description:** Using `timedelta(days=30 * i)` to simulate months is inaccurate. Months have 28-31 days, causing drift from actual calendar months.
- **Severity:** Medium
- **Category:** Logic Error

### LOW

**BUG-039: Bulk Delete Bypasses ORM Cascade Events**
- **File:** `backend/app/repositories/cart_repository.py:82-84`, `profile_repository.py:145-147, 190-194`, `session_repository.py:43-48, 84-86`
- **Description:** Methods using Query `.delete()` bypass SQLAlchemy ORM cascade events, potentially leaving orphaned records.
- **Severity:** Low
- **Category:** Logic Error

**BUG-040: Potential None Dereference in `toggle_helpful`**
- **File:** `backend/app/repositories/catalog_repository.py:641, 649`
- **Description:** The ternary `review.helpful_count if review else 0` is fragile — if the flow changes, it could break.
- **Severity:** Low
- **Category:** Missing Error Handling

**BUG-041: `get_filter_options` Returns Empty Price Range for Empty Catalog**
- **File:** `backend/app/repositories/catalog_repository.py:345-348`
- **Description:** When no active products exist, returns `{"min": 0, "max": 0}` instead of indicating an empty catalog.
- **Severity:** Low
- **Category:** Logic Error

---

## Backend — Services

### HIGH

**BUG-042: `float(product.rating)` Crashes on None (Homepage)**
- **File:** `backend/app/services/homepage_service.py:157`
- **Description:** `_serialize_product` calls `float(product.rating)` without a None check. If any product has a NULL rating, the entire homepage API will crash with a 500 error.
- **Severity:** High
- **Category:** Runtime Error

**BUG-043: `float(product.rating)` Crashes on None (Product Catalog Detail)**
- **File:** `backend/app/services/product_catalog_service.py:266`
- **Description:** Same crash as BUG-042 in `_serialize_product_detail`.
- **Severity:** High
- **Category:** Runtime Error

**BUG-044: `float(product.rating)` Crashes on None (Product Catalog Card)**
- **File:** `backend/app/services/product_catalog_service.py:286`
- **Description:** Same crash as BUG-042 in `_serialize_product_card`.
- **Severity:** High
- **Category:** Runtime Error

**BUG-045: Hardcoded Gift Card Validation**
- **File:** `backend/app/services/cart_service.py:175-190, 304`
- **Description:** Gift cards are validated against a hardcoded dict `{"GIFT10": ..., "GIFT25": ..., "GIFT50": ...}`. No database-backed validation, no balance tracking, no per-user limits. An attacker could repeatedly apply gift cards to get free orders.
- **Severity:** High
- **Category:** Logic Error / Security

**BUG-046: HTML Injection in Notification Emails**
- **File:** `backend/app/services/notification_service.py:305-319`
- **Description:** `subject` and `message` are interpolated directly into HTML without escaping: `<h2>{subject}</h2><p>{message}</p>`. Creates HTML injection/XSS in emails.
- **Severity:** High
- **Category:** Security

**BUG-047: Floating-Point Arithmetic in Order Total (Registered Users)**
- **File:** `backend/app/services/order_service.py:401`
- **Description:** `float(item.product_price) * item.quantity` uses floating-point multiplication, introducing rounding errors. Guest path correctly uses `Decimal * int`.
- **Severity:** High
- **Category:** Logic Error

**BUG-048: Referral Reward Check Prevents Legitimate Rewards**
- **File:** `backend/app/services/order_service.py:452-453`
- **Description:** `if existing_rewards[1] > 0: return` prevents giving a reward if the referrer already has ANY reward, not just for this specific referred user. If referrer A refers B and C, only B's order triggers a reward.
- **Severity:** High
- **Category:** Logic Error

**BUG-049: Stock Decrement Without Transaction Atomicity**
- **File:** `backend/app/services/order_service.py:256-265`
- **Description:** In `place_guest_order`, the order is created first, then stock is decremented. If stock decrement fails (concurrent orders), the order is already created but stock wasn't decremented.
- **Severity:** High
- **Category:** Race Condition

**BUG-050: `gift_card_amount` Hardcoded to 0.0 in Order Serialization**
- **File:** `backend/app/services/order_service.py:510`
- **Description:** `"gift_card_amount": 0.0` is hardcoded. The actual gift card amount is never stored on the Order model and always shows $0.
- **Severity:** High
- **Category:** Logic Error

**BUG-051: Admin Product Rating 0.0 Treated as Falsy**
- **File:** `backend/app/services/admin_service.py:262`
- **Description:** `float(product.rating) if product.rating else 0` — if `product.rating` is `Decimal(0)`, the condition is falsy, so it returns `0` instead of the actual rating. Silently loses data.
- **Severity:** High
- **Category:** Logic Error

**BUG-052: `float(product.discount_price)` Crash on None**
- **File:** `backend/app/services/admin_service.py:249`
- **Description:** `float(product.discount_price) if product.discount_price else None` — if `discount_price` is `Decimal(0)`, the falsy check returns `None` instead of `0`.
- **Severity:** High
- **Category:** Logic Error

### MEDIUM

**BUG-053: Invalid Coupon Silently Ignored in Guest Checkout**
- **File:** `backend/app/services/order_service.py:185-188, 337-340`
- **Description:** If `_validate_coupon` raises `ValueError`, the exception is caught and silently swallowed. Customer proceeds with no discount without knowing their coupon was rejected.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-054: Silent Failure in `_award_loyalty_points`**
- **File:** `backend/app/services/order_service.py:431-443`
- **Description:** Entire loyalty points award logic wrapped in `except Exception: pass`. Customer loses loyalty points with no logging or notification.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-055: Silent Failure in `_process_referral_reward`**
- **File:** `backend/app/services/order_service.py:445-467`
- **Description:** Same `except Exception: pass` pattern silently swallows all errors during referral reward processing.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-056: Product Stats Update Outside Transaction**
- **File:** `backend/app/services/product_catalog_service.py:130`
- **Description:** After `self.review_repo.create(review)`, the code calls `self.db.commit()` directly to update product rating/review_count, bypassing the repository pattern.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-057: Free Shipping Uses Pre-Discount Subtotal (Cart)**
- **File:** `backend/app/services/cart_service.py:317`
- **Description:** `if subtotal < FREE_SHIPPING_THRESHOLD` checks the pre-discount subtotal. A coupon bringing the total below the threshold won't affect shipping eligibility.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-058: Free Shipping Uses Pre-Discount Subtotal (Order)**
- **File:** `backend/app/services/order_service.py:344`
- **Description:** Same as BUG-057 in `_create_order`.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-059: Verification Codes Compared in Plaintext**
- **File:** `backend/app/services/business_logic.py:215`
- **Description:** `verification.code != code` compares the verification code in plaintext. If the database is compromised, all codes are immediately usable.
- **Severity:** Medium
- **Category:** Security

**BUG-060: Backup Codes Hashed Without Salt**
- **File:** `backend/app/services/business_logic.py:127-128`
- **Description:** Backup codes are hashed with `hashlib.sha256(code.encode())` without salt, making them vulnerable to rainbow table attacks.
- **Severity:** Medium
- **Category:** Security

**BUG-061: Race Condition in User Registration**
- **File:** `backend/app/services/business_logic.py:62-67`
- **Description:** Between `get_by_email` check and `create`, another concurrent request could register the same email.
- **Severity:** Medium
- **Category:** Race Condition

**BUG-062: Inactive User Gets Verification Prompt Instead of Blocked**
- **File:** `backend/app/services/business_logic.py:96-101`
- **Description:** Login for inactive users returns "Account not verified" with `requires_verification` flag, leaking information about account existence.
- **Severity:** Medium
- **Category:** Security

**BUG-063: Social Login Creates Account Without Password Hash**
- **File:** `backend/app/services/business_logic.py:400-411`
- **Description:** New users created via social login have no `password_hash`. Later `change_password` or `enable_2fa` (which requires password verification) will fail.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-064: Subtotal Uses Stale Cart Item Prices**
- **File:** `backend/app/services/order_service.py:330-331`
- **Description:** `subtotal = sum(Decimal(str(item.product_price)) * item.quantity for item in items)` uses the price stored in the cart item at time of addition, not the current product price.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-065: Search Results from Categories Mixed with Product Pagination**
- **File:** `backend/app/services/search_service.py:79`
- **Description:** When product search returns 0 results, category results replace them, but pagination meta still reflects the category count as if it were products.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-066: Refund Allows Zero-Value Refunds**
- **File:** `backend/app/services/admin_service.py:433`
- **Description:** `refund_amount = data.get("refund_amount", 0)` defaults to 0. The validation only checks upper bound, allowing $0 refunds.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-067: Order Number Collision Possible**
- **File:** `backend/app/services/order_service.py:469-473`
- **Description:** `_generate_order_number` generates `ORD-YYYYMMDD-XXXX` with only 10,000 possible numbers per day. With high volume, collisions are likely.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-068: Broadcast Notification Commits Inside Loop**
- **File:** `backend/app/services/notification_service.py:173-174`
- **Description:** `self.db.commit()` after the loop means if commit fails after processing 1000 users, all notifications are lost.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-069: Timezone-Naive vs Timezone-Aware Datetime Subtraction**
- **File:** `backend/app/services/business_logic.py:177-181`
- **Description:** `elapsed = datetime.now(timezone.utc) - latest.created_at` — if `created_at` is timezone-naive, this raises `TypeError`.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-070: Timestamp-Based Slug Deduplication is Fragile**
- **File:** `backend/app/services/customer_support_service.py:166-169`
- **Description:** `slug = f"{slug}-{int(datetime.now(timezone.utc).timestamp())}"` — two articles created in the same second get the same slug.
- **Severity:** Medium
- **Category:** Logic Error

### LOW

**BUG-071: Cart Creation Not Wrapped in try/except**
- **File:** `backend/app/services/profile_service.py:316-321`
- **Description:** In `move_to_cart`, if `self.db.add(cart)` or `self.db.commit()` fails, the method raises an unhandled exception.
- **Severity:** Low
- **Category:** Missing Error Handling

---

## Backend — API Routes

### CRITICAL

**BUG-072: `update_address` Uses `Depends()` for Request Body**
- **File:** `backend/app/api/routes/profile_endpoints.py:132`
- **Description:** `request: AddressUpdateRequest = Depends()` incorrectly uses `Depends()` for a request body parameter. FastAPI expects body parameters without `Depends()`. This will cause the endpoint to receive `None` or an empty model.
- **Severity:** Critical
- **Category:** Runtime Error / Incorrect Implementation

### MEDIUM

**BUG-073: Missing Error Handling on `logout`**
- **File:** `backend/app/api/routes/endpoints.py:117-118`
- **Description:** `auth_service.logout(request.refresh_token)` is called without try/except. If the service raises `ValueError`, it propagates as a 500 error.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-074: Missing Error Handling on `forgot_password`**
- **File:** `backend/app/api/routes/endpoints.py:194-195`
- **Description:** `auth_service.forgot_password(request.email)` is called without try/except.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-075: `update_quantity` Uses Ellipsis as Request Body Default**
- **File:** `backend/app/api/routes/cart_endpoints.py:55`
- **Description:** `request: CartUpdateQuantityRequest = ...` uses Ellipsis. The idiomatic way is to omit the default entirely.
- **Severity:** Medium
- **Category:** Logic Error / Incorrect Implementation

**BUG-076: Homepage `get_products` Treats `category`/`brand` as UUID but Named as String**
- **File:** `backend/app/api/routes/homepage_endpoints.py:64-65`
- **Description:** Parameters named `category: str` and `brand: str` are parsed as `UUID(category)`. Clients passing slugs will get 400 errors.
- **Severity:** Medium
- **Category:** Logic Error / Misleading API

**BUG-077: Invalid UUIDs Silently Ignored in Product Filters**
- **File:** `backend/app/api/routes/homepage_endpoints.py:112-113, 123-124`
- **Description:** When parsing `category_ids` and `brand_ids`, invalid UUIDs are silently `pass`ed, silently corrupting filter results.
- **Severity:** Medium
- **Category:** Logic Error / Missing Error Handling

**BUG-078: `validate_coupon` No Error Handling**
- **File:** `backend/app/api/routes/promotion_endpoints.py:60-61`
- **Description:** `coupon_service.validate_coupon(code, subtotal)` has no try/except. A `ValueError` results in a raw 500 error.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-079-081: Generic Exception Caught as 400**
- **File:** `backend/app/api/routes/promotion_endpoints.py:95-98, 168-171, 241-244`
- **Description:** `except Exception as e` blocks raise `HTTPException(400)`, masking database failures as client errors.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-082-097: Missing Error Handling on Profile Endpoints**
- **File:** `backend/app/api/routes/profile_endpoints.py` (multiple)
- **Description:** 16 profile endpoints (`get_addresses`, `get_wishlist`, `clear_wishlist`, `clear_recently_viewed`, `get_notifications`, `mark_all_notifications_read`, `get_privacy_settings`, `update_privacy_settings`, `get_account_settings`, `update_account_settings`) and cart endpoints (`get_cart`, `clear_cart`, `remove_coupon`, `remove_gift_card`, `get_shipping_methods`) have no error handling on service calls.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-098-099: Missing Error Handling on Promotion Endpoints**
- **File:** `backend/app/api/routes/promotion_endpoints.py:332-333, 394-395`
- **Description:** `get_loyalty_balance` and `get_referral_code` have no error handling.
- **Severity:** Medium
- **Category:** Missing Error Handling

### LOW

**BUG-100: Route Conflict Between Admin Notifications**
- **File:** `backend/app/api/routes/admin_notification_endpoints.py:180`
- **Description:** `GET /api/v1/admin/notifications` may conflict with `GET /api/v1/admin/notifications/stats` depending on registration order.
- **Severity:** Low
- **Category:** Logic Error / Route Conflict

---

## Backend — Tests

### CRITICAL

**BUG-101: `db_session` Fixture Never Rolls Back — Test Isolation Broken**
- **File:** `backend/tests/conftest.py:28-31`
- **Description:** The `db_session` fixture's `finally` block only calls `session.close()` but never `session.rollback()`. Committed data from one test leaks into all subsequent tests, breaking test isolation.
- **Severity:** Critical
- **Category:** Test Bug (Test Isolation)

### HIGH

**BUG-102: Hardcoded Product Slug Causes Cross-Test Collision**
- **File:** `backend/tests/test_checkout.py:34`
- **Description:** Test creates a product with `slug="test-product"`. Because conftest never rolls back (BUG-101), this persists. Future tests with the same slug will fail.
- **Severity:** High
- **Category:** Test Bug (Test Isolation)

### MEDIUM

**BUG-103-107: Missing Test Coverage**
- **File:** `backend/tests/test_auth.py:33-36, 36, 70-73, 116-119, 145`
- **Description:** Tests don't verify `provisioning_uri`, backup code count/format, session/user data in 2FA response, order summary fields, or error detail messages.
- **Severity:** Medium
- **Category:** Missing Coverage

**BUG-108: Hardcoded Invalid-Looking Bcrypt Hash in Test**
- **File:** `backend/tests/test_auth.py:41`
- **Description:** Password hash `$2b$12$LJ3m4ys4Pz4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy4tSy` is hardcoded and may not be valid.
- **Severity:** Medium
- **Category:** Test Bug

**BUG-109-111: Missing Test Coverage for Checkout**
- **File:** `backend/tests/test_checkout.py:66-69, 30-69, 72-108`
- **Description:** Tests don't verify order items/totals, stock decrement, order persistence in DB, or `terms_agreed` validation.
- **Severity:** Medium
- **Category:** Missing Coverage

**BUG-112: Status Assertion Overly Broad**
- **File:** `backend/tests/test_checkout.py:66`
- **Description:** `response.status_code in [200, 201]` should be exactly 201 per the endpoint decorator.
- **Severity:** Low
- **Category:** Test Bug

**BUG-113-114: Tests in Wrong Files**
- **File:** `backend/tests/test_auth.py:76-83, 86-145`
- **Description:** `TestSearchPublic` and `TestOrderTracking` test unrelated features (search, orders) and belong in separate test files.
- **Severity:** Low
- **Category:** Test Organization

### LOW

**BUG-115: Unused Fixtures**
- **File:** `backend/tests/conftest.py:48-69`
- **Description:** `test_user_data` and `test_shipping_address` are defined but never used.
- **Severity:** Low
- **Category:** Dead Code

---

## Frontend — Core / Context / Routing

### CRITICAL

**BUG-116: `/verify-2fa` Route Renders LoginPage Instead of 2FA Form**
- **File:** `frontend/src/routes/index.jsx:107`
- **Description:** When login returns `requires2FA: true`, the user is navigated to `/verify-2fa` with `{ state: { tempToken } }`. However, the route renders `<LoginPage />`, which has no 2FA code input UI and never reads `location.state.tempToken`. The 2FA verification flow is completely broken.
- **Severity:** Critical
- **Category:** Incorrect Implementation

### HIGH

**BUG-117: Token Refresh Race Condition**
- **File:** `frontend/src/services/api/client.js:23-46`
- **Description:** When multiple API calls return 401 simultaneously, each triggers its own token refresh attempt. Multiple concurrent `POST /auth/refresh` calls can occur, and if the backend invalidates the refresh token after first use, all subsequent refresh attempts fail.
- **Severity:** High
- **Category:** Logic Error / Race Condition

**BUG-118: `NotificationContext.markAsRead` Always Decrements Unread Count**
- **File:** `frontend/src/context/NotificationContext.jsx:43-50`
- **Description:** `setUnreadCount((prev) => Math.max(0, prev - 1))` always decrements, even if the notification was already read.
- **Severity:** High
- **Category:** Logic Error

**BUG-119: `/checkout` Route Not Protected**
- **File:** `frontend/src/routes/index.jsx:132`
- **Description:** The checkout page is publicly accessible without authentication. An unauthenticated user can navigate to `/checkout` and attempt to place an order.
- **Severity:** High
- **Category:** Security / Missing Error Handling

### MEDIUM

**BUG-120: Token Refresh Redirect Still Returns Rejected Promise**
- **File:** `frontend/src/services/api/client.js:39-48`
- **Description:** The catch block calls `window.location.href = '/login'` but falls through to `return Promise.reject(error)`, causing double-handling.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-121: `/wishlist` Route Not Protected**
- **File:** `frontend/src/routes/index.jsx:130`
- **Description:** Wishlist page requires authentication but isn't wrapped in `ProtectedRoute`.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-122: AuthContext `login` Missing `response.success` Check**
- **File:** `frontend/src/context/AuthContext.jsx:56-79`
- **Description:** `login` function directly accesses `response.data.requires_verification` without verifying success first.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-123: CartContext `updateQuantity` Missing Auth Guard**
- **File:** `frontend/src/context/CartContext.jsx:98-110`
- **Description:** Unlike `addToCart` which explicitly throws for unauthenticated users, `updateQuantity` has no auth check.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-124: CartContext Error Swallowing Inconsistency**
- **File:** `frontend/src/context/CartContext.jsx:112-122, 124-134, 151-161, 178-188, 232-242`
- **Description:** `removeFromCart`, `clearCart`, `removeCoupon`, `removeGiftCard`, and `removeSavedItem` catch errors but don't re-throw, while other operations do. Callers can't detect failures.
- **Severity:** Medium
- **Category:** Missing Error Handling / Inconsistent Implementation

**BUG-125: WishlistContext Missing Auth Guards**
- **File:** `frontend/src/context/WishlistContext.jsx:36-85`
- **Description:** All wishlist mutating operations have no `isAuthenticated` guard, inconsistent with CartContext.
- **Severity:** Medium
- **Category:** Missing Error Handling

### LOW

**BUG-126: AuthContext Returns Stale User Without Token Validation**
- **File:** `frontend/src/context/AuthContext.jsx:7-21`
- **Description:** `getInitialUser` reads `user` from localStorage synchronously, even if the token is expired. Brief flash of authenticated content before token validation.
- **Severity:** Low
- **Category:** Logic Error / UX Issue

**BUG-127: CartContext Item Count Shows 0 During Load**
- **File:** `frontend/src/context/CartContext.jsx:244`
- **Description:** `itemCount` is derived from cart state which is `EMPTY_CART` during loading, causing UI badge flicker.
- **Severity:** Low
- **Category:** Logic Error / UI Bug

---

## Frontend — API Services

### HIGH

**BUG-128: `adminProductService.exportProductsCsv` Returns Full Axios Response**
- **File:** `frontend/src/services/api/adminProductService.js:46`
- **Description:** Returns `response` (full Axios response) instead of `response.data`. Consumers expecting just the data (e.g., a Blob) will receive `{ data: Blob, status, headers, config }`.
- **Severity:** High
- **Category:** Logic Error / Inconsistent Return Value

**BUG-129: `wishlistService` Uses Default Export Instead of Named Export**
- **File:** `frontend/src/services/api/wishlistService.js:40`
- **Description:** Uses `export default` while every other service file uses named exports. Any consumer importing as named import will get `undefined`.
- **Severity:** High
- **Category:** Logic Error / Inconsistent Export Pattern

### MEDIUM

**BUG-130: Token Refresh Destructuring Assumes Nested Response**
- **File:** `frontend/src/services/api/client.js:33`
- **Description:** `const { access_token, refresh_token: newRefreshToken } = response.data.data` assumes nested response. If API returns tokens directly, throws TypeError.
- **Severity:** Medium
- **Category:** Missing Error Handling / Runtime Error

### LOW

**BUG-131: `wishlistService` Imports Client as `client` Instead of `api`**
- **File:** `frontend/src/services/api/wishlistService.js:1`
- **Description:** Inconsistent naming convention compared to all other service files.
- **Severity:** Low
- **Category:** Style Inconsistency

---

## Frontend — Common Components

### HIGH

**BUG-132: SearchBar Keyboard Navigation Selects Wrong Item**
- **File:** `frontend/src/components/common/SearchBar.jsx:137-141`
- **Description:** The `items` array is ordered `[history, popularSearches, suggestions]`, but the visual rendering order is `[suggestions, history, popularSearches]`. Keyboard navigation selects the wrong item.
- **Severity:** High
- **Category:** Logic Error

### MEDIUM

**BUG-133: SearchBar JSON.parse on localStorage Throws on Corrupted Data**
- **File:** `frontend/src/components/common/SearchBar.jsx:53, 82, 126, 181`
- **Description:** `JSON.parse(localStorage.getItem('search_history') || '[]')` will throw if localStorage contains corrupted/invalid JSON.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-134: SearchBar History Item Object Passed to executeSearch**
- **File:** `frontend/src/components/common/SearchBar.jsx:138`
- **Description:** `history.map((h) => h.query || h)` — if `h` is an object without a `query` property, the object itself is passed to `executeSearch()` which calls `.trim()` on it, causing TypeError.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-135: FilterSidebar Price Inputs Never Re-Synced**
- **File:** `frontend/src/components/common/FilterSidebar.jsx:54-55`
- **Description:** Price filter inputs initialized from props via `useState()` but never re-synced when parent changes filters externally.
- **Severity:** Medium
- **Category:** State Error / Logic Error

**BUG-136: FilterSidebar Passes Strings Instead of Numbers for Prices**
- **File:** `frontend/src/components/common/FilterSidebar.jsx:59-60`
- **Description:** `priceMin` and `priceMax` are strings from `<input type="number">` passed directly without `Number()` conversion.
- **Severity:** Low
- **Category:** Logic Error

**BUG-137: ProductCard `stock_quantity` Undefined Treated as In-Stock**
- **File:** `frontend/src/components/common/ProductCard.jsx:101`
- **Description:** `product.stock_quantity <= 0` evaluates to `false` when `stock_quantity` is `undefined`, enabling add-to-cart for products with missing stock data.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-138: ProductCard setTimeout Never Cleaned Up**
- **File:** `frontend/src/components/common/ProductCard.jsx:33`
- **Description:** `setTimeout(() => setAdded(false), 2000)` is never cleaned up on unmount, causing state update on unmounted component.
- **Severity:** Low
- **Category:** Memory Leak

**BUG-139: ActiveFilters Inconsistent `onRemove` Signatures**
- **File:** `frontend/src/components/common/ActiveFilters.jsx:12, 25, 52`
- **Description:** `onRemove` called with inconsistent signatures (sometimes 1 arg, sometimes 2). Fragile API.
- **Severity:** Medium
- **Category:** Logic Error / API Misuse

**BUG-140: NotificationDropdown Invalid Date Display**
- **File:** `frontend/src/components/common/NotificationDropdown.jsx:102`
- **Description:** `new Date(notification.created_at).toLocaleDateString()` displays "Invalid Date" if `created_at` is null/undefined.
- **Severity:** Low
- **Category:** Runtime Error

**BUG-141: MegaMenu Loading State Never Set to True**
- **File:** `frontend/src/components/common/MegaMenu.jsx:9, 14-22`
- **Description:** `loading` initialized to `false` but never set to `true` before API call. Loading spinner never renders.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-142: MegaMenu Silently Swallows API Errors**
- **File:** `frontend/src/components/common/MegaMenu.jsx:22`
- **Description:** `.catch(() => {})` silently swallows errors. User sees permanently empty menu with no failure indication.
- **Severity:** Low
- **Category:** Missing Error Handling

---

## Frontend — Cart Components

### CRITICAL

**BUG-143: LoyaltyRedeem Hardcoded Points-to-Dollar Conversion Rate**
- **File:** `frontend/src/components/cart/LoyaltyRedeem.jsx:31, 49`
- **Description:** `(pts / 100).toFixed(2)` assumes 100 points = $1.00. If server uses a different rate, displayed discount is wrong. Rate must come from API.
- **Severity:** Critical
- **Category:** Logic Error

### HIGH

**BUG-144: CartSummary No Null Guard on `cart.summary`**
- **File:** `frontend/src/components/cart/CartSummary.jsx:7`
- **Description:** `const { summary } = cart;` destructures directly. If `cart` loads asynchronously or `summary` is undefined, this crashes.
- **Severity:** High
- **Category:** Runtime Error

**BUG-145-148: Missing Error Handling on Cart Async Operations**
- **File:** `frontend/src/components/cart/CouponInput.jsx:33-38`, `GiftCardInput.jsx:33-38`, `CartItem.jsx:12,16,20`
- **Description:** `removeCoupon()`, `removeGiftCard()`, `updateQuantity`, `removeFromCart`, `saveForLater` have no try/catch. Loading state gets stuck on failure.
- **Severity:** High
- **Category:** Missing Error Handling

### MEDIUM

**BUG-149: CartItem Race Condition on Rapid Quantity Changes**
- **File:** `frontend/src/components/cart/CartItem.jsx:9-12`
- **Description:** Rapid clicks on +/- fire overlapping async calls. Out-of-order responses leave quantity desynced.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-150: CartItem Out-of-Stock Items Can Still Be Checked Out**
- **File:** `frontend/src/components/cart/CCartItem.jsx:87-89`
- **Description:** Out-of-stock items displayed with warning but no disabled state on quantity controls or checkout.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-151: ShippingSelector Missing useEffect Dependency**
- **File:** `frontend/src/components/cart/ShippingSelector.jsx:32`
- **Description:** `useEffect(() => { loadMethods(); }, [])` — `loadMethods` missing from dependency array.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-152: ShippingSelector No Error Handling on setShippingMethod**
- **File:** `frontend/src/components/cart/ShippingSelector.jsx:36`
- **Description:** If `setShippingMethod` fails, there's no catch. Radio button shows selected but server-side isn't updated.
- **Severity:** High
- **Category:** Missing Error Handling

**BUG-153: ShippingSelector Fallback Uses Hardcoded Costs**
- **File:** `frontend/src/components/cart/ShippingSelector.jsx:20-24`
- **Description:** When API fails, hardcoded shipping costs are shown, potentially differing from actual backend rates.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-154: MiniCart No Error Handling on Remove**
- **File:** `frontend/src/components/cart/MiniCart.jsx:60`
- **Description:** `removeFromCart(item.id)` has no try/catch.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-155: SavedForLater No Error Handling**
- **File:** `frontend/src/components/cart/SavedForLater.jsx:43, 50`
- **Description:** `moveToCart` and `removeSavedItem` have no try/catch.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-156: LoyaltyRedeem Silent Error in useEffect**
- **File:** `frontend/src/components/cart/LoyaltyRedeem.jsx:18`
- **Description:** `.catch(() => {})` silently discards loyalty balance API errors.
- **Severity:** Medium
- **Category:** Missing Error Handling

---

## Frontend — Catalog Components

### CRITICAL

**BUG-157: ProductReviews `ratingSummary` Crash on Undefined**
- **File:** `frontend/src/components/catalog/ProductReviews.jsx:38, 145`
- **Description:** If API response omits `rating_summary`, `ratingSummary` is `undefined`. Then `ratingSummary.total` throws TypeError, crashing the component.
- **Severity:** Critical
- **Category:** Runtime Error

### HIGH

**BUG-158: ProductGallery Stale `selectedIndex` on Prop Change**
- **File:** `frontend/src/components/catalog/ProductGallery.jsx:5`
- **Description:** `selectedIndex` initialized with `useState(0)` but never resets when `images` prop changes. Navigating between products shows wrong image.
- **Severity:** High
- **Category:** Logic Error / State Bug

**BUG-159: ProductReviews `response.pagination` Potentially Undefined**
- **File:** `frontend/src/components/catalog/ProductReviews.jsx:39-40`
- **Description:** `response.pagination.page` accessed without null-check. If API omits pagination, throws TypeError.
- **Severity:** High
- **Category:** Runtime Error

**BUG-160: ProductVariants `onSelectVariant` Not Guarded**
- **File:** `frontend/src/components/catalog/ProductVariants.jsx:18`
- **Description:** `onSelectVariant(variant)` called without guard. If prop is omitted, throws TypeError.
- **Severity:** High
- **Category:** Runtime Error

### MEDIUM

**BUG-161: ProductGallery Zoom Modal No Keyboard Escape**
- **File:** `frontend/src/components/catalog/ProductGallery.jsx:83-94`
- **Description:** No Escape key handler or focus trap. Accessibility violation (WCAG).
- **Severity:** Medium
- **Category:** Accessibility

**BUG-162: ProductReviews Breakdown Divides by Undefined**
- **File:** `frontend/src/components/catalog/ProductReviews.jsx:162`
- **Description:** `ratingSummary.breakdown[star]` may be undefined for a star level with no reviews, producing `NaN` width.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-163: ProductReviews setTimeout Not Cleaned Up**
- **File:** `frontend/src/components/catalog/ProductReviews.jsx:108-111`
- **Description:** `setTimeout` not cleaned up on unmount, causing state update on unmounted component.
- **Severity:** Low
- **Category:** Memory Leak

**BUG-164: ProductSpecifications Stale `expandedSections`**
- **File:** `frontend/src/components/catalog/ProductSpecifications.jsx:6-8`
- **Description:** `expandedSections` initialized once from initial `specifications` prop. New sections collapse on product change.
- **Severity:** Medium
- **Category:** State Bug

**BUG-165: ProductVariants Inconsistent null/undefined Stock Handling**
- **File:** `frontend/src/components/catalog/ProductVariants.jsx:13`
- **Description:** `variant.stock_quantity <= 0` — `null <= 0` is `true` (out of stock), `undefined <= 0` is `false` (in stock). Inconsistent behavior.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-166: RelatedProducts `product.slug` Could Be Undefined**
- **File:** `frontend/src/components/catalog/RelatedProducts.jsx:12`
- **Description:** `to={/products/${product.slug}}` — if slug is undefined, navigates to `/products/undefined`.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-167: ProductTags `cursor-pointer` With No Click Handler**
- **File:** `frontend/src/components/catalog/ProductTags.jsx:11`
- **Description:** Tags styled as clickable but have no onClick handler.
- **Severity:** Low
- **Category:** Logic Error

---

## Frontend — Homepage Components

### HIGH

**BUG-168: HeroBanner XSS via `link_url` in href**
- **File:** `frontend/src/components/homepage/HeroBanner.jsx:72`
- **Description:** `banner.link_url` passed directly to `<a href>`. React doesn't sanitize `javascript:` protocol in href attributes. A malicious banner with `link_url: "javascript:alert(document.cookie)"` would execute arbitrary JavaScript.
- **Severity:** High
- **Category:** Security

**BUG-169: FlashSale Product Links Use `product_id` Instead of `slug`**
- **File:** `frontend/src/components/homepage/FlashSale.jsx:84`
- **Description:** `to={`/products/${item.product_id}`}` uses numeric/UUID ID, but all other components use `product.slug`. Links will 404.
- **Severity:** High
- **Category:** Logic Error

**BUG-170: BlogSection All Cards Link to `/products`**
- **File:** `frontend/src/components/homepage/BlogSection.jsx:37`
- **Description:** Every blog post card links to `to="/products"` instead of individual blog post route.
- **Severity:** High
- **Category:** Logic Error

**BUG-171: Testimonials `customer_name.charAt(0)` Crashes on Null**
- **File:** `frontend/src/components/homepage/Testimonials.jsx:49`
- **Description:** `testimonial.customer_name.charAt(0)` throws TypeError if `customer_name` is null/undefined.
- **Severity:** High
- **Category:** Runtime Error

### MEDIUM

**BUG-172: HeroBanner `current` State Out of Bounds**
- **File:** `frontend/src/components/homepage/HeroBanner.jsx:6-14`
- **Description:** When `banners` prop shrinks, `current` is never reset. All slides become invisible until interval fires.
- **Severity:** Medium
- **Category:** State Issue

**BUG-173: FlashSale Constructed Product Missing `slug`, `stock_quantity`**
- **File:** `frontend/src/components/homepage/FlashSale.jsx:86-94`
- **Description:** Manually constructed product object missing fields. `ProductCard` can't check stock, add-to-cart always enabled.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-174: FlashSale `images` May Be Wrong Type**
- **File:** `frontend/src/components/homepage/FlashSale.jsx:91` -> `ProductCard.jsx:22`
- **Description:** If `item.product_image` is an object, `product.images.split()` throws TypeError.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-175: BlogSection "View All" Links Go to `/products`**
- **File:** `frontend/src/components/homepage/BlogSection.jsx:25, 89`
- **Description:** Both "View All" navigation links point to `/products` instead of blog listing.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-176: ProductCard `images.split()` Crashes on Non-String**
- **File:** `frontend/src/components/common/ProductCard.jsx:22`
- **Description:** `product.images.split(',')` throws TypeError if images is an array, number, or object.
- **Severity:** Medium
- **Category:** Runtime Error

### LOW

**BUG-177: FlashSale CountdownTimer Doesn't Clear Interval**
- **File:** `frontend/src/components/homepage/FlashSale.jsx:15-18, 28`
- **Description:** When countdown reaches zero, `setInterval` is never cleared. Timer runs indefinitely.
- **Severity:** Low
- **Category:** Missing Cleanup

**BUG-178: Newsletter No Way to Subscribe Again**
- **File:** `frontend/src/components/homepage/Newsletter.jsx:18-20, 42-46`
- **Description:** After successful subscription, no reset mechanism or button to allow re-subscription.
- **Severity:** Low
- **Category:** UX / Logic Error

---

## Frontend — Pages

### CRITICAL

**BUG-179: ProductDetailPage XSS via `dangerouslySetInnerHTML`**
- **File:** `frontend/src/pages/ProductDetailPage.jsx:358`
- **Description:** `dangerouslySetInnerHTML={{ __html: product.description }}` renders raw HTML without sanitization. If product descriptions can be set by users, this is a stored XSS vulnerability.
- **Severity:** Critical
- **Category:** Security

### HIGH

**BUG-180: ProductDetailPage Stock Check Uses `||` Instead of `??`**
- **File:** `frontend/src/pages/ProductDetailPage.jsx:93-94, 246-248`
- **Description:** `selectedVariant?.stock_quantity || product.stock_quantity` — when variant has `stock_quantity` of 0 (out of stock), `||` treats 0 as falsy and falls through to product-level stock. Users can add out-of-stock variants to cart.
- **Severity:** High
- **Category:** Logic Error

**BUG-181: ProductListPage `product.images.split()` Crashes on Array**
- **File:** `frontend/src/pages/ProductListPage.jsx:399`
- **Description:** `product.images.split(',').filter(Boolean)[0]` assumes string. If API returns array, throws TypeError.
- **Severity:** High
- **Category:** Runtime Error

**BUG-182: CheckoutPage No Validation for Pickup Location Selection**
- **File:** `frontend/src/pages/CheckoutPage.jsx:212-230, 297`
- **Description:** When `deliveryType === 'pickup'`, `validateShipping()` doesn't check that `selectedPickupLocation` is set. User can proceed with empty string.
- **Severity:** High
- **Category:** Logic Error / Missing Error Handling

**BUG-183: ProfilePage No Authentication Guard**
- **File:** `frontend/src/pages/ProfilePage.jsx:40-71`
- **Description:** Never checks `isAuthenticated` before rendering. Unauthenticated users see full profile layout with tabs.
- **Severity:** High
- **Category:** Missing Error Handling

**BUG-184: DashboardPage Incorrect Data Path for Devices**
- **File:** `frontend/src/pages/DashboardPage.jsx:18-19`
- **Description:** `devicesRes.data` used to set state, but actual device array might be at `devicesRes.data.data`. `.filter()` could fail silently.
- **Severity:** High
- **Category:** Logic Error

### MEDIUM

**BUG-185: CheckoutPage Card Details Sent as Plaintext**
- **File:** `frontend/src/pages/CheckoutPage.jsx:284-290`
- **Description:** Credit card details sent in plaintext. PCI-DSS violation if connected to real payment processor.
- **Severity:** Medium
- **Category:** Security

**BUG-186: CheckoutPage Silent Error Swallowing**
- **File:** `frontend/src/pages/CheckoutPage.jsx:88-90, 121-123`
- **Description:** `catch {}` blocks silently discard all errors with no user feedback.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-187: ProductListPage Inconsistent Price Formatting**
- **File:** `frontend/src/pages/ProductListPage.jsx:419`
- **Description:** `${product.discount_price || product.price}` renders raw numbers with hardcoded `$` instead of `formatPrice()`.
- **Severity:** Medium
- **Category:** Logic Error / Inconsistency

**BUG-188: WishlistPage Price Not Formatted**
- **File:** `frontend/src/pages/WishlistPage.jsx:163`
- **Description:** `${item.product_price}` renders with raw `$` instead of `formatPrice()`.
- **Severity:** Medium
- **Category:** Logic Error / Inconsistency

**BUG-189: FAQPage `faq.answer.toLowerCase()` Crashes on Null**
- **File:** `frontend/src/pages/FAQPage.jsx:42`
- **Description:** `faq.answer.toLowerCase()` throws if `faq.answer` is null/undefined.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-190: HelpCenterPage `a.content.toLowerCase()` Crashes on Null**
- **File:** `frontend/src/pages/HelpCenterPage.jsx:42`
- **Description:** Same issue as BUG-189.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-191: AdminDashboardPage `m.revenue.toLocaleString()` Crash**
- **File:** `frontend/src/pages/AdminDashboardPage.jsx:827`
- **Description:** If `m.revenue` is null/undefined, `.toLocaleString()` throws.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-192: AdminDashboardPage `(p.discount_price || p.price) * p.sold_count` Crash**
- **File:** `frontend/src/pages/AdminDashboardPage.jsx:767`
- **Description:** If both `discount_price` and `price` are undefined, expression becomes `NaN.toLocaleString()`.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-193: AdminProductImportPage Naive CSV Parser**
- **File:** `frontend/src/pages/admin/AdminProductImportPage.jsx:38-53`
- **Description:** `line.split(',')` fails for values containing commas (e.g., `"New York, NY"`). Breaks on quoted fields.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-194: AdminProductImportPage Price 0 Treated as Falsy**
- **File:** `frontend/src/pages/admin/AdminProductImportPage.jsx:96`
- **Description:** `parseFloat(rest.price) || 0` — a price of `0` is falsy and silently accepted.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-195: AdminProductListPage Stale Pagination After Delete**
- **File:** `frontend/src/pages/admin/AdminProductListPage.jsx:60-61`
- **Description:** After deleting a product, `pagination.total` not updated. "Showing X to Y of Z" text is wrong.
- **Severity:** Medium
- **Category:** State Bug

**BUG-196: ContactPage No Rate Limiting on Form Submission**
- **File:** `frontend/src/pages/ContactPage.jsx:22`
- **Description:** Contact form has no rate limiting. Attacker could submit programmatically thousands of times.
- **Severity:** Medium
- **Category:** Security

**BUG-197: OrderHistoryPage Potential Undefined Pagination Access**
- **File:** `frontend/src/pages/OrderHistoryPage.jsx:152-153, 162-163`
- **Description:** `pagination.page` could be undefined if API returns `{ pages: 2 }` without `page` property.
- **Severity:** Low
- **Category:** Missing Error Handling

### LOW

**BUG-198: ProductDetailPage Share Button Non-Functional**
- **File:** `frontend/src/pages/ProductDetailPage.jsx:314-316`
- **Description:** Share button renders but has no `onClick` handler. Dead UI element.
- **Severity:** Low
- **Category:** Missing Error Handling

**BUG-199: ProfilePage Delete Tab Styling Conflict**
- **File:** `frontend/src/pages/ProfilePage.jsx:113`
- **Description:** Active state and delete-specific classes conflict, resulting in primary-blue background with red text.
- **Severity:** Low
- **Category:** Logic Error / UI Bug

---

## Frontend — Auth Pages

### HIGH

**BUG-200: ChangePasswordPage `setTimeout` Never Cleared on Unmount**
- **File:** `frontend/src/pages/auth/ChangePasswordPage.jsx:37-40`
- **Description:** After successful password change, `setTimeout` schedules `logout()` + `navigate('/login')`. If user navigates before timer fires, callback executes on unmounted component.
- **Severity:** High
- **Category:** Memory Leak / Runtime Error

**BUG-201: VerifyEmailPage Resend Button Broken Without Email**
- **File:** `frontend/src/pages/auth/VerifyEmailPage.jsx:150-166, 188-201`
- **Description:** When user arrives via `?token=xxx` without `?email=xxx`, email input is hidden but resend button visible. `handleResend` immediately fails with "Please enter your email address" since `email` is empty. User is stuck.
- **Severity:** High
- **Category:** Logic Error

### MEDIUM

**BUG-202: LoginPage "Remember Me" Checkbox Non-Functional**
- **File:** `frontend/src/pages/auth/LoginPage.jsx:200`
- **Description:** Checkbox has no `checked` state, no `onChange` handler, and its value is never sent to `login()`.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-203: LoginPage `login()` Called With Wrong Arguments**
- **File:** `frontend/src/pages/auth/LoginPage.jsx:15`
- **Description:** `login(email, password)` — `deviceName` and `deviceType` never passed. Backend never receives device info.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-204: RegisterPage Terms of Service Not Links**
- **File:** `frontend/src/pages/auth/RegisterPage.jsx:195-198`
- **Description:** Terms and Privacy Policy text has interactive styling but are `<span>` elements with no `href` or `onClick`. Users can't read terms before agreeing.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-205: ChangePasswordPage No Validation Against Same Password**
- **File:** `frontend/src/pages/auth/ChangePasswordPage.jsx`
- **Description:** No check that `newPassword === currentPassword`. User could submit the same password.
- **Severity:** Medium
- **Category:** Security

**BUG-206: ResetPasswordPage Token Validation After Password Checks**
- **File:** `frontend/src/pages/auth/ResetPasswordPage.jsx:31-33`
- **Description:** Password checks run before token existence check. User sees "Passwords do not match" instead of "Invalid reset link" if token is null.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-207: TwoFactorSetupPage No Error Handling for Clipboard**
- **File:** `frontend/src/pages/auth/TwoFactorSetupPage.jsx:47-51`
- **Description:** `navigator.clipboard.writeText()` can throw but has no try/catch.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-208: TwoFactorSetupPage TOTP Secret Sent to Third-Party Service**
- **File:** `frontend/src/pages/auth/TwoFactorSetupPage.jsx:116`
- **Description:** TOTP secret embedded in URL sent to `api.qrserver.com`. Third-party service could log secrets.
- **Severity:** Medium
- **Category:** Security

**BUG-209: TwoFactorSetupPage `verify2FA` Result Not Used**
- **File:** `frontend/src/pages/auth/TwoFactorSetupPage.jsx:38-39`
- **Description:** After `verify2FA` succeeds, result data is discarded. Page navigates to `/dashboard` without updating auth state.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-210: RegisterPage Response Not Checked for Success Shape**
- **File:** `frontend/src/pages/auth/RegisterPage.jsx:40-46`
- **Description:** `await register(...)` — if API returns 200 with `{ success: false, detail: "..." }`, page shows "Check your email" even though registration failed.
- **Severity:** Medium
- **Category:** Missing Error Handling

### LOW

**BUG-211: LoginPage Error Fallback May Leak Internal Details**
- **File:** `frontend/src/pages/auth/LoginPage.jsx:52`
- **Description:** `err.response?.data?.detail` displayed directly. Backend errors like "User does not exist" enable user enumeration.
- **Severity:** Low
- **Category:** Security

**BUG-212: TwoFactorSetupPage Variable Shadowing**
- **File:** `frontend/src/pages/auth/TwoFactorSetupPage.jsx:169`
- **Description:** `setupData.backup_codes.map((code, i) =>` shadows `code` state variable. Future edits inside this callback will silently use wrong value.
- **Severity:** Low
- **Category:** Logic Error / Code Quality

---

## Frontend — Admin Components

### CRITICAL

**BUG-213: AdminOrderDetail Runtime Crash on `.toFixed()` Before Load**
- **File:** `frontend/src/components/admin/AdminOrderDetail.jsx:280-282`
- **Description:** On initial render, `order` is set to `initialOrder` (summary object). Fields like `subtotal`, `tax_amount` are undefined. `.toFixed(2)` throws TypeError.
- **Severity:** Critical
- **Category:** Runtime Error

### HIGH

**BUG-214: AdminOrderDetail XSS in `printInvoice`**
- **File:** `frontend/src/components/admin/AdminOrderDetail.jsx:116-159`
- **Description:** Order data (names, addresses, product names) interpolated into raw HTML with no sanitization. Stored XSS vulnerability.
- **Severity:** High
- **Category:** Security (XSS)

**BUG-215: AdminOrderDetail XSS in `printShippingLabel`**
- **File:** `frontend/src/components/admin/AdminOrderDetail.jsx:165-199`
- **Description:** Same XSS vulnerability as BUG-214.
- **Severity:** High
- **Category:** Security (XSS)

**BUG-216: AdminOrderDetail Crash in `printInvoice` Before Load**
- **File:** `frontend/src/components/admin/AdminOrderDetail.jsx:151-155`
- **Description:** `.toFixed(2)` called on undefined order fields before detail fetch completes.
- **Severity:** High
- **Category:** Runtime Error

### MEDIUM

**BUG-217-219: Search Fires on Every Keystroke**
- **File:** `frontend/src/components/admin/AdminProductList.jsx:46`, `AdminOrderList.jsx:61`, `AdminProductInventory.jsx:33`
- **Description:** `search` in useEffect dependency array alongside `searchTrigger` defeats the submit-based mechanism, firing API call on each keystroke.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-220: AdminProductForm Race Condition on Product ID Change**
- **File:** `frontend/src/components/admin/AdminProductForm.jsx:34-73`
- **Description:** `useEffect` fetches product data asynchronously with no cancellation. Changing product ID while fetch in-flight overwrites form with wrong data.
- **Severity:** Medium
- **Category:** Logic Error (Race Condition)

**BUG-221: AdminProductImportExport Naive CSV Parsing**
- **File:** `frontend/src/components/admin/AdminProductImportExport.jsx:39-51`
- **Description:** `line.split(',')` fails for quoted CSV fields containing commas.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-222: AdminCategoryList Invalid HTML**
- **File:** `frontend/src/components/admin/AdminCategoryList.jsx:64-114, 170`
- **Description:** `<div>` elements inside `<tbody>` — invalid HTML causing unpredictable rendering.
- **Severity:** Low
- **Category:** Logic Error (Invalid HTML)

**BUG-223-224: AdminNotificationList/AdminTemplateList Pagination State Undefined**
- **File:** `frontend/src/components/admin/AdminNotificationList.jsx:19`, `AdminTemplateList.jsx:16`
- **Description:** `setPagination(response.data.pagination)` without fallback. If API doesn't include pagination, state becomes `undefined`.
- **Severity:** Medium
- **Category:** Runtime Error

**BUG-225: AdminProductImportExport Discount Price 0 Treated as Undefined**
- **File:** `frontend/src/components/admin/AdminProductImportExport.jsx:98`
- **Description:** `rest.discount_price ? parseFloat(rest.discount_price) : undefined` — falsy check discards legitimate zero.
- **Severity:** Low
- **Category:** Logic Error

**BUG-226-236: Empty Catch Blocks Across Admin Components**
- **File:** `AdminNotificationList.jsx:21-22, 37-38`, `AdminTemplateList.jsx:18-19, 33-34, 43-44`, `AdminNotificationStats.jsx:16-17`, `AdminContactMessageList.jsx:36, 73`, `AdminFAQList.jsx:41`, `AdminHelpArticleList.jsx:41`
- **Description:** All catch blocks are empty — failed API calls silently fail with no user feedback.
- **Severity:** Medium
- **Category:** Missing Error Handling

---

## Frontend — Profile / Other Components

### CRITICAL

**BUG-237: AddressManagement `loadAddresses` Not Defined**
- **File:** `frontend/src/components/profile/AddressManagement.jsx:58`
- **Description:** `loadAddresses()` called in `handleSubmit` but never defined. `ReferenceError` at runtime when submitting the form.
- **Severity:** Critical
- **Category:** Runtime Error

### HIGH

**BUG-238: AddressManagement Address List Never Refreshes After Create/Update**
- **File:** `frontend/src/components/profile/AddressManagement.jsx:55-57`
- **Description:** After successful create/update, address list never refreshes due to missing `loadAddresses` function (BUG-237).
- **Severity:** High
- **Category:** Logic Error

**BUG-239: WishlistSection Share URL Double-Prefixed**
- **File:** `frontend/src/components/profile/WishlistSection.jsx:49, 170`
- **Description:** `${window.location.origin}${shareModal.share_url}` — if `share_url` is already absolute URL, produces broken URL like `https://localhost:3000https://example.com/...`.
- **Severity:** High
- **Category:** Logic Error

### MEDIUM

**BUG-240: ProfileInformation Camera Button Has No onClick**
- **File:** `frontend/src/components/profile/ProfileInformation.jsx:104-109`
- **Description:** Camera button is `type="button"` but does nothing when clicked. Avatar cannot be changed via UI.
- **Severity:** Medium
- **Category:** Logic Error / Incomplete Implementation

**BUG-241: DeleteAccountSection Confirmation Not Sent to API**
- **File:** `frontend/src/components/profile/DeleteAccountSection.jsx:29`
- **Description:** `DELETE_MY_ACCOUNT` confirmation only checked client-side. If API doesn't verify, protection is purely cosmetic.
- **Severity:** Medium
- **Category:** Security

**BUG-242: WishlistSection `product_id` vs `id` Mismatch**
- **File:** `frontend/src/components/profile/WishlistSection.jsx:127, 149`
- **Description:** `item.product_id` used for handlers but `item.id` used as React key. If `product_id` is undefined, API calls fail.
- **Severity:** Medium
- **Category:** Logic Error

**BUG-243: DeliveryTrackingSection Silent Error Swallowing**
- **File:** `frontend/src/components/orders/DeliveryTrackingSection.jsx:35-36`
- **Description:** Catch block silently discards errors. User sees no feedback for unauthorized/server errors.
- **Severity:** Medium
- **Category:** Missing Error Handling

**BUG-244: CategoryBanner `category.parent.slug` Accessed Without Null Check**
- **File:** `frontend/src/components/category/CategoryBanner.jsx:13, 16`
- **Description:** `category.parent.slug` accessed without checking if `slug` exists on `parent`. Produces `/categories/undefined` URL.
- **Severity:** Medium
- **Category:** Missing Error Handling

### LOW

**BUG-245: NotificationsSection `unreadCount` Can Desync**
- **File:** `frontend/src/components/profile/NotificationsSection.jsx:26-35`
- **Description:** `handleMarkRead` decrements `unreadCount` unconditionally without verifying notification was actually unread.
- **Severity:** Low
- **Category:** Logic Error

**BUG-246: RecentlyViewedSection Price Not Formatted**
- **File:** `frontend/src/components/profile/RecentlyViewedSection.jsx:86`
- **Description:** Price rendered without `toFixed(2)` — may display `$29.9` instead of `$29.90`.
- **Severity:** Low
- **Category:** Logic Error

**BUG-247: DeliveryTrackingSection `.replace('_', ' ')` Only Replaces First Underscore**
- **File:** `frontend/src/components/orders/DeliveryTrackingSection.jsx:78`
- **Description:** `String.prototype.replace` with string argument only replaces first occurrence. `"out_for_delivery"` becomes `"out for_delivery"`.
- **Severity:** Low
- **Category:** Logic Error

---

## Appendix: Bug Count by Area

| Area | Critical | High | Medium | Low | Total |
|------|----------|------|--------|-----|-------|
| Backend Core/Security | 1 | 3 | 4 | 1 | 9 |
| Backend Models/Schemas | 1 | 5 | 10 | 4 | 20 |
| Backend Repositories | 0 | 4 | 4 | 3 | 11 |
| Backend Services | 0 | 10 | 18 | 1 | 29 |
| Backend API Routes | 1 | 0 | 18 | 1 | 20 |
| Backend Tests | 1 | 1 | 8 | 3 | 13 |
| Frontend Core/Context | 1 | 3 | 5 | 2 | 11 |
| Frontend API Services | 0 | 2 | 1 | 1 | 4 |
| Frontend Common Components | 0 | 1 | 7 | 4 | 12 |
| Frontend Cart Components | 1 | 4 | 9 | 0 | 14 |
| Frontend Catalog Components | 1 | 3 | 5 | 2 | 11 |
| Frontend Homepage Components | 0 | 4 | 5 | 2 | 11 |
| Frontend Pages | 1 | 5 | 13 | 2 | 21 |
| Frontend Auth Pages | 0 | 2 | 9 | 2 | 13 |
| Frontend Admin Components | 1 | 3 | 10 | 2 | 16 |
| Frontend Profile/Other | 1 | 2 | 5 | 3 | 11 |
| **TOTAL** | **12** | **38** | **82** | **48** | **~180** |

---

## Top 10 Most Impactful Bugs

1. **BUG-116** — `/verify-2fa` route renders LoginPage (2FA flow completely broken)
2. **BUG-179** — XSS via `dangerouslySetInnerHTML` on product descriptions
3. **BUG-042-044** — `float(product.rating)` crashes on NULL rating (entire homepage/product pages crash)
4. **BUG-179/214-215** — XSS in invoice/label printing via unsanitized HTML
5. **BUG-045** — Hardcoded gift cards (complete payment bypass)
6. **BUG-046** — HTML injection in notification emails
7. **BUG-005** — Order lookup OR instead of AND (data breach)
8. **BUG-011** — CVV/credit card data collected server-side (PCI DSS violation)
9. **BUG-072** — `Depends()` on request body parameter (address updates broken)
10. **BUG-237** — `loadAddresses` not defined (address management completely broken)

---

*Report generated by AI Code Review — July 15, 2026*
