# workspace/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from apps.workspace.models import Workspace, Project, Task, ActivityLog, WorkspaceMember
from api.serializers.project_serializers import ProjectSerializer
from api.serializers.dashboard_serializers import (
    DashboardProjectSerializer,
    DashboardTaskSerializer,
    ActivityLogSerializer,
    DashboardMemberSerializer
)


# pyrefly: ignore [missing-import]
from apps.workspace.permissions.permissions import (
    IsWorkspaceMemberOrAdmin,
)

class WorkspaceDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin
    ]

    def get(self, request, workspace_id):
        user = request.user
        workspace = get_object_or_404(Workspace, id=workspace_id)

        # 1. Verify Membership
        membership = WorkspaceMember.objects.filter(workspace=workspace, user=user).first()
        if not membership:
            return Response({"error": "Access denied"}, status=403)

        # Filter projects based on role & visibility
        if membership.role in ['owner', 'admin']:
            accessible_projects = Project.objects.filter(workspace=workspace)
        else:
            accessible_projects = Project.objects.filter(
                workspace=workspace
            ).filter(
                Q(visibility='public') | Q(members__user=user)
            ).distinct()

        # 2. Get Active Projects
        projects_queryset = accessible_projects.filter(
            status__in=['active', 'planning']
        ).annotate(
            total_tasks=Count('tasks'),
            completed_tasks=Count('tasks', filter=Q(tasks__status='completed'))
        ).order_by('-updated_at')[:4]

        # 3. Get "My Priorities" (Tasks assigned to ME)
        my_tasks_queryset = Task.objects.filter(
            project__in=accessible_projects,
            assigned_to=user,
            status__in=['pending', 'in_progress']
        ).select_related('project').order_by('due_date', '-created_at')[:5]

        # 4. Get Recent Activity
        activity_queryset = ActivityLog.objects.filter(
            workspace=workspace
        ).select_related('actor').order_by('-created_at')[:10]

        # 5. Get Recent Members (For the "Team" widget)
        members_queryset = WorkspaceMember.objects.filter(
            workspace=workspace
        ).select_related('user').order_by('-joined_at')[:5]

        # 6. Serialize Everything
        data = {
            "workspace_name": workspace.name,
            "workspace_logo": workspace.logo.url if workspace.logo else None,
            "workspace_description": workspace.description,
            "total_members": WorkspaceMember.objects.filter(workspace=workspace).count(),
            "total_projects": accessible_projects.count(),
            "total_tasks": Task.objects.filter(project__in=accessible_projects).count(),
            "active_projects": ProjectSerializer(projects_queryset, many=True, context={'request': request}).data,
            "my_tasks": DashboardTaskSerializer(my_tasks_queryset, many=True).data,
            "activities": ActivityLogSerializer(activity_queryset, many=True).data,
            "recent_members": DashboardMemberSerializer(members_queryset, many=True).data
        }

        return Response(data)