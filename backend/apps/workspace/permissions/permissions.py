from rest_framework import permissions
from django.shortcuts import get_object_or_404
from ..models import WorkspaceMember, ProjectMember, Workspace, Project

class IsWorkspaceMemberOrAdmin(permissions.BasePermission):
    """
    Handles permissions for Workspace interactions.
    - READ (GET): Must be a member of the workspace.
    - WRITE (PUT, PATCH, DELETE): Must be 'admin' or 'owner' of the workspace.
    """

    def has_permission(self, request, view):
        # 1. Global Authentication Check
        if not request.user.is_authenticated:
            return False
            
        # 2. If this is a list view or specific view not using get_object() immediately,
        # we might check 'workspace_id' from the URL if available.
        workspace_id = view.kwargs.get('workspace_id') or view.kwargs.get('pk')
        
        # If we can't find an ID in the URL, we let the view handle logic 
        # (e.g., creating a new workspace doesn't need a specific ID check here)
        if not workspace_id:
            return True

        # Check if user is a member of this workspace
        return WorkspaceMember.objects.filter(
            workspace_id=workspace_id, 
            user=request.user
        ).exists()

    def has_object_permission(self, request, view, obj):
        # This is called when view.get_object() runs.
        # 'obj' is the actual Workspace instance.

        # 1. Verify Membership again (Safeguard)
        membership = WorkspaceMember.objects.filter(
            workspace=obj, 
            user=request.user
        ).first()

        if not membership:
            return False

        # 2. Safe Methods (GET, HEAD, OPTIONS) -> Allow any member
        if request.method in permissions.SAFE_METHODS:
            return True

        # 3. Unsafe Methods (PUT, DELETE) -> Must be Admin or Owner
        return membership.role in ['admin', 'owner']


class IsProjectCollaboratorOrWorkspaceAdmin(permissions.BasePermission):
    """
    Handles permissions for Project interactions nested inside a Workspace.
    - Prerequisite: Must be a Workspace Member.
    - Public Projects: All workspace members can see and interact.
    - Private Projects: Only Workspace Admins/Owners and explicit Project Members can see and interact.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        workspace_id = view.kwargs.get('workspace_id')
        if workspace_id:
            is_workspace_member = WorkspaceMember.objects.filter(
                workspace_id=workspace_id, 
                user=request.user
            ).exists()
            if not is_workspace_member:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        # 'obj' here is the PROJECT instance
        workspace_membership = WorkspaceMember.objects.filter(
            workspace=obj.workspace,
            user=request.user
        ).first()

        if not workspace_membership:
            return False

        # 1. ADMIN/OWNER OVERRIDE
        if workspace_membership.role in ['admin', 'owner']:
            return True

        # 2. Check Project Membership
        is_project_collaborator = ProjectMember.objects.filter(
            project=obj,
            user=request.user
        ).exists()

        # 3. If Private Project -> Only project members (or admins/owners handled above)
        if obj.visibility == 'private' and not is_project_collaborator:
            return False

        # 4. Safe Methods (GET, HEAD, OPTIONS) -> Allowed if public or collaborator
        if request.method in permissions.SAFE_METHODS:
            return True

        # 5. Unsafe Methods (PUT, PATCH, DELETE) -> Creator or project members with write permission
        if is_project_collaborator:
            pm = ProjectMember.objects.filter(project=obj, user=request.user).first()
            if pm and pm.permission == 'write':
                return True

        return False


class IsTaskCollaboratorOrProjectAdmin(permissions.BasePermission):
    """
    Handles permissions for Task interactions nested inside a Project.
    
    Rules:
    - Prerequisite: Must be a Workspace Member.
    - If Project is PUBLIC: All workspace members can see and interact (view, create, start, complete tasks).
    - If Project is PRIVATE: Only Workspace Admins/Owners or explicit Project Members can see and interact.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        workspace_id = view.kwargs.get('workspace_id')
        project_id = view.kwargs.get('project_id')
        user = request.user

        if workspace_id:
            workspace_member = WorkspaceMember.objects.filter(
                workspace_id=workspace_id,
                user=user
            ).first()
            if not workspace_member:
                return False

            if project_id:
                try:
                    project = Project.objects.get(id=project_id, workspace_id=workspace_id)
                    if workspace_member.role in ['admin', 'owner']:
                        return True
                    if project.visibility == 'public':
                        return True
                    return ProjectMember.objects.filter(project=project, user=user).exists()
                except Project.DoesNotExist:
                    return False

        return True

    def has_object_permission(self, request, view, obj):
        # 'obj' is the TASK instance
        project = obj.project
        workspace = project.workspace

        # 1. Workspace Membership check
        workspace_member = WorkspaceMember.objects.filter(
            workspace=workspace,
            user=request.user
        ).first()

        if not workspace_member:
            return False

        # 2. ADMIN/OWNER OVERRIDE
        if workspace_member.role in ['admin', 'owner']:
            return True

        # 3. Check Project Membership & Visibility
        is_project_member = ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).exists()

        if project.visibility == 'private' and not is_project_member:
            return False

        # If project is public OR user is project member -> can see and interact!
        return True


class IsCommentVisibleToUser(permissions.BasePermission):
    """
    Handles permissions for Comment interactions.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # obj is Comment
        task = obj.task
        project = task.project
        workspace = project.workspace

        workspace_member = WorkspaceMember.objects.filter(
            workspace=workspace,
            user=request.user
        ).first()

        if not workspace_member:
            return False

        if workspace_member.role in ['admin', 'owner']:
            return True

        is_project_member = ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).exists()
        
        if project.visibility == 'public' or is_project_member:
            return True

        return False