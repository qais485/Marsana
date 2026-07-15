from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.endpoints import router as auth_router
from app.api.routes.admin_endpoints import router as admin_router
from app.api.routes.category_endpoints import router as category_router
from app.api.routes.homepage_endpoints import router as homepage_router
from app.api.routes.product_catalog_endpoints import router as product_catalog_router
from app.api.routes.profile_endpoints import router as profile_router, public_router as wishlist_public_router
from app.api.routes.search_endpoints import router as search_router
from app.api.routes.cart_endpoints import router as cart_router
from app.api.routes.checkout_endpoints import router as checkout_router
from app.api.routes.promotion_endpoints import router as promotion_router
from app.api.routes.admin_notification_endpoints import router as admin_notification_router
from app.api.routes.admin_customer_support_endpoints import router as admin_support_router
from app.api.routes.customer_support_endpoints import router as support_router
from app.core.config import settings
from app.middleware.rate_limit import RateLimitMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(profile_router)
app.include_router(homepage_router)
app.include_router(product_catalog_router)
app.include_router(category_router)
app.include_router(search_router)
app.include_router(cart_router)
app.include_router(checkout_router)
app.include_router(promotion_router)
app.include_router(admin_notification_router)
app.include_router(admin_support_router)
app.include_router(support_router)
app.include_router(wishlist_public_router)


@app.get("/api/v1/health")
def health_check():
    return {"success": True, "message": "Service is running"}
