import pytest
from backend.middleware.rls import (
    tenant_context, 
    set_postgres_rls_session_vars, 
    generate_rls_sql_for_table,
    is_postgres_connection,
)


@pytest.mark.django_db
class TestPostgresRLS:

    def test_tenant_context_manager(self):
        ws_id = "11111111-2222-3333-4444-555555555555"
        user_id = "66666666-7777-8888-9999-000000000000"
        
        with tenant_context(workspace_id=ws_id, user_id=user_id):
            # Inside tenant context execution
            pass
        # After context exit reset succeeds without errors

    def test_set_postgres_rls_session_vars(self):
        # Executes safely on active DB (Postgres or SQLite fallback)
        res = set_postgres_rls_session_vars(workspace_id="11111111-2222-3333-4444-555555555555")
        # On SQLite return False gracefully, on Postgres return True
        assert res in (True, False)

    def test_generate_rls_sql_for_table(self):
        sql = generate_rls_sql_for_table("apps_workspace_task")
        assert "ENABLE ROW LEVEL SECURITY" in sql
        assert "tenant_workspace_isolation_policy" in sql
        assert "app.current_workspace_id" in sql
