from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address, OtpCode


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0
    fields = ("recipient", "phone", "province", "city", "postal", "detail", "is_default")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("phone", "full_name", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("phone", "full_name", "national_id", "email")
    ordering = ("-date_joined",)
    inlines = [AddressInline]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("اطلاعات شخصی", {
            "fields": ("full_name", "national_id", "email"),
        }),
        ("دسترسی‌ها", {
            "fields": ("is_active", "is_staff", "is_superuser",
                       "groups", "user_permissions"),
        }),
        ("تاریخ‌ها", {"fields": ("last_login", "date_joined"), "classes": ("collapse",)}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "full_name", "password1", "password2"),
        }),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("recipient", "phone", "province", "city", "user", "is_default")
    list_filter = ("province", "is_default")
    search_fields = ("recipient", "phone", "detail", "user__phone")


@admin.register(OtpCode)
class OtpCodeAdmin(admin.ModelAdmin):
    list_display = ("phone", "code", "consumed", "attempts", "created_at")
    list_filter = ("consumed",)
    search_fields = ("phone",)
    readonly_fields = ("created_at",)
