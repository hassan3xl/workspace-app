import re
import uuid
from typing import Tuple, Optional
from django.core.cache import cache
from django.http import JsonResponse
from apps.workspace.models import Workspace, WorkspaceMember
from .config import is_path_excluded, is_workspace_optional

# Regex pattern for UUID validation
UUID_REGEX = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)


def extract_workspace_id(request) -> Optional[str]:
    """
    Extracts workspace_id from incoming request:
    1. Header: X-Workspace-ID
    2. URL path pattern: /api/workspaces/<uuid>/...
    3. Query parameter: ?workspace_id=...
    """
    # 1. Header Check
    ws_id = request.META.get('HTTP_X_WORKSPACE_ID') or request.headers.get('X-Workspace-ID')
    if ws_id:
        ws_id = str(ws_id).strip()
        if UUID_REGEX.match(ws_id):
            return ws_id

    # 2. Query Parameter Check
    ws_id = request.GET.get('workspace_id') or request.GET.get('workspace')
    if ws_id:
        ws_id = str(ws_id).strip()
        if UUID_REGEX.match(ws_id):
            return ws_id

    # 3. URL Path Resolver / Regex Check
    # Resolves pattern like /api/workspaces/<workspace_id>/...
    path = request.path_info
    match = re.search(r'/api/workspaces/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', path, re.IGNORECASE)
    if match:
        return match.group(1)

    return None


def get_cached_workspace(workspace_id: str) -> Optional[Workspace]:
    """Retrieves workspace object, cached for performance."""
    cache_key = f"ws_obj:{workspace_id}"
    ws = cache.get(cache_key)
    if ws is None:
        try:
            ws = Workspace.objects.filter(id=workspace_id).first()
            if ws:
                cache.set(cache_key, ws, timeout=60)
        except Exception:
            return None
    return ws


def check_user_workspace_membership(user, workspace: Workspace) -> bool:
    """Checks whether authenticated user belongs to workspace (Owner or Member)."""
    if not user or not user.is_authenticated:
        return False

    # Platform admins / superusers / staff check
    if (
        getattr(user, 'is_superuser', False) or 
        getattr(user, 'is_staff', False) or 
        getattr(user, 'role', '') == 'platform_admin'
    ):
        return True

    # Owner check (safely compare string representations to prevent UUID vs str mismatch)
    if str(workspace.owner_id) == str(user.id):
        return True

    # Member check cached for 60s
    cache_key = f"ws_member:{workspace.id}:{user.id}"
    is_member = cache.get(cache_key)
    if is_member is None:
        is_member = WorkspaceMember.objects.filter(
            workspace=workspace, 
            user=user
        ).exists()
        cache.set(cache_key, is_member, timeout=60)

    return bool(is_member)


class WorkspaceEnforcer:
    """
    Enforces workspace validity and access controls at base level.
    """

    @classmethod
    def process_request(cls, request) -> Tuple[bool, Optional[JsonResponse], Optional[str], Optional[Workspace]]:
        """
        Validates incoming request for workspace enforcement.
        
        Returns:
            (success: bool, response_on_failure: JsonResponse|None, workspace_id: str|None, workspace_obj: Workspace|None)
        """
        path = request.path_info

        # Skip checks for excluded paths (admin, auth, static, etc.)
        if is_path_excluded(path):
            return True, None, None, None

        # Check if bypass decorator was set on view function
        if getattr(request, '_bypass_workspace_enforcement', False):
            return True, None, None, None

        workspace_id = extract_workspace_id(request)

        # Handle missing workspace_id
        if not workspace_id:
            if is_workspace_optional(path):
                return True, None, None, None
            
            # If path requires a workspace and none was provided
            return False, JsonResponse(
                {
                    "error": "Bad Request",
                    "detail": "workspace_id parameter or X-Workspace-ID header is required for this request.",
                    "code": "WORKSPACE_ID_REQUIRED"
                },
                status=400
            ), None, None

        # Validate Workspace Existence
        workspace = get_cached_workspace(workspace_id)
        if not workspace:
            return False, JsonResponse(
                {
                    "error": "Not Found",
                    "detail": f"Workspace with ID '{workspace_id}' does not exist.",
                    "code": "WORKSPACE_NOT_FOUND"
                },
                status=404
            ), None, None

        # Validate Access Permission if User is Authenticated
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if not check_user_workspace_membership(user, workspace):
                return False, JsonResponse(
                    {
                        "error": "Forbidden",
                        "detail": "You do not have access to this workspace.",
                        "code": "WORKSPACE_ACCESS_DENIED"
                    },
                    status=403
                ), str(workspace.id), workspace

        return True, None, str(workspace.id), workspace
