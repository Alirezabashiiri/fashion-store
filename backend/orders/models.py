from django.db import models
from django.conf import settings
from accounts.models import Address
from products.models import Product, ProductVariant


class Order(models.Model):
    """
    ثبت نهایی سفارش با قیمت ثابت فاکتور.
    وضعیت: pending → paid → preparing → shipped → delivered (| cancelled)
    """

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار پرداخت"
        PAID = "paid", "پرداخت‌شده"
        PREPARING = "preparing", "در حال آماده‌سازی"
        SHIPPED = "shipped", "ارسال‌شده"
        DELIVERED = "delivered", "تحویل‌شده"
        CANCELLED = "cancelled", "لغو شده"

    code = models.CharField("کد سفارش", max_length=20, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name="orders", verbose_name="کاربر",
    )
    address = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="آدرس",
    )
    address_snapshot = models.JSONField("اسنپ‌شات آدرس", default=dict, blank=True)
    subtotal = models.PositiveIntegerField("مجموع کالاها")
    discount = models.PositiveIntegerField("تخفیف", default=0)
    shipping = models.PositiveIntegerField("ارسال", default=0)
    total = models.PositiveIntegerField("مبلغ نهایی")
    status = models.CharField(
        "وضعیت", max_length=12, choices=Status.choices, default=Status.PENDING
    )
    shipping_method = models.CharField("روش ارسال", max_length=10, blank=True)
    delivery_slot = models.CharField("بازه تحویل", max_length=20, blank=True)
    tracking_code = models.CharField("کد رهگیری پستی", max_length=30, blank=True)
    note = models.TextField("یادداشت", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "سفارش"
        verbose_name_plural = "سفارش‌ها"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"])]

    def __str__(self):
        return f"{self.code} ({self.get_status_display()})"


class OrderItem(models.Model):
    """
    اقلام سفارش با snapshot قیمت/محصول — قیمت فاکتور ثابت می‌ماند
    حتی اگر قیمت محصول در آینده تغییر کند.
    """

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items", verbose_name="سفارش"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, verbose_name="محصول"
    )
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="متغیر",
    )
    name = models.CharField("نام", max_length=200)
    brand = models.CharField("برند", max_length=80, blank=True)
    image = models.CharField("تصویر", max_length=255)
    color_name = models.CharField("رنگ", max_length=40)
    color_hex = models.CharField("هکس رنگ", max_length=9, default="#1a1a1a")
    size = models.CharField("سایز", max_length=10)
    unit_price = models.PositiveIntegerField("قیمت واحد")
    qty = models.PositiveIntegerField("تعداد")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "قلم سفارش"
        verbose_name_plural = "اقلام سفارش"

    def __str__(self):
        return f"{self.name} × {self.qty}"

    @property
    def line_total(self):
        return self.unit_price * self.qty
