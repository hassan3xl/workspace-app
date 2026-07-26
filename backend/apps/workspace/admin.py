from django.contrib import admin
from .models import Workspace, WorkspaceChannel, WorkspaceMember, WorkspaceInvitation, Project, ProjectMember, Task, Comment
from .models.document import WorkspaceDocument

# workspaces
admin.site.register(Workspace)
admin.site.register(WorkspaceChannel)
admin.site.register(WorkspaceMember)
admin.site.register(WorkspaceInvitation)

# projects
admin.site.register(Project)
admin.site.register(ProjectMember)

# tasks
admin.site.register(Task)
admin.site.register(Comment)

# documents
admin.site.register(WorkspaceDocument)
