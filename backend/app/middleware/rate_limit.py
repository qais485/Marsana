import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60, max_entries: int = 10000):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.max_entries = max_entries
        self.requests = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        # Always use client.host as primary identifier
        host = request.client.host if request.client else "unknown"
        
        # Only trust X-Forwarded-For if client is localhost (behind trusted proxy)
        # In production, configure a list of trusted proxy IPs
        if host in ("127.0.0.1", "::1", "localhost"):
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                # Take the first IP (original client)
                return forwarded.split(",")[0].strip()
        
        return host

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        now = time.time()
        window = 60

        # Enforce maximum entries to prevent memory exhaustion
        if len(self.requests) >= self.max_entries:
            # Clean up oldest entries
            stale_keys = [k for k, v in self.requests.items() if not v or (now - max(v)) > 60]
            for k in stale_keys[:len(stale_keys)//2]:  # Clean half at a time
                del self.requests[k]

        # Filter out expired timestamps
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < window
        ]

        # Clean up empty entries
        if not self.requests[client_ip]:
            if client_ip in self.requests:
                del self.requests[client_ip]
            self.requests[client_ip] = []

        # Check rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        self.requests[client_ip].append(now)
        return await call_next(request)
