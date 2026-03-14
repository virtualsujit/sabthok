import re

from rest_framework import serializers

from .models import User


class OTPRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Phone number or email")
    channel = serializers.ChoiceField(choices=["phone", "email"])

    def validate(self, attrs):
        identifier = attrs["identifier"]
        channel = attrs["channel"]
        if channel == "email":
            if "@" not in identifier:
                raise serializers.ValidationError(
                    {"identifier": "Enter a valid email address."}
                )
        else:
            if not re.match(r"^\+?[1-9]\d{7,14}$", identifier):
                raise serializers.ValidationError(
                    {"identifier": "Enter a valid phone number (e.g. +9779812345678)."}
                )
        return attrs


class OTPVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()
    channel = serializers.ChoiceField(choices=["phone", "email"])
    code = serializers.RegexField(
        regex=r"^\d{6}$",
        max_length=6,
        error_messages={"invalid": "OTP must be exactly 6 digits."},
    )


class EmailPasswordLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class EmailPasswordRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=150, required=False, default="")

    def validate_password(self, value):
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value


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
