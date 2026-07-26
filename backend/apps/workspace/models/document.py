from django.db import models
from apps.users.models import User
from apps.workspace.models.workspace import Workspace
import uuid
import os


class WorkspaceDocument(models.Model):
    VISIBILITY_CHOICES = (
        ('public', 'Public (All Workspace Members)'),
        ('private', 'Private (Uploader & Admins Only)'),
    )

    FILE_TYPE_CHOICES = (
        ('pdf', 'PDF'),
        ('doc', 'Document'),
        ('spreadsheet', 'Spreadsheet'),
        ('image', 'Image'),
        ('presentation', 'Presentation'),
        ('archive', 'Archive'),
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='documents',
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')

    file = models.FileField(upload_to='workspace_documents/')
    file_name = models.CharField(max_length=255, help_text='Original filename')
    file_size = models.BigIntegerField(default=0, help_text='File size in bytes')
    file_type = models.CharField(
        max_length=20,
        choices=FILE_TYPE_CHOICES,
        default='other',
    )

    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default='public',
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workspace_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.workspace.name})"

    @staticmethod
    def detect_file_type(filename: str) -> str:
        """Detect file type category from extension."""
        ext = os.path.splitext(filename)[1].lower()
        mapping = {
            '.pdf': 'pdf',
            '.doc': 'doc', '.docx': 'doc', '.odt': 'doc', '.rtf': 'doc', '.txt': 'doc',
            '.xls': 'spreadsheet', '.xlsx': 'spreadsheet', '.csv': 'spreadsheet', '.ods': 'spreadsheet',
            '.ppt': 'presentation', '.pptx': 'presentation', '.odp': 'presentation',
            '.png': 'image', '.jpg': 'image', '.jpeg': 'image', '.gif': 'image',
            '.svg': 'image', '.webp': 'image', '.bmp': 'image',
            '.zip': 'archive', '.rar': 'archive', '.tar': 'archive', '.gz': 'archive', '.7z': 'archive',
        }
        return mapping.get(ext, 'other')
