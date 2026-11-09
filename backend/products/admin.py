from django.contrib import admin
from .models import Category, Brand, Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    """
    ویرایش متغیرهای محصول (رنگ/سایز/موجودی) به‌صورت TabularInline
    زیر همان محصول — معادل مدیریت انبار در زمان تعریف لباس.
    """

    model = ProductVariant
    extra = 1
    fields = ("color_name", "color_hex", "size", "stock", "price", "sku")
    ordering = ("color_name", "size")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "slug")
    list_filter = ("parent",)
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "name_en", "logo_text")
    search_fields = ("name", "name_en")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "name",
        "sku",
        "brand",
        "category",
        "price",
        "stock_badge",
        "is_active",
    )
    list_display_links = ("name",)
    list_filter = ("category", "brand", "is_active", "is_new", "is_bestseller")
    search_fields = ("name", "name_en", "sku")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductVariantInline]
    readonly_fields = ("created_at", "updated_at")
    filter_horizontal = ()

    fieldsets = (
        ("اطلاعات اصلی", {
            "fields": ("name", "name_en", "slug", "sku", "brand", "category"),
        }),
        ("تصاویر", {"fields": ("image", "hover_image")}),
        ("قیمت و توضیحات", {
            "fields": ("price", "old_price", "description"),
        }),
        ("ویژگی‌ها و نمایش", {
            "fields": ("is_new", "is_bestseller", "is_special", "is_active",
                       "rating", "review_count"),
        }),
        ("تاریخ‌ها", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def thumbnail(self, obj):
        if obj.image:
            from django.utils.html import format_html
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;'
                'border-radius:6px;border:1px solid #ddd" />',
                obj.image.url,
            )
        return "—"
    thumbnail.short_description = "تصویر"

    def stock_badge(self, obj):
        from django.utils.html import format_html
        total = sum(v.stock for v in obj.variants.all())
        low = any(v.stock <= 3 for v in obj.variants.all())
        color = "#e53935" if (low or total == 0) else "#1a1a1a"
        label = f"{total} عدد" + (" (کم)" if low else "")
        return format_html('<b style="color:{}">{}</b>', color, label)
    stock_badge.short_description = "موجودی"
