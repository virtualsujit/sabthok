import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


phone_validator = RegexValidator(
    regex=r"^\+?[1-9]\d{7,14}$",
    message="Enter a valid phone number (e.g. +9779812345678).",
)


class UserManager(BaseUserManager):
    def create_user(self, phone=None, email=None, password=None, **extra):
        if not phone and not email:
            raise ValueError("Either phone or email is required")
        if email:
            email = self.normalize_email(email)
        user = self.model(phone=phone, email=email, **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_verified", True)
        return self.create_user(email=email, password=password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        validators=[phone_validator],
    )
    email = models.EmailField(unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to="avatars/%Y/%m/", blank=True)
    is_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone"]

    class Meta:
        db_table = "users"
        constraints = [
            models.CheckConstraint(
                check=~models.Q(phone__isnull=True, email__isnull=True),
                name="user_must_have_phone_or_email",
            ),
        ]

    def __str__(self):
        return self.email or self.phone or str(self.id)


class OTPToken(models.Model):
    """Short-lived OTP for phone/email verification."""

    CHANNEL_CHOICES = [("phone", "Phone"), ("email", "Email")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    identifier = models.CharField(max_length=255, db_index=True)
    channel = models.CharField(max_length=5, choices=CHANNEL_CHOICES)
    code = models.CharField(max_length=6)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = "otp_tokens"
        indexes = [
            models.Index(fields=["identifier", "channel", "is_used"]),
        ]

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now() and self.attempts < 5
