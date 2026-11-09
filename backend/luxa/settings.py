"""
Django settings for لوکسا (Luxa) — e-commerce backend.
Phase 2: Python/Django backend for public deployment.

Environment variables (see .env.example):
  DEBUG, SECRET_KEY, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS,
  SHAPARAK_MODE, SHAPARAK_MERCHANT_ID, SHAPARAK_* urls
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Core ---
SECRET_KEY = os.environ.get(
    "SECRET_KEY", "django-insecure-dev-key-change-in-production-please"
)
DEBUG = os.environ.get("DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1,*").split(",")

# --- Apps ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party
    "corsheaders",
    # local (5 apps + discounts)
    "accounts",
    "products",
    "cart",
    "orders",
    "payments",
    "discounts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # before CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "luxa.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "luxa.wsgi.application"
ASGI_APPLICATION = "luxa.asgi.application"

# --- Database ---
# Dev: SQLite. Prod: set DATABASE_URL or use env vars for PostgreSQL.
DATABASES = {
    "default": {
        "ENGINE": os.environ.get("DB_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("DB_NAME", BASE_DIR / "db.sqlite3"),
        **(
            {
                "HOST": os.environ.get("DB_HOST"),
                "PORT": os.environ.get("DB_PORT"),
                "USER": os.environ.get("DB_USER"),
                "PASSWORD": os.environ.get("DB_PASSWORD"),
            }
            if os.environ.get("DB_ENGINE", "").startswith("postgres")
            else {}
        ),
    }
}

# --- Custom user model (phone-based, AbstractUser override) ---
AUTH_USER_MODEL = "accounts.User"

# Auth backends: default (for admin password login) + OTP backend
AUTHENTICATION_BACKENDS = [
    "accounts.backends.OtpBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# --- Password validators ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Internationalization ---
LANGUAGE_CODE = "fa-ir"
TIME_ZONE = "Asia/Tehran"
USE_I18N = True
USE_TZ = True

# --- Static & Media (uploads) ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Match the Next.js frontend paths exactly (no trailing-slash redirects that
# would drop POST bodies). The Django admin keeps its own slash conventions.
APPEND_SLASH = False

# --- CORS: allow the Next.js frontend (dev) and your production domain ---
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True  # allow session cookies cross-origin

# Session cookie: for cross-origin (frontend on different domain) set these in prod
SESSION_COOKIE_SAMESITE = os.environ.get("SESSION_COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"
CSRF_COOKIE_SAMESITE = os.environ.get("CSRF_COOKIE_SAMESITE", "Lax")
CSRF_COOKIE_SECURE = os.environ.get("CSRF_COOKIE_SECURE", "0") == "1"

# --- OTP settings ---
OTP_EXPIRE_MINUTES = 2
OTP_MAX_ATTEMPTS = 5
OTP_LENGTH = 5

# --- Shaparak payment gateway ---
SHAPARAK_MODE = os.environ.get("SHAPARAK_MODE", "demo")  # demo | live
SHAPARAK_MERCHANT_ID = os.environ.get(
    "SHAPARAK_MERCHANT_ID", "00000000-0000-0000-0000-000000000000"
)
SHAPARAK_REQUEST_URL = os.environ.get(
    "SHAPARAK_REQUEST_URL",
    "https://api.zarinpal.com/pg/v4/payment/request.json",
)
SHAPARAK_VERIFY_URL = os.environ.get(
    "SHAPARAK_VERIFY_URL",
    "https://api.zarinpal.com/pg/v4/payment/verify.json",
)
SHAPARAK_REDIRECT_BASE = os.environ.get(
    "SHAPARAK_REDIRECT_BASE", "https://www.zarinpal.com/pg/StartPay/"
)
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:8000")
# The frontend URL — after payment verify, the browser is redirected here with ?payment=...
FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", PUBLIC_BASE_URL)

# --- Shipping ---
FREE_SHIPPING_THRESHOLD = 1_000_000
SHIPPING_COST = 120_000

# --- Login URLs ---
LOGIN_URL = "/admin/login/"
LOGIN_REDIRECT_URL = "/admin/"
