from django.urls import path
from . import views

app_name = "products"

# categories & brands are defined at the top level (luxa/urls.py) to match
# the Next.js frontend (/api/categories, /api/brands).
urlpatterns = [
    path("", views.product_list, name="list"),
    path("<str:pk>", views.product_detail, name="detail"),
]
