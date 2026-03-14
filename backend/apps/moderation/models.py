import uuid

from django.conf import settings
from django.db import models

from apps.listings.models import Listing


class ModerationLog(models.Model):
    class Verdict(models.TextChoices):
        AUTO_APPROVED = "auto_approved", "Auto Approved"
        AUTO_FLAGGED = "auto_flagged", "Auto Flagged"
        MANUALLY_APPROVED = "manually_approved", "Manually Approved"
        MANUALLY_REJECTED = "manually_rejected", "Manually Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="moderation_logs"
    )
    verdict = models.CharField(max_length=20, choices=Verdict.choices)
    reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "moderation_logs"
        ordering = ["-created_at"]


class Report(models.Model):
    class Reason(models.TextChoices):
        SPAM = "spam", "Spam"
        SCAM = "scam", "Scam / Fraud"
        PROHIBITED = "prohibited", "Prohibited Item"
        DUPLICATE = "duplicate", "Duplicate"
        OFFENSIVE = "offensive", "Offensive Content"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        REVIEWED = "reviewed", "Reviewed"
        DISMISSED = "dismissed", "Dismissed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="reports"
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports_filed",
    )
    reason = models.CharField(max_length=12, choices=Reason.choices)
    details = models.TextField(blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reports"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["listing", "reporter"],
                name="unique_report_per_user_per_listing",
            ),
        ]
