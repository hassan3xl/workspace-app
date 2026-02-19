"""
Centralized cache key builders and invalidation helpers for the workspace app.
"""

import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)


# ======================== TTLs (seconds) ========================

TTL_WORKSPACE = 60 * 5       # 5 minutes
TTL_MEMBERS = 60 * 5         # 5 minutes
TTL_DASHBOARD = 60 * 2       # 2 minutes
TTL_PROJECT = 60 * 3         # 3 minutes
TTL_TASK = 60 * 2            # 2 minutes
TTL_COMMENT = 60 * 2         # 2 minutes
TTL_NOTIFICATION = 60        # 1 minute


# ======================== Key Builders ========================

def workspace_list_key(user_id):
    return f"ws:list:{user_id}"

def workspace_detail_key(workspace_id, user_id):
    return f"ws:detail:{workspace_id}:{user_id}"

def workspace_members_key(workspace_id):
    return f"ws:members:{workspace_id}"

def dashboard_key(workspace_id, user_id):
    return f"ws:dashboard:{workspace_id}:{user_id}"

def project_list_key(workspace_id, user_id):
    return f"ws:projects:{workspace_id}:{user_id}"

def task_list_key(project_id):
    return f"ws:tasks:{project_id}"

def comment_list_key(task_id):
    return f"ws:comments:{task_id}"

def notification_list_key(user_id):
    return f"notif:list:{user_id}"


# ======================== Cache Helpers ========================

def cache_get(key):
    """Get from cache with logging."""
    data = cache.get(key)
    if data is not None:
        logger.debug(f"Cache HIT: {key}")
    else:
        logger.debug(f"Cache MISS: {key}")
    return data

def cache_set(key, data, ttl):
    """Set cache with logging."""
    cache.set(key, data, ttl)
    logger.debug(f"Cache SET: {key} (TTL={ttl}s)")

def cache_delete(key):
    """Delete from cache with logging."""
    cache.delete(key)
    logger.debug(f"Cache DELETE: {key}")


# ======================== Invalidation Helpers ========================

def invalidate_workspace_caches(workspace_id, user_id=None):
    """Invalidate workspace-related caches.
    
    If user_id is provided, clears that user's specific caches.
    Always clears the members cache for the workspace.
    """
    cache_delete(workspace_members_key(workspace_id))
    
    if user_id:
        cache_delete(workspace_list_key(user_id))
        cache_delete(workspace_detail_key(workspace_id, user_id))
        cache_delete(dashboard_key(workspace_id, user_id))


def invalidate_project_caches(workspace_id, project_id=None, user_id=None):
    """Invalidate project-related caches."""
    if user_id:
        cache_delete(project_list_key(workspace_id, user_id))
        cache_delete(dashboard_key(workspace_id, user_id))
    
    if project_id:
        cache_delete(task_list_key(project_id))


def invalidate_task_caches(workspace_id, project_id, task_id=None, user_id=None):
    """Invalidate task and related caches."""
    cache_delete(task_list_key(project_id))
    
    if task_id:
        cache_delete(comment_list_key(task_id))
    
    if user_id:
        cache_delete(dashboard_key(workspace_id, user_id))


def invalidate_notification_cache(user_id):
    """Invalidate notification list cache for a user."""
    cache_delete(notification_list_key(user_id))
