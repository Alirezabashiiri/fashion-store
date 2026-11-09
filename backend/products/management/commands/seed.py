"""
Seed management command — populates categories, brands, products (+ variants),
users (admin + demo), discount codes, and demo orders.

Usage:
    python manage.py seed

Images are copied from backend/seed_images/ into media/ on first run.
"""
import os
import shutil
import random
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from accounts.models import Address
from products.models import Category, Brand, Product, ProductVariant
from orders.models import Order
from payments.models import Transaction
from discounts.models import DiscountCode

User = get_user_model()

SEED_DIR = Path(settings.BASE_DIR) / "seed_images"
MEDIA = Path(settings.MEDIA_ROOT)


# (filename, name, nameEn, brand, sku, categorySlug, price, oldPrice, colors[[name,hex]...], sizes, outOfStockSizes, rating, reviews, description, flags)
COLORS = {
    "مشکی": "#1a1a1a", "سرمه‌ای": "#2b2f3a", "بژ": "#d8c4a0", "کرم": "#f3ece1",
    "سفید": "#ffffff", "قهوه‌ای": "#6b4423", "طلایی": "#c19a6b", "قرمز": "#c0392b",
    "خاکستری": "#8a8a8a", "جلگه‌ای": "#4a6b8a", "سرخابی": "#e8b4c8", "طلایی روشن": "#d4af37",
}
CLOTHES = ["XS", "S", "M", "L", "XL", "XXL"]
SHOES = ["38", "39", "40", "41", "42", "43", "44"]

