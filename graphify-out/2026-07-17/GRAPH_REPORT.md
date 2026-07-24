# Graph Report - E-Commerce Platform  (2026-07-17)

## Corpus Check
- 266 files · ~140,256 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2733 nodes · 6449 edges · 219 communities (149 shown, 70 thin omitted)
- Extraction: 77% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 1316 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a203555`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend Auth & Profile
- Backend Auth & Session
- Product Catalog
- Admin Dashboard
- Order Management
- Frontend Core Components
- Checkout & Shipping
- Marketing & Affiliates
- Promotions & Coupons
- Product Reviews
- User Notifications
- Database Models Core
- Frontend Pages
- Backend Services
- API Endpoints
- Frontend Admin Components
- Wishlist & Saved
- Customer Support
- Inventory Management
- User Settings
- Cart Management
- Promotions Backend
- Order Returns & Exchange
- Profile Settings
- Search Functionality
- Admin Support
- Category Management
- Admin Product UI
- Product Repository
- Session & Device
- Frontend Services
- Checkout Endpoints
- Security & Auth
- Email & Verification
- Category Endpoints
- Loyalty Points
- Frontend App Core
- Reports & Analytics
- Profile Repository
- Order Services
- Order Tracking UI
- Product Detail UI
- Auto Discounts
- Flash Sales
- Admin Statistics
- Coupon Service
- Auth Business Logic
- Coupon Repository
- Notification Repository
- Repository Init
- Marketing Models
- Promotion Models
- Support Service
- Referral System
- Tech Stack
- Contact Messages
- FAQ Repository
- Review Repository
- Help Articles
- Address Repository
- Wishlist Repository
- Help Service
- Inventory Pages
- Support Endpoints
- Security Concepts
- Repository Sessions
- Test Suite
- Support Models
- Inventory Models
- Rate Limiting
- Recently Viewed
- Frontend Guidelines
- Shipping Models
- Database Stack
- Notification Models
- Homepage Models
- Brand Repository
- Promotion Init
- Checkout Tests
- Cart Models
- Search Models
- Banner Repository
- Category Models
- Profile Models
- Wishlist Models
- Config Settings
- Business Config
- OpenCode Plugin
- backend/app/main.py
- StoreSettingService
- graphify.js
- ActiveFilters Component
- ErrorBoundary Component
- FilterSidebar Component
- Header Component
- MegaMenu Component
- NotificationDropdown Component
- ProductCard Component
- SearchBar Component
- UUID
- BACKEND.md
- DATABASE.md
- CODING_STYLE.md
- FRONTEND.md
- SECURITY.md
- Guest Checkout
- Input Validation
- Multi-Warehouse Inventory
- Paginated API
- UI_DESIGN.md
- UUID
- PROJECT_RULES.md
- UUID Primary Keys
- Brand Model
- ExchangeRequest Model
- GiftCard Model
- ProductAttribute Model
- ProductSpecification Model
- ProductTagAssociation Model
- ProductTag Model
- RecentlyViewedProduct Model
- ReturnRequest Model
- ReviewHelpful Model
- ReviewReport Model
- SavedForLater Model
- UserAccountSetting Model
- UserDevice Model
- UserPrivacySetting Model
- backend/app/database/base.py
- backend/app/utils/email.py
- frontend/index.html
- Public Route Guard
- backend
- e-commerce-platform
- Column snake_case
- Component-Service-API Separation
- Consistent Response Format
- Foreign Keys Required
- Migrations Required
- No Business Logic in Routers
- No Direct Database Access
- No Duplicate Code
- No Raw Passwords
- PEP 8 Python
- Pydantic Schemas Required
- Small Functions
- Table Plural snake_case
- UTC Timestamps
- UUID Primary Keys Rule
- Validate All Input
- UserRepository
- adminCustomerSupportService.js
- AdminDashboardPage.jsx
- 5. Database Models
- AffiliateProgramService
- Project_reader.md
- AdminOrderDetail.jsx
- 9. Key Implementation Details
- UserProfile
- 4. Backend Architecture
- 7. Frontend Architecture
- UserAccountSetting
- Session
- 8. API Design
- Text Hierarchy
- Color System
- 10. Development Workflow
- ProfileUpdateRequest
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `User` - 268 edges
2. `Product` - 85 edges
3. `Base` - 76 edges
4. `AdminService` - 75 edges
5. `ProfileService` - 69 edges
6. `BaseResponse` - 61 edges
7. `AuthService` - 61 edges
8. `CustomerSupportService` - 57 edges
9. `useAuth()` - 55 edges
10. `OrderRepository` - 52 edges

## Surprising Connections (you probably didn't know these)
- `E-Commerce Platform` ----> `Layered Architecture`  [1.0]
  Project_reader.md → prompts/BACKEND.md
- `E-Commerce Platform` ----> `Responsive Design`  [1.0]
  Project_reader.md → prompts/UI_DESIGN.md
- `E-Commerce Platform` ----> `Component-Based Architecture`  [1.0]
  Project_reader.md → prompts/FRONTEND.md
- `E-Commerce Platform` ----> `REST API`  [1.0]
  Project_reader.md → prompts/API_GUIDELINES.md
- `E-Commerce Platform` ----> `Role-Based Access Control`  [1.0]
  Project_reader.md → prompts/SECURITY.md

## Import Cycles
- None detected.

## Communities (219 total, 70 thin omitted)

### Community 0 - "Frontend Auth & Profile"
Cohesion: 0.02
Nodes (173): AccountSettingsResponse, AccountSettingsUpdateRequest, AddressCreateRequest, AddressResponse, AddressUpdateRequest, AdminCategoryCreateRequest, AdminCategoryResponse, AdminCategoryUpdateRequest (+165 more)

### Community 1 - "Backend Auth & Session"
Cohesion: 0.14
Nodes (44): approve_affiliate(), create_affiliate(), create_affiliate_link(), create_email_campaign(), create_push_campaign(), create_sms_campaign(), delete_affiliate_program(), delete_email_campaign() (+36 more)

### Community 2 - "Product Catalog"
Cohesion: 0.05
Nodes (21): Affiliate, AffiliateClick, AffiliateEarning, AffiliateLink, AffiliateProgram, CampaignLog, EmailCampaign, PushCampaign (+13 more)

### Community 3 - "Admin Dashboard"
Cohesion: 0.06
Nodes (33): adjust_stock(), bulk_adjust_stock(), create_warehouse(), delete_warehouse(), get_inventory_history(), get_inventory_service(), get_inventory_summary(), get_low_stock_items() (+25 more)

### Community 4 - "Order Management"
Cohesion: 0.12
Nodes (34): admin_create_category(), admin_create_product(), admin_delete_category(), admin_delete_product(), admin_delete_user(), admin_export_products_csv(), admin_get_category(), admin_get_order() (+26 more)

### Community 5 - "Frontend Core Components"
Cohesion: 0.13
Nodes (13): AdminNotificationBroadcast(), NOTIFICATION_TYPES, TARGETS, AdminNotificationForm(), NOTIFICATION_TYPES, AdminNotificationList(), AdminNotificationStats(), AdminTemplateForm() (+5 more)

### Community 6 - "Checkout & Shipping"
Cohesion: 0.06
Nodes (27): broadcast_notification(), create_notification(), create_notification_template(), delete_notification(), delete_notification_template(), get_admin_notifications(), get_notification_service(), get_notification_stats() (+19 more)

### Community 7 - "Marketing & Affiliates"
Cohesion: 0.09
Nodes (29): add_recently_viewed(), add_to_wishlist(), clear_recently_viewed(), clear_wishlist(), create_address(), delete_account(), delete_address(), get_account_settings() (+21 more)

### Community 8 - "Promotions & Coupons"
Cohesion: 0.13
Nodes (24): BlogPost, DeliveryTracking, NewsletterSubscriber, OrderStatusHistory, PickupLocation, ProductAttribute, ProductImage, ProductSpecification (+16 more)

### Community 9 - "Product Reviews"
Cohesion: 0.04
Nodes (56): AddressListResponse, AdminCategoryListResponse, AdminOrderListResponse, AdminProductImportResponse, AdminProductListResponse, AdminUserListResponse, AffiliateEarningListResponse, AffiliateLinkListResponse (+48 more)

### Community 10 - "User Notifications"
Cohesion: 0.10
Nodes (28): LoyaltyRedeem(), AuthContext, useAuth(), AdminAffiliatePage(), AdminCouponPage(), AdminEmailCampaignsPage(), AdminFlashSalePage(), AdminMarketingHubPage() (+20 more)

### Community 11 - "Database Models Core"
Cohesion: 0.13
Nodes (25): CartItem(), CartSummary(), CouponInput(), GiftCardInput(), MiniCart(), SavedForLater(), TODO: Replace with dynamic fallback or show error message, ShippingSelector() (+17 more)

### Community 12 - "Frontend Pages"
Cohesion: 0.04
Nodes (46): autoprefixer, axios, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, dependencies (+38 more)

### Community 13 - "Backend Services"
Cohesion: 0.07
Nodes (25): EMPTY_FORM, CategoryBanner(), MegaMenu(), ProductCard(), SearchBar(), BestSellers(), BlogSection(), Brands() (+17 more)

### Community 14 - "API Endpoints"
Cohesion: 0.09
Nodes (24): get_blog_posts(), get_blog_service(), get_homepage_data(), get_homepage_service(), get_newsletter_service(), get_product_filters(), get_product_service(), get_products() (+16 more)

### Community 15 - "Frontend Admin Components"
Cohesion: 0.12
Nodes (21): add_to_cart(), apply_coupon(), apply_gift_card(), clear_cart(), get_cart(), get_cart_service(), get_shipping_methods(), move_to_cart() (+13 more)

### Community 16 - "Wishlist & Saved"
Cohesion: 0.14
Nodes (10): Cart, CartItem, SavedForLater, CartItemRepository, CartRepository, Session, UUID, # NOTE: Bulk delete via .delete() bypasses ORM cascade events and (+2 more)

### Community 17 - "Customer Support"
Cohesion: 0.06
Nodes (33): Admin Router, Auth Router, Checkout Router, Product Catalog Router, EmailVerification Model, OrderItem Model, Order Model, OrderStatusHistory Model (+25 more)

### Community 18 - "Inventory Management"
Cohesion: 0.11
Nodes (27): change_email(), change_password(), disable_2fa(), enable_2fa(), forgot_password(), get_auth_service(), get_devices(), get_email_verification_status() (+19 more)

### Community 19 - "User Settings"
Cohesion: 0.15
Nodes (20): create_product_review(), get_product_catalog_service(), get_product_detail(), get_product_reviews(), get_related_products(), get_similar_products(), Session, UUID (+12 more)

### Community 20 - "Cart Management"
Cohesion: 0.08
Nodes (15): AdminReportsPage(), REPORT_TABS, AdminSettingsPage(), CATEGORIES, AdminUserDetailPage(), AdminUserListPage(), Verify2FAPage(), ContactPage() (+7 more)

### Community 21 - "Promotions Backend"
Cohesion: 0.13
Nodes (28): add_flash_sale_item(), create_coupon(), create_discount(), create_flash_sale(), delete_coupon(), delete_discount(), delete_flash_sale(), get_all_coupons() (+20 more)

### Community 22 - "Order Returns & Exchange"
Cohesion: 0.12
Nodes (8): Order, OrderItem, ReturnRequest, OrderRepository, date, Session, ReportRepository, TestOrderTracking

### Community 23 - "Profile Settings"
Cohesion: 0.18
Nodes (11): AccountSettingsSection(), AddressManagement(), EMPTY_ADDRESS, DeleteAccountSection(), NotificationsSection(), PrivacySettingsSection(), ProfileInformation(), RecentlyViewedSection() (+3 more)

### Community 24 - "Search Functionality"
Cohesion: 0.12
Nodes (18): add_to_search_history(), clear_search_history(), get_popular_searches(), get_search_history(), get_search_service(), get_search_suggestions(), Session, remove_from_search_history() (+10 more)

### Community 25 - "Admin Support"
Cohesion: 0.17
Nodes (21): create_faq_item(), create_help_article(), delete_contact_message(), delete_faq_item(), delete_help_article(), get_contact_message(), get_contact_messages(), get_contact_stats() (+13 more)

### Community 26 - "Category Management"
Cohesion: 0.15
Nodes (5): Category, PopularSearch, SearchHistory, CategoryRepository, SearchRepository

### Community 27 - "Admin Product UI"
Cohesion: 0.14
Nodes (13): xlsx, AdminProductImportExport(), NOTE: This is a naive CSV parser. For production use, consider a proper, REQUIRED_COLUMNS, AdminProductInventory(), AdminProductList(), AdminProductExportPage(), AdminProductImportPage() (+5 more)

### Community 28 - "Product Repository"
Cohesion: 0.14
Nodes (5): ExchangeRequest, Product, AdminProductRepository, ProductRepository, UUID

### Community 29 - "Session & Device"
Cohesion: 0.17
Nodes (8): UserDevice, UserSession, DeviceRepository, Session, UUID, # NOTE: Bulk delete via .delete() bypasses ORM cascade events., SessionRepository, Session

### Community 30 - "Frontend Services"
Cohesion: 0.08
Nodes (24): AuthContext, CartContext, NotificationContext, WishlistContext, Admin Category Service (Frontend), Admin Notification Service (Frontend), Admin Order Service (Frontend), Admin Product Service (Frontend) (+16 more)

### Community 31 - "Checkout Endpoints"
Cohesion: 0.12
Nodes (19): cancel_order(), get_invoice(), get_order(), get_order_service(), get_order_tracking(), get_orders(), get_pickup_locations(), get_shipping_methods() (+11 more)

### Community 32 - "Security & Auth"
Cohesion: 0.23
Nodes (6): create_access_token(), create_refresh_token(), decode_token(), generate_token(), generate_verification_code(), timedelta

### Community 33 - "Email & Verification"
Cohesion: 0.17
Nodes (6): EmailVerification, PasswordReset, SocialAccount, Session, UUID, VerificationRepository

### Community 34 - "Category Endpoints"
Cohesion: 0.15
Nodes (12): get_all_categories(), get_categories(), get_category_by_slug(), get_category_children(), get_category_service(), get_featured_categories(), Session, CategoryService (+4 more)

### Community 35 - "Loyalty Points"
Cohesion: 0.22
Nodes (7): get_loyalty_balance(), redeem_loyalty_points(), LoyaltyPoint, LoyaltyPointTransaction, LoyaltyRepository, UUID, LoyaltyService

### Community 36 - "Frontend App Core"
Cohesion: 0.09
Nodes (17): App(), ErrorBoundary, Header(), NotificationDropdown(), TYPE_COLORS, TYPE_ICONS, AuthProvider(), getInitialUser() (+9 more)

### Community 37 - "Reports & Analytics"
Cohesion: 0.18
Nodes (11): get_customer_report(), get_financial_report(), get_inventory_report(), get_product_report(), get_report_service(), get_sales_report(), date, Session (+3 more)

### Community 38 - "Profile Repository"
Cohesion: 0.31
Nodes (3): UserPrivacySetting, PrivacyRepository, Session

### Community 39 - "Order Services"
Cohesion: 0.05
Nodes (41): 200, 201, 204, 400, 401, 403, 404, 422 (+33 more)

### Community 40 - "Order Tracking UI"
Cohesion: 0.16
Nodes (12): DeliveryTrackingSection(), STATUS_COLORS, STATUS_ICONS, InvoicePage(), CANCEL_REASONS, EXCHANGE_REASONS, OrderDetailPage(), RETURN_REASONS (+4 more)

### Community 41 - "Product Detail UI"
Cohesion: 0.18
Nodes (9): ProductAttributes(), ProductGallery(), ProductReviews(), REPORT_REASONS, ProductSpecifications(), ProductTags(), ProductVariants(), RelatedProducts() (+1 more)

### Community 42 - "Auto Discounts"
Cohesion: 0.20
Nodes (4): AutoDiscount, AutoDiscountRepository, utcnow(), AutoDiscountService

### Community 43 - "Flash Sales"
Cohesion: 0.18
Nodes (9): Base, FlashSale, FlashSaleItem, ProductTagAssociation, datetime, # NOTE: Add a CHECK constraint (0 <= rating <= 5.00) via migration for DB-level, utcnow(), FlashSaleAdminRepository (+1 more)

### Community 46 - "Auth Business Logic"
Cohesion: 0.16
Nodes (3): hash_password(), verify_password(), UUID

### Community 47 - "Coupon Repository"
Cohesion: 0.18
Nodes (5): validate_coupon(), Coupon, CouponRepository, Session, CouponService

### Community 48 - "Notification Repository"
Cohesion: 0.23
Nodes (4): UserNotification, NotificationRepository, UUID, # NOTE: Bulk delete via .delete() bypasses ORM cascade events.

### Community 50 - "Marketing Models"
Cohesion: 0.13
Nodes (15): Marketing Router, AffiliateClick Model, AffiliateEarning Model, AffiliateLink Model, Affiliate Model, AffiliateProgram Model, CampaignLog Model, EmailCampaign Model (+7 more)

### Community 51 - "Promotion Models"
Cohesion: 0.13
Nodes (15): Promotion Router, AutoDiscount Model, Coupon Model, FlashSaleItem Model, FlashSale Model, LoyaltyPoint Model, LoyaltyPointTransaction Model, ReferralCode Model (+7 more)

### Community 53 - "Referral System"
Cohesion: 0.18
Nodes (6): apply_referral(), get_referral_code(), ReferralCode, ReferralReward, ReferralRepository, ReferralService

### Community 54 - "Tech Stack"
Cohesion: 0.11
Nodes (20): Component-Based Architecture, E-Commerce Platform, REST API, backend/app/schemas/request_response_models.py, backend/app/core/security.py, API Guidelines, Frontend Guidelines, Single File Schemas (+12 more)

### Community 55 - "Contact Messages"
Cohesion: 0.23
Nodes (4): ContactMessage, ContactMessageRepository, UUID, Session

### Community 56 - "FAQ Repository"
Cohesion: 0.23
Nodes (3): FAQItem, FAQRepository, Session

### Community 57 - "Review Repository"
Cohesion: 0.27
Nodes (4): ProductReview, ReviewHelpful, ReviewReport, ProductReviewRepository

### Community 62 - "Inventory Pages"
Cohesion: 0.29
Nodes (5): AdminInventoryHistoryPage(), AdminInventoryPage(), AdminStockAlertsPage(), AdminWarehousePage(), inventoryService

### Community 63 - "Support Endpoints"
Cohesion: 0.22
Nodes (8): get_customer_support_service(), get_faq(), get_faq_categories(), get_help_article_by_slug(), get_help_articles(), get_help_categories(), Session, submit_contact_form()

### Community 64 - "Security Concepts"
Cohesion: 0.33
Nodes (6): JWT Authentication, Role-Based Access Control, backend/app/core/dependencies.py, Admin Route Guard, Protected Route Guard, Security Guidelines

### Community 66 - "Test Suite"
Cohesion: 0.22
Nodes (4): UserTwoFactor, # NOTE: Auth tests are organized by feature (2FA, login, register)., TestSearchPublic, TestTwoFactorAuth

### Community 67 - "Support Models"
Cohesion: 0.29
Nodes (7): Admin Support Router, Support Router, ContactMessage Model, FAQItem Model, HelpArticle Model, Customer Support, Support Service

### Community 68 - "Inventory Models"
Cohesion: 0.29
Nodes (7): Inventory Router, InventoryHistory Model, StockAlert Model, WarehouseInventory Model, Warehouse Model, Inventory Management, Inventory Service

### Community 69 - "Rate Limiting"
Cohesion: 0.38
Nodes (3): Request, RateLimitMiddleware, BaseHTTPMiddleware

### Community 71 - "Frontend Guidelines"
Cohesion: 0.29
Nodes (7): Layered Architecture, Backend Guidelines, Coding Style, Project Rules, UI Design Guidelines, Responsive Design, FastAPI

### Community 72 - "Shipping Models"
Cohesion: 0.29
Nodes (7): DeliveryTracking Model, PickupLocation Model, ShippingMethod Model, ShippingRate Model, ShippingZone Model, TrackingEvent Model, Shipping Service

### Community 73 - "Database Stack"
Cohesion: 0.33
Nodes (7): backend/app/models/database_models.py, backend/app/database/session.py, Database Guidelines, Single File Models, Alembic, PostgreSQL, SQLAlchemy

### Community 74 - "Notification Models"
Cohesion: 0.33
Nodes (6): Admin Notification Router, NotificationLog Model, NotificationTemplate Model, UserNotification Model, Notifications, Notification Service

### Community 75 - "Homepage Models"
Cohesion: 0.33
Nodes (6): Homepage Router, Banner Model, BlogPost Model, NewsletterSubscriber Model, Testimonial Model, Homepage Service

### Community 80 - "Cart Models"
Cohesion: 0.40
Nodes (5): Cart Router, CartItem Model, Cart Model, Cart Management, Cart Service

### Community 81 - "Search Models"
Cohesion: 0.40
Nodes (5): Search Router, PopularSearch Model, SearchHistory Model, Product Search, Search Service

### Community 83 - "Category Models"
Cohesion: 0.50
Nodes (4): Category Router, Category Model, Category Navigation, Category Service

### Community 84 - "Profile Models"
Cohesion: 0.50
Nodes (4): Profile Router, Address Model, UserProfile Model, Profile Service

### Community 85 - "Wishlist Models"
Cohesion: 0.50
Nodes (4): Wishlist Public Router, WishlistItem Model, Wishlist, Wishlist Service

### Community 86 - "Config Settings"
Cohesion: 0.50
Nodes (3): Config, Settings, BaseSettings

### Community 87 - "Business Config"
Cohesion: 0.50
Nodes (4): Business Constants, Environment Variables, backend/app/core/config.py, pydantic-settings

### Community 88 - "OpenCode Plugin"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 114 - "backend/app/main.py"
Cohesion: 0.67
Nodes (3): AdminProductImportRequest Error, backend/app/main.py, backend/app/middleware/rate_limit.py

### Community 115 - "StoreSettingService"
Cohesion: 0.10
Nodes (16): get_all_settings(), get_setting_by_key(), get_settings_by_category(), get_store_setting_service(), initialize_default_settings(), BaseModel, Session, SettingsBulkUpdateRequest (+8 more)

### Community 139 - "UUID"
Cohesion: 0.13
Nodes (4): AffiliateService, EmailCampaignService, datetime, UUID

### Community 140 - "BACKEND.md"
Cohesion: 0.06
Nodes (33): Adding New Features, API Design Rules, API Naming, API Response Format, Async Rules, Authentication, Authorization, Backend Architecture (+25 more)

### Community 141 - "DATABASE.md"
Cohesion: 0.06
Nodes (30): Adding New Tables, Backup Considerations, Column Naming Rules, Data Security, Data Types, Database Design Principles, Database Development Rules, Database Normalization (+22 more)

### Community 142 - "CODING_STYLE.md"
Cohesion: 0.06
Nodes (29): API Code Style, Boolean Naming, Classes, Coding Style Rules, Comments, Constant Naming, CSS / Tailwind Style, Documentation (+21 more)

### Community 143 - "FRONTEND.md"
Cohesion: 0.06
Nodes (29): Accessibility, Adding New Features, API Communication, API Service Structure, Code Quality, Component Naming, Component Responsibility, Component Rules (+21 more)

### Community 144 - "SECURITY.md"
Cohesion: 0.07
Nodes (28): API Security, Authentication, Authentication Errors, Authorization, CORS Security, Data Sanitization, Database Security, Dependency Security (+20 more)

### Community 149 - "UI_DESIGN.md"
Cohesion: 0.07
Nodes (27): Accessibility, Animations, Border Radius, Button Types, Buttons, Card Design, Color Usage Rules, Container Rules (+19 more)

### Community 151 - "PROJECT_RULES.md"
Cohesion: 0.08
Nodes (23): AI Development Rules, Architecture, Backend, Code Generation Rules, Code Quality, Decision Priority, Dependencies, Documentation (+15 more)

### Community 194 - "UserRepository"
Cohesion: 0.12
Nodes (8): get_current_active_user(), get_current_admin_user(), get_current_user(), Session, Session, UUID, UserRepository, HTTPAuthorizationCredentials

### Community 195 - "adminCustomerSupportService.js"
Cohesion: 0.18
Nodes (9): AdminContactMessageList(), STATUS_STYLES, AdminFAQForm(), CATEGORIES, AdminFAQList(), AdminHelpArticleForm(), CATEGORIES, AdminHelpArticleList() (+1 more)

### Community 196 - "AdminDashboardPage.jsx"
Cohesion: 0.27
Nodes (6): AdminCategoryForm(), getInitialFormData(), AdminCategoryList(), AdminProductForm(), adminCategoryService, adminService

### Community 197 - "5. Database Models"
Cohesion: 0.15
Nodes (13): 5.10 Customer Support Models, 5.11 Marketing Models, 5.1 User & Auth Models, 5.2 Profile Models, 5.3 Catalog Models, 5.4 Inventory Models, 5.5 Homepage/CMS Models, 5.5 User Activity Models (+5 more)

### Community 198 - "AffiliateProgramService"
Cohesion: 0.21
Nodes (6): create_affiliate_program(), get_affiliate_program(), get_affiliate_programs(), update_affiliate_program(), AffiliateProgramResponse, AffiliateProgramService

### Community 199 - "Project_reader.md"
Cohesion: 0.17
Nodes (10): 11. Environment Variables, 12. Important Notes, 1. Project Overview, 2. Root Structure, 3. Technology Stack, 6. Pydantic Schemas, Backend, Frontend (+2 more)

### Community 200 - "AdminOrderDetail.jsx"
Cohesion: 0.24
Nodes (8): AdminOrderDetail(), escapeHtml(), STATUS_COLORS, STATUS_OPTIONS, AdminOrderList(), PAYMENT_STATUS_COLORS, STATUS_COLORS, adminOrderService

### Community 201 - "9. Key Implementation Details"
Cohesion: 0.22
Nodes (9): 9.1 Authentication Flow, 9.2 Product Catalog, 9.3 Cart & Checkout, 9.4 Promotions, 9.5 Notifications, 9.6 Inventory Management, 9.7 Customer Support, 9.8 Marketing (+1 more)

### Community 202 - "UserProfile"
Cohesion: 0.36
Nodes (3): UserProfile, ProfileRepository, date

### Community 203 - "4. Backend Architecture"
Cohesion: 0.25
Nodes (8): 4.1 Layered Architecture, 4.2 Backend Folder Structure, 4.3 Registered Routers (in `backend/app/main.py`), 4.4 Core Configuration (`core/config.py`), 4.5 Security (`core/security.py`), 4.6 Dependencies (`core/dependencies.py`), 4.7 Database Session (`database/session.py`), 4. Backend Architecture

### Community 204 - "7. Frontend Architecture"
Cohesion: 0.25
Nodes (8): 7.1 Frontend Folder Structure, 7.2 Context Providers (State Management), 7.3 API Services (`services/api/`), 7.4 Common Components (`components/common/`), 7.5 Pages (25+ pages), 7.6 Route Guards, 7.7 Frontend Dependencies, 7. Frontend Architecture

### Community 207 - "8. API Design"
Cohesion: 0.40
Nodes (5): 8.1 Response Format, 8.2 Error Format, 8.3 Pagination Format, 8.4 API Versioning, 8. API Design

### Community 208 - "Text Hierarchy"
Cohesion: 0.40
Nodes (5): Body Text, Heading, Small Text, Subheading, Text Hierarchy

### Community 209 - "Color System"
Cohesion: 0.40
Nodes (5): Color System, Neutral Colors, Primary Color, Secondary Color, Status Colors

### Community 210 - "10. Development Workflow"
Cohesion: 0.50
Nodes (4): 10.1 Adding New Backend Feature, 10.2 Adding New Frontend Feature, 10.3 Running the Application, 10. Development Workflow

## Knowledge Gaps
- **535 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `Config`, `Config`, `backend` (+530 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **70 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Order Management` to `Backend Auth & Session`, `Admin Dashboard`, `Checkout & Shipping`, `Marketing & Affiliates`, `Promotions & Coupons`, `API Endpoints`, `Frontend Admin Components`, `Inventory Management`, `User Settings`, `Promotions Backend`, `Order Returns & Exchange`, `Search Functionality`, `Admin Support`, `Category Management`, `Product Repository`, `Checkout Endpoints`, `Security & Auth`, `Email & Verification`, `Loyalty Points`, `Reports & Analytics`, `Profile Repository`, `Flash Sales`, `Admin Statistics`, `Auth Business Logic`, `Notification Repository`, `Referral System`, `Review Repository`, `Address Repository`, `Wishlist Repository`, `UserRepository`, `Test Suite`, `AffiliateProgramService`, `Recently Viewed`, `UserProfile`, `Brand Repository`, `UserAccountSetting`, `Checkout Tests`, `Banner Repository`, `StoreSettingService`?**
  _High betweenness centrality (0.203) - this node is a cross-community bridge._
