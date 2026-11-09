from django.db import models


class DiscountCode(models.Model):
    """کمپین‌ها و کدهای تخفیف (درصدی یا مبلغ ثابت)."""

    class Type(models.TextChoices):
        PERCENT = "percent", "درصدی"
        FIXED = "fixed", "مبلغ ثابت"

    code = models.CharField("کد", max_length=30, unique=True)
    type = models.CharField("نوع", max_length=8, choices=Type.choices, default=Type.PERCENT)
    value = models.PositiveIntegerField("مقدار (٪ یا تومان)")
    max_uses = models.PositiveIntegerField("سقف استفاده (۰=نامحدود)", default=0)
    uses = models.PositiveIntegerField("تعداد استفاده", default=0)
    expires_at = models.DateTimeField("تاریخ انقضا", null=True, blank=True)
    is_active = models.BooleanField("فعال", default=True)
    min_subtotal = models.PositiveIntegerField("حداقل خرید", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "کد تخفیف"
        verbose_name_plural = "کدهای تخفیف"
        ordering = ["-created_at"]

    def __str__(self):
        return self.code
