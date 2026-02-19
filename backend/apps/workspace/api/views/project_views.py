# views.py
from rest_framework import viewsets, status, generics, permissions
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from django.db import models
from workspace.permissions.permissions import (
    IsProjectCollaboratorOrWorkspaceAdmin, 
    IsTaskCollaboratorOrProjectAdmin,
    IsCommentVisibleToUser
)

from workspace.models import (
    Project, 
    Task, 
    ProjectMember, 
    Workspace, 
    WorkspaceMember, 
    Comment
)
from users.models import User

from workspace.api import (
    ProjectSerializer,
    ProjectWriteSerializer,
    TaskSerializer,
    TaskWriteSerializer,
    CommentSerializer,
    ProjectMemberSerializer
)
from notifications.notification_services import NotificationService
from workspace.workspace_services import (
    create_project_service,
    start_task_service, 
    create_comment_service,
    complete_task_service,
    add_project_member_service
)
from django.db.models import Q

# Caching
from workspace.cache_utils import (
    cache_get, cache_set, cache_delete,
    project_list_key, task_list_key, comment_list_key,
    invalidate_project_caches, invalidate_task_caches,
    TTL_PROJECT, TTL_TASK, TTL_COMMENT,
)


# ----------------------- PROJECT -----------------------
class ProjectViewSet(viewsets.ModelViewSet):

    permission_classes = [
        IsAuthenticated, 
        IsProjectCollaboratorOrWorkspaceAdmin
    ]

    def get_serializer_class(self):
        if self.action in ["create"]:
            return ProjectWriteSerializer
        return ProjectSerializer

    def get_queryset(self):
        workspace_id = self.kwargs.get("workspace_id")
        user = self.request.user

        try:
            membership = getattr(self.request, 'workspace_memberships', None) or \
                WorkspaceMember.objects.get(workspace_id=workspace_id, user=user)
        except WorkspaceMember.DoesNotExist:
            return Project.objects.all()
        
        base_qs = Project.objects.filter(workspace_id=workspace_id)
        
        # Admins see everything
        if membership.role in ['owner', 'admin']:
            return base_qs
        
        # Members see Public + Their Projects
        return base_qs.filter(
            Q(visibility='public') | 
            Q(members__user=user)
        ).distinct()

    def list(self, request, *args, **kwargs):
        workspace_id = self.kwargs.get("workspace_id")
        key = project_list_key(workspace_id, request.user.id)
        cached = cache_get(key)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache_set(key, response.data, TTL_PROJECT)
        return response

    def perform_create(self, serializer):
        workspace_id = self.kwargs.get("workspace_id")
        workspace = get_object_or_404(Workspace, id=workspace_id)

        create_project_service(
            user=self.request.user,
            workspace=workspace,
            project_data=serializer.validated_data
        )

        # Invalidate project list cache
        invalidate_project_caches(workspace_id, user_id=self.request.user.id)

    def perform_update(self, serializer):
        instance = serializer.save()
        workspace_id = self.kwargs.get("workspace_id")
        invalidate_project_caches(workspace_id, project_id=instance.id, user_id=self.request.user.id)

    def perform_destroy(self, instance):
        workspace_id = self.kwargs.get("workspace_id")
        project_id = instance.id
        instance.delete()
        invalidate_project_caches(workspace_id, project_id=project_id, user_id=self.request.user.id)


