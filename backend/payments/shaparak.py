"""
Shaparak (زرین‌پال/PSP) payment gateway integration.
3-step flow: Request (Authority) → Redirect → Callback Verify.

گام ۱: درخواست توکن از درگاه
گام ۲: هدایت کاربر به بانک
گام ۳: بازگشت + Verify حیاتی + کسر اتمیک موجودی
"""

import random
import string
import requests
from django.conf import settings
from django.db import transaction


def _generate_authority():
    chars = string.ascii_uppercase + string.digits
    return "A" + "".join(random.choice(chars) for _ in range(32))


def request_payment(amount_toman: int, callback_url: str):
    """
    گام ۱: POST {merchant_id, amount(rial), callback_url} → Authority.
    Returns dict(authority, redirect_url).
    """
    amount_rial = amount_toman * 10  # PSP expects rial

    if settings.SHAPARAK_MODE == "demo":
        authority = _generate_authority()
        # Redirect back to our verify endpoint, mimicking a bank callback.
        sep = "&" if "?" in callback_url else "?"
        redirect_url = f"{callback_url}{sep}Authority={authority}&Status=OK"
        return {"authority": authority, "redirect_url": redirect_url}

    body = {
        "merchant_id": settings.SHAPARAK_MERCHANT_ID,
        "amount": amount_rial,
        "callback_url": callback_url,
        "description": "خرید از فروشگاه لوکسا",
    }
    resp = requests.post(
        settings.SHAPARAK_REQUEST_URL,
        json=body,
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        timeout=15,
    )
    data = resp.json()
    authority = (data.get("data") or {}).get("authority")
    if not authority or data.get("errors"):
        raise RuntimeError(
            f"Shaparak request failed: {data.get('errors') or data}"
        )
    return {
        "authority": authority,
        "redirect_url": f"{settings.SHAPARAK_REDIRECT_BASE}{authority}",
    }


def verify_payment(authority: str, amount_toman: int):
    """
    گام ۳: Verify حیاتی — مطمئن می‌شود تراکنش واقعی بوده.
    Returns dict(ok, ref_id, code, message).
    """
    amount_rial = amount_toman * 10

    if settings.SHAPARAK_MODE == "demo":
        return {
            "ok": True,
            "ref_id": str(random.randint(100000000, 999999999)),
            "code": 100,
            "message": "Verified (demo)",
        }

    body = {
        "merchant_id": settings.SHAPARAK_MERCHANT_ID,
        "amount": amount_rial,
        "authority": authority,
    }
    resp = requests.post(
        settings.SHAPARAK_VERIFY_URL,
        json=body,
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        timeout=15,
    )
    data = resp.json()
    code = (data.get("data") or {}).get("code")
    ref_id = (data.get("data") or {}).get("ref_id")
    if code == 100:
        return {"ok": True, "ref_id": str(ref_id) if ref_id else "", "code": code, "message": "Verified"}
    return {
        "ok": False,
        "ref_id": str(ref_id) if ref_id else "",
        "code": code or 0,
        "message": str((data.get("errors") or {}).get("message") or "Verify failed"),
    }


@transaction.atomic
def finalize_order_on_success(order_id, transaction_id, ref_id):
    """
    فرآیند اتمیک: کسر موجودی انبار + سفارش paid + ثبت RefID.
    داخل transaction.atomic — اگر خطا دهد، همه rollback می‌شود.
    """
    from orders.models import Order

    order = (
        Order.objects.select_for_update()
        .filter(id=order_id, status=Order.Status.PENDING)
        .first()
    )
    if not order:
        # Already finalized (idempotent).
        return

    # Decrement stock for every variant.
    for item in order.items.select_related("variant"):
        if item.variant:
            variant = (
                item.variant.__class__.objects.select_for_update()
                .filter(id=item.variant_id, stock__gte=item.qty)
                .first()
            )
            if not variant:
                raise RuntimeError(
                    f"Insufficient stock for {item.name} "
                    f"({item.color_name}/{item.size})"
                )
            variant.stock = variant.stock - item.qty
            variant.save(update_fields=["stock"])

    # Mark order paid + record verified transaction with RefID.
    order.status = Order.Status.PAID
    order.save(update_fields=["status", "updated_at"])

    order.transactions.filter(id=transaction_id).update(
        status="verified", ref_id=ref_id
    )


def mark_transaction_failed(transaction_id, message=""):
    from payments.models import Transaction
    Transaction.objects.filter(id=transaction_id).update(
        status="failed", message=message
    )


def validate_discount(code: str, subtotal: int):
    """Validate a discount code against the subtotal. Returns dict."""
    from discounts.models import DiscountCode
    from django.utils import timezone

    try:
        c = DiscountCode.objects.get(code=code.upper())
    except DiscountCode.DoesNotExist:
        return {"ok": False, "message": "کد تخفیف نامعتبر است", "amount": 0}
    if not c.is_active:
        return {"ok": False, "message": "کد تخفیف غیرفعال است", "amount": 0}
    if c.expires_at and c.expires_at < timezone.now():
        return {"ok": False, "message": "کد تخفیف منقضی شده است", "amount": 0}
    if c.max_uses > 0 and c.uses >= c.max_uses:
        return {"ok": False, "message": "سقف استفاده تکمیل شده است", "amount": 0}
    if subtotal < c.min_subtotal:
        return {
            "ok": False,
            "message": f"حداقل خرید {c.min_subtotal:,} تومان است",
            "amount": 0,
        }
    if c.type == DiscountCode.Type.PERCENT:
        amount = round(subtotal * c.value / 100)
    else:
        amount = c.value
    amount = min(amount, subtotal)
    return {"ok": True, "message": "کد تخفیف اعمال شد", "amount": amount, "code_id": c.id}
