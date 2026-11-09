from django.contrib import admin
from .models import DiscountCode


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "type", "value", "uses", "max_uses",
                    "min_subtotal", "is_active", "expires_at")
    list_filter = ("type", "is_active")
    search_fields = ("code",)
    list_editable = ("is_active",)
