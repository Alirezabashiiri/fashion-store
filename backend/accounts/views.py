"""JSON API for accounts: OTP auth, me, logout, addresses."""
import json
import random
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import OtpCode, Address

User = get_user_model()


def _json(data, status=200):
    return JsonResponse(data, status=status, json_dumps_params={"ensure_ascii": False})


def _parse(body):
    try:
        return json.loads(body) or {}
    except (ValueError, TypeError):
        return {}


@csrf_exempt
@require_http_methods(["POST"])
def otp_request(request):
    """ارسال کد یکبار مصرف به شماره موبایل."""
    data = _parse(request.body)
    phone = str(data.get("phone", "")).replace(" ", "")
    if not phone or not phone.startswith("09") or len(phone) != 11:
        return _json({"error": "شماره موبایل نامعتبر است"}, 400)

    # Invalidate previous unconsumed codes.
    OtpCode.objects.filter(phone=phone, consumed=False).update(consumed=True)

    code = "".join(random.choices("0123456789", k=settings.OTP_LENGTH))
    OtpCode.objects.create(
        phone=phone,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
    )
    # In production: send SMS here. In demo: return the code.
    resp = {"ok": True, "message": "کد یکبار مصرف ارسال شد"}
    if settings.SHAPARAK_MODE == "demo" or settings.DEBUG:
        resp["demoCode"] = code
    return _json(resp)


@csrf_exempt
@require_http_methods(["POST"])
def otp_verify(request):
    """تأیید کد و ورود کاربر (find-or-create) + ایجاد سشن."""
    data = _parse(request.body)
    phone = str(data.get("phone", "")).replace(" ", "")
    code = str(data.get("code", ""))
    if not phone or not code:
        return _json({"error": "شماره و کد الزامی است"}, 400)

    record = (
        OtpCode.objects.filter(phone=phone, consumed=False)
        .order_by("-created_at")
        .first()
    )
    if not record:
        return _json({"error": "کد یافت نشد، مجدداً درخواست کنید"}, 400)
    if record.expires_at < timezone.now():
        return _json({"error": "کد منقضی شده است"}, 400)
    if record.attempts >= settings.OTP_MAX_ATTEMPTS:
        return _json({"error": "تعداد تلاش‌ها بیش از حد مجاز"}, 400)

    record.attempts += 1
    record.save(update_fields=["attempts"])

    if record.code != code:
        return _json({"error": "کد نادرست است"}, 400)

    record.consumed = True
    record.save(update_fields=["consumed"])

    # Find-or-create user.
    user, created = User.objects.get_or_create(
        phone=phone,
        defaults={"full_name": "کاربر لوکسا"},
    )
    login(request, user, backend="accounts.backends.OtpBackend")
    return _json({
        "ok": True,
        "user": {
            "id": user.id,
            "phone": user.phone,
            "fullName": user.full_name or "کاربر لوکسا",
            "isStaff": user.is_staff,
        },
    })


@login_required
@require_http_methods(["GET"])
def me(request):
    u = request.user
    return _json({
        "user": {
            "id": u.id,
            "phone": u.phone,
            "fullName": u.full_name,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "nationalId": u.national_id,
            "email": u.email,
            "isStaff": u.is_staff,
        }
    })


@login_required
@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return _json({"ok": True})


@login_required
@require_http_methods(["GET", "POST"])
def addresses(request):
    if request.method == "GET":
        items = [
            {
                "id": a.id, "recipient": a.recipient, "phone": a.phone,
                "province": a.province, "city": a.city, "postal": a.postal,
                "detail": a.detail, "isDefault": a.is_default,
            }
            for a in request.user.addresses.all()
        ]
        return _json({"addresses": items})

    data = _parse(request.body)
    required = ("recipient", "phone", "province", "city", "postal", "detail")
    if not all(data.get(f) for f in required):
        return _json({"error": "تمامی فیلدها الزامی هستند"}, 400)
    if data.get("isDefault"):
        request.user.addresses.filter(is_default=True).update(is_default=False)
    a = Address.objects.create(
        user=request.user,
        recipient=data["recipient"], phone=data["phone"],
        province=data["province"], city=data["city"],
        postal=data["postal"], detail=data["detail"],
        is_default=bool(data.get("isDefault")),
    )
    return _json({
        "address": {
            "id": a.id, "recipient": a.recipient, "phone": a.phone,
            "province": a.province, "city": a.city, "postal": a.postal,
            "detail": a.detail, "isDefault": a.is_default,
        }
    }, status=201)


@login_required
@require_http_methods(["DELETE"])
def address_delete(request, pk):
    deleted, _ = request.user.addresses.filter(pk=pk).delete()
    if not deleted:
        return _json({"error": "آدرس یافت نشد"}, 404)
    return _json({"ok": True})
