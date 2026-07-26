import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.settings_repository import StoreSettingRepository

logger = logging.getLogger(__name__)


class StoreSettingService:
    def __init__(self, db: Session):
        self.db = db
        self.settings_repo = StoreSettingRepository(db)

    def get_all_settings(self) -> dict:
        grouped = self.settings_repo.get_all_grouped()
        result = {}
        for category, settings in grouped.items():
            result[category] = [self._serialize_setting(s) for s in settings]
        return result

    def get_settings_by_category(self, category: str) -> list[dict]:
        settings = self.settings_repo.get_by_category(category)
        return [self._serialize_setting(s) for s in settings]

    def get_setting(self, key: str) -> Optional[dict]:
        setting = self.settings_repo.get_by_key(key)
        if not setting:
            return None
        return self._serialize_setting(setting)

    def update_setting(self, key: str, value) -> dict:
        setting = self.settings_repo.get_by_key(key)
        if not setting:
            raise ValueError(f"Setting '{key}' not found")
        setting = self.settings_repo.update(setting, {"value": value})
        return self._serialize_setting(setting)

    def update_settings_bulk(self, settings_data: list[dict]) -> list[dict]:
        updated = self.settings_repo.bulk_update(settings_data)
        return [self._serialize_setting(s) for s in updated]

    def initialize_default_settings(self) -> dict:
        defaults = self._get_default_settings()
        created = []
        for setting_data in defaults:
            existing = self.settings_repo.get_by_key(setting_data["key"])
            if not existing:
                created.append(self.settings_repo.create(setting_data))
        return {
            "initialized": len(created),
            "total": len(defaults),
        }

    def _serialize_setting(self, setting) -> dict:
        return {
            "id": str(setting.id),
            "key": setting.key,
            "value": setting.value,
            "category": setting.category,
            "description": setting.description,
            "created_at": setting.created_at.isoformat() if setting.created_at else None,
            "updated_at": setting.updated_at.isoformat() if setting.updated_at else None,
        }

    def _get_default_settings(self) -> list[dict]:
        return [
            # Store Information
            {"key": "store_name", "category": "store_information", "value": "My Store", "description": "Store name displayed to customers"},
            {"key": "store_description", "category": "store_information", "value": "", "description": "Brief description of your store"},
            {"key": "store_email", "category": "store_information", "value": "", "description": "Primary contact email"},
            {"key": "store_phone", "category": "store_information", "value": "", "description": "Primary contact phone number"},
            {"key": "store_address", "category": "store_information", "value": {"street": "", "city": "", "state": "", "zip": "", "country": ""}, "description": "Store physical address"},
            {"key": "store_logo", "category": "store_information", "value": "", "description": "URL to store logo"},
            {"key": "store_favicon", "category": "store_information", "value": "", "description": "URL to store favicon"},

            # Currency
            {"key": "currency_code", "category": "currency", "value": "USD", "description": "Default currency code (ISO 4217)"},
            {"key": "currency_symbol", "category": "currency", "value": "$", "description": "Currency symbol displayed to users"},
            {"key": "currency_position", "category": "currency", "value": "before", "description": "Symbol position: 'before' or 'after' price"},
            {"key": "decimal_places", "category": "currency", "value": 2, "description": "Number of decimal places for prices"},
            {"key": "thousands_separator", "category": "currency", "value": ",", "description": "Separator for thousands"},
            {"key": "decimal_separator", "category": "currency", "value": ".", "description": "Separator for decimal places"},

            # Language
            {"key": "default_language", "category": "language", "value": "en", "description": "Default store language"},
            {"key": "available_languages", "category": "language", "value": ["en"], "description": "List of available languages"},
            {"key": "rtl_support", "category": "language", "value": False, "description": "Enable right-to-left language support"},

            # Timezone
            {"key": "timezone", "category": "timezone", "value": "UTC", "description": "Default store timezone"},
            {"key": "date_format", "category": "timezone", "value": "YYYY-MM-DD", "description": "Date display format"},
            {"key": "time_format", "category": "timezone", "value": "24h", "description": "Time format: '12h' or '24h'"},

            # Taxes
            {"key": "tax_enabled", "category": "taxes", "value": True, "description": "Enable tax calculations"},
            {"key": "tax_inclusive_pricing", "category": "taxes", "value": False, "description": "Display prices including tax"},
            {"key": "default_tax_rate", "category": "taxes", "value": 0.0, "description": "Default tax rate percentage"},
            {"key": "tax_rates", "category": "taxes", "value": [], "description": "Custom tax rates by region"},
            {"key": "tax_id_label", "category": "taxes", "value": "VAT ID", "description": "Label for tax identification number"},

            # Shipping
            {"key": "shipping_enabled", "category": "shipping", "value": True, "description": "Enable shipping calculations"},
            {"key": "free_shipping_threshold", "category": "shipping", "value": None, "description": "Minimum order amount for free shipping"},
            {"key": "default_shipping_method", "category": "shipping", "value": "standard", "description": "Default shipping method"},
            {"key": "shipping_zones_enabled", "category": "shipping", "value": True, "description": "Enable shipping zones"},
            {"key": "pickup_enabled", "category": "shipping", "value": False, "description": "Enable pickup locations"},

            # Payment Gateways
            {"key": "payment_gateways", "category": "payment_gateways", "value": {
                "stripe": {"enabled": False, "public_key": "", "secret_key": ""},
                "paypal": {"enabled": False, "client_id": "", "client_secret": ""},
                "razorpay": {"enabled": False, "key_id": "", "key_secret": ""},
            }, "description": "Payment gateway configurations"},
            {"key": "currency_exchange_api", "category": "payment_gateways", "value": "", "description": "API key for currency exchange rates"},

            # SEO
            {"key": "meta_title", "category": "seo", "value": "", "description": "Default meta title for pages"},
            {"key": "meta_description", "category": "seo", "value": "", "description": "Default meta description"},
            {"key": "meta_keywords", "category": "seo", "value": [], "description": "Default meta keywords"},
            {"key": "canonical_url", "category": "seo", "value": "", "description": "Canonical URL for the store"},
            {"key": "og_image", "category": "seo", "value": "", "description": "Open Graph image URL"},
            {"key": "robots_txt", "category": "seo", "value": "User-agent: *\nAllow: /", "description": "Robots.txt content"},
            {"key": "sitemap_enabled", "category": "seo", "value": True, "description": "Enable automatic sitemap generation"},

            # Email Templates
            {"key": "email_from_name", "category": "email_templates", "value": "My Store", "description": "Sender name for emails"},
            {"key": "email_from_address", "category": "email_templates", "value": "", "description": "Sender email address"},
            {"key": "email_header_logo", "category": "email_templates", "value": "", "description": "Logo URL for email header"},
            {"key": "email_footer_text", "category": "email_templates", "value": "© 2024 My Store. All rights reserved.", "description": "Footer text for emails"},
            {"key": "email_color_primary", "category": "email_templates", "value": "#007bff", "description": "Primary color for emails"},
            {"key": "email_templates", "category": "email_templates", "value": {
                "order_confirmation": {"enabled": True, "subject": "Order Confirmation"},
                "shipping_confirmation": {"enabled": True, "subject": "Your Order Has Shipped"},
                "delivery_confirmation": {"enabled": True, "subject": "Order Delivered"},
                "password_reset": {"enabled": True, "subject": "Password Reset Request"},
                "welcome": {"enabled": True, "subject": "Welcome to Our Store"},
                "newsletter": {"enabled": True, "subject": "Newsletter"},
            }, "description": "Email template configurations"},

            # Security - Authentication
            {"key": "auth_method", "category": "security", "value": "jwt", "description": "Authentication method (jwt, session)", "status": "existing"},
            {"key": "session_timeout", "category": "security", "value": 60, "description": "Session timeout in minutes", "status": "existing"},

            # Security - Authorization & Role Based Access
            {"key": "rbac_enabled", "category": "security", "value": True, "description": "Enable role-based access control (user/admin)", "status": "existing"},
            {"key": "admin_role_name", "category": "security", "value": "admin", "description": "Admin role identifier", "status": "existing"},

            # Security - Rate Limiting
            {"key": "rate_limit_enabled", "category": "security", "value": True, "description": "Enable API rate limiting (in-memory)", "status": "existing"},
            {"key": "rate_limit_requests", "category": "security", "value": 60, "description": "Max requests per minute per IP", "status": "existing"},
            {"key": "rate_limit_login_attempts", "category": "security", "value": 5, "description": "Max login attempts per window", "status": "existing"},
            {"key": "rate_limit_login_window", "category": "security", "value": 15, "description": "Login rate limit window in minutes", "status": "existing"},

            # Security - Account Lockout
            {"key": "account_lockout_enabled", "category": "security", "value": True, "description": "Enable account lockout after failed attempts", "status": "missing"},
            {"key": "max_login_attempts", "category": "security", "value": 5, "description": "Max failed login attempts before lockout", "status": "missing"},
            {"key": "lockout_duration", "category": "security", "value": 30, "description": "Account lockout duration in minutes", "status": "missing"},

            # Security - Password Policy
            {"key": "password_policy_enabled", "category": "security", "value": True, "description": "Enforce password strength requirements", "status": "missing"},
            {"key": "password_min_length", "category": "security", "value": 8, "description": "Minimum password length", "status": "missing"},
            {"key": "password_require_uppercase", "category": "security", "value": True, "description": "Require uppercase letter in password", "status": "missing"},
            {"key": "password_require_number", "category": "security", "value": True, "description": "Require number in password", "status": "missing"},
            {"key": "password_require_special", "category": "security", "value": True, "description": "Require special character in password", "status": "missing"},

            # Security - CSRF Protection
            {"key": "csrf_protection_enabled", "category": "security", "value": False, "description": "Enable CSRF token validation (needed for cookie-based auth)", "status": "missing"},
            {"key": "csrf_cookie_samesite", "category": "security", "value": "lax", "description": "CSRF cookie SameSite policy (lax, strict, none)", "status": "missing"},

            # Security - XSS Protection
            {"key": "xss_sanitization_enabled", "category": "security", "value": True, "description": "Sanitize user-generated content to prevent XSS", "status": "partial"},
            {"key": "content_security_policy", "category": "security", "value": "default-src 'self'", "description": "Content Security Policy header value", "status": "missing"},

            # Security - SQL Injection (auto-protected by SQLAlchemy ORM)
            {"key": "sql_injection_protection", "category": "security", "value": True, "description": "SQL injection protection via SQLAlchemy ORM (always on)", "status": "existing"},

            # Security - Audit Logs
            {"key": "audit_log_enabled", "category": "security", "value": False, "description": "Enable audit logging for security-sensitive actions", "status": "missing"},
            {"key": "audit_log_retention_days", "category": "security", "value": 90, "description": "Number of days to keep audit logs", "status": "missing"},
            {"key": "audit_log_events", "category": "security", "value": ["login_success", "login_failure", "password_change", "role_change", "data_export", "admin_action"], "description": "Events to track in audit log", "status": "missing"},

            # Security - Login History
            {"key": "login_history_enabled", "category": "security", "value": True, "description": "Track login attempts (success/failure)", "status": "missing"},
            {"key": "login_history_retention_days", "category": "security", "value": 30, "description": "Number of days to keep login history", "status": "missing"},

            # Security - Security Headers
            {"key": "security_headers_enabled", "category": "security", "value": True, "description": "Add security headers to responses", "status": "missing"},
            {"key": "hsts_enabled", "category": "security", "value": True, "description": "Enable HTTP Strict Transport Security", "status": "missing"},
            {"key": "x_frame_options", "category": "security", "value": "DENY", "description": "X-Frame-Options header value", "status": "missing"},
            {"key": "x_content_type_options", "category": "security", "value": "nosniff", "description": "X-Content-Type-Options header value", "status": "missing"},

            # Security - Maintenance
            {"key": "maintenance_mode", "category": "security", "value": False, "description": "Enable maintenance mode", "status": "existing"},
            {"key": "maintenance_message", "category": "security", "value": "We're currently undergoing maintenance. Please check back soon.", "description": "Maintenance mode message", "status": "existing"},
            {"key": "allowed_origins", "category": "security", "value": [], "description": "Allowed CORS origins", "status": "existing"},

            # Backup
            {"key": "auto_backup_enabled", "category": "backup", "value": False, "description": "Enable automatic backups"},
            {"key": "backup_frequency", "category": "backup", "value": "daily", "description": "Backup frequency: 'daily', 'weekly', 'monthly'"},
            {"key": "backup_retention_days", "category": "backup", "value": 30, "description": "Number of days to keep backups"},
            {"key": "backup_storage", "category": "backup", "value": "local", "description": "Storage type: 'local', 's3', 'gcs'"},
            {"key": "backup_s3_bucket", "category": "backup", "value": "", "description": "S3 bucket name for backups"},
            {"key": "backup_s3_key", "category": "backup", "value": "", "description": "S3 access key for backups"},
            {"key": "backup_s3_secret", "category": "backup", "value": "", "description": "S3 secret key for backups"},
            {"key": "backup_last_run", "category": "backup", "value": None, "description": "Timestamp of last backup"},

            # Performance - Lazy Loading
            {"key": "lazy_loading_enabled", "category": "performance", "value": False, "description": "Enable React.lazy() code splitting for routes", "status": "missing"},
            {"key": "lazy_load_images", "category": "performance", "value": True, "description": "Enable native lazy loading for images (loading='lazy')", "status": "missing"},
            {"key": "lazy_load_threshold", "category": "performance", "value": 200, "description": "Pixels before viewport to start loading (IntersectionObserver rootMargin)", "status": "missing"},

            # Performance - Image Optimization
            {"key": "image_optimization_enabled", "category": "performance", "value": False, "description": "Enable server-side image optimization (requires Pillow)", "status": "missing"},
            {"key": "image_format", "category": "performance", "value": "webp", "description": "Preferred image format: 'webp', 'avif', 'jpeg', 'png'", "status": "missing"},
            {"key": "image_quality", "category": "performance", "value": 80, "description": "Image compression quality (1-100)", "status": "missing"},
            {"key": "image_max_width", "category": "performance", "value": 1920, "description": "Maximum image width in pixels", "status": "missing"},
            {"key": "image_max_height", "category": "performance", "value": 1080, "description": "Maximum image height in pixels", "status": "missing"},
            {"key": "image_thumbnails", "category": "performance", "value": {"sm": 150, "md": 300, "lg": 600}, "description": "Thumbnail sizes in pixels", "status": "missing"},
            {"key": "image_srcset_enabled", "category": "performance", "value": False, "description": "Generate responsive srcset attributes", "status": "missing"},

            # Performance - Pagination (EXISTS - no settings needed)

            # Performance - Infinite Scroll
            {"key": "infinite_scroll_enabled", "category": "performance", "value": False, "description": "Enable infinite scroll on product/list pages", "status": "missing"},
            {"key": "infinite_scroll_batch_size", "category": "performance", "value": 20, "description": "Number of items to load per batch", "status": "missing"},
            {"key": "infinite_scroll_threshold", "category": "performance", "value": 100, "description": "Pixels from bottom to trigger next load", "status": "missing"},
            {"key": "virtual_scrolling_enabled", "category": "performance", "value": False, "description": "Enable virtual scrolling for large lists (react-window)", "status": "missing"},

            # Performance - Cache
            {"key": "cache_enabled", "category": "performance", "value": False, "description": "Enable server-side response caching (requires Redis)", "status": "missing"},
            {"key": "cache_backend", "category": "performance", "value": "memory", "description": "Cache backend: 'memory', 'redis', 'memcached'", "status": "missing"},
            {"key": "cache_ttl", "category": "performance", "value": 300, "description": "Default cache TTL in seconds", "status": "missing"},
            {"key": "cache_max_size", "category": "performance", "value": 1000, "description": "Max items in memory cache", "status": "missing"},
            {"key": "cache_redis_url", "category": "performance", "value": "redis://localhost:6379/0", "description": "Redis connection URL", "status": "missing"},
            {"key": "browser_cache_enabled", "category": "performance", "value": True, "description": "Set Cache-Control headers for static assets", "status": "missing"},
            {"key": "browser_cache_max_age", "category": "performance", "value": 86400, "description": "Browser cache max-age in seconds (default 24h)", "status": "missing"},
            {"key": "etag_enabled", "category": "performance", "value": True, "description": "Enable ETag headers for conditional requests", "status": "missing"},
            {"key": "stale_while_revalidate", "category": "performance", "value": 60, "description": "Stale-while-revalidate period in seconds", "status": "missing"},

            # Performance - CDN
            {"key": "cdn_enabled", "category": "performance", "value": False, "description": "Enable CDN for static assets", "status": "missing"},
            {"key": "cdn_provider", "category": "performance", "value": "cloudflare", "description": "CDN provider: 'cloudflare', 'cloudfront', 'fastly', 'custom'", "status": "missing"},
            {"key": "cdn_url", "category": "performance", "value": "", "description": "CDN base URL (e.g., https://cdn.example.com)", "status": "missing"},
            {"key": "cdn_zone_id", "category": "performance", "value": "", "description": "Cloudflare zone ID or equivalent", "status": "missing"},
            {"key": "cdn_purge_on_deploy", "category": "performance", "value": True, "description": "Auto-purge CDN cache on deployment", "status": "missing"},
            {"key": "cdn_image_resize", "category": "performance", "value": True, "description": "Use CDN for on-the-fly image resizing", "status": "missing"},

            # Performance - Compression
            {"key": "compression_enabled", "category": "performance", "value": True, "description": "Enable HTTP compression middleware", "status": "missing"},
            {"key": "compression_algorithm", "category": "performance", "value": "gzip", "description": "Compression algorithm: 'gzip', 'brotli', 'deflate'", "status": "missing"},
            {"key": "compression_level", "category": "performance", "value": 6, "description": "Compression level (1-9, higher = smaller but slower)", "status": "missing"},
            {"key": "compression_min_size", "category": "performance", "value": 1024, "description": "Minimum response size in bytes to compress", "status": "missing"},
            {"key": "compression_exclude_paths", "category": "performance", "value": ["/assets", "/static"], "description": "Paths to exclude from compression", "status": "missing"},
        ]
