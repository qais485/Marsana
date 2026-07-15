import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        host = request.client.host if request.client else "unknown"
        if host in ("127.0.0.1", "::1", "localhost"):
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                return forwarded.split(",")[0].strip()
        return host

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        now = time.time()
        window = 60

        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < window
        ]

        stale_keys = [k for k, v in self.requests.items() if not v or (now - max(v)) > 60]
        for k in stale_keys:
            del self.requests[k]

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        self.requests[client_ip].append(now)
        return await call_next(request)
