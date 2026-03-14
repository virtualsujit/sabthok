import logging
import re

from celery import shared_task
from django.db import transaction
from django.utils import timezone

logger = logging.getLogger(__name__)

# Blocklist of terms that trigger auto-flagging
BLOCKED_PATTERNS = [
    r"\b(scam|fraud|fake|counterfeit)\b",
    r"\b(drugs|weapons|firearms|ammunition)\b",
    r"\b(stolen|illegal)\b",
]


@shared_task(bind=True, max_retries=3, retry_backoff=True, retry_backoff_max=300)
def moderate_listing(self, listing_id: str):
    """Automated content moderation for new listings.

    Idempotent: skips if listing already has a moderation log.
    """
    from apps.listings.models import Listing

    from .models import ModerationLog

    try:
        listing = Listing.objects.get(pk=listing_id)
    except Listing.DoesNotExist:
        logger.warning("Listing %s not found for moderation", listing_id)
        return

    # Idempotency: skip if already moderated
    if ModerationLog.objects.filter(listing=listing).exists():
        logger.info("Listing %s already moderated, skipping", listing_id)
        return

    text = f"{listing.title} {listing.description}".lower()

    flagged_reasons = []
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, text):
            flagged_reasons.append(f"Matched pattern: {pattern}")

    with transaction.atomic():
        # Re-check idempotency inside transaction
        if ModerationLog.objects.filter(listing=listing).exists():
            return

        if flagged_reasons:
            Listing.objects.filter(pk=listing.pk).exclude(
                status=Listing.Status.ACTIVE
            ).update(status=Listing.Status.HIDDEN)
            ModerationLog.objects.create(
                listing=listing,
                verdict=ModerationLog.Verdict.AUTO_FLAGGED,
                reason="; ".join(flagged_reasons),
            )
            logger.info("Listing %s auto-flagged: %s", listing_id, flagged_reasons)
        else:
            Listing.objects.filter(pk=listing.pk, status=Listing.Status.PENDING).update(
                status=Listing.Status.ACTIVE,
                published_at=timezone.now(),
            )
            ModerationLog.objects.create(
                listing=listing,
                verdict=ModerationLog.Verdict.AUTO_APPROVED,
                reason="Passed automated scan.",
            )
            logger.info("Listing %s auto-approved", listing_id)


@shared_task(bind=True, max_retries=3, retry_backoff=True)
def send_otp_task(self, identifier: str, channel: str, code: str):
    """Send OTP via SMS or email. Placeholder for real integration."""
    logger.info("Sending OTP to %s via %s", identifier, channel)
    # TODO: Integrate with actual SMS gateway (e.g. Sparrow SMS for Nepal)
    # or email service (e.g. SES, Mailgun)
    if channel == "email":
        from django.core.mail import send_mail

        send_mail(
            subject="Your Sabthok verification code",
            message=f"Your verification code is: {code}",
            from_email=None,  # Uses DEFAULT_FROM_EMAIL
            recipient_list=[identifier],
            fail_silently=False,
        )
    else:
        # SMS integration placeholder
        logger.warning("SMS sending not configured for %s", identifier)