PRODUCTS = [
    ("p-wcoat.png", "پالتو پشمی زنانه مدل بژ", "Women's Beige Wool Trench Coat", "آریانا", "LX-WC-1001", "women-cloth", 2890000, 3890000, [["بژ", COLORS["بژ"]], ["سرمه‌ای", COLORS["سرمه‌ای"]], ["کرم", COLORS["کرم"]]], CLOTHES, ["XS"], 4.8, 124, "پالتوی پشمی زنانه با طراحی مینیمال و دوخت دقیق، از پارچه پشم مرغوب با آستر حریری.", ["new", "bestseller"]),
    ("p-wdress.png", "میدی بلک پارچه حریر زنانه", "Women's Black Silk Midi Dress", "لوکسا پریمیوم", "LX-WD-2002", "women-cloth", 1490000, None, [["مشکی", COLORS["مشکی"]], ["قرمز", COLORS["قرمز"]], ["جلگه‌ای", COLORS["جلگه‌ای"]]], CLOTHES, [], 4.6, 87, "میدی‌پیراهن حریر با برش مدرن و افتادگی زیبا، مناسب مجالس و قرارهای رسمی.", ["special"]),
    ("p-wblouse.png", "بلوز حریر زنانه مدل سفید", "Women's White Silk Blouse", "مودرن استایل", "LX-WB-3003", "women-cloth", 890000, 1190000, [["سفید", COLORS["سفید"]], ["کرم", COLORS["کرم"]], ["سرخابی", COLORS["سرخابی"]]], CLOTHES, [], 4.4, 56, "بلوز حریر با طراحی شیک و آستین ساییده، مناسب ست کردن با شلوار رسمی یا دامن.", ["bestseller"]),
    ("p-wheels.png", "کفش پاشنه‌دار زنانه چرم طبیعی", "Women's Beige Suede Heels", "آریانا", "LX-WS-4004", "women-shoes", 1690000, None, [["بژ", COLORS["بژ"]], ["مشکی", COLORS["مشکی"]], ["قرمز", COLORS["قرمز"]]], SHOES, ["38", "44"], 4.5, 41, "کفش پاشنه‌دار با چرم طبیعی و پاشنه ۷ سانت، مناسب مجالس و محل کار.", []),
    ("p-sneaker-w.png", "کتانی اسپرت چرم زنانه سفید", "Women's White Leather Sneakers", "اوربیت", "LX-WS-5005", "women-shoes", 1290000, 1790000, [["سفید", COLORS["سفید"]], ["بژ", COLORS["بژ"]]], SHOES, [], 4.7, 203, "کتانی اسپرت چرمی با طراحی مینیمال، سبک و راحت برای استفاده روزمره.", ["special", "bestseller"]),
    ("p-handbag.png", "کیف دستی چرم زنانه مدل تان", "Women's Tan Leather Handbag", "وینتیج", "LX-WG-6006", "women-bag", 1890000, None, [["طلایی", COLORS["طلایی"]], ["مشکی", COLORS["مشکی"]], ["قهوه‌ای", COLORS["قهوه‌ای"]]], ["ONE"], [], 4.9, 156, "کیف دستی چرمی با طراحی کلاسیک و فضای داخلی جادار، مناسب استفاده روزمره و رسمی.", ["bestseller"]),
    ("p-watch-gold.png", "ساعت مچی لوکس چرمی طلایی", "Luxury Gold Leather Strap Watch", "اتلیه", "LX-AC-7007", "women-accessory", 2390000, 2990000, [["طلایی روشن", COLORS["طلایی روشن"]], ["قهوه‌ای", COLORS["قهوه‌ای"]]], ["ONE"], [], 4.8, 98, "ساعت مچی لوکس با قاب طلایی و بند چرمی، طراحی مینیمال و شیک.", ["special"]),
    ("p-earrings.png", "گوشواره حلقه‌ای طلایی", "Gold Hoop Earrings", "لوکسا پریمیوم", "LX-JW-8008", "women-jewelry", 690000, 890000, [["طلایی روشن", COLORS["طلایی روشن"]]], ["ONE"], [], 4.6, 67, "گوشواره حلقه‌ای طلایی با طراحی مینیمال، مناسب استفاده روزمره و رسمی.", ["special"]),
    ("p-mshirt.png", "پیراهن مردانه کتان سفید", "Men's White Cotton Dress Shirt", "کلاسیک‌هوم", "LX-MC-9009", "men-cloth", 990000, None, [["سفید", COLORS["سفید"]], ["کرم", COLORS["کرم"]], ["جلگه‌ای", COLORS["جلگه‌ای"]]], CLOTHES, [], 4.5, 78, "پیراهن مردانه کتان با دوخت دقیق و یقه رسمی، مناسب محل کار و قرارهای رسمی.", ["new"]),
    ("p-mjacket.png", "ژاکت جین مردانه مدل تیره", "Men's Dark Denim Jacket", "نیوفیشن", "LX-MC-1010", "men-cloth", 1390000, 1790000, [["جلگه‌ای", COLORS["جلگه‌ای"]], ["مشکی", COLORS["مشکی"]]], CLOTHES, ["S"], 4.4, 45, "ژاکت جین مردانه با پارچه جین نرم و برش مدرن، مناسب استایل کژوال.", ["special"]),
    ("p-mshoes.png", "کفش رسمی مردانه چرم قهوه‌ای", "Men's Brown Leather Oxford Shoes", "کلاسیک‌هوم", "LX-MS-1111", "men-shoes", 1890000, None, [["قهوه‌ای", COLORS["قهوه‌ای"]], ["مشکی", COLORS["مشکی"]]], SHOES, ["39"], 4.7, 112, "کفش رسمی مردانه آکسفورد با چرم طبیعی و دوخت دستی، مناسب مجالس و محل کار.", ["bestseller"]),
    ("p-sneaker-w.png", "کتانی اسپرت مردانه چرمی", "Men's White Leather Sneakers", "اوربیت", "LX-MS-1212", "men-shoes", 1490000, 1990000, [["سفید", COLORS["سفید"]], ["خاکستری", COLORS["خاکستری"]]], SHOES, [], 4.6, 134, "کتانی اسپرت مردانه با رویه چرمی و طراحی مینیمال، سبک و راحت.", ["special"]),
    ("p-mwallet.png", "کیف پول مردانه چرم قهوه‌ای", "Men's Brown Leather Bifold Wallet", "وینتیج", "LX-MB-1313", "men-bag", 590000, None, [["قهوه‌ای", COLORS["قهوه‌ای"]], ["مشکی", COLORS["مشکی"]]], ["ONE"], [], 4.8, 89, "کیف پول مردانه دوخم با چرم طبیعی، دارای ۸ جای کارت و جیب زیپ‌دار.", []),
    ("p-belt.png", "کمربند چرمی مردانه مشکی", "Men's Black Leather Belt", "کلاسیک‌هوم", "LX-AC-1414", "men-accessory", 390000, 490000, [["مشکی", COLORS["مشکی"]], ["قهوه‌ای", COLORS["قهوه‌ای"]]], ["85", "90", "95", "100", "105"], [], 4.5, 54, "کمربند چرمی مردانه با سگک استیل ضدزنگ، چرم طبیعی مرغوب.", ["special"]),
    ("p-watch-gold.png", "ساعت مچی مردانه چرمی کلاسیک", "Men's Classic Leather Strap Watch", "اتلیه", "LX-AC-1515", "men-accessory", 1990000, None, [["طلایی روشن", COLORS["طلایی روشن"]], ["سرمه‌ای", COLORS["سرمه‌ای"]]], ["ONE"], [], 4.7, 76, "ساعت مچی مردانه کلاسیک با قاب طلایی و بند چرمی، طراحی شیک و رسمی.", ["bestseller"]),
    ("p-kdress.png", "پیراهن دخترانه طرح گل", "Girls' Floral Summer Dress", "نیوفیشن", "LX-KG-1616", "kids-girl", 590000, 790000, [["سرخابی", COLORS["سرخابی"]], ["کرم", COLORS["کرم"]]], ["100", "110", "120", "130", "140"], [], 4.6, 33, "پیراهن دخترانه طرح گل با پارچه نرم و تنفس‌پذیر، مناسب فصل بهار و تابستان.", ["special"]),
]

