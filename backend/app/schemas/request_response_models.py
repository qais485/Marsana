from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ─── Base Response ───────────────────────────────────────────────


class BaseResponse(BaseModel):
    success: bool
    message: str


class SuccessResponse(BaseResponse):
    data: Optional[dict] = None


# ─── Auth Schemas ────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class RegisterResponse(BaseResponse):
    data: Optional[dict] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    device_name: Optional[str] = None
    device_type: Optional[str] = None


class TokenResponse(BaseResponse):
    data: Optional[dict] = None


class LogoutRequest(BaseModel):
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ─── Email Verification ─────────────────────────────────────────


class SendEmailVerificationRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    token: str
    code: str


class ChangeEmailRequest(BaseModel):
    new_email: EmailStr
    password: str


# ─── Password Schemas ────────────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


# ─── Two-Factor Authentication ──────────────────────────────────


class Enable2FARequest(BaseModel):
    password: str


class Verify2FARequest(BaseModel):
    temp_token: str = Field(description="Temporary token from login with 2FA")
    code: str = Field(max_length=6, pattern=r"^\d{6}$", description="6-digit TOTP verification code")


class Disable2FARequest(BaseModel):
    password: str
    code: str


class TwoFactorSetupResponse(BaseResponse):
    data: Optional[dict] = None


# ─── Social Login ────────────────────────────────────────────────


class SocialLoginRequest(BaseModel):
    provider: str = Field(pattern=r"^google$")
    access_token: str
    device_name: Optional[str] = None
    device_type: Optional[str] = None


# ─── Session & Device Schemas ────────────────────────────────────


class DeviceResponse(BaseModel):
    id: UUID
    device_name: str
    device_type: str
    device_os: Optional[str]
    browser: Optional[str]
    ip_address: Optional[str]
    last_active_at: datetime
    is_trusted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    id: UUID
    device_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    is_active: bool
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class DevicesListResponse(BaseResponse):
    data: Optional[list[DeviceResponse]] = None


class SessionsListResponse(BaseResponse):
    data: Optional[list[SessionResponse]] = None


class RevokeDeviceRequest(BaseModel):
    device_id: UUID


class RevokeAllSessionsRequest(BaseModel):
    password: str


# ─── Profile Schemas ─────────────────────────────────────────────


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    bio: Optional[str] = Field(None, max_length=500)
    gender: Optional[str] = Field(
        None, pattern=r"^(male|female|other|prefer_not_to_say)$"
    )
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    avatar_url: Optional[str]
    phone_number: Optional[str]
    date_of_birth: Optional[date]
    bio: Optional[str]
    gender: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserWithProfileResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    is_email_verified: bool
    is_2fa_enabled: bool
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True


# ─── Address Schemas ─────────────────────────────────────────────


