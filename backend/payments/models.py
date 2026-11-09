from django.db import models
from orders.models import Order


class Transaction(models.Model):
    """
    تراکنش شاپرک: ذخیره Authority، RefID، وضعیت.
    وضعیت: requested → verified (یا failed / cancelled)
    """

    class Status(models.TextChoices):
        REQUESTED = "requested", "درخواست‌شده"
        VERIFIED = "verified", "تأییدشده"
        FAILED = "failed", "ناموفق"
        CANCELLED = "cancelled", "لغو شده"

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="transactions",
        verbose_name="سفارش",
    )
    authority = models.CharField("توکن درگاه", max_length=64, db_index=True, blank=True)
    ref_id = models.CharField("کد پیگیری بانک", max_length=30, blank=True)
    amount = models.PositiveIntegerField("مبلغ")
    status = models.CharField(
        "وضعیت", max_length=12, choices=Status.choices, default=Status.REQUESTED
    )
    gateway = models.CharField("درگاه", max_length=20, default="shaparak")
    message = models.CharField("پیام", max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "تراکنش"
        verbose_name_plural = "تراکنش‌ها"
        ordering = ["-created_at"]

    def __str__(self):
        return f"TX#{self.id} ({self.get_status_display()}) — {self.order.code}"
