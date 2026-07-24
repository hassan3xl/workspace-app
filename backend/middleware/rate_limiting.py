import time
import math
from typing import Tuple, Optional
from django.core.cache import cache
from django.conf import settings
from .config import (
    RATE_LIMIT_ENABLED,
    RATE_LIMIT_ANON,
    RATE_LIMIT_USER,
    RATE_LIMIT_WORKSPACE,
    THROTTLE_BURST_LIMIT,
)


def parse_rate(rate_str: str) -> Tuple[int, int]:
    """
    Parses a rate string like '60/minute', '10/second', '1000/hour', '5000/day'.
    Returns tuple of (num_requests, window_in_seconds).
    """
    try:
        count, period = rate_str.strip().lower().split('/')
        count = int(count)
        
        periods = {
            's': 1, 'sec': 1, 'second': 1, 'seconds': 1,
            'm': 60, 'min': 60, 'minute': 60, 'minutes': 60,
            'h': 3600, 'hr': 3600, 'hour': 3600, 'hours': 3600,
            'd': 86400, 'day': 86400, 'days': 86400,
        }
        
        window = periods.get(period, 60)
        return count, window
    except Exception:
        return 60, 60


def get_client_ip(request) -> str:
    """Extract client IP address from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip


class RateLimiter:
    """
    Sliding window rate limiter and burst throttler using Django cache (Redis/LocMem).
    """
    
    @classmethod
    def evaluate_sliding_window(
        cls, 
        cache_key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> Tuple[bool, int, int, int]:
        """
        Evaluates a sliding window for a given cache key.
        Returns: (allowed, limit, remaining, reset_seconds)
        """
        now = time.time()
        current_window_bucket = int(now // window_seconds)
        sub_key = f"{cache_key}:{current_window_bucket}"
        
        # Use cache increment pattern
        try:
            current_count = cache.get_or_set(sub_key, 0, timeout=window_seconds * 2)
            current_count = cache.incr(sub_key)
        except Exception:
            # Fallback if cache fails or incr on new key raises error
            cache.set(sub_key, 1, timeout=window_seconds * 2)
            current_count = 1

        reset_seconds = int(((current_window_bucket + 1) * window_seconds) - now)
        remaining = max(0, max_requests - current_count)
        allowed = current_count <= max_requests
        
        return allowed, max_requests, remaining, reset_seconds

    @classmethod
    def check_request(cls, request, workspace_id: Optional[str] = None) -> Tuple[bool, int, int, int, int, Optional[str]]:
        """
        Checks rate limits and burst throttling for an incoming request.
        
        Checks hierarchy:
        1. Burst Throttling (IP based)
        2. Workspace Limit (if workspace_id provided)
        3. User Limit (if authenticated)
        4. Anon IP Limit (if unauthenticated)

        Returns: (allowed, limit, remaining, reset_seconds, retry_after, limit_type)
        """
        if not RATE_LIMIT_ENABLED:
            return True, 999999, 999999, 0, 0, None

        ip = get_client_ip(request)
        user = getattr(request, 'user', None)
        user_id = str(user.id) if (user and user.is_authenticated) else None

        # 1. Burst Throttling Check (Short window protection e.g. 15 requests / second)
        burst_limit, burst_window = parse_rate(THROTTLE_BURST_LIMIT)
        burst_key = f"throttle:burst:{ip}"
        b_allowed, b_limit, b_rem, b_reset = cls.evaluate_sliding_window(burst_key, burst_limit, burst_window)
        if not b_allowed:
            return False, b_limit, 0, b_reset, b_reset, "burst_throttle"

        # 2. Workspace Level Rate Limit
        if workspace_id:
            ws_limit, ws_window = parse_rate(RATE_LIMIT_WORKSPACE)
            ws_key = f"rate_limit:ws:{workspace_id}"
            w_allowed, w_limit, w_rem, w_reset = cls.evaluate_sliding_window(ws_key, ws_limit, ws_window)
            if not w_allowed:
                return False, w_limit, 0, w_reset, w_reset, "workspace_rate_limit"

        # 3. User Level Rate Limit
        if user_id:
            usr_limit, usr_window = parse_rate(RATE_LIMIT_USER)
            usr_key = f"rate_limit:user:{user_id}"
            u_allowed, u_limit, u_rem, u_reset = cls.evaluate_sliding_window(usr_key, usr_limit, usr_window)
            if not u_allowed:
                return False, u_limit, 0, u_reset, u_reset, "user_rate_limit"
            return True, u_limit, u_rem, u_reset, 0, "user"

        # 4. Anonymous IP Level Rate Limit
        anon_limit, anon_window = parse_rate(RATE_LIMIT_ANON)
        anon_key = f"rate_limit:anon:{ip}"
        a_allowed, a_limit, a_rem, a_reset = cls.evaluate_sliding_window(anon_key, anon_limit, anon_window)
        if not a_allowed:
            return False, a_limit, 0, a_reset, a_reset, "anon_rate_limit"
        
        return True, a_limit, a_rem, a_reset, 0, "anon"