class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [
        IsTaskCollaboratorOrProjectAdmin
    ]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskWriteSerializer
        return TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(
            project__id=self.kwargs["project_id"], 
            project__workspace_id=self.kwargs["workspace_id"]
        ).order_by("-created_at")

    def list(self, request, *args, **kwargs):
        project_id = self.kwargs.get("project_id")
        key = task_list_key(project_id)
        cached = cache_get(key)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache_set(key, response.data, TTL_TASK)
        return response

    def perform_create(self, serializer):
        workspace_id = self.kwargs.get("workspace_id")
        project_id = self.kwargs.get("project_id")
        user = self.request.user

        # Fetch project with validation
        project = get_object_or_404(Project, id=project_id, workspace_id=workspace_id)

        # 1. Save the task first (to get an ID and Object)
        task = serializer.save(project=project, created_by=user)

        # 2. Invalidate task list cache
        invalidate_task_caches(workspace_id, project_id, user_id=user.id)

        # 3. Notifications
        members = project.members.all().select_related('user')
        
        recipients = []
        if task.assigned_to and task.assigned_to != user:
            recipients.append(task.assigned_to)
            
        if recipients:
            NotificationService.send_bulk_notification(
                recipients=recipients,
                actor=user,
                title="Assigned to New Task",
                message=f"{user.profile.username} assigned you to a new task: '{task.title}' in '{project.title}'.",
                target_obj=task,
                category='task_assigned',
            )

class TaskRetrieveUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [
        IsAuthenticated,
        IsTaskCollaboratorOrProjectAdmin
    ]

    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def get_queryset(self):
        workspace_id = self.kwargs.get("workspace_id")
        project_id = self.kwargs.get("project_id")
        user = self.request.user

        workspace = get_object_or_404(Workspace, id=workspace_id)
        project = get_object_or_404(Project, id=project_id, workspace=workspace)

        return Task.objects.filter(project=project)

    def perform_update(self, serializer):
        workspace_id = self.kwargs.get("workspace_id")
        project_id = self.kwargs.get("project_id")
        task_id = self.kwargs.get("task_id")
        user = self.request.user

        workspace = get_object_or_404(Workspace, id=workspace_id)
        project = get_object_or_404(Project, id=project_id, workspace=workspace)
        task = get_object_or_404(Task, id=task_id, project=project)

        serializer.save(project=project)

        # Invalidate caches
        invalidate_task_caches(workspace_id, project_id, task_id=task_id, user_id=user.id)

    def perform_destroy(self, instance):
        workspace_id = self.kwargs.get("workspace_id")
        project_id = self.kwargs.get("project_id")
        task_id = instance.id
        user = self.request.user

        workspace = get_object_or_404(Workspace, id=workspace_id)
        project = get_object_or_404(Project, id=project_id, workspace=workspace)

        instance.delete()

        # Invalidate caches
        invalidate_task_caches(workspace_id, project_id, task_id=task_id, user_id=user.id)


# ----------------------- PROJECT MEMBERS -----------------------
class ProjectMemberView(generics.ListCreateAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [
        IsAuthenticated,
        IsProjectCollaboratorOrWorkspaceAdmin    
    ]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return ProjectMember.objects.filter(project_id=project_id).select_related('user')

    def create(self, request, *args, **kwargs):
        # 1. Permission Check
        workspace_id = self.kwargs.get("workspace_id")
        project_id = self.kwargs.get("project_id")
        
        is_admin = WorkspaceMember.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            role__in=["owner", "admin", "moderator"]
        ).exists()
        
        if not is_admin:
            raise PermissionDenied("Only admins can add members.")

        # 2. Get Data
        project = get_object_or_404(Project, id=project_id)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = serializer.validated_data.get('user_id') 
        target_user = serializer.validated_data.get('user') 

        if not target_user:
             target_user = get_object_or_404(User, id=request.data.get('user_id'))

        # 3. Additional Validation
        if not WorkspaceMember.objects.filter(workspace_id=workspace_id, user=target_user).exists():
            return Response({"user": "User is not in this workspace."}, status=400)
            
        if ProjectMember.objects.filter(project=project, user=target_user).exists():
            return Response({"detail": "User is already in project."}, status=400)

        # 4. Service Call
        member = add_project_member_service(
            actor=request.user,
            project=project,
            target_user=target_user,
            role=serializer.validated_data.get('permission', 'read')
        )

        # 5. Invalidate project cache
        invalidate_project_caches(workspace_id, project_id=project_id, user_id=request.user.id)

        return Response(ProjectMemberSerializer(member).data, status=status.HTTP_201_CREATED)

