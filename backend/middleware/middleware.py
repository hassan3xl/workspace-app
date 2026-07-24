import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication

from .rate_limiting import RateLimiter
from .workspace_enforcement import WorkspaceEnforcer
from .rls import set_postgres_rls_session_vars
from .config import is_path_excluded

logger = logging.getLogger(__name__)


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Ensures request.user is populated from JWT Bearer header or cookie
    before downstream middlewares process authentication context.
    """
    def process_request(self, request):
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            token = None
            auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            elif 'session_access_token' in request.COOKIES:
                token = request.COOKIES.get('session_access_token')
            elif 'access_token' in request.COOKIES:
                token = request.COOKIES.get('access_token')

            if token:
                try:
                    jwt_auth = JWTAuthentication()
                    validated_token = jwt_auth.get_validated_token(token)
                    user = jwt_auth.get_user(validated_token)
                    if user:
                        request.user = user
                except Exception as e:
                    # Let DRF handle invalid token responses if view is protected
                    pass


class RateLimitMiddleware(MiddlewareMixin):
    """
    Django Middleware to enforce sliding window rate limiting and throttling.
    """
    def process_request(self, request):
        path = request.path_info
        if is_path_excluded(path):
            return None

        workspace_id = getattr(request, 'workspace_id', None)
        
        allowed, limit, remaining, reset_secs, retry_after, limit_type = RateLimiter.check_request(
            request, 
            workspace_id=workspace_id
        )

        request._rate_limit_info = {
            'limit': limit,
            'remaining': remaining,
            'reset': reset_secs,
        }

        if not allowed:
            response = JsonResponse(
                {
                    "error": "Too Many Requests",
                    "detail": f"Rate limit exceeded ({limit_type}). Please try again in {retry_after} seconds.",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "retry_after": retry_after,
                },
                status=429
            )
            response['Retry-After'] = str(retry_after)
            response['X-RateLimit-Limit'] = str(limit)
            response['X-RateLimit-Remaining'] = str(0)
            response['X-RateLimit-Reset'] = str(reset_secs)
            return response

    def process_response(self, request, response):
        info = getattr(request, '_rate_limit_info', None)
        if info:
            response['X-RateLimit-Limit'] = str(info['limit'])
            response['X-RateLimit-Remaining'] = str(info['remaining'])
            response['X-RateLimit-Reset'] = str(info['reset'])
        return response


class WorkspaceEnforcementMiddleware(MiddlewareMixin):
    """
    Django Middleware to enforce workspace identification and access controls at base level.
    """
    def process_request(self, request):
        # Default empty attributes
        request.workspace_id = None
        request.workspace = None

        success, err_response, ws_id, ws_obj = WorkspaceEnforcer.process_request(request)
        
        if ws_id:
            request.workspace_id = ws_id
            request.workspace = ws_obj

        if not success and err_response:
            return err_response


class PostgresRLSMiddleware(MiddlewareMixin):
    """
    Django Middleware to set PostgreSQL RLS session variables 
    (app.current_workspace_id and app.current_user_id).
    """
    def process_request(self, request):
        ws_id = getattr(request, 'workspace_id', None)
        user = getattr(request, 'user', None)
        user_id = str(user.id) if (user and user.is_authenticated) else None
        
        set_postgres_rls_session_vars(workspace_id=ws_id, user_id=user_id)


class BaseMiddlewareSuite(MiddlewareMixin):
    """
    Unified All-in-One Middleware Suite executing:
    1. JWT Resolution
    2. Workspace Enforcement
    3. Rate Limiting & Throttling
    4. PostgreSQL RLS Session Variable Setup
    """
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.jwt_middleware = JWTAuthenticationMiddleware(get_response)
        self.workspace_middleware = WorkspaceEnforcementMiddleware(get_response)
        self.rate_limit_middleware = RateLimitMiddleware(get_response)
        self.rls_middleware = PostgresRLSMiddleware(get_response)

    def process_request(self, request):
        # 1. JWT Resolution
        self.jwt_middleware.process_request(request)

        # 2. Workspace Enforcement
        ws_resp = self.workspace_middleware.process_request(request)
        if ws_resp:
            return ws_resp

        # 3. Rate Limiting & Throttling
        rl_resp = self.rate_limit_middleware.process_request(request)
        if rl_resp:
            return rl_resp

        # 4. PostgreSQL RLS
        self.rls_middleware.process_request(request)

    def process_response(self, request, response):
        return self.rate_limit_middleware.process_response(request, response)