- **Why does `Base` connect `Flash Sales` to `Product Catalog`, `Admin Dashboard`, `Order Management`, `Checkout & Shipping`, `Promotions & Coupons`, `Frontend Admin Components`, `Wishlist & Saved`, `Order Returns & Exchange`, `Category Management`, `Product Repository`, `Session & Device`, `Email & Verification`, `Loyalty Points`, `Profile Repository`, `Auto Discounts`, `Coupon Repository`, `Notification Repository`, `Referral System`, `Contact Messages`, `FAQ Repository`, `Review Repository`, `Help Articles`, `Address Repository`, `Wishlist Repository`, `Test Suite`, `Recently Viewed`, `UserProfile`, `Brand Repository`, `UserAccountSetting`, `Banner Repository`, `StoreSettingService`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `AuthService` connect `Inventory Management` to `Security & Auth`, `Email & Verification`, `Test Suite`, `UserRepository`, `Order Management`, `Auth Business Logic`, `Order Returns & Exchange`, `Session & Device`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 46 inferred relationships involving `User` (e.g. with `SettingsBulkUpdateRequest` and `SettingUpdateRequest`) actually correct?**
  _`User` has 46 INFERRED edges - model-reasoned connections that need verification._
- **Are the 60 inferred relationships involving `Product` (e.g. with `Base` and `AdminProductRepository`) actually correct?**
  _`Product` has 60 INFERRED edges - model-reasoned connections that need verification._
- **Are the 74 inferred relationships involving `Base` (e.g. with `Address` and `Affiliate`) actually correct?**
  _`Base` has 74 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `AdminService` (e.g. with `Product` and `AdminProductRepository`) actually correct?**
  _`AdminService` has 7 INFERRED edges - model-reasoned connections that need verification._