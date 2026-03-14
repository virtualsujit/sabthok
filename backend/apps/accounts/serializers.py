from rest_framework import serializers

from .models import User


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "email",
            "full_name",
            "avatar",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "phone", "email", "is_verified", "date_joined"]
