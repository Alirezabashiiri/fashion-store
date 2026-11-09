from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponse
from django.template.response import TemplateResponse
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "variant", "name", "brand", "image",
                       "color_name", "color_hex", "size", "unit_price", "qty")
    can_delete = False
    max_num = 0

    def has_add_permission(self, request, obj=None):
        return False


STATUS_COLORS = {
    "pending": "#b45309",      # amber
    "paid": "#047857",         # emerald
    "preparing": "#0369a1",    # sky
    "shipped": "#0369a1",      # sky
    "delivered": "#047857",    # emerald
    "cancelled": "#e53935",    # red
}
STATUS_BG = {
    "pending": "#fef3c7", "paid": "#d1fae5", "preparing": "#e0f2fe",
    "shipped": "#e0f2fe", "delivered": "#d1fae5", "cancelled": "#fdecea",
}


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("code", "user", "status_badge", "total",
                    "item_count", "tracking_code", "created_at")
    list_display_links = ("code",)
    list_filter = ("status", "shipping_method", "created_at")
    search_fields = ("code", "user__phone", "user__full_name", "tracking_code")
    readonly_fields = ("code", "user", "subtotal", "discount", "shipping",
                       "total", "address_snapshot", "created_at", "updated_at")
    inlines = [OrderItemInline]
    actions = ["mark_preparing", "mark_shipped", "mark_delivered", "mark_cancelled",
               "print_invoice"]
    fieldsets = (
        ("اطلاعات سفارش", {
            "fields": ("code", "user", "status", "shipping_method",
                       "delivery_slot", "tracking_code", "note"),
        }),
        ("مالی", {
            "fields": ("subtotal", "discount", "shipping", "total"),
        }),
        ("آدرس", {"fields": ("address_snapshot",), "classes": ("collapse",)}),
        ("تاریخ‌ها", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, "#1a1a1a")
        bg = STATUS_BG.get(obj.status, "#f3f4f6")
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;'
            'border-radius:9999px;font-size:11px;font-weight:600">{}</span>',
            bg, color, obj.get_status_display(),
        )
    status_badge.short_description = "وضعیت"

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "تعداد اقلام"

    # --- Bulk actions (تغییر دسته‌جمعی وضعیت) ---
    def mark_preparing(self, request, queryset):
        updated = queryset.filter(status="paid").update(status="preparing")
        self.message_user(request, f"{updated} سفارش به «آماده‌سازی» تغییر یافت")
    mark_preparing.short_description = "تغییر به «در حال آماده‌سازی»"

    def mark_shipped(self, request, queryset):
        updated = queryset.filter(
            status__in=["paid", "preparing"]
        ).update(status="shipped")
        self.message_user(request, f"{updated} سفارش به «ارسال‌شده» تغییر یافت")
    mark_shipped.short_description = "تغییر به «ارسال‌شده»"

    def mark_delivered(self, request, queryset):
        updated = queryset.filter(status="shipped").update(status="delivered")
        self.message_user(request, f"{updated} سفارش به «تحویل‌شده» تغییر یافت")
    mark_delivered.short_description = "تغییر به «تحویل‌شده»"

    def mark_cancelled(self, request, queryset):
        updated = queryset.exclude(status__in=["delivered", "cancelled"]).update(
            status="cancelled"
        )
        self.message_user(request, f"{updated} سفارش لغو شد")
    mark_cancelled.short_description = "لغو سفارش‌ها"

    def print_invoice(self, request, queryset):
        """چاپ فاکتور رسمی برای سفارش‌های انتخاب‌شده."""
        orders = queryset.select_related("user").prefetch_related("items")
        return TemplateResponse(
            request,
            "admin/orders/invoice_print.html",
            {"orders": orders, "opts": self.model._meta, "title": "فاکتور رسمی"},
        )
    print_invoice.short_description = "چاپ فاکتور رسمی"

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom = [
            path(
                "<path:object_id>/invoice/",
                self.admin_site.admin_view(self.invoice_view),
                name="orders_order_invoice",
            ),
        ]
        return custom + urls

    def invoice_view(self, request, object_id):
        from django.shortcuts import get_object_or_404
        order = get_object_or_404(
            Order.objects.select_related("user").prefetch_related("items"),
            pk=object_id,
        )
        return TemplateResponse(
            request,
            "admin/orders/invoice_print.html",
            {"orders": [order], "title": f"فاکتور {order.code}"},
        )