CATEGORIES = [
    ("زنانه", "women", None), ("مردانه", "men", None), ("بچه‌گانه", "kids", None),
    ("لباس زنانه", "women-cloth", "women"), ("کفش زنانه", "women-shoes", "women"),
    ("کیف زنانه", "women-bag", "women"), ("اکسسوری زنانه", "women-accessory", "women"),
    ("زیورآلات", "women-jewelry", "women"),
    ("لباس مردانه", "men-cloth", "men"), ("کفش مردانه", "men-shoes", "men"),
    ("کیف مردانه", "men-bag", "men"), ("اکسسوری مردانه", "men-accessory", "men"),
    ("دخترانه", "kids-girl", "kids"),
]

BRANDS = [
    ("آریانا", "ARIANA", "ARIANA"), ("نیوفیشن", "NEUFASHION", "NEU"),
    ("لوکسا پریمیوم", "LUXA PREMIUM", "LUXA"), ("کلاسیک‌هوم", "CLASSIC HOME", "CLASSIC"),
    ("مودرن استایل", "MODERN STYLE", "MODERN"), ("اوربیت", "ORBIT", "ORBIT"),
    ("وینتیج", "VINTAGE", "VINTAGE"), ("اتلیه", "ATELIER", "ATELIER"),
]


class Command(BaseCommand):
    help = "Seed the database with categories, brands, products, users, and demo orders."

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding لوکسا database...")

        # Clean
        Transaction.objects.all().delete()
        Order.objects.all().delete()
        Address.objects.all().delete()
        ProductVariant.objects.all().delete()
        Product.objects.all().delete()
        Brand.objects.all().delete()
        Category.objects.all().delete()
        DiscountCode.objects.all().delete()
        User.objects.all().delete()

        # Prepare media dirs + copy seed images
        for sub in ("products", "categories"):
            (MEDIA / sub).mkdir(parents=True, exist_ok=True)
        if SEED_DIR.exists():
            for img in SEED_DIR.glob("*.png"):
                dest_products = MEDIA / "products" / img.name
                if not dest_products.exists():
                    shutil.copy2(img, dest_products)

        # Categories
        cat_map = {}
        for title, slug, parent_slug in CATEGORIES:
            parent_id = cat_map.get(parent_slug) if parent_slug else None
            c = Category.objects.create(title=title, slug=slug, parent_id=parent_id)
            cat_map[slug] = c.id
        self.stdout.write(f"  ✓ {len(CATEGORIES)} categories")

        # Brands
        for name, name_en, logo in BRANDS:
            Brand.objects.create(name=name, name_en=name_en, logo_text=logo)
        self.stdout.write(f"  ✓ {len(BRANDS)} brands")

        # Products + variants
        vcount = 0
        for (img, name, name_en, brand_name, sku, cat_slug, price, old_price,
             colors, sizes, oos, rating, reviews, desc, flags) in PRODUCTS:
            brand = Brand.objects.filter(name=brand_name).first()
            cat_id = cat_map.get(cat_slug)
            p = Product.objects.create(
                name=name, name_en=name_en, slug=sku, sku=sku,
                brand=brand, category_id=cat_id, description=desc,
                price=price, old_price=old_price,
                image=f"products/{img}", hover_image=f"products/{img}",
                rating=rating, review_count=reviews,
                is_new="new" in flags, is_bestseller="bestseller" in flags,
                is_special="special" in flags, is_active=True,
            )
            for color_name, color_hex in colors:
                for size in sizes:
                    stock = 0 if size in oos else random.randint(3, 14)
                    ProductVariant.objects.create(
                        product=p, color_name=color_name, color_hex=color_hex,
                        size=size, stock=stock,
                    )
                    vcount += 1
        self.stdout.write(f"  ✓ {len(PRODUCTS)} products, {vcount} variants")

        # Users
        admin = User.objects.create(
            phone="09000000000", full_name="مدیر لوکسا",
            first_name="مدیر", last_name="لوکسا",
            is_staff=True, is_superuser=True,
        )
        admin.set_password("admin12345")
        admin.save()

        demo = User.objects.create(
            phone="09120000000", full_name="کاربر لوکسا",
            first_name="کاربر", last_name="لوکسا",
        )
        demo.set_password("demo12345")
        demo.save()
        self.stdout.write("  ✓ 2 users (admin phone=09000000000, demo phone=09120000000)")

        # Demo address
        addr = Address.objects.create(
            user=demo, recipient="کاربر لوکسا", phone="09120000000",
            province="تهران", city="تهران", postal="1234567890",
            detail="خیابان ولیعصر، نرسیده به پارک‌وی، پلاک ۱۲۰، واحد ۳", is_default=True,
        )

        # Discount codes
        DiscountCode.objects.create(code="LUXA10", type="percent", value=10)
        DiscountCode.objects.create(code="WELCOME15", type="percent", value=15)
        DiscountCode.objects.create(code="FEST20", type="percent", value=20)
        DiscountCode.objects.create(code="FLAT50", type="fixed", value=50000, min_subtotal=500000)
        self.stdout.write("  ✓ 4 discount codes")

        # Demo orders
        o1 = Order.objects.create(
            code="LX-10234", user=demo, address=addr,
            address_snapshot={"recipient": addr.recipient, "phone": addr.phone,
                              "province": addr.province, "city": addr.city,
                              "detail": addr.detail, "postal": addr.postal},
            subtotal=4380000, shipping=0, total=4380000,
            status=Order.Status.DELIVERED, shipping_method="post",
        )
        Transaction.objects.create(order=o1, authority="DEMO-1", ref_id="100200300",
                                   amount=4380000, status="verified")
        o2 = Order.objects.create(
            code="LX-10501", user=demo, address=addr,
            address_snapshot={"recipient": addr.recipient, "phone": addr.phone,
                              "province": addr.province, "city": addr.city,
                              "detail": addr.detail, "postal": addr.postal},
            subtotal=1890000, shipping=0, total=1890000,
            status=Order.Status.SHIPPED, shipping_method="post", tracking_code="IR-777888",
        )
        Transaction.objects.create(order=o2, authority="DEMO-2", ref_id="100200301",
                                   amount=1890000, status="verified")
        self.stdout.write("  ✓ 2 demo orders")

        self.stdout.write(self.style.SUCCESS("✅ Seed complete!"))
        self.stdout.write("  Admin login: /admin/ → phone 09000000000 / password admin12345")
