from rest_framework import viewsets, status, generics, permissions, serializers
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import NotFound

from workspace.permissions.permissions import (
    IsWorkspaceMemberOrAdmin,
)

from workspace.models import (
    Workspace,
    WorkspaceMember,
    WorkspaceInvitation,
    Project, Task, ProjectMember,
    WorkspaceChannel
)
from workspace.api import (
    WorkspaceSerializer,
    CreateWorkspaceSerializer,
    WorkspaceMemberSerializer,
    CreateWorkspaceInvitationSerializer,
    UploadWorkspaceLogoSerializer,
    WorkspaceDashboardSerializer,
    WorkspaceInvitationSerializer,
)
from django.contrib.auth import get_user_model
from django.utils import timezone
from notifications.notification_services import NotificationService

# Caching
from workspace.cache_utils import (
    cache_get, cache_set, cache_delete,
    workspace_list_key, workspace_detail_key, workspace_members_key,
    invalidate_workspace_caches,
    TTL_WORKSPACE, TTL_MEMBERS,
)


User = get_user_model()

    
class WorkspaceViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateWorkspaceSerializer
        return WorkspaceSerializer

    def get_queryset(self):
        user = self.request.user
        return Workspace.objects.filter(
            Q(owner=user) |
            Q(members__user=user)
        ).distinct()

    def list(self, request, *args, **kwargs):
        key = workspace_list_key(request.user.id)
        cached = cache_get(key)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache_set(key, response.data, TTL_WORKSPACE)
        return response

    def retrieve(self, request, *args, **kwargs):
        key = workspace_detail_key(kwargs.get("pk"), request.user.id)
        cached = cache_get(key)
        if cached is not None:
            return Response(cached)

        response = super().retrieve(request, *args, **kwargs)
        cache_set(key, response.data, TTL_WORKSPACE)
        return response

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)

        # Ensure owner is also a member
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role="owner",
        )

        # Invalidate workspace list cache
        cache_delete(workspace_list_key(self.request.user.id))

        return workspace

    def perform_update(self, serializer):
        instance = serializer.save()
        invalidate_workspace_caches(instance.id, self.request.user.id)

    def perform_destroy(self, instance):
        workspace_id = instance.id
        user_id = self.request.user.id
        instance.delete()
        invalidate_workspace_caches(workspace_id, user_id)


    @action(detail=True, methods=["get"], url_path="members")
    def members(self, request, pk=None):
        workspace = self.get_object()
        self.check_object_permissions(request, workspace)

        key = workspace_members_key(workspace.id)
        cached = cache_get(key)
        if cached is not None:
            return Response(cached)

        members = WorkspaceMember.objects.filter(
            workspace=workspace
        ).select_related("user")

        serializer = WorkspaceMemberSerializer(members, many=True)
        cache_set(key, serializer.data, TTL_MEMBERS)
        return Response(serializer.data)

class CreateWorkspaceInvitationView(generics.CreateAPIView):
    serializer_class = CreateWorkspaceInvitationSerializer
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin
    ]

    def get_serializer_context(self):
        """Pass request and workspace to serializer for validation"""
        context = super().get_serializer_context()
        workspace_id = self.kwargs["workspace_id"]
        workspace = get_object_or_404(Workspace, id=workspace_id)
        context['workspace'] = workspace
        return context

    def perform_create(self, serializer):
        workspace_id = self.kwargs["workspace_id"]
        workspace = get_object_or_404(Workspace, id=workspace_id)
        
        # Check permissions: Is the requester an Admin or Owner?
        try:
            member = WorkspaceMember.objects.get(
                workspace=workspace,
                user=self.request.user
            )
            if member.role not in ["owner", "admin"]:
                raise serializers.ValidationError({"detail": "Only admins can invite users."})
        except WorkspaceMember.DoesNotExist:
             raise serializers.ValidationError({"detail": "You are not a member of this workspace."})

        # Save with the missing fields that aren't in the request body
        serializer.save(
            workspace=workspace,
            invited_by=self.request.user
        )



