import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPToken, User
from .serializers import (
    EmailPasswordLoginSerializer,
    EmailPasswordRegisterSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    UserProfileSerializer,
)

logger = logging.getLogger(__name__)


class OTPRequestThrottle(AnonRateThrottle):
    rate = "5/min"


class OTPVerifyThrottle(AnonRateThrottle):
    rate = "10/min"


class OTPRequestView(generics.GenericAPIView):
    """Send OTP to phone or email."""

    serializer_class = OTPRequestSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRequestThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["identifier"]
        channel = serializer.validated_data["channel"]

        # Expire any existing unused OTPs for this identifier
        OTPToken.objects.filter(
            identifier=identifier, channel=channel, is_used=False
        ).update(is_used=True)

        code = f"{secrets.randbelow(900000) + 100000}"

        OTPToken.objects.create(
            identifier=identifier,
            channel=channel,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5),
        )

        if settings.DEBUG:
            logger.info("OTP for %s:%s -> %s", channel, identifier, code)
        else:
            from apps.moderation.tasks import send_otp_task

            send_otp_task.delay(identifier, channel, code)

        return Response({"detail": "OTP sent."}, status=status.HTTP_200_OK)


class OTPVerifyView(generics.GenericAPIView):
    """Verify OTP and return JWT tokens. Creates user if new."""

    serializer_class = OTPVerifySerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPVerifyThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["identifier"]
        channel = serializer.validated_data["channel"]
        code = serializer.validated_data["code"]

        otp = (
            OTPToken.objects.filter(
                identifier=identifier, channel=channel, is_used=False
            )
            .order_by("-created_at")
            .first()
        )

        if not otp or not otp.is_valid():
            return Response(
                {"detail": "Invalid or expired OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Track failed attempts (constant-time comparison)
        if not secrets.compare_digest(otp.code, code):
            otp.attempts += 1
            otp.save(update_fields=["attempts"])
            return Response(
                {"detail": "Invalid or expired OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        # Get or create user with transaction safety
        lookup = {"email": identifier} if channel == "email" else {"phone": identifier}
        defaults = {"is_verified": True}
        try:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    defaults=defaults, **lookup
                )
                if not created and not user.is_verified:
                    user.is_verified = True
                    user.save(update_fields=["is_verified"])
        except IntegrityError:
            user = User.objects.get(**lookup)
            created = False

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new_user": created,
            }
        )


class EmailPasswordLoginView(generics.GenericAPIView):
    """Login with email + password."""

    serializer_class = EmailPasswordLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.has_usable_password() or not user.check_password(password):
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new_user": False,
            }
        )


class EmailPasswordRegisterView(generics.GenericAPIView):
    """Register with email + password."""

    serializer_class = EmailPasswordRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        full_name = serializer.validated_data.get("full_name", "")

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=email, password=password, full_name=full_name, is_verified=True
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new_user": True,
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
