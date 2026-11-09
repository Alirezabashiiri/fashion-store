# لوکسا (Luxa) — فروشگاه آنلاین پوشاک، کیف، کفش و اکسسوری

مرجع فروش آنلاین پوشاک با رابط کاربری مینیمال و مدرن (RTL، فارسی)، احراز هویت OTP،
پنل مدیریت کامل، و اتصال به درگاه پرداخت شاپرک (Request → Redirect → Verify).

## ✨ امکانات

### فروشگاه (مشتری)
- صفحه اصلی با اسلایدر، دسته‌بندی‌های تصویری، اسلایدر محصولات، ویترین برندها
- صفحه لیست محصولات (PLP) با فیلتر برند/سایز/رنگ/قیمت، مرتب‌سازی، تغییر ستون‌ها
- صفحه جزئیات محصول (PDP) با گالری + زوم، انتخاب رنگ/سایز، راهنمای سایز، تب‌ها
- سبد خرید با کد تخفیف، خلاصه فاکتور
- تسویه حساب با انتخاب آدرس، شیوه ارسال، بازه تحویل
- احراز هویت OTP پیامکی (شماره موبایل به‌عنوان USERNAME_FIELD)
- پنل کاربری: سفارش‌ها، آدرس‌ها، علاقه‌مندی‌ها، اطلاعات حساب

### پنل مدیریت (Admin)
- داشبورد با آمار درآمد، سفارش‌ها، کاربران، هشدار کم‌موجودی
- مدیریت محصولات با ویرایشگر inline متغیرها (رنگ/سایز/موجودی) — معادل TabularInline
- مدیریت سفارشات با رنگ‌بندی وضعیت‌ها، تغییر دسته‌جمعی، چاپ فاکتور رسمی
- مدیریت کدهای تخفیف (درصدی/ثابت، تاریخ انقضا، سقف استفاده)

### بک‌اند
- ۵ اپلیکیشن ماژولار: **accounts، products، cart، orders، payments** (+ discounts)
- **ProductVariant** به‌عنوان کلید انبار — هر ترکیب رنگ×سایز دارای موجودی مستقل
- **OrderItem با قیمت ثابت فاکتور** (snapshot) — قیمت فاکتور حتی پس از تغییر قیمت محصول ثابت می‌ماند
- اتصال شاپرک: گام ۱ (درخواست Authority) → گام ۲ (هدایت به بانک) → گام ۳ (Verify + کسر اتمیک موجودی)
- تراکنش‌های اتمیک (`transaction.atomic`) برای کسر موجودی + ثبت سفارش
- امنیت: `@login_required` و `@staff_member_required` معادل‌سازی شده با requireUser/requireAdmin

## 🛠 تکنولوژی

| لایه | تکنولوژی |
|---|---|
| فرانت‌اند | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| بک‌اند | Next.js API Routes + Prisma ORM (SQLite) |
| احراز هویت | OTP پیامکی + Session token (HttpOnly cookie) |
| پرداخت | شاپرک (زرین‌پال) — حالت demo و live |
| فونت | وزیرمتن (Vazirmatn) |

## 🚀 نصب و اجرا

```bash
# نصب وابستگی‌ها
bun install

# تنظیم متغیرهای محیطی
cp .env.example .env

# ایجاد دیتابیس و seed داده‌های اولیه
bun run db:push
bun run scripts/seed.ts

# اجرای سرور توسعه
bun run dev
```

سپس به `http://localhost:3000` بروید.

### حساب‌های تست (پس از seed)

| نقش | شماره موبایل | دسترسی |
|---|---|---|
| مدیر | `09000000000` | پنل مدیریت کامل |
| کاربر | `09120000000` | خرید و پنل کاربری |

> در حالت demo، کد OTP در نوتیفیکیشن نمایش داده می‌شود (نیازی به پیامک واقعی نیست).

## 📁 ساختار پروژه

```
src/
├── app/
│   ├── api/                  # API routes (5 apps)
│   │   ├── accounts/         # OTP, me, addresses, logout
│   │   ├── products/         # list, detail, categories, brands
│   │   ├── orders/           # create order
│   │   ├── payments/         # request, verify (Shaparak)
│   │   └── admin/            # products, orders, discounts, stats
│   ├── page.tsx              # SPA view router
│   └── layout.tsx            # RTL + Vazirmatn
├── components/store/         # UI components + views
│   ├── views/                # Home, PLP, PDP, Cart, Checkout, Auth, Dashboard, Admin
│   └── ...
└── lib/
    ├── db.ts                 # Prisma client
    ├── auth.ts               # session/token, requireUser, requireAdmin
    ├── shaparak.ts           # payment request/verify + atomic finalize
    ├── store.ts              # Zustand (cart, wishlist, auth, view)
    └── data.ts               # catalog data + helpers
prisma/
└── schema.prisma             # 5-app data model
scripts/
├── seed.ts                   # seed categories, brands, products, variants, users
└── gen-images.ts             # regenerate product/hero images (AI)
```

## 🔒 امنیت

- **تراکنش‌های اتمیک**: کسر موجودی + تغییر وضعیت سفارش + ثبت RefID در یک `db.$transaction`
- **Verify حیاتی**: بعد از بازگشت از بانک، تراکنش با سرور بانک تأیید می‌شود (جلوگیری از دست‌کاری پارامترها)
- **دسترسی ادمین**: تمام مسیرهای `/api/admin/*` با `requireAdmin()` محافظت می‌شوند (بررسی `isStaff`)
- **Session امن**: توکن HttpOnly cookie با SameSite=Lax

## 📝 انتشار عمومی (Production)

برای انتشار با دامنه واقعی و درگاه پرداخت واقعی:

1. `SHAPARAK_MODE=live` و `SHAPARAK_MERCHANT_ID` واقعی را در `.env` تنظیم کنید
2. `NEXT_PUBLIC_BASE_URL` را روی دامنه‌ی واقعی تنظیم کنید
3. دیتابیس را از SQLite به PostgreSQL/MySQL تغییر دهید (در `prisma/schema.prisma`)
4. با `bun run build && bun run start` در حالت production اجرا کنید
5. پشت یک reverse proxy (Nginx/Caddy) با HTTPS قرار دهید

## 📄 لایسنس

این پروژه به‌عنوان پایه‌ی فروشگاه آنلاین لوکسا توسعه یافته است.
