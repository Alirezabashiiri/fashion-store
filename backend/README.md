# لوکسا (Luxa) — Django Backend

بک‌اند واقعی **پایتون/Django** برای فروشگاه لوکسا — آماده‌ی انتشار عمومی.

این بک‌اند به‌صورت مستقل قابل deploy است و شامل:

- ✅ **۵ اپلیکیشن ماژولار**: accounts، products، cart، orders، payments (+ discounts)
- ✅ **احراز هویت OTP** پیامکی (شماره موبایل به‌عنوان `USERNAME_FIELD`)
- ✅ **Django Admin کامل**: TabularInline برای متغیرها، list_filter، search_fields،
  رنگ‌بندی وضعیت سفارش‌ها، اکشن‌های دسته‌جمعی، چاپ فاکتور رسمی
- ✅ **ProductVariant** برای مدیریت انبار (هر رنگ×سایز موجودی مستقل)
- ✅ **OrderItem با قیمت ثابت فاکتور** (snapshot)
- ✅ **اتصال شاپرک**: Request → Redirect → Verify با `transaction.atomic` (کسر اتمیک موجودی)
- ✅ **آپلود تصویر** با Pillow (ImageField در ادمین)
- ✅ **کدهای تخفیف** (درصدی/ثابت، تاریخ انقضا، سقف استفاده)
- ✅ **JSON API** برای اتصال فرانت‌اند (Next.js یا هر کلاینت)
- ✅ امنیت: `@login_required` و `@staff_member_required` (دسترسی `/admin` فقط برای `is_staff`)

## 🚀 نصب و اجرا

```bash
cd backend

# نصب وابستگی‌ها
pip install -r requirements.txt

# تنظیم متغیرهای محیطی
cp .env.example .env   # سپس مقادیر را ویرایش کنید

# migrations
python manage.py makemigrations
python manage.py migrate

# seed داده‌های اولیه (دسته‌ها، برندها، ۱۶ محصول، کاربران، کدهای تخفیف)
python manage.py seed

# اجرای سرور توسعه
python manage.py runserver 8000
```

سپس:
- **Django Admin**: `http://localhost:8000/admin/`
- **JSON API**: `http://localhost:8000/api/...`

### حساب‌های تست (پس از seed)

| نقش | شماره موبایل | رمز عبور | دسترسی |
|---|---|---|---|
| مدیر | `09000000000` | `admin12345` | Django Admin کامل |
| کاربر | `09120000000` | `demo12345` | خرید و پنل کاربری |

> کاربران از طریق **OTP پیامکی** هم وارد می‌شوند (در حالت demo، کد در پاسخ API نمایش داده می‌شود).

## 📁 ساختار

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── seed_images/              # تصاویر محصول (برای seed)
├── luxa/                     # settings package
│   ├── settings.py           # SQLite dev, CORS, custom user, Shaparak config
│   └── urls.py               # admin + /api/* includes
├── accounts/                 # User (AbstractUser, phone), Address, OtpCode
├── products/                 # Category, Brand, Product, ProductVariant
│   └── management/commands/seed.py
├── cart/                     # Cart, CartItem
├── orders/                   # Order, OrderItem (snapshot pricing)
├── payments/                 # Transaction + shaparak.py (request/verify/atomic)
├── discounts/                # DiscountCode
└── templates/admin/orders/   # قالب چاپ فاکتور
```

## 🔗 API Endpoints

| متد | مسیر | توضیح |
|---|---|---|
| POST | `/api/accounts/otp/request/` | درخواست کد OTP |
| POST | `/api/accounts/otp/verify/` | تأیید کد و ورود |
| GET | `/api/accounts/me/` | کاربر جاری |
| POST | `/api/accounts/logout/` | خروج |
| GET/POST | `/api/accounts/addresses/` | لیست/ایجاد آدرس |
| DELETE | `/api/accounts/addresses/<id>/` | حذف آدرس |
| GET | `/api/products/` | لیست محصولات (با فیلتر) |
| GET | `/api/products/<id>/` | جزئیات محصول |
| GET | `/api/products/categories/` | دسته‌بندی‌ها |
| GET | `/api/products/brands/` | برندها |
| GET | `/api/orders/` | سفارش‌های کاربر |
| POST | `/api/orders/create/` | ایجاد سفارش (pending) |
| POST | `/api/payments/request/` | درخواست توکن شاپرک |
| GET | `/api/payments/verify/` | Callback از بانک + Verify + کسر موجودی |

## 🌐 اتصال فرانت‌اند Next.js

فرانت‌اند Next.js (در پوشه‌ی ریشه‌ی پروژه) می‌تواند به این بک‌اند متصل شود:
متغیر محیطی `NEXT_PUBLIC_API_BASE_URL` را روی آدرس Django تنظیم کنید
(مثلاً `http://localhost:8000`) تا تمام درخواست‌های API به Django هدایت شوند.

## 🚢 انتشار عمومی (Production)

1. `.env`: `DEBUG=0`، `SECRET_KEY` تصادفی، `ALLOWED_HOSTS` روی دامنه‌ی واقعی
2. دیتابیس: از SQLite به **PostgreSQL** تغییر دهید (`DB_ENGINE=django.db.backends.postgresql`)
3. درگاه پرداخت: `SHAPARAK_MODE=live` و `SHAPARAK_MERCHANT_ID` واقعی
4. `PUBLIC_BASE_URL` را روی دامنه‌ی HTTPS خود تنظیم کنید
5. کوکی‌های امن: `SESSION_COOKIE_SECURE=1`، `CSRF_COOKIE_SECURE=1`
6. سرور: `gunicorn luxa.wsgi:application` پشت Nginx با HTTPS
7. فایل‌های استاتیک/رسانه: `python manage.py collectstatic` + سرو Nginx برای `/static/` و `/media/`
8. درگاه: برای `/admin/` از HTTPS استفاده کنید

```bash
# نمونه‌ی production
pip install gunicorn whitenoise psycopg2-binary
python manage.py collectstatic --noinput
gunicorn luxa.wsgi:application --bind 0.0.0.0:8000
```

## 🔒 امنیت

- **تراکنش‌های اتمیک**: کسر موجودی + تغییر وضعیت + ثبت RefID در `transaction.atomic` با `select_for_update`
- **Verify حیاتی**: بعد از بازگشت از بانک، تراکنش با سرور بانک تأیید می‌شود
- **دسترسی ادمین**: `/admin/` فقط برای `is_staff=True` (Django built-in)
- **Session امن**: کوکی‌های HttpOnly، تنظیمات SameSite/Secure برای production
