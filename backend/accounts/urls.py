from django.urls import path
from . import views

app_name = "accounts"

# No trailing slashes — matches Next.js frontend paths.
urlpatterns = [
    path("otp/request", views.otp_request, name="otp_request"),
    path("otp/verify", views.otp_verify, name="otp_verify"),
    path("me", views.me, name="me"),
    path("logout", views.logout_view, name="logout"),
    path("addresses", views.addresses, name="addresses"),
    path("addresses/<int:pk>", views.address_delete, name="address_delete"),
]
