
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.views import APIView
import socket 


class TestView(APIView):
    def get(self, request):
        return Response({
            "message": "Hello!",
            "served_by_container": socket.gethostname() 
        })
    
urlpatterns = [
    path('admin/', admin.site.urls),
    # path('test/', TestView.as_view(), name='test'),
    
    # auth urls
    path('api/auth/', include("api.routes.auth_urls")),

    # workspace urls
    path('api/workspaces/', include("api.routes.workspace_urls")),
    
    # feeds url
    # path('api/feeds/', include("api.routes.feeds_urls")),

    # settings urls
    path('api/settings/', include("api.routes.settings_urls")),

    # notifications urls
    path('api/notifications/', include("api.routes.notification_urls")),

    # user urls
    path('api/user/', include("api.routes.user_urls")),
] 

# Only load toolbar URLs if DEBUG is True AND the app is installed
if settings.DEBUG:
    if "debug_toolbar" in settings.INSTALLED_APPS:
        # pyrefly: ignore [missing-import]
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]