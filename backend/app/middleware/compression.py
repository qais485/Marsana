import gzip
import brotli
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, StreamingResponse
from io import BytesIO


class CompressionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, algorithm='gzip', level=6, min_size=1024, exclude_paths=None):
        super().__init__(app)
        self.algorithm = algorithm
        self.level = level
        self.min_size = min_size
        self.exclude_paths = exclude_paths or ['/assets', '/static']

    def should_compress(self, request: Request, content_type: str) -> bool:
        path = request.url.path
        if any(path.startswith(p) for p in self.exclude_paths):
            return False

        compressible_types = [
            'application/json',
            'text/html',
            'text/css',
            'application/javascript',
            'text/javascript',
            'text/plain',
            'application/xml',
            'text/xml',
            'image/svg+xml',
        ]

        return any(ct in content_type for ct in compressible_types)

    def get_accept_encoding(self, request: Request) -> str:
        return request.headers.get('accept-encoding', '')

    def compress_gzip(self, data: bytes) -> bytes:
        return gzip.compress(data, compresslevel=self.level)

    def compress_brotli(self, data: bytes) -> bytes:
        return brotli.compress(data, quality=min(11, self.level + 3))

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method not in ('GET', 'HEAD'):
            return response

        content_type = response.headers.get('content-type', '')
        if not self.should_compress(request, content_type):
            return response

        body = b''
        async for chunk in response.body_iterator:
            if isinstance(chunk, str):
                body += chunk.encode()
            else:
                body += chunk

        if len(body) < self.min_size:
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
            )

        accept_encoding = self.get_accept_encoding(request)

        compressed = None
        encoding = None

        if self.algorithm == 'brotli' or 'br' in accept_encoding:
            try:
                compressed = self.compress_brotli(body)
                encoding = 'br'
            except Exception:
                pass

        if not compressed and ('gzip' in accept_encoding or 'deflate' in accept_encoding):
            try:
                compressed = self.compress_gzip(body)
                encoding = 'gzip'
            except Exception:
                pass

        if not compressed:
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
            )

        headers = dict(response.headers)
        headers['content-encoding'] = encoding
        headers['content-length'] = str(len(compressed))
        headers['vary'] = 'Accept-Encoding'

        return Response(
            content=compressed,
            status_code=response.status_code,
            headers=headers,
        )
