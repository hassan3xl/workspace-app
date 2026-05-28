from rest_framework_nested import routers
from django.urls import path, include

from api.views.project_views import (

    ProjectViewSet,
    TaskListCreateView,
    TaskRetrieveUpdateView,
    ProjectMemberView,
    StartTaskView,
    CompleteTaskView,
    CommentListCreateView,
    CommentRetrieveUpdateDestroyView,
)

# ----------------------- ROUTERS -----------------------
router = routers.SimpleRouter()
router.register(
    r'(?P<workspace_id>[^/.]+)/projects',
    ProjectViewSet,
    basename='workspace-projects'
)

projects_router = routers.NestedSimpleRouter(
    router,
    r'(?P<workspace_id>[^/.]+)/projects',
    lookup='project'
)
# You can register nested viewsets here if needed
# projects_router.register(r'tasks', TaskViewSet, basename='project-tasks')


# ----------------------- URL PATTERNS -----------------------
urlpatterns = [
    path("", include(router.urls)),

    # Tasks
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/tasks/",
        TaskListCreateView.as_view(),
        name="project-tasks"
    ),
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/tasks/<uuid:task_id>/",
        TaskRetrieveUpdateView.as_view(),
        name="project-task-detail"
    ),
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/tasks/<uuid:task_id>/start/",
        StartTaskView.as_view(),
        name="start-task"
    ),
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/tasks/<uuid:task_id>/complete/",
        CompleteTaskView.as_view(),
        name="complete-task"
    ),
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/tasks/<uuid:task_id>/comments/",
        CommentListCreateView.as_view(),
        name="task-comment"
    ),
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/tasks/<uuid:task_id>/comments/<uuid:comment_id>/",
        CommentRetrieveUpdateDestroyView.as_view(),
        name="task-comment-detail"
    ),

    # Project members
    path(
        "<uuid:workspace_id>/projects/<uuid:project_id>/collaborators/",
        ProjectMemberView.as_view(),
        name="project-collaborators"
    ),
]