class AddressCreateRequest(BaseModel):
    address_type: str = Field(pattern=r"^(billing|shipping)$")
    label: Optional[str] = Field(None, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    address_line_1: str = Field(min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=1, max_length=20)
    country: str = Field(min_length=1, max_length=100)
    is_default: bool = False


class AddressUpdateRequest(BaseModel):
    address_type: Optional[str] = Field(None, pattern=r"^(billing|shipping)$")
    label: Optional[str] = Field(None, max_length=100)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    address_line_1: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: UUID
    user_id: UUID
    address_type: str
    label: Optional[str]
    first_name: str
    last_name: str
    phone_number: Optional[str]
    address_line_1: str
    address_line_2: Optional[str]
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AddressListResponse(BaseResponse):
    data: Optional[list[AddressResponse]] = None


# ─── Wishlist Schemas ────────────────────────────────────────────


class WishlistAddRequest(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    product_name: str = Field(min_length=1, max_length=255)
    product_price: str = Field(min_length=1, max_length=20)
    product_image: Optional[str] = None


class WishlistItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: Optional[UUID] = None
    product_name: str
    product_price: str
    product_image: Optional[str]
    share_token: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WishlistListResponse(BaseResponse):
    data: Optional[list[WishlistItemResponse]] = None


class WishlistShareResponse(BaseModel):
    share_url: str
    share_token: str


class WishlistMoveToCartRequest(BaseModel):
    quantity: int = Field(default=1, ge=1, le=99)


class SharedWishlistItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_price: str
    product_image: Optional[str]


class SharedWishlistResponse(BaseModel):
    owner_name: str
    items: list[SharedWishlistItemResponse]
    item_count: int
    shared_at: str


# ─── Recently Viewed Schemas ─────────────────────────────────────


class RecentlyViewedAddRequest(BaseModel):
    product_id: UUID
    product_name: str = Field(min_length=1, max_length=255)
    product_price: str = Field(min_length=1, max_length=20)
    product_image: Optional[str] = None


class RecentlyViewedResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_price: str
    product_image: Optional[str]
    viewed_at: datetime

    class Config:
        from_attributes = True


class RecentlyViewedListResponse(BaseResponse):
    data: Optional[list[RecentlyViewedResponse]] = None


# ─── Notification Schemas ────────────────────────────────────────


class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseResponse):
    data: Optional[list[NotificationResponse]] = None
    unread_count: Optional[int] = None


# ─── Admin Notification Schemas ──────────────────────────────────


class NotificationTemplateCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=100, pattern=r"^[a-z0-9_-]+$")
    description: Optional[str] = None
    subject: str = Field(min_length=1, max_length=255)
    title_template: str = Field(min_length=1, max_length=255)
    message_template: str = Field(min_length=1)
    notification_type: str = Field(pattern=r"^(order|promotion|security|system)$")
    channel: str = Field(default="all", pattern=r"^(all|in_app|email|push)$")
    is_active: bool = True
    send_email: bool = True
    send_push: bool = True
    send_in_app: bool = True


class NotificationTemplateUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    title_template: Optional[str] = Field(None, min_length=1, max_length=255)
    message_template: Optional[str] = Field(None, min_length=1)
    notification_type: Optional[str] = Field(None, pattern=r"^(order|promotion|security|system)$")
    channel: Optional[str] = Field(None, pattern=r"^(all|in_app|email|push)$")
    is_active: Optional[bool] = None
    send_email: Optional[bool] = None
    send_push: Optional[bool] = None
    send_in_app: Optional[bool] = None


class NotificationTemplateResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    subject: str
    title_template: str
    message_template: str
    notification_type: str
    channel: str
    is_active: bool
    send_email: bool
    send_push: bool
    send_in_app: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class NotificationCreateRequest(BaseModel):
    user_id: Optional[UUID] = None
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    notification_type: str = Field(pattern=r"^(order|promotion|security|system)$")
    send_email: bool = False
    send_push: bool = False
    send_in_app: bool = True


class NotificationBroadcastRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    notification_type: str = Field(pattern=r"^(order|promotion|security|system)$")
    target: str = Field(default="all", pattern=r"^(all|active|inactive)$")
    send_email: bool = False
    send_push: bool = False
    send_in_app: bool = True


class NotificationLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    template_id: Optional[UUID]
    channel: str
    title: str
    message: str
    status: str
    error_message: Optional[str]
    reference_type: Optional[str]
    reference_id: Optional[str]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# ─── Privacy Settings Schemas ────────────────────────────────────


class PrivacySettingsUpdateRequest(BaseModel):
    show_email: Optional[bool] = None
    show_phone: Optional[bool] = None
    show_address: Optional[bool] = None
    profile_visible: Optional[bool] = None


class PrivacySettingsResponse(BaseModel):
    id: UUID
    user_id: UUID
    show_email: bool
    show_phone: bool
    show_address: bool
    profile_visible: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Account Settings Schemas ────────────────────────────────────


class AccountSettingsUpdateRequest(BaseModel):
    email_notifications: Optional[bool] = None
    order_updates: Optional[bool] = None
    promotional_emails: Optional[bool] = None
    security_alerts: Optional[bool] = None
    language: Optional[str] = Field(None, max_length=10)
    currency: Optional[str] = Field(None, max_length=10)


class AccountSettingsResponse(BaseModel):
    id: UUID
    user_id: UUID
    email_notifications: bool
    order_updates: bool
    promotional_emails: bool
    security_alerts: bool
    language: str
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Delete Account Schemas ──────────────────────────────────────


