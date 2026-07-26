from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.document_views import WorkspaceDocumentViewSet

router = DefaultRouter()
router.register(r'', WorkspaceDocumentViewSet, basename='workspace-document')

urlpatterns = [
    path('', include(router.urls)),
]