# ----------------------- TASK ACTIONS -----------------------
class StartTaskView(APIView):
    permission_classes = [
        IsAuthenticated, 
        IsProjectCollaboratorOrWorkspaceAdmin
    ]


    def post(self, request, workspace_id, project_id, task_id):
        task = get_object_or_404(Task, id=task_id, project_id=project_id, project__workspace_id=workspace_id)

        if task.status != 'pending':
            return Response({"detail": "Task is not in pending state."}, status=status.HTTP_400_BAD_REQUEST)
        
        if task.started_by is not None:
             return Response({"detail": "Task already started."}, status=status.HTTP_400_BAD_REQUEST)

        # Service Call
        updated_task = start_task_service(request.user, task)

        # Invalidate caches
        invalidate_task_caches(workspace_id, project_id, task_id=task_id, user_id=request.user.id)
        
        return Response(TaskSerializer(updated_task).data)


class CompleteTaskView(APIView):
    permission_classes = [
        IsAuthenticated, 
        IsProjectCollaboratorOrWorkspaceAdmin
    ]


    def post(self, request, workspace_id, project_id, task_id):
        task = get_object_or_404(Task, id=task_id, project_id=project_id)

        if task.status != 'in_progress':
             return Response({"detail": "Task is not in progress."}, status=status.HTTP_400_BAD_REQUEST)
             
        if task.started_by != request.user:
            return Response({"detail": "You are not the user that started this task."}, status=status.HTTP_403_FORBIDDEN)

        # Service Call
        updated_task = complete_task_service(request.user, task)

        # Invalidate caches
        invalidate_task_caches(workspace_id, project_id, task_id=task_id, user_id=request.user.id)

        return Response(TaskSerializer(updated_task).data)


# ----------------------- COMMENTS -----------------------
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [
        IsAuthenticated, 
        IsProjectCollaboratorOrWorkspaceAdmin
    ]
    
    def get_queryset(self):
        return Comment.objects.filter(
            task_id=self.kwargs.get("task_id")
        ).select_related('author').order_by("created_at")

    def list(self, request, *args, **kwargs):
        task_id = self.kwargs.get("task_id")
        key = comment_list_key(task_id)
        cached = cache_get(key)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache_set(key, response.data, TTL_COMMENT)
        return response

    def perform_create(self, serializer):
        task = get_object_or_404(
            Task, 
            id=self.kwargs.get("task_id"), 
            project_id=self.kwargs.get("project_id")
        )
        
        # Use Service instead of serializer.save()
        create_comment_service(
            user=self.request.user,
            task=task,
            content=serializer.validated_data['content']
        )

        # Invalidate comment cache
        cache_delete(comment_list_key(task.id))


class CommentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [
        IsAuthenticated,
        IsCommentVisibleToUser
    ]

    lookup_field = "id"
    lookup_url_kwarg = "comment_id"

    def get_queryset(self):
        workspace_id = self.kwargs.get("workspace_id")
        project_id = self.kwargs.get("project_id")
        task_id = self.kwargs.get("task_id")
        
        return Comment.objects.filter(
            task__id=task_id,
            task__project__id=project_id,
            task__project__workspace__id=workspace_id
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        cache_delete(comment_list_key(instance.task_id))

    def perform_destroy(self, instance):
        task_id = instance.task_id
        instance.delete()
        cache_delete(comment_list_key(task_id))

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        
        if request.method in ['PUT', 'PATCH']:
            if obj.author != request.user:
                raise PermissionDenied("You can only edit your own comments.")
        
        if request.method == 'DELETE':
            is_admin = WorkspaceMember.objects.filter(
                workspace_id=self.kwargs.get("workspace_id"),
                user=request.user,
                role__in=['admin', 'owner']
            ).exists()
            
            if obj.author != request.user and not is_admin:
                raise PermissionDenied("You can only delete your own comments.")