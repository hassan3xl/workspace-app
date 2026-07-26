# serializers.py
from rest_framework import serializers
from apps.users.models.user import User
from django.utils import timezone
import uuid

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    username = serializers.CharField(source='profile.username', read_only=True)
    first_name = serializers.CharField(source='profile.first_name', read_only=True)
    last_name = serializers.CharField(source='profile.last_name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'avatar']
    
    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return None

    def get_full_name(self, obj):
        if hasattr(obj, 'profile'):
            fn = (obj.profile.first_name or "").strip()
            ln = (obj.profile.last_name or "").strip()
            name = f"{fn} {ln}".strip()
            return name if name else None
        return None

class AccountUserSerializer(serializers.ModelSerializer):   
    class Meta:
        model = User
        fields = ['id', 'email', ]
    