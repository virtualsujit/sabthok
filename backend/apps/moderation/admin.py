from django.contrib import admin

from .models import ModerationLog, Report


@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ["listing", "verdict", "reviewed_by", "created_at"]
    list_filter = ["verdict"]
    readonly_fields = ["listing", "verdict", "reason", "reviewed_by", "created_at"]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["listing", "reporter", "reason", "status", "created_at"]
    list_filter = ["reason", "status"]
    actions = ["mark_reviewed", "mark_dismissed"]

    @admin.action(description="Mark selected reports as reviewed")
    def mark_reviewed(self, request, queryset):
        queryset.update(status=Report.Status.REVIEWED)

    @admin.action(description="Dismiss selected reports")
    def mark_dismissed(self, request, queryset):
        queryset.update(status=Report.Status.DISMISSED)
