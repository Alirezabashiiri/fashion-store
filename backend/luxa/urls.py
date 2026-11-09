"""Project URL configuration — explicit paths aligned with the Next.js frontend."""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from accounts import views as acc
from products import views as prod
from orders import views as ord
from payments import views as pay

urlpatterns = [
    path("admin/", admin.site.urls),

    # --- accounts ---
    path("api/accounts/otp/request", acc.otp_request),
    path("api/accounts/otp/verify", acc.otp_verify),
    path("api/accounts/me", acc.me),
    path("api/accounts/logout", acc.logout_view),
    path("api/accounts/addresses", acc.addresses),
    path("api/accounts/addresses/<int:pk>", acc.address_delete),

    # --- products ---
    path("api/products", prod.product_list),
    path("api/products/<str:pk>", prod.product_detail),
    path("api/categories", prod.categories),
    path("api/brands", prod.brands),

    # --- orders ---
    path("api/orders", ord.order_dispatch),

    # --- payments ---
    path("api/payments/request", pay.payment_request),
    path("api/payments/verify", pay.payment_verify),
]

# Serve media (uploaded product images) in development.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
