from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse


class CDNMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, cdn_url='', enabled=False, image_resize=True):
        super().__init__(app)
        self.cdn_url = cdn_url.rstrip('/')
        self.enabled = enabled
        self.image_resize = image_resize

    def rewrite_url(self, url: str) -> str:
        if not self.enabled or not self.cdn_url or not url:
            return url

        if url.startswith(('http://', 'https://')):
            return url

        if url.startswith('/'):
            return f"{self.cdn_url}{url}"

        return url

    def get_image_resize_url(self, url: str, width: int = None, height: int = None, quality: int = 80, format: str = 'webp') -> str:
        if not self.enabled or not self.cdn_url or not self.image_resize:
            return url

        params = []
        if width:
            params.append(f'w={width}')
        if height:
            params.append(f'h={height}')
        params.append(f'q={quality}')
        params.append(f'f={format}')

        separator = '&' if '?' in url else '?'
        return f"{url}{separator}{'&'.join(params)}"

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if not self.enabled:
            return response

        if 'application/json' in response.headers.get('content-type', ''):
            import json
            body = b''
            async for chunk in response.body_iterator:
                if isinstance(chunk, str):
                    body += chunk.encode()
                else:
                    body += chunk

            try:
                data = json.loads(body)
                data = self._rewrite_dict(data)
                return JSONResponse(
                    content=data,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                )
            except json.JSONDecodeError:
                pass

        return response

    def _rewrite_dict(self, data):
        if isinstance(data, dict):
            result = {}
            for key, value in data.items():
                if isinstance(value, str) and key in ('url', 'image', 'image_url', 'logo', 'favicon', 'thumbnail', 'src', 'href'):
                    result[key] = self.rewrite_url(value)
                elif isinstance(value, (dict, list)):
                    result[key] = self._rewrite_dict(value)
                else:
                    result[key] = value
            return result
        elif isinstance(data, list):
            return [self._rewrite_dict(item) for item in data]
        return data
