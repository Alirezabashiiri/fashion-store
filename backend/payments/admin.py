from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "status", "amount", "authority",
                    "ref_id", "gateway", "created_at")
    list_filter = ("status", "gateway")
    search_fields = ("authority", "ref_id", "order__code")
    readonly_fields = ("created_at", "updated_at")
