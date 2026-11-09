from django.urls import path
from . import views

app_name = "payments"

urlpatterns = [
    path("request", views.payment_request, name="request"),
    path("verify", views.payment_verify, name="verify"),
]
