import uuid
import pytest
from django.test import RequestFactory
from apps.users.models.user import User
from apps.workspace.models import Workspace, WorkspaceMember
from backend.middleware.middleware import WorkspaceEnforcementMiddleware, JWTAuthenticationMiddleware
from backend.middleware.workspace_enforcement import extract_workspace_id


@pytest.mark.django_db
class TestWorkspaceEnforcement:

    @pytest.fixture(autouse=True)
    def setup_data(self):
        self.factory = RequestFactory()
        self.owner = User.objects.create_user(email="owner@example.com", password="password123")
        self.member = User.objects.create_user(email="member@example.com", password="password123")
        self.non_member = User.objects.create_user(email="nonmember@example.com", password="password123")

        self.workspace = Workspace.objects.create(name="Test Workspace", owner=self.owner)
        WorkspaceMember.objects.create(workspace=self.workspace, user=self.member, role="member")

    def test_extract_workspace_id_header(self):
        ws_id = str(self.workspace.id)
        request = self.factory.get("/api/projects/", HTTP_X_WORKSPACE_ID=ws_id)
        extracted = extract_workspace_id(request)
        assert extracted == ws_id

    def test_extract_workspace_id_query(self):
        ws_id = str(self.workspace.id)
        request = self.factory.get(f"/api/projects/?workspace_id={ws_id}")
        extracted = extract_workspace_id(request)
        assert extracted == ws_id

    def test_extract_workspace_id_path(self):
        ws_id = str(self.workspace.id)
        request = self.factory.get(f"/api/workspaces/{ws_id}/dashboard/")
        extracted = extract_workspace_id(request)
        assert extracted == ws_id

    def test_missing_workspace_id_returns_400(self):
        middleware = WorkspaceEnforcementMiddleware(lambda r: None)
        request = self.factory.get("/api/projects/some-sub-route/")
        response = middleware.process_request(request)
        assert response is not None
        assert response.status_code == 400

    def test_invalid_workspace_id_returns_404(self):
        fake_uuid = str(uuid.uuid4())
        middleware = WorkspaceEnforcementMiddleware(lambda r: None)
        request = self.factory.get("/api/projects/", HTTP_X_WORKSPACE_ID=fake_uuid)
        response = middleware.process_request(request)
        assert response is not None
        assert response.status_code == 404

    def test_unauthorized_user_returns_403(self):
        middleware = WorkspaceEnforcementMiddleware(lambda r: None)
        ws_id = str(self.workspace.id)
        request = self.factory.get("/api/projects/", HTTP_X_WORKSPACE_ID=ws_id)
        request.user = self.non_member
        response = middleware.process_request(request)
        assert response is not None
        assert response.status_code == 403

    def test_workspace_owner_access_granted(self):
        middleware = WorkspaceEnforcementMiddleware(lambda r: None)
        ws_id = str(self.workspace.id)
        request = self.factory.get("/api/projects/", HTTP_X_WORKSPACE_ID=ws_id)
        request.user = self.owner
        response = middleware.process_request(request)
        assert response is None  # Allowed to proceed
        assert request.workspace_id == ws_id
        assert request.workspace == self.workspace

    def test_workspace_member_access_granted(self):
        middleware = WorkspaceEnforcementMiddleware(lambda r: None)
        ws_id = str(self.workspace.id)
        request = self.factory.get("/api/projects/", HTTP_X_WORKSPACE_ID=ws_id)
        request.user = self.member
        response = middleware.process_request(request)
        assert response is None  # Allowed to proceed
        assert request.workspace_id == ws_id
        assert request.workspace == self.workspace
