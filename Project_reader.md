# Project_reader.md

> **Before read and follow:

prompts/
PROJECT_RULES.md
BACKEND.md
FRONTEND.md
UI_DESIGN.md
DATABASE.md
API_GUIDELINES.md
SECURITY.md
CODING_STYLE.md

Then analyze the existing project structure and implement the feature according to these rules.**

> **Do not read the entire project again. Only inspect files directly related to
the requested feature. After features implementation, update this file according
to the changes, modified files, and newly added files.**

---

## 1. Project Overview

**E-Commerce Platform** — a full-stack web application with:

- **Backend**: Python + FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS + JavaScript
- **Database**: PostgreSQL with Alembic migrations

---

## 2. Root Structure

```
E-Commerce Platform/
├── .agents/                    # Agent skills and configurations
├── backend/                    # FastAPI backend
├── frontend/                   # React + Vite frontend
├── prompts/                    # Project rule documents
├── reports/                    # Generated reports
├── main.py                     # Root entry (placeholder)
├── pyproject.toml              # Root Python config (minimal)
├── skills-lock.json            # Skills lock file
└── Project_reader.md           # This file
```

---

## 3. Technology Stack

### Backend

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Language   | Python 3.12+               |
| Framework  | FastAPI                    |
| ORM        | SQLAlchemy                 |
| Database   | PostgreSQL                 |
| Migrations | Alembic                    |
| Auth       | JWT (python-jose) + bcrypt |
| 2FA        | pyotp (TOTP)               |
| Email      | SMTP (smtplib)             |
| Validation | Pydantic                   |

### Frontend

| Layer        | Technology         |
| ------------ | ------------------ |
| Framework    | React 18           |
| Build Tool   | Vite 5             |
| Language     | JavaScript (JSX)   |
| Styling      | Tailwind CSS 3.4   |
| Routing      | react-router-dom 6 |
| HTTP Client  | Axios              |
| Icons        | lucide-react       |
| Spreadsheets | xlsx               |

---

## 4. Backend Architecture

### 4.1 Layered Architecture

```
API Layer (FastAPI Routers)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Database Operations)
    ↓
Database Layer (SQLAlchemy + PostgreSQL)
```

### 4.2 Backend Folder Structure

```
backend/
├── alembic/                    # Database migrations
├── alembic.ini                 # Alembic config
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app creation, middleware, router registration
│   ├── api/
│   │   └── routes/             # All endpoint files (14 routers)
│   ├── core/
│   │   ├── config.py           # Settings via pydantic-settings + env vars
│   │   ├── security.py         # JWT, password hashing, token generation
│   │   └── dependencies.py     # FastAPI dependencies (get_current_user, etc.)
│   ├── database/
│   │   ├── base.py             # SQLAlchemy DeclarativeBase
│   │   └── session.py          # Engine, SessionLocal, get_db dependency
│   ├── middleware/
│   │   └── rate_limit.py       # Rate limiting middleware
│   ├── models/
│   │   └── database_models.py  # ALL SQLAlchemy models (single file)
│   ├── repositories/
│   │   └── *_repository.py     # 12 repository files (includes inventory_repository.py, marketing_repository.py)
│   ├── schemas/
│   │   └── request_response_models.py  # ALL Pydantic schemas (single file)
│   ├── services/
│   │   └── *_service.py        # 15 service files (includes inventory_service.py, marketing_service.py)
│   └── utils/
│       └── email.py            # Email sending utilities
├── tests/                      # Test directory
├── main.py                     # Backend entry placeholder
├── pyproject.toml              # Dependencies
├── requirements.txt            # Pip requirements
└── uv.lock                     # uv lock file
```

### 4.3 Registered Routers (in `backend/app/main.py`)