class DeleteAccountRequest(BaseModel):
    password: str
    confirmation: str = Field(pattern=r"^DELETE_MY_ACCOUNT$")


# ─── Category Schemas ────────────────────────────────────────────


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    parent_id: Optional[UUID]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryListResponse(BaseResponse):
    data: Optional[list[CategoryResponse]] = None


# ─── Admin Category Schemas ──────────────────────────────────────


class AdminCategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_active: bool = True
    sort_order: int = 0


class AdminCategoryUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class AdminCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    parent_id: Optional[UUID]
    is_active: bool
    sort_order: int
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminCategoryListResponse(BaseResponse):
    data: Optional[list[AdminCategoryResponse]] = None


# ─── Brand Schemas ───────────────────────────────────────────────


class BrandResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    logo_url: Optional[str]
    description: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BrandListResponse(BaseResponse):
    data: Optional[list[BrandResponse]] = None


# ─── Product Schemas ─────────────────────────────────────────────


class ProductResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    short_description: Optional[str]
    price: float
    discount_price: Optional[float]
    images: Optional[str]
    category_id: Optional[UUID]
    brand_id: Optional[UUID]
    stock_quantity: int
    sku: Optional[str]
    is_active: bool
    is_featured: bool
    is_new_arrival: bool
    is_best_seller: bool
    rating: float
    review_count: int
    sold_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseResponse):
    data: Optional[list[ProductResponse]] = None
    pagination: Optional[dict] = None


# ─── Product Catalog Schemas ────────────────────────────────────────


class ProductImageResponse(BaseModel):
    id: UUID
    product_id: UUID
    url: str
    alt_text: Optional[str]
    sort_order: int
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductVariantResponse(BaseModel):
    id: UUID
    product_id: UUID
    name: str
    sku: Optional[str]
    price: float
    discount_price: Optional[float]
    stock_quantity: int
    option_values: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductAttributeResponse(BaseModel):
    id: UUID
    product_id: UUID
    attribute_name: str
    attribute_value: str
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductSpecificationResponse(BaseModel):
    id: UUID
    product_id: UUID
    section_name: str
    spec_name: str
    spec_value: str
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductTagResponse(BaseModel):
    id: UUID
    name: str
    slug: str

    class Config:
        from_attributes = True


class ProductReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None


class ProductReviewResponse(BaseModel):
    id: UUID
    product_id: UUID
    user_id: UUID
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    rating: int
    title: Optional[str]
    content: Optional[str]
    is_verified_purchase: bool
    is_approved: bool
    helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductReviewListResponse(BaseResponse):
    data: Optional[list[ProductReviewResponse]] = None
    pagination: Optional[dict] = None


class ReviewReportRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None


class ReviewHelpfulResponse(BaseModel):
    helpful_count: int
    is_helpful: bool


class ProductDetailResponse(BaseResponse):
    data: Optional[dict] = None


# ─── Flash Sale Schemas ──────────────────────────────────────────


class FlashSaleItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    product_price: Optional[float] = None
    sale_price: float
    stock_limit: int
    stock_sold: int

    class Config:
        from_attributes = True


class FlashSaleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    is_active: bool
    items: list[FlashSaleItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FlashSaleListResponse(BaseResponse):
    data: Optional[list[FlashSaleResponse]] = None


# ─── Banner Schemas ──────────────────────────────────────────────


class BannerResponse(BaseModel):
    id: UUID
    title: str
    subtitle: Optional[str]
    image_url: str
    link_url: Optional[str]
    button_text: Optional[str]
    position: str
    is_active: bool
    sort_order: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BannerListResponse(BaseResponse):
    data: Optional[list[BannerResponse]] = None


# ─── Testimonial Schemas ─────────────────────────────────────────


class TestimonialResponse(BaseModel):
    id: UUID
    customer_name: str
    customer_avatar: Optional[str]
    customer_title: Optional[str]
    content: str
    rating: int
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestimonialListResponse(BaseResponse):
    data: Optional[list[TestimonialResponse]] = None


# ─── Blog Schemas ────────────────────────────────────────────────


class BlogPostResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    content: Optional[str]
    excerpt: Optional[str]
    cover_image: Optional[str]
    author_name: str
    author_avatar: Optional[str]
    category: Optional[str]
    tags: Optional[str]
    is_published: bool
    published_at: Optional[datetime]
    view_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostListResponse(BaseResponse):
    data: Optional[list[BlogPostResponse]] = None
    pagination: Optional[dict] = None


# ─── Newsletter Schemas ──────────────────────────────────────────


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterSubscribeResponse(BaseResponse):
    data: Optional[dict] = None


# ─── Homepage Schemas ────────────────────────────────────────────


class HomepageDataResponse(BaseResponse):
    data: Optional[dict] = None


# ─── Search Schemas ────────────────────────────────────────────


class SearchSuggestionItem(BaseModel):
    type: str
    id: UUID
    name: str
    slug: Optional[str] = None
    image_url: Optional[str] = None


class SearchSuggestionsResponse(BaseResponse):
    data: Optional[list[SearchSuggestionItem]] = None


class PopularSearchResponse(BaseModel):
    id: UUID
    query: str
    count: int

    class Config:
        from_attributes = True


class PopularSearchListResponse(BaseResponse):
    data: Optional[list[PopularSearchResponse]] = None


class SearchHistoryResponse(BaseModel):
    id: UUID
    query: str
    created_at: datetime

    class Config:
        from_attributes = True


class SearchHistoryListResponse(BaseResponse):
    data: Optional[list[SearchHistoryResponse]] = None


class SearchHistoryCreateRequest(BaseModel):
    query: str = Field(min_length=1, max_length=255)


class SearchResultItem(BaseModel):
    type: str
    id: UUID
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None


class SearchResultListResponse(BaseResponse):
    data: Optional[list[SearchResultItem]] = None
    pagination: Optional[dict] = None


# ─── Admin Product Schemas ──────────────────────────────────────


class AdminProductCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: float = Field(gt=0)
    discount_price: Optional[float] = Field(None, gt=0)
    images: Optional[str] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    stock_quantity: int = Field(default=0, ge=0)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    is_active: bool = True
    is_featured: bool = False
    is_new_arrival: bool = False
    is_best_seller: bool = False


class AdminProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    discount_price: Optional[float] = Field(None, gt=0)
    images: Optional[str] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_best_seller: Optional[bool] = None


class AdminProductResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    short_description: Optional[str]
    price: float
    discount_price: Optional[float]
    images: Optional[str]
    category_id: Optional[UUID]
    category_name: Optional[str] = None
    brand_id: Optional[UUID]
    brand_name: Optional[str] = None
    stock_quantity: int
    sku: Optional[str]
    barcode: Optional[str]
    is_active: bool
    is_featured: bool
    is_new_arrival: bool
    is_best_seller: bool
    rating: float
    review_count: int
    sold_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminProductListResponse(BaseResponse):
    data: Optional[list[AdminProductResponse]] = None
    pagination: Optional[dict] = None


class AdminProductInventoryRequest(BaseModel):
    stock_quantity: int = Field(ge=0)


class AdminProductImportRow(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_name: Optional[str] = None
    brand_name: Optional[str] = None
    stock_quantity: int = 0
    sku: Optional[str] = None
    barcode: Optional[str] = None
    is_active: bool = True


class AdminProductImportRequest(BaseModel):
    products: list[AdminProductImportRow]


class AdminProductImportResponse(BaseResponse):
    data: Optional[dict] = None


# ─── Admin Order Schemas ─────────────────────────────────────────


class AdminOrderItemResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID]
    product_name: str
    product_sku: Optional[str]
    product_image: Optional[str]
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True


class AdminOrderStatusHistoryResponse(BaseModel):
    id: UUID
    status: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminOrderResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    order_number: str
    status: str
    payment_status: str
    payment_method: Optional[str]
    subtotal: float
    tax_amount: float
    shipping_cost: float
    discount_amount: float
    total_amount: float
    shipping_name: Optional[str]
    shipping_address: Optional[str]
    shipping_city: Optional[str]
    shipping_state: Optional[str]
    shipping_postal_code: Optional[str]
    shipping_country: Optional[str]
    shipping_phone: Optional[str]
    tracking_number: Optional[str]
    shipping_carrier: Optional[str]
    notes: Optional[str]
    admin_notes: Optional[str]
    refund_amount: float
    refund_reason: Optional[str]
    refunded_at: Optional[datetime]
    items: list[AdminOrderItemResponse] = []
    status_history: list[AdminOrderStatusHistoryResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminOrderListResponse(BaseResponse):
    data: Optional[list[AdminOrderResponse]] = None


class AdminOrderStatusUpdateRequest(BaseModel):
    status: str = Field(min_length=1, max_length=50, pattern=r"^(pending|confirmed|processing|shipped|delivered|cancelled|refunded)$")
    note: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None


class AdminOrderRefundRequest(BaseModel):
    refund_amount: float = Field(gt=0)
    refund_reason: str = Field(min_length=1, max_length=500)


class AdminOrderNotesRequest(BaseModel):
    admin_notes: Optional[str] = None


# ─── Cart Schemas ────────────────────────────────────────────────


class CartAddRequest(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(default=1, ge=1, le=99)


class CartUpdateQuantityRequest(BaseModel):
    quantity: int = Field(ge=1, le=99)


class CartApplyCouponRequest(BaseModel):
    coupon_code: str = Field(min_length=1, max_length=50)


class CartApplyGiftCardRequest(BaseModel):
    gift_card_code: str = Field(min_length=1, max_length=50)


class CartShippingRequest(BaseModel):
    shipping_method: str = Field(min_length=1, max_length=50)


class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: Optional[UUID]
    quantity: int
    product_name: str
    product_price: float
    product_image: Optional[str]
    product_sku: Optional[str]
    product_in_stock: bool = True
    product_max_quantity: int = 99
    created_at: datetime

    class Config:
        from_attributes = True


class SavedForLaterResponse(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: Optional[UUID]
    product_name: str
    product_price: float
    product_image: Optional[str]
    product_sku: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CartSummaryResponse(BaseModel):
    subtotal: float
    discount_amount: float
    estimated_tax: float
    estimated_shipping: float
    gift_card_amount: float
    total: float
    coupon_code: Optional[str]
    gift_card_code: Optional[str]
    shipping_method: Optional[str]
    item_count: int


class CartResponse(BaseModel):
    id: UUID
    items: list[CartItemResponse]
    summary: CartSummaryResponse
    saved_items: list[SavedForLaterResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        # NOTE: from_attributes may not correctly serialize composite/nested fields;
        # manual mapping or validators may be needed for full fidelity.
        from_attributes = True


class CartResponseEnvelope(BaseResponse):
    data: Optional[CartResponse] = None


# ─── Checkout Schemas ───────────────────────────────────────────


class CheckoutAddressRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    address_line_1: str = Field(min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=1, max_length=20)
    country: str = Field(min_length=1, max_length=100)


class CreditCardDetails(BaseModel):
    card_number: str = Field(min_length=13, max_length=19)
    expiry: str = Field(pattern=r"^\d{2}/\d{2}$")
    cardholder_name: Optional[str] = Field(None, max_length=200)


class CheckoutRequest(BaseModel):
    email: EmailStr
    shipping_address: CheckoutAddressRequest
    billing_address: Optional[CheckoutAddressRequest] = None
    billing_same_as_shipping: bool = True
    shipping_method: str = Field(pattern=r"^(standard|express|overnight|pickup)$")
    payment_method: str = Field(pattern=r"^(cod|credit_card|paypal)$")
    payment_details: Optional[CreditCardDetails] = None
    notes: Optional[str] = Field(None, max_length=500)
    terms_agreed: bool
    coupon_code: Optional[str] = None
    gift_card_code: Optional[str] = None


class GuestCartItem(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(default=1, ge=1, le=99)


class GuestCheckoutRequest(BaseModel):
    email: EmailStr
    shipping_address: CheckoutAddressRequest
    billing_address: Optional[CheckoutAddressRequest] = None
    billing_same_as_shipping: bool = True
    shipping_method: str = Field(pattern=r"^(standard|express|overnight|pickup)$")
    payment_method: str = Field(pattern=r"^(cod|credit_card|paypal)$")
    payment_details: Optional[CreditCardDetails] = None
    notes: Optional[str] = Field(None, max_length=500)
    terms_agreed: bool
    coupon_code: Optional[str] = None
    gift_card_code: Optional[str] = None
    cart_items: list[GuestCartItem] = Field(default_factory=list, description="Cart items for guest checkout")


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID]
    product_name: str
    product_sku: Optional[str]
    product_image: Optional[str]
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: UUID
    status: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    status: str
    payment_status: str
    payment_method: Optional[str]
    subtotal: float
    tax_amount: float
    shipping_cost: float
    discount_amount: float
    gift_card_amount: float = 0.0
    total_amount: float
    shipping_email: Optional[str]
    shipping_name: Optional[str]
    shipping_address: Optional[str]
    shipping_city: Optional[str]
    shipping_state: Optional[str]
    shipping_postal_code: Optional[str]
    shipping_country: Optional[str]
    shipping_phone: Optional[str]
    billing_name: Optional[str]
    billing_address: Optional[str]
    billing_city: Optional[str]
    billing_state: Optional[str]
    billing_postal_code: Optional[str]
    billing_country: Optional[str]
    tracking_number: Optional[str]
    shipping_carrier: Optional[str]
    notes: Optional[str]
    items: list[OrderItemResponse] = []
    status_history: list[OrderStatusHistoryResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseResponse):
    data: Optional[list[dict]] = None
    pagination: Optional[dict] = None


class CheckoutResponse(BaseResponse):
    data: Optional[dict] = None


class OrderTrackingRequest(BaseModel):
    email: EmailStr
    order_number: str


class OrderTrackingResponse(BaseResponse):
    data: Optional[dict] = None


class CancelOrderRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500, description="Reason for cancellation")


class ReturnRequestCreate(BaseModel):
    reason: str = Field(..., min_length=1, max_length=100, description="Reason for return")
    description: str = Field(..., min_length=1, max_length=1000, description="Detailed description")


class ExchangeRequestCreate(BaseModel):
    order_item_id: UUID = Field(..., description="Item to exchange")
    reason: str = Field(..., min_length=1, max_length=100, description="Reason for exchange")
    description: str = Field(..., min_length=1, max_length=1000, description="What you want instead")


class ReturnRequestResponse(BaseModel):
    id: UUID
    order_id: UUID
    reason: str
    description: Optional[str] = None
    status: str
    admin_response: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExchangeRequestResponse(BaseModel):
    id: UUID
    order_id: UUID
    order_item_id: UUID
    reason: str
    description: Optional[str] = None
    status: str
    admin_response: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseResponse):
    data: Optional[dict] = None


class ShippingMethodResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    carrier: Optional[str] = None
    estimated_days_min: int
    estimated_days_max: int
    is_express: bool = False
    cost: float
    free_shipping: bool = False

    model_config = ConfigDict(from_attributes=True)


class PickupLocationResponse(BaseModel):
    id: UUID
    name: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    working_hours: Optional[str] = None
    instructions: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TrackingEventResponse(BaseModel):
    id: UUID
    status: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_time: datetime

    model_config = ConfigDict(from_attributes=True)


class DeliveryTrackingResponse(BaseModel):
    id: UUID
    order_id: UUID
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    status: str
    status_description: Optional[str] = None
    location: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    out_for_delivery_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    events: list[TrackingEventResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ShippingAddressRequest(BaseModel):
    country: str = Field(..., min_length=1, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=100)


# ─── Promotion Schemas ────────────────────────────────────────


class CouponCreateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(default="percentage", pattern=r"^(percentage|fixed_amount)$")
    discount_value: float = Field(gt=0)
    min_order_amount: float = Field(default=0, ge=0)
    max_uses: Optional[int] = Field(None, ge=1)
    per_user_limit: Optional[int] = Field(None, ge=1)
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CouponUpdateRequest(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = Field(None, pattern=r"^(percentage|fixed_amount)$")
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    max_uses: Optional[int] = Field(None, ge=1)
    per_user_limit: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CouponResponse(BaseModel):
    id: UUID
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_uses: Optional[int]
    used_count: int
    per_user_limit: Optional[int]
    is_active: bool
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class CouponApplyRequest(BaseModel):
    coupon_code: str = Field(min_length=1, max_length=50)


class AutoDiscountCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    discount_type: str = Field(default="percentage")
    discount_value: float = Field(gt=0)
    min_order_amount: float = Field(default=0, ge=0)
    min_quantity: int = Field(default=1, ge=1)
    target_type: str = Field(default="all", pattern=r"^(all|specific_products|specific_categories)$")
    target_product_ids: Optional[str] = None
    target_category_ids: Optional[str] = None
    buy_x_get_y_buy_qty: Optional[int] = None
    buy_x_get_y_get_qty: Optional[int] = None
    buy_x_get_y_discount: Optional[float] = None
    is_active: bool = True
    priority: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AutoDiscountUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    discount_type: Optional[str] = Field(None, pattern=r"^(percentage|fixed_amount|buy_x_get_y)$")
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    min_quantity: Optional[int] = Field(None, ge=1)
    target_type: Optional[str] = Field(None, pattern=r"^(all|specific_products|specific_categories)$")
    target_product_ids: Optional[str] = None
    target_category_ids: Optional[str] = None
    buy_x_get_y_buy_qty: Optional[int] = None
    buy_x_get_y_get_qty: Optional[int] = None
    buy_x_get_y_discount: Optional[float] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AutoDiscountResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_amount: float
    min_quantity: int
    target_type: str
    target_product_ids: Optional[str]
    target_category_ids: Optional[str]
    buy_x_get_y_buy_qty: Optional[int]
    buy_x_get_y_get_qty: Optional[int]
    buy_x_get_y_discount: Optional[float]
    is_active: bool
    priority: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class LoyaltyPointResponse(BaseModel):
    points_balance: int
    lifetime_earned: int
    lifetime_redeemed: int

    model_config = ConfigDict(from_attributes=True)


class LoyaltyPointTransactionResponse(BaseModel):
    id: UUID
    points: int
    transaction_type: str
    description: Optional[str]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class LoyaltyRedeemRequest(BaseModel):
    points: int = Field(gt=0)


class ReferralCodeResponse(BaseModel):
    code: str
    usage_count: int
    max_uses: Optional[int]
    is_active: bool
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class ReferralApplyRequest(BaseModel):
    referral_code: str = Field(min_length=1, max_length=20)


class ReferralRewardResponse(BaseModel):
    id: UUID
    referrer_id: UUID
    referred_id: Optional[UUID]
    referral_code: str
    reward_type: str
    reward_value: int
    status: str
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class FlashSaleCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool = True


class FlashSaleUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class FlashSaleItemCreateRequest(BaseModel):
    product_id: UUID
    sale_price: float = Field(gt=0)
    stock_limit: Optional[int] = Field(None, ge=0)


class PromotionValidateResponse(BaseModel):
    valid: bool
    message: str
    discount_amount: Optional[float] = None
    discount_type: Optional[str] = None


# ─── Customer Support Schemas ──────────────────────────────────────


class ContactMessageCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)


class ContactMessageUpdateRequest(BaseModel):
    status: Optional[str] = None
    admin_reply: Optional[str] = None


class ContactMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    subject: str
    message: str
    status: str
    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class FAQItemCreateRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1)
    category: str = Field(default="general", max_length=100)
    sort_order: int = 0
    is_active: bool = True


class FAQItemUpdateRequest(BaseModel):
    question: Optional[str] = Field(None, min_length=1, max_length=500)
    answer: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=100)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class FAQItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question: str
    answer: str
    category: str
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class HelpArticleCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    category: str = Field(default="general", max_length=100)
    is_published: bool = True


class HelpArticleUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    is_published: Optional[bool] = None


class HelpArticleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    category: str
    is_published: bool
    view_count: int
    created_at: datetime
    updated_at: datetime
