# E-Commerce Platform - Bug & Issue Report

**Generated:** 2026-07-23  
**Scope:** Full codebase audit — backend (Python/FastAPI), frontend (React/Vite), middleware, database models  
**Total Issues Found:** 127  
**Priority Breakdown:** Critical: 12 | High: 28 | Medium: 48 | Low: 39

---

## Table of Contents

1. [Security — Critical & High](#1-security)
2. [Race Conditions & Data Integrity](#2-race-conditions)
3. [Backend - Core & Config](#3-backend-core)
4. [Backend - Services](#4-backend-services)
5. [Backend - Repositories](#5-backend-repositories)
6. [Backend - API Routes](#6-backend-routes)
7. [Backend - Middleware](#7-backend-middleware)
8. [Frontend - Core & Auth](#8-frontend-core)
9. [Frontend - Pages](#9-frontend-pages)
10. [Frontend - Components](#10-frontend-components)
11. [Frontend - Context Providers](#11-frontend-context)
12. [Frontend - Services & Hooks](#12-frontend-services)
13. [Cross-Cutting Issues](#13-cross-cutting)
14. [Summary Statistics](#14-summary)

---

<a id="1-security"></a>
## 1. Security — Critical & High

### S-01 | PCI-DSS Violation — Raw Credit Card Data Handled Client-Side
- **File:** `frontend/src/pages/CheckoutPage.jsx:287-297`
- **Priority:** CRITICAL
- **Description:** Raw credit card number, CVV, and expiry are stored in React state and sent to the backend. This is a direct PCI-DSS compliance violation. Card data must never touch your server.
- **Fix:** Integrate Stripe.js/Elements or Braintree Drop-in UI for client-side tokenization. The backend should only receive a payment token, never raw card data.

### S-02 | Auth Tokens Stored in localStorage
- **File:** `frontend/src/services/api/client.js:25,50,59-60`
- **Priority:** CRITICAL
- **Description:** `access_token` and `refresh_token` are stored in `localStorage`, making them accessible to any XSS attack. If an attacker injects script (via a comment field, product description, etc.), they can steal the tokens.
- **Fix:** Use `httpOnly` cookies with `SameSite=Strict` and `Secure` flags. Alternatively, use a BFF (Backend for Frontend) pattern.

### S-03 | Credentials Committed to Repository
- **File:** `backend/.env:1-16`
- **Priority:** CRITICAL
- **Description:** The `.env` file contains database credentials, JWT secrets, SMTP passwords, and Google OAuth client secrets. While `.gitignore` lists `.env`, the file is currently present in the working directory. If any `.gitignore` misconfiguration occurs, these leak.
- **Fix:** Rotate all exposed credentials immediately. Use a secrets manager (e.g., AWS Secrets Manager, Vault). Add `backend/.env` to `.gitignore` explicitly and audit git history.

### S-04 | Rate Limiter Bypass via IP Spoofing
- **File:** `backend/app/middleware/rate_limit.py:16-18`
- **Priority:** CRITICAL
- **Description:** The `X-Forwarded-For` header is trusted without validation. An attacker can set `X-Forwarded-For: 1.2.3.4` on every request to get a fresh rate limit bucket, completely bypassing rate limiting.
- **Fix:** Only trust `X-Forwarded-For` from known trusted proxies (configure a list of proxy IPs). Use `request.client.host` as the primary identifier. Consider using Redis-based rate limiting.

### S-05 | Arbitrary Field Update on User Objects (Privilege Escalation)
- **File:** `backend/app/repositories/catalog_repository.py:1097-1103`
- **Priority:** CRITICAL
- **Description:** `update_user()` uses `setattr(user, key, value)` without restricting which fields can be set. An attacker could set `role="admin"`, `is_email_verified=True`, or `deleted_at`.
- **Fix:** Implement an allowlist of fields that can be updated. Never use `**kwargs` with `setattr` for user-modifiable fields.

### S-06 | Arbitrary Field Update on Order Objects
- **File:** `backend/app/repositories/catalog_repository.py:1365-1371`
- **Priority:** HIGH
- **Description:** `OrderRepository.update()` sets arbitrary fields via `setattr(order, key, value)`. Could overwrite `id`, `user_id`, `total_amount`, `payment_status`, etc.
- **Fix:** Implement an allowlist of order fields that can be updated through this method.

### S-07 | Unbounded Memory Growth in Rate Limiter (DoS)
- **File:** `backend/app/middleware/rate_limit.py:11,26-32`
- **Priority:** HIGH
- **Description:** `self.requests = defaultdict(list)` is an in-memory store that grows unboundedly. A DDoS with millions of unique IPs fills memory with no upper bound. The cleanup only runs during request processing.
- **Fix:** Use Redis with TTL-based key expiration for rate limiting. Add a maximum size limit to the in-memory dict.

### S-08 | 2FA Temporary Token Is a Full Access Token
- **File:** `backend/app/services/business_logic.py:100`
- **Priority:** HIGH
- **Description:** When 2FA is required during login, a full access token is created as a "temp" token. If this is the same JWT as a normal session, a user could skip 2FA entirely by using this token.
- **Fix:** Create a separate short-lived, restricted token type (e.g., `type: "2fa_pending"`) that only allows 2FA verification endpoints.

### S-09 | Admin Can Delete Self / Last Admin
- **File:** `backend/app/api/routes/admin_endpoints.py:178-199`
- **Priority:** HIGH
- **Description:** No check prevents an admin from deleting their own account or the last admin user. This could lock the system permanently.
- **Fix:** Add validation: reject if `user_id == current_user.id`, and check if user is the last admin before deletion.

### S-10 | Admin Can Elevate Any User to Admin
- **File:** `backend/app/api/routes/admin_endpoints.py:126-149`
- **Priority:** HIGH
- **Description:** `PATCH /users/{user_id}` lets any admin change any user's role, including promoting a regular user to admin. No confirmation or audit trail.
- **Fix:** Require super-admin role for role changes. Add confirmation dialog. Log role changes.

### S-11 | Guest Checkout Has No Rate Limiting
- **File:** `backend/app/api/routes/checkout_endpoints.py:74-117`
- **Priority:** HIGH
- **Description:** `POST /checkout/guest` requires no authentication and has no rate limiting. This is the most abuse-prone endpoint: credit card fraud, spam orders, inventory manipulation.
- **Fix:** Add per-IP and per-email rate limiting. Consider requiring CAPTCHA for guest checkout.

### S-12 | Backup Codes Use SHA-256 Instead of bcrypt
- **File:** `backend/app/services/business_logic.py:120-130`
- **Priority:** HIGH
- **Description:** 2FA backup codes are hashed with SHA-256, which is too fast for brute-force attacks. Backup codes should use bcrypt or argon2.
- **Fix:** Use `passlib` with bcrypt for backup code hashing, same as passwords.

---

<a id="2-race-conditions"></a>
## 2. Race Conditions & Data Integrity

### R-01 | Stock Decrement Race — Overselling Products
- **File:** `backend/app/repositories/catalog_repository.py:1343-1363`
- **File:** `backend/app/services/order_service.py:148-266`
- **Priority:** CRITICAL
- **Description:** Stock is validated at one point and decremented at another without row-level locking (`SELECT ... FOR UPDATE`). Two concurrent orders for the last item can both succeed, overselling the product.
- **Fix:** Use `SELECT ... FOR UPDATE` or `SELECT ... FOR UPDATE NOWAIT` when reading stock. Wrap stock validation + decrement in a single atomic transaction.

### R-02 | Loyalty Points Double-Spend
- **File:** `backend/app/repositories/catalog_repository.py:150-191`
- **Priority:** CRITICAL
- **Description:** `LoyaltyRepository.redeem_points` reads `loyalty.points_balance`, checks sufficiency, subtracts, and writes back — all without locking. Two concurrent redemptions can both read the same balance and both succeed.
- **Fix:** Use `UPDATE ... SET points_balance = points_balance - :points WHERE points_balance >= :points RETURNING points_balance` for atomic redemption.

### R-03 | Coupon Usage Double-Count
- **File:** `backend/app/services/order_service.py:270-273,416-419`
- **File:** `backend/app/repositories/promotion_repository.py:62-64`
- **Priority:** HIGH
- **Description:** `increment_usage()` reads `used_count`, increments in Python, writes back. Concurrent uses can lose increments, allowing coupon overuse beyond `max_uses`.
- **Fix:** Use atomic `UPDATE coupons SET used_count = used_count + 1 WHERE id = :id AND used_count < COALESCE(max_uses, 999999) RETURNING used_count`.

### R-04 | Cart Duplication Race
- **File:** `backend/app/repositories/cart_repository.py:16-23`
- **Priority:** HIGH
- **Description:** `get_or_create()` — two concurrent requests for the same user can both find no cart and both attempt to create one, causing IntegrityError or duplicate carts.
- **Fix:** Use `INSERT ... ON CONFLICT DO NOTHING` with a unique constraint on `user_id`, then fetch the existing cart.

### R-05 | Inventory Record Duplication
- **File:** `backend/app/repositories/inventory_repository.py:100-116`
- **Priority:** HIGH
- **Description:** `get_or_create()` for warehouse inventory — two concurrent calls for the same product+warehouse can both find nothing and both insert.
- **Fix:** Use `INSERT ... ON CONFLICT DO NOTHING` with the unique constraint.

### R-06 | Review Helpful Count Lost Update
- **File:** `backend/app/repositories/catalog_repository.py:629-652`
- **Priority:** MEDIUM
- **Description:** `toggle_helpful` reads `review.helpful_count`, modifies in Python, then writes back. Concurrent clicks lose increments.
- **Fix:** Use atomic `UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = :id`.

### R-07 | Newsletter/Blog View Count Lost Updates
- **File:** `backend/app/repositories/customer_support_repository.py:161-163`
- **Priority:** LOW
- **Description:** `increment_view_count` reads `article.view_count`, adds 1 in Python, writes back. Concurrent views lose increments.
- **Fix:** Use atomic SQL `UPDATE ... SET view_count = view_count + 1`.

### R-08 | Popular Search Count Race
- **File:** `backend/app/repositories/catalog_repository.py:771-782`
- **Priority:** LOW
- **Description:** `add_popular_search` — read-then-insert is not atomic. Two concurrent identical searches can both find no existing row and both insert duplicates.
- **Fix:** Use `INSERT ... ON CONFLICT (query) DO UPDATE SET count = count + 1`.

---

<a id="3-backend-core"></a>
## 3. Backend - Core & Config

### C-01 | Database Connection Pool Misconfigured for Production
- **File:** `backend/app/database/session.py:6`
- **Priority:** MEDIUM
- **Description:** `pool_size=5, max_overflow=10` is too small for production. Also missing `pool_recycle` for MySQL/MariaDB connections.
- **Fix:** Increase pool size for production (e.g., 20 connections). Add `pool_recycle=3600` if using MySQL.

### C-02 | No CORS Validation for Production
- **File:** `backend/app/core/config.py:28`
- **Priority:** MEDIUM
- **Description:** `CORS_ORIGINS` defaults to `["http://localhost:5173"]`. If `.env` is not set properly, production could allow localhost origins.
- **Fix:** Make CORS_ORIGINS required (no default) or add a check that localhost origins are not allowed in production.

### C-03 | Settings Singleton Loaded at Import Time
- **File:** `backend/app/core/config.py:38`
- **Priority:** LOW
- **Description:** `settings = Settings()` is created at module import time. If `.env` is missing or malformed, the error occurs at import rather than at startup, making debugging harder.
- **Fix:** Use `lru_cache` for settings initialization or initialize in the FastAPI startup event.

---

<a id="4-backend-services"></a>
## 4. Backend - Services

### SV-01 | Email Verification Codes Stored in Plaintext
- **File:** `backend/app/services/business_logic.py:214-216`
- **Priority:** HIGH
- **Description:** `verify_email()` compares both plaintext `code` and `code_hash`. This means the code is stored in plaintext in the DB — if an attacker gets DB access, they have the raw verification codes.
- **Fix:** Only store the hash. Compare hashes using constant-time comparison.

### SV-02 | Race Condition in Registration Email Uniqueness
- **File:** `backend/app/services/business_logic.py:52-67`
- **Priority:** HIGH
- **Description:** Email uniqueness check and `create()` are not atomic. Two concurrent registrations with the same email can both pass the check.
- **Fix:** Add a unique constraint on the `email` column (already have one, but for deleted users) and catch `IntegrityError`. The existing partial unique index (`ix_users_email_active`) may not be sufficient.

### SV-03 | No Password Strength Validation
- **File:** `backend/app/services/business_logic.py:260,279`
- **Priority:** MEDIUM
- **Description:** `reset_password()` and `change_password()` don't validate password strength beyond length. No complexity requirements.
- **Fix:** Add password strength validation: minimum length, uppercase, lowercase, digit, and special character requirements.

### SV-04 | Social Login Accepts Any Provider
- **File:** `backend/app/services/business_logic.py:377`
- **Priority:** MEDIUM
- **Description:** `social_login()` doesn't validate `provider` against a whitelist. Any string is accepted as a provider.
- **Fix:** Whitelist allowed providers: `if provider not in ("google",)`.

### SV-05 | N+1 Query in Cart Serialization
- **File:** `backend/app/services/cart_service.py:34`
- **Priority:** MEDIUM
- **Description:** `_serialize_cart_item()` queries Product for every cart item individually. A cart with 20 items = 20 extra queries.
- **Fix:** Pre-fetch all products in a single query and pass a product dict to the serializer.

### SV-06 | Category Product Count Triggers Lazy Loading
- **File:** `backend/app/services/category_service.py:28,48,77,101`
- **Priority:** MEDIUM
- **Description:** `len(category.products)` triggers lazy loading of all products just to count them. For categories with many products, this loads everything into memory.
- **Fix:** Use `func.count()` in a separate query or add a `product_count` column to the Category model.

### SV-07 | Broadcast Notification Creates Notifications One-by-One
- **File:** `backend/app/services/notification_service.py:156-172`
- **Priority:** MEDIUM
- **Description:** `broadcast_notification()` creates notifications one-by-one in a loop with individual `db.add()`. For thousands of users this is very slow.
- **Fix:** Use `bulk_insert_mappings()` or `insert().values()` for batch inserts.

### SV-08 | Template Injection Risk in Notifications
- **File:** `backend/app/services/notification_service.py:222-226`
- **Priority:** MEDIUM
- **Description:** `_interpolate_template()` inserts context values directly without HTML escaping. A malicious context value could inject HTML/script.
- **Fix:** Use `html.escape()` on all interpolated values.

### SV-09 | Hardcoded 60% Cost Ratio in Reports
- **File:** `backend/app/repositories/report_repository.py:346`
- **Priority:** MEDIUM
- **Description:** `total_costs = float(total_revenue) * 0.6` — cost ratio is hardcoded to 60%. This should be configurable.
- **Fix:** Store cost ratio in `store_settings` or compute actual COGS from inventory data.

### SV-10 | Missing Transaction Boundaries
- **File:** Multiple services (order_service, cart_service, promotion_service)
- **Priority:** HIGH
- **Description:** Most services don't use explicit transactions. If a multi-step operation fails midway (e.g., create order + decrement stock + clear cart), the DB is left in an inconsistent state.
- **Fix:** Wrap multi-step operations in explicit `db.begin_nested()` (savepoint) or `db.commit()` blocks. Use `try/except/finally` with rollback.

### SV-11 | Customer Support setattr Allows Arbitrary Field Modification
- **File:** `backend/app/services/customer_support_service.py:63-68,118-124,182-195`
- **Priority:** HIGH
- **Description:** `update_contact_message()`, `update_faq_item()`, and `update_help_article()` all use `setattr(obj, key, value)` on arbitrary input without allowlisting fields.
- **Fix:** Define explicit field allowlists for each update method.

### SV-12 | Order Number Generated with `random.choices`
- **File:** `backend/app/services/order_service.py:469-473`
- **Priority:** MEDIUM
- **Description:** `_generate_order_number()` uses `random.choices` (not `secrets`), which is not cryptographically secure. Order numbers could be predictable.
- **Fix:** Use `secrets.token_hex()` or ensure the UUID-based approach is used. Order numbers don't strictly need cryptographic randomness, but predictability enables enumeration.

### SV-13 | Search Results Lose Product Results When Categories Found
- **File:** `backend/app/services/search_service.py:80-85`
- **Priority:** MEDIUM
- **Description:** When products are found (total > 0), categories are never searched. But when products are 0, categories replace results entirely — all product results are lost.
- **Fix:** Search both products and categories, then combine results.

### SV-14 | Homepage Makes 9 Separate DB Calls
- **File:** `backend/app/services/homepage_service.py:30-55`
- **Priority:** MEDIUM
- **Description:** `get_homepage_data()` makes 9 separate repository calls. This is the most frequently accessed endpoint.
- **Fix:** Use parallel async queries or cache the response for 5-10 minutes.

---

<a id="5-backend-repositories"></a>
## 5. Backend - Repositories

### RP-01 | Size/Color Filter Uses OR Logic
- **File:** `backend/app/repositories/catalog_repository.py:223-251`
- **Priority:** HIGH
- **Description:** Size and color filters use OR logic — searching for `["M", "L"]` returns products with M OR L, not products that have both. Also, `ilike(f"%{size}%")` is a substring match — searching for "M" also matches "Medium", "XL", "MM".
- **Fix:** Use AND logic for multiple selections. Parse `option_values` JSON for exact matching.

### RP-02 | Full Table Scan for Filter Options
- **File:** `backend/app/repositories/catalog_repository.py:303-335`
- **Priority:** MEDIUM
- **Description:** `get_filter_options` loads ALL `ProductVariant.option_values` into Python, then parses sizes/colors with string splitting. Two full table scans of variants.
- **Fix:** Use SQL aggregation or a materialized view for filter options. Cache the result.

### RP-03 | Cart Item Count Sums in Python
- **File:** `backend/app/repositories/cart_repository.py:89-96`
- **Priority:** LOW
- **Description:** `count_items` loads all `CartItem.quantity` rows into memory and sums in Python.
- **Fix:** Use `func.sum(CartItem.quantity)` in SQL.

### RP-04 | N+1 Queries in Settings Bulk Update
- **File:** `backend/app/repositories/settings_repository.py:66-75`
- **Priority:** MEDIUM
- **Description:** `bulk_update` calls `get_by_key` + `update`/`create` in a loop. For N settings, this is 2N queries.
- **Fix:** Use `bulk_insert_mappings()` or `insert().on_conflict().do_update()`.

### RP-05 | Duplicate Identical Query in Reports
- **File:** `backend/app/repositories/report_repository.py:87-88`
- **Priority:** LOW
- **Description:** `total_products` and `active_products` execute the same query: `self.db.query(Product).filter(Product.is_active).count()`.
- **Fix:** Reuse the result or fix the query for `total_products` to include inactive products.

### RP-06 | User Notifications Loaded Without Pagination
- **File:** `backend/app/repositories/profile_repository.py:202-209`
- **Priority:** MEDIUM
- **Description:** `get_by_user` returns ALL user notifications without pagination. A user with thousands of notifications loads them all.
- **Fix:** Add pagination parameters (limit, offset).

### RP-07 | LIKE Pattern Escaping Incomplete
- **File:** `backend/app/repositories/catalog_repository.py:203-205`
- **Priority:** LOW
- **Description:** `search` escapes `%` and `_` but does NOT escape the escape character (`\`), so a user could inject `\%` to bypass escaping.
- **Fix:** Also escape the escape character: `query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")`.

---

<a id="6-backend-routes"></a>
## 6. Backend - API Routes

### RT-01 | No Rate Limiting on Sensitive Endpoints
- **File:** `backend/app/api/routes/endpoints.py:34,80,154-160`
- **Priority:** CRITICAL
- **Description:** No rate limiting on `/register`, `/login`, `/forgot_password`, or `/verify-email`. Vulnerable to credential stuffing, brute force, and email enumeration.
- **Fix:** Add per-IP rate limiting dependencies on auth endpoints. Use stricter limits on login (e.g., 5 attempts/minute).

### RT-02 | Silent Exception Swallowing on Logout
- **File:** `backend/app/api/routes/endpoints.py:120-121`
- **Priority:** HIGH
- **Description:** `except Exception` block returns a fake success message on logout, meaning token revocation can fail silently. The token remains valid.
- **Fix:** Log the exception and still return success to the user (for UX), but alert monitoring.

### RT-03 | Email Verification Endpoint Leaks User Existence
- **File:** `backend/app/api/routes/endpoints.py:154-160`
- **Priority:** MEDIUM
- **Description:** `/auth/verification-status` accepts an arbitrary email and reveals whether it's registered. This enables user enumeration.
- **Fix:** Only allow checking status for the currently authenticated user's email.

### RT-04 | Sort Parameter Could Be SQL Injection Vector
- **File:** `backend/app/api/routes/homepage_endpoints.py:67`
- **Priority:** HIGH
- **Description:** `sort: str = Query(None)` is an unsanitized string passed to the service. If used in `order_by()`, it could be a SQL injection vector.
- **Fix:** Whitelist allowed sort values at the route level: `sort: Optional[str] = Query(None, pattern="^(price_asc|price_desc|newest|rating)$")`.

### RT-05 | Order Tracking Has No Authentication
- **File:** `backend/app/api/routes/checkout_endpoints.py:159-176`
- **Priority:** MEDIUM
- **Description:** `/orders/track` accepts email + order number without authentication. If order numbers are predictable, anyone can view tracking details.
- **Fix:** Consider adding CAPTCHA or rate limiting. Validate email matches the order's email.

### RT-06 | Product Search Endpoint Has No Rate Limiting
- **File:** `backend/app/api/routes/homepage_endpoints.py:60-154`
- **Priority:** MEDIUM
- **Description:** Full-text search is expensive and unauthenticated with no rate limiting.
- **Fix:** Add rate limiting and consider requiring authentication for search.

### RT-07 | No Input Size Limits on Bulk Operations
- **File:** `backend/app/api/routes/admin_endpoints.py:417-434`
- **File:** `backend/app/api/routes/inventory_endpoints.py:194-214`
- **Priority:** MEDIUM
- **Description:** `AdminProductImportRequest` and `InventoryBulkAdjustRequest` accept lists with no max length. A malicious admin could submit thousands of items.
- **Fix:** Add `max_length` constraint on the list: `products: list[AdminProductImportRow] = Field(max_length=1000)`.

### RT-08 | Generic `except Exception` Hides Real Errors
- **File:** All route files
- **Priority:** HIGH
- **Description:** Nearly every endpoint catches `Exception` and returns a generic 500. Stack traces are lost, making debugging nearly impossible.
- **Fix:** At minimum, log the exception with `logger.exception()`. Consider using FastAPI's exception handlers.

### RT-09 | Settings Update Accepts Any JSON Value
- **File:** `backend/app/api/routes/admin_settings_endpoints.py:19-20`
- **Priority:** HIGH
- **Description:** `SettingUpdateRequest.value: Any` accepts any JSON value with zero validation. An admin could write arbitrary payloads to the settings table.
- **Fix:** Validate setting values per key. Use typed setting models.

### RT-10 | Broadcast Notifications Have No Confirmation
- **File:** `backend/app/api/routes/admin_notification_endpoints.py:246-263`
- **Priority:** MEDIUM
- **Description:** `POST /notifications/broadcast` sends to all users with no confirmation step. An admin could accidentally broadcast to millions.
- **Fix:** Require a confirmation token or implement a two-step broadcast process.

### RT-11 | No Idempotency Key for Order Placement
- **File:** `backend/app/api/routes/checkout_endpoints.py:27-71`
- **Priority:** MEDIUM
- **Description:** Duplicate requests could create duplicate orders. No idempotency key mechanism.
- **Fix:** Accept an `Idempotency-Key` header and store processed keys.

### RT-12 | Newsletter Subscribe Has No Rate Limiting
- **File:** `backend/app/api/routes/homepage_endpoints.py:178-194`
- **Priority:** LOW
- **Description:** Can be spammed with different emails, potentially causing email bombs.
- **Fix:** Add per-IP rate limiting on the subscribe endpoint.

### RT-13 | Contact Form Has No Rate Limiting
- **File:** `backend/app/api/routes/customer_support_endpoints.py:17-33`
- **Priority:** MEDIUM
- **Description:** Anyone (no auth required) can spam the contact form.
- **Fix:** Add per-IP and per-email rate limiting.

### RT-14 | Marketing Dashboard Runs 7 Aggregate Queries
- **File:** `backend/app/api/routes/marketing_endpoints.py:594-631`
- **Priority:** MEDIUM
- **Description:** Each dashboard request hits the DB 7+ times with no caching.
- **Fix:** Cache the dashboard response for 5 minutes or use a single composite query.

### RT-15 | CSV Export Loads All Products Into Memory
- **File:** `backend/app/api/routes/admin_endpoints.py:437-488`
- **Priority:** MEDIUM
- **Description:** Export builds a `StringIO` buffer in memory with all matching products. For large catalogs, this causes OOM.
- **Fix:** Stream the CSV response using `StreamingResponse`.

### RT-16 | Cart Endpoints Missing Error Handling
- **File:** `backend/app/api/routes/cart_endpoints.py:25-31,86-92`
- **Priority:** MEDIUM
- **Description:** `GET /cart` and `DELETE /cart` have no try/except. Raw exceptions propagate as 500.
- **Fix:** Add consistent error handling like other endpoints.

---

<a id="7-backend-middleware"></a>
## 7. Backend - Middleware

### MW-01 | Cache Middleware Uses MD5 for ETags
- **File:** `backend/app/middleware/cache.py:44`
- **Priority:** LOW
- **Description:** ETag uses MD5, which is deprecated. Some security scanners flag this.
- **Fix:** Use SHA-256 truncated to 16 bytes.

### MW-02 | Stale ETag Based on 5-Minute Windows
- **File:** `backend/app/middleware/cache.py:43`
- **Priority:** LOW
- **Description:** ETag is based on `int(time.time() / 300)`. The ETag may not match actual content if data changed within the window.
- **Fix:** Base ETag on actual response content hash.

### MW-03 | Missing Vary Header
- **File:** `backend/app/middleware/cache.py:38-49`
- **Priority:** LOW
- **Description:** The middleware never sets `Vary: Accept-Encoding`. Downstream proxies may serve compressed responses to clients that don't support them.
- **Fix:** Add `Vary: Accept-Encoding` header.

### MW-04 | CDN Middleware Buffers Full Response in Memory
- **File:** `backend/app/middleware/cdn.py:48-53`
- **Priority:** MEDIUM
- **Description:** The entire response body is read into memory to parse and rewrite URLs. For large JSON responses, this is problematic.
- **Fix:** Only rewrite URLs for known content types (e.g., `text/html`). Stream other content.

### MW-05 | Compression Middleware Buffers Full Response
- **File:** `backend/app/middleware/compression.py:55-60`
- **Priority:** MEDIUM
- **Description:** The entire response body is buffered into memory before compression. This defeats `StreamingResponse` and can cause OOM.
- **Fix:** Use streaming compression for large responses.

### MW-06 | Compression Exceptions Silently Swallowed
- **File:** `backend/app/middleware/compression.py:78-79,85-86`
- **Priority:** LOW
- **Description:** Compression exceptions are silently swallowed. If compression fails, the uncompressed response is returned with no logging.
- **Fix:** Log compression failures.

### MW-07 | Rate Limiter O(K) Cleanup Per Request
- **File:** `backend/app/middleware/rate_limit.py:30`
- **Priority:** MEDIUM
- **Description:** `max(v)` is called for every key in `self.requests` on every request. For K active keys, this is O(K) per request.
- **Fix:** Use a more efficient data structure (e.g., sorted timestamps with binary search, or Redis TTL).

### MW-08 | Rate Limiter Missing Standard Headers
- **File:** `backend/app/middleware/rate_limit.py:35-38`
- **Priority:** LOW
- **Description:** The 429 response doesn't include `Retry-After` or `X-RateLimit-Remaining` headers.
- **Fix:** Add standard rate limiting response headers.

### MW-09 | Rate Limiter Window Is Hardcoded
- **File:** `backend/app/middleware/rate_limit.py:24`
- **Priority:** LOW
- **Description:** `window = 60` is hardcoded but `requests_per_minute` is configurable. The window should derive from the rate limit configuration.
- **Fix:** Set `window = 60` to match `requests_per_minute` or make it configurable.

---

<a id="8-frontend-core"></a>
## 8. Frontend - Core & Auth

### FC-01 | Hard Redirect on Auth Failure Destroys React State
- **File:** `frontend/src/services/api/client.js:71`
- **Priority:** HIGH
- **Description:** `window.location.href = '/login'` does a full page reload, destroying all React state. Should use router navigation.
- **Fix:** Export a `navigate` function from the router and use it instead of `window.location.href`.

### FC-02 | User Object Stored in localStorage
- **File:** `frontend/src/context/AuthContext.jsx:8-9,80-82`
- **Priority:** HIGH
- **Description:** Full user object (email, role, personal info) is stored in `localStorage` via `JSON.stringify`. This is not encryption.
- **Fix:** Store only the minimum needed (user ID, role). Fetch full user data from API when needed.

### FC-03 | No AbortController in Auth Validation
- **File:** `frontend/src/context/AuthContext.jsx:28-57`
- **Priority:** MEDIUM
- **Description:** No `AbortController` in `useEffect` — if the component unmounts while `validateToken` is in flight, it sets state on an unmounted component.
- **Fix:** Create an `AbortController` in the effect and pass `signal` to the fetch call.

### FC-04 | isAuthenticated Desync with Token
- **File:** `frontend/src/context/AuthContext.jsx:119`
- **Priority:** MEDIUM
- **Description:** `isAuthenticated: !!user` — if `user` is set to `null` (failed validation), `isAuthenticated` becomes `false`, but the token might still be valid in `localStorage`. Creates a desync.
- **Fix:** Base `isAuthenticated` on token existence, not user state.

---

<a id="9-frontend-pages"></a>
## 9. Frontend - Pages

### P-01 | CVV Stored in React State
- **File:** `frontend/src/pages/CheckoutPage.jsx:60-65`
- **Priority:** CRITICAL
- **Description:** Full CVV is stored in React state (`cardDetails.cvv`). CVV should never be stored, even temporarily. This violates PCI-DSS.
- **Fix:** Never store CVV. Use Stripe Elements or similar that handle CVV in an iframe.

### P-02 | Card Data Sent to Backend
- **File:** `frontend/src/pages/CheckoutPage.jsx:287-297`
- **Priority:** CRITICAL
- **Description:** Raw card number, CVV, and expiry are sent to the backend in the order request. (Duplicate of S-01.)
- **Fix:** Use Stripe.js/Elements for client-side tokenization.

### P-03 | Card Validation Only Checks Length
- **File:** `frontend/src/pages/CheckoutPage.jsx:236-248`
- **Priority:** MEDIUM
- **Description:** Card validation only checks length. No Luhn check, no expiry validation, no card type detection.
- **Fix:** Implement Luhn algorithm check. Validate expiry is in the future.

### P-04 | Side Effect in Render — navigate During Render
- **File:** `frontend/src/pages/ProfilePage.jsx:45-48`
- **Priority:** MEDIUM
- **Description:** `navigate('/login')` is called during the render body. Navigation should be in a `useEffect`.
- **Fix:** Move the redirect logic into a `useEffect` with `isAuthenticated` as dependency.

### P-05 | Missing AbortController in ProductDetailPage
- **File:** `frontend/src/pages/ProductDetailPage.jsx:34-56`
- **Priority:** MEDIUM
- **Description:** No `AbortController` — if the user navigates away while the product is loading, `setData` is called on an unmounted component.
- **Fix:** Add AbortController with cleanup in useEffect.

### P-06 | setTimeout Not Cleaned Up on Unmount
- **File:** `frontend/src/pages/ProductDetailPage.jsx:106`
- **Priority:** LOW
- **Description:** `setTimeout(() => setAddedToCart(false), 2000)` is not cleared on unmount.
- **Fix:** Store timeout ID in a ref and clear it in the useEffect cleanup.

### P-07 | Silent Error on Add-to-Cart
- **File:** `frontend/src/pages/ProductDetailPage.jsx:107`
- **Priority:** LOW
- **Description:** The catch block does nothing, leaving the user without feedback if adding to cart fails.
- **Fix:** Show an error toast or message.

### P-08 | Admin Self-Block Risk
- **File:** `frontend/src/pages/admin/AdminUserDetailPage.jsx:78-91`
- **Priority:** HIGH
- **Description:** Admin can disable/block their own account, which would lock them out.
- **Fix:** Add a check to prevent self-modification of active status.

### P-09 | Admin Role Escalation Without Confirmation
- **File:** `frontend/src/pages/admin/AdminUserDetailPage.jsx:237-248`
- **Priority:** MEDIUM
- **Description:** Admin can change any user to admin without a confirmation dialog.
- **Fix:** Add confirmation modal for role changes, especially elevation to admin.

### P-10 | Admin Settings Silent JSON Parse Failure
- **File:** `frontend/src/pages/admin/AdminSettingsPage.jsx:166-169`
- **Priority:** LOW
- **Description:** If the user enters invalid JSON in the textarea, the error is silently swallowed.
- **Fix:** Show an error message when JSON is invalid.

---

<a id="10-frontend-components"></a>
## 10. Frontend - Components

### CM-01 | XSS Risk in Admin Print Function
- **File:** `frontend/src/components/admin/AdminOrderDetail.jsx:124-172`
- **Priority:** HIGH
- **Description:** `document.write` with template literals inside print functions. Although `escapeHtml` is used, the function is defined locally and not audited for completeness.
- **Fix:** Extract `escapeHtml` to a utility module. Audit for completeness. Consider using DOMPurify.

### CM-02 | Product Card Images Null Handling
- **File:** `frontend/src/components/common/ProductCard.jsx:23`
- **Priority:** MEDIUM
- **Description:** `product.images.split(',')` throws if `product.images` is null. The `typeof` check handles `string` but not `null`.
- **Fix:** Add null check: `product.images?.split(',') || []`.

### CM-03 | Product Card Not Wrapped in Link
- **File:** `frontend/src/components/common/ProductCard.jsx:74-157`
- **Priority:** LOW
- **Description:** Card has no navigation to the product detail page. No `<a>` or `<Link>` wrapping.
- **Fix:** Wrap the card in a `<Link to={`/products/${product.slug}`}>`.

### CM-04 | SearchBar Debounce Memory Leak
- **File:** `frontend/src/components/common/SearchBar.jsx:100-112`
- **Priority:** LOW
- **Description:** If the component unmounts during the debounce delay, the callback fires after unmount.
- **Fix:** Clear the timeout in the cleanup function.

### CM-05 | SearchBar Parses Untrusted localStorage
- **File:** `frontend/src/components/common/SearchBar.jsx:55-56,88-89`
- **Priority:** LOW
- **Description:** `JSON.parse(localStorage.getItem('search_history'))` — if another script injects malicious JSON, this parses it.
- **Fix:** Validate the parsed data structure.

### CM-06 | Admin Product Form Missing Client Validation
- **File:** `frontend/src/components/admin/AdminProductForm.jsx:82-107`
- **Priority:** LOW
- **Description:** No client-side price validation — `discount_price` can be higher than `price`, or negative.
- **Fix:** Add client-side validation before submission.

### CM-07 | Order Detail Status Transition Not Validated
- **File:** `frontend/src/components/admin/AdminOrderDetail.jsx:65-84`
- **Priority:** MEDIUM
- **Description:** Can set status from any state to any state (e.g., `delivered` → `pending`).
- **Fix:** Validate allowed status transitions on both frontend and backend.

### CM-08 | ErrorBoundary Only Logs to Console
- **File:** `frontend/src/components/common/ErrorBoundary.jsx:14-16`
- **Priority:** LOW
- **Description:** `console.error` only. In production, errors should be sent to an error reporting service.
- **Fix:** Integrate Sentry, LogRocket, or similar.

---

<a id="11-frontend-context"></a>
## 11. Frontend - Context Providers

### CX-01 | Cart Context Missing Auth Checks
- **File:** `frontend/src/context/CartContext.jsx:115-126,128-139,156-167,184-195,197-209,239-250`
- **Priority:** HIGH
- **Description:** `removeFromCart`, `clearCart`, `removeCoupon`, `removeGiftCard`, `setShippingMethod`, `removeSavedItem` don't check `isAuthenticated`. They may make unauthenticated API calls or silently fail.
- **Fix:** Add consistent auth guards to all cart methods.

### CX-02 | Stale Closure in useCallback Dependencies
- **File:** `frontend/src/context/CartContext.jsx:98-113`
- **File:** `frontend/src/context/WishlistContext.jsx:76,94,111,129`
- **Priority:** MEDIUM
- **Description:** Multiple `useCallback` hooks are missing `isAuthenticated` in their dependency arrays. The functions capture an old `isAuthenticated` value.
- **Fix:** Add `isAuthenticated` to the dependency arrays.

### CX-03 | Wishlist Context Inconsistent Return Values
- **File:** `frontend/src/context/WishlistContext.jsx:36-58`
- **Priority:** LOW
- **Description:** `addToWishlist` returns `{ success: true }` or `{ success: false, message }` but can also throw an error, creating inconsistent error handling.
- **Fix:** Always return a consistent result object. Never throw from context methods.

### CX-04 | Notification Context Stale Closure
- **File:** `frontend/src/context/NotificationContext.jsx:45-57`
- **Priority:** LOW
- **Description:** `markAsRead` captures `notifications` in closure. The `notifications.find()` call uses a stale snapshot.
- **Fix:** Use functional state update: `setNotifications(prev => prev.map(...))`.

---

<a id="12-frontend-services"></a>
## 12. Frontend - Services & Hooks

### SH-01 | useInfiniteScroll Stale Page Closure
- **File:** `frontend/src/hooks/useInfiniteScroll.js:14-23`
- **Priority:** MEDIUM
- **Description:** `loadMore` depends on `page` — when called from IntersectionObserver, it may use a stale `page` value.
- **Fix:** Use a ref for the page value inside the observer callback.

### SH-02 | useInfiniteScroll Missing Error Handling
- **File:** `frontend/src/hooks/useInfiniteScroll.js:14-22`
- **Priority:** LOW
- **Description:** `fetchMore` error is caught but no error state is surfaced to the caller.
- **Fix:** Expose an `error` state from the hook.

### SH-03 | format.js Hardcoded USD Currency
- **File:** `frontend/src/utils/format.js:1-2`
- **Priority:** LOW
- **Description:** Always formats as USD. No support for multi-currency.
- **Fix:** Accept a currency parameter or read from settings.

### SH-04 | format.js NaN Handling
- **File:** `frontend/src/utils/format.js:2`
- **Priority:** LOW
- **Description:** `price ?? 0` handles `null`/`undefined`, but `NaN` formats as "$NaN".
- **Fix:** Add `isNaN(price)` check: `(isNaN(price) || price == null) ? '$0.00' : ...`.

### SH-05 | Missing Route-Level Error Boundaries
- **File:** `frontend/src/routes/index.jsx:117-176`
- **Priority:** MEDIUM
- **Description:** All lazy-loaded routes share one `Suspense` boundary. No per-route error boundaries. If a route throws, the entire app crashes.
- **Fix:** Wrap each route in its own `ErrorBoundary` with specific fallbacks.

### SH-06 | Single Suspense for All Lazy Routes
- **File:** `frontend/src/routes/index.jsx:117-176`
- **Priority:** LOW
- **Description:** If a slow component loads, everything shows the same loader.
- **Fix:** Use per-route `Suspense` with route-specific fallbacks.

---

<a id="13-cross-cutting"></a>
## 13. Cross-Cutting Issues

### X-01 | No Structured Logging Anywhere
- **File:** All backend files
- **Priority:** HIGH
- **Description:** Most services and routes use `print()` or no logging at all. No structured logging (JSON format), no correlation IDs, no request tracing.
- **Fix:** Add structured logging with `structlog` or `python-json-logger`. Include request ID middleware.

### X-02 | No Request ID / Audit Trail for Admin Actions
- **File:** All admin route files
- **Priority:** HIGH
- **Description:** Admin actions (delete user, refund order, adjust stock, change settings) have no request correlation ID for tracing or auditing.
- **Fix:** Add request ID middleware. Log all admin actions with user ID, action, and affected resource.

### X-03 | Inconsistent Error Handling Patterns
- **File:** All backend files
- **Priority:** MEDIUM
- **Description:** Some services raise `ValueError`, some return dicts, some return `None`. Some endpoints catch `ValueError + Exception`, some only `Exception`, some have no try/except. No standardized error response format.
- **Fix:** Define a standard error response format. Use FastAPI exception handlers for consistent responses.

### X-04 | No CSRF Protection
- **File:** `backend/app/main.py`, frontend forms
- **Priority:** MEDIUM
- **Description:** No CSRF middleware or token mechanism. While cookie-based auth would mitigate this, the current localStorage approach has other issues.
- **Fix:** Add `Starlette-CSRF` middleware or implement double-submit cookie pattern.

### X-05 | Inconsistent API Response Formats
- **File:** Multiple route files
- **Priority:** LOW
- **Description:** Some endpoints return `{ success, message, data }`, others return `{ success, message, data, pagination }`, and some return raw data.
- **Fix:** Standardize all responses to use the `SuccessResponse` envelope with consistent pagination format.

### X-06 | No `.env.example` File
- **File:** Project root
- **Priority:** LOW
- **Description:** No `.env.example` to document required environment variables. New developers must inspect `config.py` to know what's needed.
- **Fix:** Create `.env.example` with all required variables and descriptions.

### X-07 | Root `pyproject.toml` Has No Dependencies
- **File:** `pyproject.toml:7`
- **Priority:** LOW
- **Description:** The root `pyproject.toml` has `dependencies = []`. All dependencies are in `backend/pyproject.toml`. This is confusing.
- **Fix:** Either move dependencies to root or remove the root `pyproject.toml`.

### X-08 | `graphify-out/` Not in `.gitignore`
- **File:** `.gitignore`
- **Priority:** LOW
- **Description:** The `graphify-out/` directory is not listed in `.gitignore`. Generated graph files could be committed.
- **Fix:** Add `graphify-out/` to `.gitignore`.

### X-09 | `skills-lock.json` Not in `.gitignore`
- **File:** `.gitignore`
- **Priority:** LOW
- **Description:** `skills-lock.json` is listed in `.gitignore` but was found in the project root. Verify it's actually being ignored.
- **Fix:** Confirm `.gitignore` is working correctly.

### X-10 | No Input Sanitization Across Services
- **File:** All service files
- **Priority:** MEDIUM
- **Description:** User-supplied strings (names, emails, addresses) are stored without sanitization. Could contain XSS payloads that render in admin panels or emails.
- **Fix:** Sanitize all user input before storage. Use a library like `bleach` for HTML content.

### X-11 | No Database Indexes on Frequently Queried Foreign Keys
- **File:** `backend/app/models/database_models.py`
- **Priority:** MEDIUM
- **Description:** Several foreign key columns lack explicit indexes (e.g., `cart_items.cart_id`, `order_items.product_id` has one but `wishlist_items.product_id` doesn't). This can cause slow queries at scale.
- **Fix:** Audit all foreign key columns and add indexes for frequently queried ones.

### X-12 | Missing Soft Delete Consistency
- **File:** `backend/app/services/order_service.py:149` vs `backend/app/services/cart_service.py:56`
- **Priority:** MEDIUM
- **Description:** `cart_service.py` checks `product.deleted_at`, but `order_service.py` does not check `deleted_at` on products. Inconsistent soft delete handling.
- **Fix:** Ensure all product lookups filter by `deleted_at IS NULL`.

---

<a id="14-summary"></a>
## 14. Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 4 | 6 | 1 | 0 | 11 |
| Race Conditions | 2 | 4 | 2 | 3 | 11 |
| Backend Core | 0 | 0 | 2 | 1 | 3 |
| Backend Services | 0 | 2 | 9 | 0 | 11 |
| Backend Repositories | 0 | 1 | 3 | 3 | 7 |
| Backend Routes | 1 | 3 | 10 | 2 | 16 |
| Backend Middleware | 0 | 0 | 3 | 6 | 9 |
| Frontend Core | 0 | 2 | 2 | 0 | 4 |
| Frontend Pages | 2 | 1 | 4 | 3 | 10 |
| Frontend Components | 0 | 1 | 2 | 5 | 8 |
| Frontend Context | 0 | 1 | 2 | 2 | 5 |
| Frontend Services/Hooks | 0 | 0 | 2 | 4 | 6 |
| Cross-Cutting | 0 | 2 | 5 | 5 | 12 |
| **TOTAL** | **9** | **23** | **45** | **34** | **111** |

### Top 5 Most Urgent Fixes

1. **PCI-DSS Violation** (S-01, P-01, P-02) — Integrate Stripe.js immediately. Raw card data must never touch your server or frontend state.
2. **Stock Overselling Race Condition** (R-01) — Add row-level locking on all stock operations. This directly causes financial loss.
3. **Auth Tokens in localStorage** (S-02) — Migrate to httpOnly cookies. Any XSS attack steals all user sessions.
4. **Rate Limiter Bypass** (S-04) — Fix IP spoofing vulnerability. Currently all rate limiting is ineffective.
5. **Arbitrary Field Updates** (S-05, S-06) — Implement allowlists for all update operations. Currently any user/admin can modify any field on any object.
