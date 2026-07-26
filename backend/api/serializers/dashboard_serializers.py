# workspace/serializers.py
from rest_framework import serializers
from apps.workspace.models import Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceChannel, Project, Task, ActivityLog
from api.serializers.user_serializers import UserSerializer 

class DashboardMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = WorkspaceMember
        fields = ['id', 'user', 'role']

class DashboardProjectSerializer(serializers.ModelSerializer):
    # Calculate progress percentage on the fly
    progress = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'status', 'updated_at', 'progress', 'collaborators']

    def get_progress(self, obj):
        total = obj.total_tasks
        completed = obj.completed_tasks
        if total == 0: return 0
        return int((completed / total) * 100)

    def get_collaborators(self, obj):
        # Return first 3 members for the UI avatars
        members = obj.members.select_related('user')[:4]
        return [{
            "user": {
                "username": m.user.profile.username, 
                "avatar": m.user.profile.avatar.url if m.user.profile.avatar else None}
        } for m in members]

class DashboardTaskSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'priority', 'due_date', 'project_title', 'status']

class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    actor_username = serializers.CharField(source='actor.profile.username', read_only=True)
    actor_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'actor_name', 'actor_username', 'actor_avatar', 'action_type', 'target_text', 'created_at']

    def get_actor_name(self, obj):
        if hasattr(obj.actor, 'profile'):
            fn = (obj.actor.profile.first_name or "").strip()
            ln = (obj.actor.profile.last_name or "").strip()
            name = f"{fn} {ln}".strip()
            if name:
                return name
            return obj.actor.profile.username
        return obj.actor.email

    def get_actor_avatar(self, obj):
        if hasattr(obj.actor, 'profile') and obj.actor.profile.avatar:
            return obj.actor.profile.avatar.url
        return None