| Router                      | Prefix                      | Purpose                                  |
| --------------------------- | --------------------------- | ---------------------------------------- |
| `auth_router`               | /api/v1/auth                | Authentication (login, register, etc.)   |
| `admin_router`              | /api/v1/admin               | Admin dashboard, products, orders, users |
| `category_router`           | /api/v1/categories          | Category listing                         |
| `homepage_router`           | /api/v1/homepage            | Homepage data                            |
| `product_catalog_router`    | /api/v1/products            | Product listing, details, reviews        |
| `profile_router`            | /api/v1/profile             | User profile, addresses, settings        |
| `search_router`             | /api/v1/search              | Search functionality                     |
| `cart_router`               | /api/v1/cart                | Cart operations                          |
| `checkout_router`           | /api/v1/checkout            | Checkout + orders                        |
| `promotion_router`          | /api/v1/promotions          | Coupons, flash sales, loyalty, referrals |
| `admin_notification_router` | /api/v1/admin/notifications | Admin notification management            |
| `admin_support_router`      | /api/v1/admin/support       | Admin support management                 |
| `support_router`            | /api/v1/support             | Customer support (FAQ, help, contact)    |
| `wishlist_public_router`    | (public)                    | Shared wishlist access                   |
| `inventory_router`          | /api/v1/admin/inventory     | Inventory management (warehouses, stock) |
| `marketing_router`         | /api/v1/admin/marketing     | Marketing (campaigns, affiliates)        |

### 4.4 Core Configuration (`core/config.py`)

All secrets loaded from `.env` via `pydantic-settings`:

- `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `CORS_ORIGINS`, `FRONTEND_URL`

Business constants:

- `TAX_RATE = 0.08`
- `FREE_SHIPPING_THRESHOLD = 50.00`
- `LOYALTY_POINTS_PER_DOLLAR = 10`

### 4.5 Security (`core/security.py`)

- Password hashing: bcrypt via passlib
- JWT tokens: access + refresh tokens
- Token decode/verify: `decode_token()`
- Verification code generation
- Token generation (URL-safe)

### 4.6 Dependencies (`core/dependencies.py`)

| Dependency                | Purpose                           |
| ------------------------- | --------------------------------- |
| `get_current_user`        | Validates JWT, returns User model |
| `get_current_active_user` | Checks `is_active` flag           |
| `get_current_admin_user`  | Checks `role == "admin"`          |

### 4.7 Database Session (`database/session.py`)

- Engine with `pool_pre_ping=True`, `pool_size=5`, `max_overflow=10`
- `SessionLocal` factory
- `get_db()` generator for FastAPI dependency injection

---

## 5. Database Models

**All models defined in**: `backend/app/models/database_models.py`

### 5.1 User & Auth Models

| Model               | Table                 | Purpose                                                           |
| ------------------- | --------------------- | ----------------------------------------------------------------- |
| `User`              | `users`               | Main user entity (UUID PK, email, password_hash, role, is_active) |
| `UserSession`       | `user_sessions`       | Refresh tokens, device tracking                                   |
| `UserDevice`        | `user_devices`        | Device info (name, type, OS, browser)                             |
| `EmailVerification` | `email_verifications` | Email verification tokens                                         |
| `PasswordReset`     | `password_resets`     | Password reset tokens                                             |
| `UserTwoFactor`     | `user_two_factor`     | 2FA secrets and backup codes                                      |
| `SocialAccount`     | `social_accounts`     | Google OAuth links                                                |

### 5.2 Profile Models

| Model                | Table                   | Purpose                                |
| -------------------- | ----------------------- | -------------------------------------- |
| `UserProfile`        | `user_profiles`         | Avatar, phone, DOB, bio, gender        |
| `Address`            | `addresses`             | Shipping/billing addresses             |
| `UserPrivacySetting` | `user_privacy_settings` | Privacy toggles                        |
| `UserAccountSetting` | `user_account_settings` | Notification prefs, language, currency |

### 5.3 Catalog Models

| Model                   | Table                     | Purpose                                      |
| ----------------------- | ------------------------- | -------------------------------------------- |
| `Category`              | `categories`              | Hierarchical categories (parent_id self-ref) |
| `Brand`                 | `brands`                  | Product brands                               |
| `Product`               | `products`                | Main product (price, stock, rating, flags)   |
| `ProductImage`          | `product_images`          | Multiple images per product                  |
| `ProductVariant`        | `product_variants`        | Size/color variants                          |
| `ProductAttribute`      | `product_attributes`      | Key-value attributes                         |
| `ProductSpecification`  | `product_specifications`  | Grouped specs                                |
| `ProductTag`            | `product_tags`            | Tags (many-to-many)                          |
| `ProductTagAssociation` | `product_tag_association` | M2M junction                                 |
| `ProductReview`         | `product_reviews`         | User reviews with ratings                    |
| `ReviewHelpful`         | `review_helpful`          | Helpful vote tracking                        |
| `ReviewReport`          | `review_reports`          | Review reports                               |

### 5.4 Inventory Models

| Model               | Table                  | Purpose                                    |
| ------------------- | ---------------------- | ------------------------------------------ |
| `Warehouse`         | `warehouses`           | Warehouse locations (name, address, etc.)  |
| `WarehouseInventory`| `warehouse_inventories`| Per-product stock per warehouse            |
| `InventoryHistory`  | `inventory_histories`  | Audit trail for all stock changes          |
| `StockAlert`        | `stock_alerts`         | Low stock / out-of-stock alerts            |

**Note**: `Product` model now includes:
- `low_stock_threshold` (default=10)
- `total_quantity` property (aggregated across warehouses)
- `is_low_stock` property
- `is_out_of_stock` property

### 5.5 Homepage/CMS Models

| Model                  | Table                    | Purpose                 |
| ---------------------- | ------------------------ | ----------------------- |
| `FlashSale`            | `flash_sales`            | Flash sale events       |
| `FlashSaleItem`        | `flash_sale_items`       | Products in flash sales |
| `Banner`               | `banners`                | Homepage banners        |
| `Testimonial`          | `testimonials`           | Customer testimonials   |
| `BlogPost`             | `blog_posts`             | Blog articles           |
| `NewsletterSubscriber` | `newsletter_subscribers` | Email subscribers       |

### 5.5 User Activity Models

| Model                   | Table                      | Purpose                     |
| ----------------------- | -------------------------- | --------------------------- |
| `WishlistItem`          | `wishlist_items`           | Wishlist with share_token   |
| `RecentlyViewedProduct` | `recently_viewed_products` | Browsing history            |
| `SearchHistory`         | `search_history`           | Search queries              |
| `PopularSearch`         | `popular_searches`         | Aggregated popular searches |

### 5.6 Cart & Order Models

| Model                | Table                  | Purpose                                   |
| -------------------- | ---------------------- | ----------------------------------------- |
| `Cart`               | `carts`                | User cart (coupon, gift card, shipping)   |
| `CartItem`           | `cart_items`           | Cart line items                           |
| `SavedForLater`      | `saved_for_later`      | Saved items                               |
| `GiftCard`           | `gift_cards`           | Gift card balances                        |
| `Order`              | `orders`               | Full order (addresses, payment, shipping) |
| `OrderItem`          | `order_items`          | Order line items                          |
| `OrderStatusHistory` | `order_status_history` | Status audit trail                        |
| `ReturnRequest`      | `return_requests`      | Return requests                           |
| `ExchangeRequest`    | `exchange_requests`    | Exchange requests                         |

### 5.7 Shipping Models

| Model              | Table               | Purpose             |
| ------------------ | ------------------- | ------------------- |
| `ShippingZone`     | `shipping_zones`    | Geographic zones    |
| `ShippingMethod`   | `shipping_methods`  | Shipping methods    |
| `ShippingRate`     | `shipping_rates`    | Zone + method rates |
| `PickupLocation`   | `pickup_locations`  | Pickup points       |
| `DeliveryTracking` | `delivery_tracking` | Tracking info       |
| `TrackingEvent`    | `tracking_events`   | Tracking event log  |

### 5.8 Promotion Models

| Model                     | Table                        | Purpose               |
| ------------------------- | ---------------------------- | --------------------- |
| `Coupon`                  | `coupons`                    | Discount codes        |
| `AutoDiscount`            | `auto_discounts`             | Automatic discounts   |
| `LoyaltyPoint`            | `loyalty_points`             | User point balances   |
| `LoyaltyPointTransaction` | `loyalty_point_transactions` | Point transaction log |
| `ReferralCode`            | `referral_codes`             | Referral codes        |
| `ReferralReward`          | `referral_rewards`           | Referral rewards      |

### 5.9 Notification Models

| Model                  | Table                    | Purpose              |
| ---------------------- | ------------------------ | -------------------- |
| `UserNotification`     | `user_notifications`     | In-app notifications |
| `NotificationTemplate` | `notification_templates` | Reusable templates   |
| `NotificationLog`      | `notification_logs`      | Delivery log         |

### 5.10 Customer Support Models

| Model            | Table              | Purpose                  |
| ---------------- | ------------------ | ------------------------ |
| `ContactMessage` | `contact_messages` | Contact form submissions |
| `FAQItem`        | `faq_items`        | FAQ entries              |
| `HelpArticle`    | `help_articles`    | Help center articles     |

### 5.11 Marketing Models

| Model               | Table                  | Purpose                                    |
| ------------------- | ---------------------- | ------------------------------------------ |
| `EmailCampaign`     | `email_campaigns`      | Email marketing campaigns                  |
| `SMSCampaign`       | `sms_campaigns`        | SMS marketing campaigns                    |
| `PushCampaign`      | `push_campaigns`       | Push notification campaigns                |
| `CampaignLog`       | `campaign_logs`        | Campaign event logs (opens, clicks, etc.) |
| `AffiliateProgram`  | `affiliate_programs`   | Affiliate program configurations           |
| `Affiliate`         | `affiliates`           | Affiliate user accounts                    |
| `AffiliateLink`     | `affiliate_links`      | Affiliate tracking links                   |
| `AffiliateClick`    | `affiliate_clicks`     | Affiliate click tracking                   |
| `AffiliateEarning`  | `affiliate_earnings`   | Affiliate commission records               |

---

## 6. Pydantic Schemas

**All schemas defined in**: `backend/app/schemas/request_response_models.py`

### Schema Naming Convention

- Request: `{Action}Request` (e.g., `LoginRequest`, `CartAddRequest`)
- Response: `{Entity}Response` (e.g., `UserResponse`, `ProductResponse`)
- List: `{Entity}ListResponse` (e.g., `OrderListResponse`)
- Envelope: All responses extend `BaseResponse(success, message, data)`

### Key Schema Groups

1. **Auth**: RegisterRequest, LoginRequest, TokenResponse, LogoutRequest, RefreshTokenRequest
2. **Email Verification**: SendEmailVerificationRequest, VerifyEmailRequest, ChangeEmailRequest
3. **Password**: ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest
4. **2FA**: Enable2FARequest, Verify2FARequest, Disable2FARequest
5. **Social**: SocialLoginRequest
6. **Sessions/Devices**: DeviceResponse, SessionResponse, RevokeDeviceRequest
7. **Profile**: ProfileUpdateRequest, ProfileResponse, UserWithProfileResponse
8. **Address**: AddressCreateRequest, AddressUpdateRequest, AddressResponse
9. **Wishlist**: WishlistAddRequest, WishlistItemResponse, SharedWishlistResponse
10. **Notifications**: NotificationResponse, NotificationTemplateCreateRequest
11. **Categories**: CategoryResponse, AdminCategoryCreateRequest
12. **Products**: ProductResponse, AdminProductCreateRequest, AdminProductUpdateRequest
13. **Reviews**: ProductReviewCreateRequest, ProductReviewResponse, ReviewReportRequest
14. **Cart**: CartAddRequest, CartResponse, CartSummaryResponse, SavedForLaterResponse
15. **Checkout**: CheckoutRequest, GuestCheckoutRequest, OrderResponse
16. **Promotions**: CouponCreateRequest, AutoDiscountCreateRequest, FlashSaleCreateRequest
17. **Loyalty**: LoyaltyPointResponse, LoyaltyRedeemRequest
18. **Referral**: ReferralCodeResponse, ReferralApplyRequest
19. **Support**: ContactMessageCreateRequest, FAQItemCreateRequest, HelpArticleCreateRequest
20. **Admin**: AdminUserResponse, AdminOrderResponse, AdminProductImportRequest
21. **Inventory**: WarehouseCreateRequest, InventoryAdjustRequest, InventoryBulkAdjustRequest, InventoryTransferRequest, StockAlertResponse
22. **Marketing**: EmailCampaignCreateRequest, SMSCampaignCreateRequest, PushCampaignCreateRequest, AffiliateProgramCreateRequest, AffiliateCreateRequest, AffiliateLinkCreateRequest

---

## 7. Frontend Architecture

### 7.1 Frontend Folder Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Root component with providers
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles (Tailwind)
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── cart/               # Cart components
│   │   ├── catalog/            # Product catalog components
│   │   ├── category/           # Category components
│   │   ├── common/             # Shared UI components
│   │   ├── homepage/           # Homepage sections
│   │   ├── orders/             # Order-related components
│   │   └── profile/            # Profile components
│   ├── context/                # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── WishlistContext.jsx
│   ├── hooks/                  # Custom hooks (empty currently)
│   ├── pages/                  # Page components (25+ pages)
│   │   ├── auth/               # Auth pages (Login, Register, etc.)
│   │   ├── admin/              # Admin pages
│   │   └── *.jsx               # Public/protected pages
│   ├── routes/
│   │   └── index.jsx           # All route definitions
│   ├── services/
│   │   └── api/                # API service files (18 files)
│   └── utils/
│       └── format.js           # Formatting utilities
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

### 7.2 Context Providers (State Management)

| Context               | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `AuthContext`         | User auth state, login/logout, token management |
| `CartContext`         | Cart state, add/remove/update items             |
| `WishlistContext`     | Wishlist state                                  |
| `NotificationContext` | Notification state, unread count                |

**Provider Order in App.jsx**: Auth → Cart → Wishlist → Notification → Routes

### 7.3 API Services (`services/api/`)

| Service                          | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `client.js`                      | Axios instance with interceptors (base URL, auth headers) |
| `authService.js`                 | Login, register, logout, refresh, 2FA, social login       |
| `profileService.js`              | Profile, addresses, privacy/account settings              |
| `categoryService.js`             | Category listing                                          |
| `productService.js`              | Product listing, details, reviews                         |
| `homeService.js`                 | Homepage data                                             |
| `searchService.js`               | Search, suggestions, history                              |
| `cartService.js`                 | Cart CRUD, coupon, gift card                              |
| `checkoutService.js`             | Checkout, order creation                                  |
| `wishlistService.js`             | Wishlist CRUD, sharing                                    |
| `promotionService.js`            | Coupons, flash sales, loyalty, referrals                  |
| `adminService.js`                | Admin dashboard stats                                     |
| `adminProductService.js`         | Admin product CRUD, import/export                         |
| `adminOrderService.js`           | Admin order management                                    |
| `adminUserService.js`            | Admin user management                                     |
| `adminCategoryService.js`        | Admin category management                                 |
| `adminNotificationService.js`    | Admin notification management                             |
| `adminCustomerSupportService.js` | Admin support management                                  |
| `inventoryService.js`            | Inventory management (warehouses, stock, alerts, history) |
| `marketingService.js`            | Marketing (campaigns, affiliates, earnings)               |

### 7.4 Common Components (`components/common/`)

| Component                  | Purpose                       |
| -------------------------- | ----------------------------- |
| `Header.jsx`               | Main navigation header        |
| `MegaMenu.jsx`             | Mega menu dropdown            |
| `SearchBar.jsx`            | Search input with suggestions |
| `NotificationDropdown.jsx` | Notification bell dropdown    |
| `ProductCard.jsx`          | Product card display          |
| `FilterSidebar.jsx`        | Product filter sidebar        |
| `ActiveFilters.jsx`        | Active filter chips           |
| `ErrorBoundary.jsx`        | React error boundary          |

### 7.5 Pages (25+ pages)

**Auth Pages** (`pages/auth/`):

- LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
- VerifyEmailPage, ChangePasswordPage, TwoFactorSetupPage, Verify2FAPage

**Public Pages**:

- HomePage, ProductListPage, ProductDetailPage
- CategoryListPage, CategoryDetailPage
- SearchPage, CartPage
- ContactPage, FAQPage, HelpCenterPage
- OrderTrackingPage, SharedWishlistPage

**Protected Pages**:

- DashboardPage, ProfilePage
- CheckoutPage, OrderConfirmationPage
- OrderHistoryPage, OrderDetailPage, InvoicePage
- WishlistPage, LoyaltyPage, ReferralPage

**Admin Pages** (`pages/admin/`):

- AdminDashboardPage, AdminProductListPage, AdminProductFormPage
- AdminProductImportPage, AdminProductExportPage
- AdminCouponPage, AdminFlashSalePage
- AdminUserListPage, AdminUserDetailPage
- AdminInventoryPage, AdminWarehousePage
- AdminInventoryHistoryPage, AdminStockAlertsPage
- AdminMarketingHubPage, AdminEmailCampaignsPage
- AdminSMSCampaignsPage, AdminPushCampaignsPage
- AdminAffiliatePage

### 7.6 Route Guards

| Guard            | Purpose                                 |
| ---------------- | --------------------------------------- |
| `ProtectedRoute` | Requires authentication                 |
| `AdminRoute`     | Requires `role === "admin"`             |
| `PublicRoute`    | Redirects to dashboard if authenticated |

### 7.7 Frontend Dependencies

| Package          | Version | Purpose             |
| ---------------- | ------- | ------------------- |
| react            | 18.3.1  | UI framework        |
| react-dom        | 18.3.1  | DOM rendering       |
| react-router-dom | 6.26.0  | Client-side routing |
| axios            | 1.7.0   | HTTP client         |
| lucide-react     | 0.400.0 | Icons               |
| xlsx             | 0.18.5  | Excel import/export |

---

## 8. API Design

### 8.1 Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### 8.2 Error Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### 8.3 Pagination Format

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 8.4 API Versioning

All APIs prefixed with `/api/v1/`

---

## 9. Key Implementation Details

### 9.1 Authentication Flow

1. Register → Email verification required
2. Login → Access token (30 min) + Refresh token (7 days)
3. 2FA → TOTP via pyotp, backup codes
4. Social → Google OAuth
5. Session tracking → Device info, IP, user agent

### 9.2 Product Catalog

- Products have variants, images, attributes, specifications, tags
- Soft delete via `deleted_at` timestamp
- Flash sales with stock limits
- Product reviews with helpful votes and reports

### 9.3 Cart & Checkout

- Cart per user (one-to-one)
- Coupon + gift card support
- Shipping method selection (standard/express/overnight/pickup)
- Guest checkout supported
- Order status tracking with history

### 9.4 Promotions

- Coupons (percentage/fixed) with usage limits
- Auto discounts (bulk, category-specific, buy X get Y)
- Loyalty points (earn + redeem)
- Referral system with rewards

### 9.5 Notifications

- In-app notifications
- Email notifications (via SMTP)
- Template-based system
- Broadcast capability

### 9.6 Inventory Management

- Multi-warehouse inventory tracking
- Per-product stock levels across warehouses
- Low stock and out-of-stock alerts (configurable thresholds)
- Inventory history audit trail (adjustments, restocks, sales, transfers, returns, damage)
- Bulk inventory adjustments
- Inter-warehouse transfers
- Automatic alert generation on stock changes

### 9.7 Customer Support

- Contact form messages
- FAQ items
- Help articles
- Admin reply system

### 9.8 Marketing

- **Email Campaigns**: Create, schedule, send email campaigns with user segmentation
- **SMS Campaigns**: Create, schedule, send SMS campaigns with user segmentation
- **Push Campaigns**: Create, schedule, send push notification campaigns with user segmentation
- **Campaign Logs**: Track opens, clicks, deliveries across all campaign types
- **Affiliate Programs**: Configure commission types (percentage/fixed), cookie duration, minimum payout
- **Affiliate System**: User sign-up, approval workflow, unique affiliate codes
- **Affiliate Links**: Generate tracking links per product with click/conversion tracking
- **Affiliate Earnings**: Commission calculation, pending/approved/paid status tracking

---

## 10. Development Workflow

### 10.1 Adding New Backend Feature

1. Add model in `backend/app/models/database_models.py`
2. Create Alembic migration: `alembic revision --autogenerate -m "description"`
3. Add schemas in `backend/app/schemas/request_response_models.py`
4. Create repository in `backend/app/repositories/`
5. Create service in `backend/app/services/`
6. Create router in `backend/app/api/routes/`
7. Register router in `backend/app/main.py`

### 10.2 Adding New Frontend Feature

1. Create page in `frontend/src/pages/`
2. Create components in `frontend/src/components/`
3. Create API service in `frontend/src/services/api/`
4. Add route in `frontend/src/routes/index.jsx`
5. Add context if needed in `frontend/src/context/`

### 10.3 Running the Application

**Backend**:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Frontend**:

```bash
cd frontend
npm run dev
```

**Database Migrations**:

```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "description"
```

---

## 11. Environment Variables

Required in `backend/.env`:

```
DATABASE_URL=postgresql://...
SECRET_KEY=...
JWT_SECRET_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=["http://localhost:5173"]
```

---

## 12. Important Notes

1. **Single-file models**: All SQLAlchemy models are in `database_models.py` (~1400 lines)
2. **Single-file schemas**: All Pydantic schemas are in `request_response_models.py` (~1800 lines)
3. **UUID PKs**: All tables use UUID primary keys
4. **Soft delete**: Users and products use `deleted_at` timestamp
5. **Timezone**: All timestamps use UTC (`timezone=True`)
6. **Rate limiting**: 60 requests/minute default
7. **CORS**: Configured for localhost:5173 (Vite dev server)
8. **API proxy**: Vite proxies `/api` to localhost:8000
9. **Tailwind**: Custom primary color palette (blue-based)
10. **No TypeScript**: Frontend uses plain JavaScript with JSX

---

_Last updated: Marketing feature implementation (Email, SMS, Push Campaigns + Affiliate System)_
