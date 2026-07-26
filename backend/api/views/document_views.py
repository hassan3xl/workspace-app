from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.db.models import Q

from apps.workspace.models import Workspace, WorkspaceMember
from apps.workspace.models.document import WorkspaceDocument
from api.serializers.document_serializers import (
    DocumentSerializer,
    CreateDocumentSerializer,
)


class WorkspaceDocumentViewSet(viewsets.ModelViewSet):
    """
    CRUD for workspace documents.
    
    Permissions:
    - Must be a workspace member to access any documents.
    - Public documents: visible to all workspace members.
    - Private documents: visible only to the uploader + workspace admins/owners.
    - Only uploader or admin/owner can delete.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateDocumentSerializer
        return DocumentSerializer

    def _get_workspace_and_membership(self):
        """Helper to get workspace and current user's membership."""
        workspace_id = self.kwargs.get('workspace_id')
        workspace = get_object_or_404(Workspace, id=workspace_id)
        membership = WorkspaceMember.objects.filter(
            workspace=workspace,
            user=self.request.user,
        ).first()
        return workspace, membership

    def get_queryset(self):
        workspace_id = self.kwargs.get('workspace_id')
        user = self.request.user

        # Get membership
        membership = WorkspaceMember.objects.filter(
            workspace_id=workspace_id,
            user=user,
        ).first()

        if not membership:
            return WorkspaceDocument.objects.none()

        # Admin/Owner can see everything
        if membership.role in ['admin', 'owner']:
            return WorkspaceDocument.objects.filter(
                workspace_id=workspace_id
            ).select_related('uploaded_by')

        # Regular members: public docs + their own private docs
        return WorkspaceDocument.objects.filter(
            workspace_id=workspace_id
        ).filter(
            Q(visibility='public') | Q(uploaded_by=user)
        ).select_related('uploaded_by')

    def list(self, request, *args, **kwargs):
        workspace, membership = self._get_workspace_and_membership()
        if not membership:
            return Response(
                {"error": "You are not a member of this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        workspace, membership = self._get_workspace_and_membership()
        if not membership:
            return Response(
                {"error": "You are not a member of this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            workspace=workspace,
            uploaded_by=request.user,
        )
        
        # Return full document details
        output_serializer = DocumentSerializer(
            serializer.instance,
            context={'request': request},
        )
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        workspace, membership = self._get_workspace_and_membership()
        if not membership:
            return Response(
                {"error": "You are not a member of this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        document = self.get_object()

        # Private doc: only uploader + admin/owner
        if document.visibility == 'private':
            if document.uploaded_by != request.user and membership.role not in ['admin', 'owner']:
                return Response(
                    {"error": "You don't have permission to view this document."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = self.get_serializer(document)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        workspace, membership = self._get_workspace_and_membership()
        if not membership:
            return Response(
                {"error": "You are not a member of this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        document = self.get_object()

        # Only uploader or admin/owner can delete
        if document.uploaded_by != request.user and membership.role not in ['admin', 'owner']:
            return Response(
                {"error": "You don't have permission to delete this document."},
                status=status.HTTP_403_FORBIDDEN,
            )

        document.file.delete(save=False)  # Delete the actual file
        document.delete()
        return Response(
            {"message": "Document deleted successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, *args, **kwargs):
        """Serve the document file for download."""
        workspace, membership = self._get_workspace_and_membership()
        if not membership:
            return Response(
                {"error": "You are not a member of this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        document = self.get_object()

        # Private doc: only uploader + admin/owner
        if document.visibility == 'private':
            if document.uploaded_by != request.user and membership.role not in ['admin', 'owner']:
                return Response(
                    {"error": "You don't have permission to download this document."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if not document.file:
            return Response(
                {"error": "File not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        response = FileResponse(
            document.file.open('rb'),
            as_attachment=True,
            filename=document.file_name,
        )
        return response
