import logging
import os

from django.db import IntegrityError, transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserProfileSerializer

logger = logging.getLogger(__name__)


class GoogleLoginThrottle(AnonRateThrottle):
    rate = "20/min"


class GoogleLoginView(generics.GenericAPIView):
    """Verify Google ID token and return JWT tokens. Creates user if new."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [GoogleLoginThrottle]

    def post(self, request):
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token

        token = request.data.get("id_token")
        if not token:
            return Response(
                {"detail": "id_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        if not google_client_id:
            return Response(
                {"detail": "Google login is not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), google_client_id
            )
        except ValueError:
            return Response(
                {"detail": "Invalid Google token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = idinfo.get("email")
        if not email or not idinfo.get("email_verified"):
            return Response(
                {"detail": "Google account email not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_name = idinfo.get("name", "")

        try:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={"full_name": full_name, "is_verified": True},
                )
                if not created and not user.full_name and full_name:
                    user.full_name = full_name
                    user.save(update_fields=["full_name"])
        except IntegrityError:
            user = User.objects.get(email=email)
            created = False

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_new_user": created,
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
