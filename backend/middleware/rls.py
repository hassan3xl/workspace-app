import logging
from contextlib import contextmanager
from typing import Optional
from django.db import connection, connections
from .config import RLS_ENABLED

logger = logging.getLogger(__name__)

# Default nil UUID for RLS session variable reset
NIL_UUID = "00000000-0000-0000-0000-000000000000"


def is_postgres_connection(db_alias: str = "default") -> bool:
    """Check if the active database connection vendor is PostgreSQL."""
    try:
        conn = connections[db_alias]
        return conn.vendor == "postgresql"
    except Exception:
        return False


def set_postgres_rls_session_vars(
    workspace_id: Optional[str] = None, 
    user_id: Optional[str] = None,
    db_alias: str = "default"
) -> bool:
    """
    Sets PostgreSQL session variables:
    - app.current_workspace_id
    - app.current_user_id
    
    Returns True if successfully set on Postgres, False if bypassed (non-Postgres or disabled).
    """
    if not RLS_ENABLED:
        return False

    if not is_postgres_connection(db_alias):
        return False

    ws_val = str(workspace_id) if workspace_id else NIL_UUID
    usr_val = str(user_id) if user_id else NIL_UUID

    try:
        with connections[db_alias].cursor() as cursor:
            # Using SET LOCAL ensures setting applies to current transaction
            cursor.execute(
                "SET LOCAL app.current_workspace_id = %s; SET LOCAL app.current_user_id = %s;",
                [ws_val, usr_val]
            )
        return True
    except Exception as e:
        logger.warning(f"Failed to set Postgres RLS variables: {e}")
        return False


@contextmanager
def tenant_context(workspace_id: str, user_id: Optional[str] = None, db_alias: str = "default"):
    """
    Python context manager to execute database queries within a specific tenant/workspace context.
    
    Usage:
        with tenant_context(workspace_id="uuid...", user_id="uuid..."):
            tasks = Task.objects.all()
    """
    set_postgres_rls_session_vars(workspace_id=workspace_id, user_id=user_id, db_alias=db_alias)
    try:
        yield
    finally:
        set_postgres_rls_session_vars(workspace_id=NIL_UUID, user_id=NIL_UUID, db_alias=db_alias)


def generate_rls_sql_for_table(table_name: str, workspace_column: str = "workspace_id") -> str:
    """
    Helper function generating standard PostgreSQL Row Level Security (RLS) SQL statements 
    for isolating records by app.current_workspace_id.
    """
    return f"""
    -- Enable Row Level Security on {table_name}
    ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
    ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY;

    -- Drop existing policy if present
    DROP POLICY IF EXISTS tenant_workspace_isolation_policy ON {table_name};

    -- Create Tenant Isolation Policy
    CREATE POLICY tenant_workspace_isolation_policy ON {table_name}
        FOR ALL
        USING (
            {workspace_column}::text = NULLIF(current_setting('app.current_workspace_id', true), '')
            OR current_setting('app.current_workspace_id', true) = '{NIL_UUID}'
        )
        WITH CHECK (
            {workspace_column}::text = NULLIF(current_setting('app.current_workspace_id', true), '')
            OR current_setting('app.current_workspace_id', true) = '{NIL_UUID}'
        );
    """
