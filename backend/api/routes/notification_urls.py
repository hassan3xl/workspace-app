from django.urls import path
from api.views.notification_views import (
    NotificationListView, 
    MarkNotificationReadView, 
    MarkAllReadView
)

urlpatterns = [
    # GET: List all notifications (unread first)
    path('', NotificationListView.as_view(), name='notification-list'),

    # POST: Mark a specific notification as read
    path('<uuid:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),

    # POST: Mark ALL notifications as read (e.g., "Mark all as read" button)
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark-all-notifications-read'),
]