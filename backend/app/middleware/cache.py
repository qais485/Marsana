from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class CacheMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, default_max_age=86400, exclude_paths=None):
        super().__init__(app)
        self.default_max_age = default_max_age
        self.exclude_paths = exclude_paths or ['/api/v1/admin', '/api/v1/health']

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        path = request.url.path

        if any(path.startswith(p) for p in self.exclude_paths):
            return response

        if request.method != 'GET':
            return response

        content_type = response.headers.get('content-type', '')

        if 'application/json' in content_type:
            max_age = 300
            cache_control = f'public, max-age={max_age}, stale-while-revalidate=60'
        elif any(t in content_type for t in ['text/html', 'text/css', 'application/javascript']):
            max_age = self.default_max_age
            cache_control = f'public, max-age={max_age}, immutable'
        elif any(t in content_type for t in ['image/', 'font/', 'video/']):
            max_age = 31536000
            cache_control = f'public, max-age={max_age}, immutable'
        else:
            max_age = 3600
            cache_control = f'public, max-age={max_age}'

        response.headers['Cache-Control'] = cache_control

        if request.method == 'GET' and 200 <= response.status_code < 300:
            import hashlib
            import time
            etag_input = f"{path}-{response.headers.get('content-length', '0')}-{int(time.time() / 300)}"
            etag = hashlib.md5(etag_input.encode()).hexdigest()
            response.headers['ETag'] = f'"{etag}"'

            if_none_match = request.headers.get('if-none-match')
            if if_none_match and if_none_match.strip('"') == etag:
                return Response(status_code=304)

        return response
