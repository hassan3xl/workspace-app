from rest_framework import serializers
from apps.workspace.models.document import WorkspaceDocument
from api.serializers.user_serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceDocument
        fields = [
            'id',
            'title',
            'description',
            'file_url',
            'file_name',
            'file_size',
            'file_type',
            'visibility',
            'uploaded_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class CreateDocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=True)

    class Meta:
        model = WorkspaceDocument
        fields = [
            'id',
            'title',
            'description',
            'file',
            'visibility',
        ]
        read_only_fields = ['id']

    def validate_file(self, value):
        # Max file size: 25MB
        max_size = 25 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("File size must be under 25MB.")
        return value

    def create(self, validated_data):
        file_obj = validated_data['file']

        # Auto-fill metadata from the uploaded file
        validated_data['file_name'] = file_obj.name
        validated_data['file_size'] = file_obj.size
        validated_data['file_type'] = WorkspaceDocument.detect_file_type(file_obj.name)

        # Title defaults to filename if not provided
        if not validated_data.get('title'):
            validated_data['title'] = file_obj.name

        return super().create(validated_data)
