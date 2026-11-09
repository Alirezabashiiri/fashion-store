"""Custom auth backend for OTP-based authentication."""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class OtpBackend(ModelBackend):
    """
    Authenticate a user by phone number.
    The actual OTP code verification happens in accounts.views.otp_verify;
    this backend simply fetches/creates the user by phone so that
    django.contrib.auth.login() can attach a session.
    """

    def authenticate(self, request, phone=None, **kwargs):
        if not phone:
            return None
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return None
        if not user.is_active:
            return None
        return user
