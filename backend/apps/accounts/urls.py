from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("otp/request/", views.OTPRequestView.as_view(), name="otp-request"),
    path("otp/verify/", views.OTPVerifyView.as_view(), name="otp-verify"),
    path("login/", views.EmailPasswordLoginView.as_view(), name="email-login"),
    path("register/", views.EmailPasswordRegisterView.as_view(), name="email-register"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", views.UserProfileView.as_view(), name="user-profile"),
    path("google/", views.GoogleLoginView.as_view(), name="google-login"),
]
