from functools import wraps
from .rls import tenant_context, set_postgres_rls_session_vars


def bypass_workspace_enforcement(view_func):
    """
    Decorator to mark a view function or APIView to bypass workspace enforcement.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        request._bypass_workspace_enforcement = True
        return view_func(request, *args, **kwargs)
    return _wrapped_view


__all__ = [
    "bypass_workspace_enforcement",
    "tenant_context",
    "set_postgres_rls_session_vars",
]