class RemoveWorkspaceMemberView(generics.DestroyAPIView):
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin
    ]

    def delete(self, request, *args, **kwargs):
        workspace_id = self.kwargs.get('workspace_id')
        member_id = self.kwargs.get('member_id') # ID of the user to be removed

        workspace = get_object_or_404(Workspace, id=workspace_id)
        
        # 1. Get the member record of the requester (You)
        try:
            requester_membership = WorkspaceMember.objects.get(
                workspace=workspace, 
                user=request.user
            )
        except WorkspaceMember.DoesNotExist:
            return Response(
                {"error": "You are not a member of this workspace."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Check if requester has permission (Admin/Owner only)
        if requester_membership.role not in ['owner', 'admin']:
            return Response(
                {"error": "Only admins and owners can remove members."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Get the member to be kicked (Target)
        target_user = get_object_or_404(User, id=member_id)
        target_membership = get_object_or_404(
            WorkspaceMember, 
            workspace=workspace, 
            user=target_user
        )

        # 4. Safety Checks
        
        # Prevent kicking yourself (Use 'Leave' endpoint for that)
        if request.user.id == target_user.id:
             return Response(
                {"error": "You cannot kick yourself. Please use the leave workspace option."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent kicking the Owner
        if target_membership.role == 'owner':
            return Response(
                {"error": "The workspace owner cannot be removed."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent Admins from kicking other Admins (Optional, usually reserved for Owner)
        if requester_membership.role == 'admin' and target_membership.role == 'admin':
             return Response(
                {"error": "Admins cannot remove other admins. Contact the Owner."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 5. Perform the Kick
        target_membership.delete()

        # 6. Invalidate caches
        invalidate_workspace_caches(workspace_id, request.user.id)

        return Response(
            {"message": f"User {target_user.email} has been removed from the workspace."},
            status=status.HTTP_200_OK
        )
    
class LeaveWorkspaceView(generics.DestroyAPIView):
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin
    ]

    def delete(self, request, *args, **kwargs):
        workspace_id = self.kwargs.get('workspace_id')
        workspace = get_object_or_404(Workspace, id=workspace_id)
        
        # 1. Find the membership for the current user
        try:
            membership = WorkspaceMember.objects.get(
                workspace=workspace,
                user=request.user
            )
        except WorkspaceMember.DoesNotExist:
            return Response(
                {"error": "You are not a member of this workspace."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Critical Check: Owners cannot leave
        if membership.role == 'owner':
            return Response(
                {
                    "error": "Owners cannot leave their workspace. You must transfer ownership to another member or delete the workspace."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Process the leave action
        membership.delete()

        # 4. Invalidate caches
        invalidate_workspace_caches(workspace_id, request.user.id)

        return Response(
            {"message": f"You have successfully left {workspace.name}."},
            status=status.HTTP_200_OK
        )

class GetWorkspaceInvitationsView(generics.ListAPIView):
    serializer_class = WorkspaceInvitationSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return WorkspaceInvitation.objects.filter(
            invited_user=self.request.user
        )
        

class AcceptWorkspaceInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invite_id):
        user = request.user

        invite = get_object_or_404(
            WorkspaceInvitation,
            id=invite_id,
            invited_user=user,
        )

        # Expiration check
        if invite.expires_at and invite.expires_at < timezone.now():
            return Response(
                {"error": "Invite has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate membership
        if WorkspaceMember.objects.filter(
            workspace=invite.workspace,
            user=user
        ).exists():
            return Response(
                {"error": "You are already a member of this workspace."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        WorkspaceMember.objects.create(
            workspace=invite.workspace,
            user=user,
            role=invite.role,
        )

        workspace_id = invite.workspace.id
        invite.delete()  # invitations are one-time

        # Invalidate caches
        invalidate_workspace_caches(workspace_id, user.id)

        return Response(
            {"message": "You have joined the workspace."},
            status=status.HTTP_200_OK,
        )


class RejectWorkspaceInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invite_id):
        invite = get_object_or_404(
            WorkspaceInvitation,
            id=invite_id,
            invited_user=request.user,
        )

        invite.delete()

        return Response(
            {"message": "Invitation rejected."},
            status=status.HTTP_200_OK,
        )


class WorkspaceImageUploadView(generics.UpdateAPIView):
    serializer_class = UploadWorkspaceLogoSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin    
    ]

    def get_object(self):
        workspace_id = self.kwargs["workspace_id"]
        workspace = get_object_or_404(Workspace, id=workspace_id)

        # Only owner/admin
        member = get_object_or_404(
            WorkspaceMember,
            workspace=workspace,
            user=self.request.user,
        )

        if member.role not in ["owner", "admin"]:
            raise permissions.PermissionDenied(
                "You do not have permission to update this workspace."
            )

        return workspace

    def perform_update(self, serializer):
        instance = serializer.save()
        invalidate_workspace_caches(instance.id, self.request.user.id)


class WorkspaceMemberRoleView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsWorkspaceMemberOrAdmin
    ]
    
    

    def post(self, request, workspace_id, user_id):
        workspace = get_object_or_404(Workspace, id=workspace_id)

        requester = get_object_or_404(
            WorkspaceMember,
            workspace=workspace,
            user=request.user,
        )

        if requester.role not in ["owner", "admin"]:
            return Response(
                {"error": "Only admins can update roles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        member = get_object_or_404(
            WorkspaceMember,
            workspace=workspace,
            user__id=user_id,
        )

        if member.user == request.user:
            return Response(
                {"error": "You cannot change your own role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        role = request.data.get("role")
        if role not in dict(WorkspaceMember.ROLE_CHOICES):
            return Response(
                {"error": "Invalid role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        member.role = role
        member.save(update_fields=["role"])

        # Invalidate caches
        invalidate_workspace_caches(workspace_id, request.user.id)

        return Response(
            {
                "message": "Role updated successfully.",
                "user": member.user.id,
                "role": member.role,
            },
            status=status.HTTP_200_OK,
        )
