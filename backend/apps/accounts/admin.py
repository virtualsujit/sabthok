from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import OTPToken, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "phone", "full_name", "is_verified", "is_staff", "date_joined"]
    list_filter = ["is_verified", "is_staff", "is_active"]
    search_fields = ["email", "phone", "full_name"]
    ordering = ["-date_joined"]

    fieldsets = (
        (None, {"fields": ("phone", "email", "password")}),
        ("Personal Info", {"fields": ("full_name", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_verified", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("phone", "email", "password1", "password2")}),
    )


@admin.register(OTPToken)
class OTPTokenAdmin(admin.ModelAdmin):
    list_display = ["identifier", "channel", "is_used", "created_at", "expires_at"]
    list_filter = ["channel", "is_used"]
    readonly_fields = ["code"]
