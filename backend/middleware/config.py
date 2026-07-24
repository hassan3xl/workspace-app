import re
from django.conf import settings


def get_setting(key, default):
    return getattr(settings, key, default)


# Rate Limiting & Throttling Configs
RATE_LIMIT_ENABLED = getattr(settings, "MIDDLEWARE_RATE_LIMIT_ENABLED", True)

# Default Rates (Format: "count/window", e.g. "60/minute", "10/second", "1000/hour", "5000/day")
RATE_LIMIT_ANON = getattr(settings, "MIDDLEWARE_RATE_LIMIT_ANON", "60/minute")
RATE_LIMIT_USER = getattr(settings, "MIDDLEWARE_RATE_LIMIT_USER", "1000/minute")
RATE_LIMIT_WORKSPACE = getattr(settings, "MIDDLEWARE_RATE_LIMIT_WORKSPACE", "3000/minute")

# Throttling / Burst Limit (e.g., max 15 requests in a 1-second burst window)
THROTTLE_BURST_LIMIT = getattr(settings, "MIDDLEWARE_THROTTLE_BURST_LIMIT", "15/second")

# Path Exclusion Regex Patterns (Always skip workspace enforcement and rate limiting for these)
EXCLUDED_PATH_PATTERNS = getattr(
    settings,
    "MIDDLEWARE_EXCLUDED_PATH_PATTERNS",
    [
        r"^/admin/",
        r"^/__debug__/",
        r"^/static/",
        r"^/media/",
        r"^/favicon\.ico$",
        r"^/api/auth/",
    ]
)

# Workspace-Optional Path Patterns (Workspace enforcement is applied ONLY IF workspace_id is provided)
WORKSPACE_OPTIONAL_PATH_PATTERNS = getattr(
    settings,
    "MIDDLEWARE_WORKSPACE_OPTIONAL_PATH_PATTERNS",
    [
        r"^/api/workspaces/?$",                    # Workspace list / create
        r"^/api/workspaces/invitations/?",         # Invitation accept / reject list
        r"^/api/workspaces/invites/?",             # Invitation accept / reject / cancel
        r"^/api/user/",                             # User profile endpoints
        r"^/api/notifications/",                   # User global notifications
        r"^/api/settings/",                         # User global settings
    ]
)

# Postgres RLS Configuration
RLS_ENABLED = getattr(settings, "MIDDLEWARE_RLS_ENABLED", True)


def is_path_excluded(path: str) -> bool:
    """Check if request path is excluded from middleware enforcement."""
    for pattern in EXCLUDED_PATH_PATTERNS:
        if re.match(pattern, path):
            return True
    return False


def is_workspace_optional(path: str) -> bool:
    """Check if request path does not strictly mandate a workspace_id unless supplied."""
    for pattern in WORKSPACE_OPTIONAL_PATH_PATTERNS:
        if re.match(pattern, path):
            return True
    return False
