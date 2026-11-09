from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant


class Cart(models.Model):
    """Session-based or user-bound cart."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="cart",
        verbose_name="کاربر",
    )
    session_key = models.CharField("کلید سشن", max_length=64, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "سبد خرید"
        verbose_name_plural = "سبدهای خرید"

    def __str__(self):
        return f"Cart#{self.id} ({self.user or self.session_key})"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart, on_delete=models.CASCADE, related_name="items", verbose_name="سبد"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name="محصول"
    )
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="متغیر",
    )
    color_name = models.CharField("رنگ", max_length=40)
    color_hex = models.CharField("هکس رنگ", max_length=9, default="#1a1a1a")
    size = models.CharField("سایز", max_length=10)
    unit_price = models.PositiveIntegerField("قیمت واحد")
    qty = models.PositiveIntegerField("تعداد", default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "اقلام سبد"
        verbose_name_plural = "اقلام سبد"

    def __str__(self):
        return f"{self.product.name} × {self.qty}"
