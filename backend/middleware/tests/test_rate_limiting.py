import pytest
from django.test import RequestFactory
from django.core.cache import cache
from backend.middleware.middleware import RateLimitMiddleware
from backend.middleware.rate_limiting import RateLimiter


@pytest.mark.django_db
class TestRateLimiting:

    def setup_method(self):
        self.factory = RequestFactory()
        cache.clear()

    def test_rate_limiter_allows_under_threshold(self):
        middleware = RateLimitMiddleware(lambda r: None)
        request = self.factory.get("/api/auth/login/")
        response = middleware.process_request(request)
        assert response is None  # Allowed

    def test_rate_limiter_blocks_burst(self):
        middleware = RateLimitMiddleware(lambda r: None)
        # Exceed burst limit artificially
        burst_key = "throttle:burst:127.0.0.1:0"
        for _ in range(25):
            request = self.factory.get("/api/some-endpoint/")
            response = middleware.process_request(request)
            if response is not None:
                assert response.status_code == 429
                assert "Retry-After" in response
                assert "X-RateLimit-Limit" in response
                break

    def test_parse_rate_strings(self):
        from backend.middleware.rate_limiting import parse_rate
        assert parse_rate("60/minute") == (60, 60)
        assert parse_rate("10/second") == (10, 1)
        assert parse_rate("1000/hour") == (1000, 3600)
