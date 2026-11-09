from django.db import models


class Category(models.Model):
    """Tree structure (parent/child): زنانه ← پوشاک ← مانتو."""

    title = models.CharField("عنوان", max_length=80)
    slug = models.SlugField("اسلاگ", unique=True, allow_unicode=True)
    image = models.ImageField("تصویر", upload_to="categories/", blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        verbose_name="دسته مادر",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
        ordering = ["title"]

    def __str__(self):
        return self.title


class Brand(models.Model):
    name = models.CharField("نام", max_length=80, unique=True)
    name_en = models.CharField("نام انگلیسی", max_length=80, blank=True)
    logo_text = models.CharField("متن لوگو", max_length=30, blank=True)
    image = models.ImageField("لوگو", upload_to="brands/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "برند"
        verbose_name_plural = "برندها"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField("نام محصول", max_length=200)
    name_en = models.CharField("نام انگلیسی", max_length=200, blank=True)
    slug = models.SlugField("اسلاگ", unique=True, allow_unicode=True)
    sku = models.CharField("کد کالا", max_length=40, unique=True)
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="products", verbose_name="برند",
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="products", verbose_name="دسته‌بندی",
    )
    description = models.TextField("توضیحات", blank=True)
    price = models.PositiveIntegerField("قیمت (تومان)")
    old_price = models.PositiveIntegerField(
        "قیمت قبل تخفیف", null=True, blank=True
    )
    image = models.ImageField("تصویر اصلی", upload_to="products/")
    hover_image = models.ImageField(
        "تصویر هاور", upload_to="products/", blank=True
    )
    rating = models.FloatField("امتیاز", default=0)
    review_count = models.PositiveIntegerField("تعداد نظرات", default=0)
    is_new = models.BooleanField("جدید", default=False)
    is_bestseller = models.BooleanField("پرفروش", default=False)
    is_special = models.BooleanField("شگفت‌انگیز", default=False)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["slug"]), models.Index(fields=["sku"])]

    def __str__(self):
        return self.name

    @property
    def discount_percent(self):
        if self.old_price and self.old_price > self.price:
            return round((self.old_price - self.price) / self.old_price * 100)
        return None


class ProductVariant(models.Model):
    """
    کلید مدیریت انبار: هر ترکیب رنگ×سایز دارای موجودی مستقل.
    این ردیف‌ها به‌صورت TabularInline در ادمین زیر محصول ویرایش می‌شوند.
    """

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants",
        verbose_name="محصول",
    )
    color_name = models.CharField("رنگ", max_length=40)
    color_hex = models.CharField("هکس رنگ", max_length=9, default="#1a1a1a")
    size = models.CharField("سایز", max_length=10)
    stock = models.PositiveIntegerField("موجودی", default=0)
    price = models.PositiveIntegerField(
        "قیمت اختصاصی", null=True, blank=True,
        help_text="خالی = استفاده از قیمت محصول",
    )
    sku = models.CharField("کد متغیر", max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "متغیر محصول"
        verbose_name_plural = "متغیرهای محصول"
        unique_together = [("product", "color_name", "size")]
        ordering = ["color_name", "size"]

    def __str__(self):
        return f"{self.product.name} — {self.color_name} / {self.size}"

    @property
    def effective_price(self):
        return self.price if self.price else self.product.price
