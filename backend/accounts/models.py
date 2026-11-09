from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — phone-based authentication.
    USERNAME_FIELD = 'phone' (replaces username).
    """

    username = None  # remove the default username field
    phone = models.CharField(
        "شماره موبایل", max_length=11, unique=True
    )
    national_id = models.CharField("کد ملی", max_length=10, blank=True)
    email = models.EmailField("ایمیل", blank=True)
    full_name = models.CharField("نام و نام خانوادگی", max_length=120, blank=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    def __str__(self):
        return self.full_name or self.phone


class OtpCode(models.Model):
    phone = models.CharField("شماره موبایل", max_length=11, db_index=True)
    code = models.CharField("کد", max_length=6)
    consumed = models.BooleanField("مصرف‌شده", default=False)
    attempts = models.PositiveIntegerField("تعداد تلاش", default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField("انقضا")

    class Meta:
        verbose_name = "کد یکبار مصرف"
        verbose_name_plural = "کدهای یکبار مصرف"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.phone} @ {self.created_at:%Y-%m-%d %H:%M}"


class Address(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="addresses", verbose_name="کاربر"
    )
    recipient = models.CharField("تحویل‌گیرنده", max_length=120)
    phone = models.CharField("شماره تماس", max_length=11)
    province = models.CharField("استان", max_length=50)
    city = models.CharField("شهر", max_length=50)
    postal = models.CharField("کد پستی", max_length=10)
    detail = models.TextField("آدرس")
    is_default = models.BooleanField("پیش‌فرض", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "آدرس"
        verbose_name_plural = "آدرس‌ها"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient} — {self.province}، {self.city}"
