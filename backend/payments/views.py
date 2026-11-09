"""JSON API for payments: Shaparak request + verify callback."""
import json
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from orders.models import Order
from payments.models import Transaction
from payments.shaparak import request_payment, verify_payment, finalize_order_on_success, mark_transaction_failed


def _json(data, status=200):
    return JsonResponse(data, status=status, json_dumps_params={"ensure_ascii": False})


def _parse(body):
    try:
        return json.loads(body) or {}
    except (ValueError, TypeError):
        return {}


@csrf_exempt
@login_required
@require_http_methods(["POST"])
def payment_request(request):
    """
    گام ۱: ایجاد تراکنش با وضعیت requested + درخواست Authority از شاپرک.
    برمی‌گرداند: redirectUrl
    """
    data = _parse(request.body)
    order = get_object_or_404(Order, pk=data.get("orderId"), user=request.user)
    if order.status != Order.Status.PENDING:
        return _json({"error": "این سفارش قابل پرداخت نیست"}, 400)

    tx = order.transactions.filter(status="requested").first()
    if not tx:
        tx = Transaction.objects.create(
            order=order, amount=order.total, status="requested", gateway="shaparak",
        )

    callback_url = f"{settings.PUBLIC_BASE_URL}/api/payments/verify"
    result = request_payment(order.total, callback_url)
    tx.authority = result["authority"]
    tx.save(update_fields=["authority"])

    return _json({
        "redirectUrl": result["redirect_url"],
        "authority": result["authority"],
        "orderId": order.id,
        "orderCode": order.code,
    })


@require_http_methods(["GET"])
def payment_verify(request):
    """
    گام ۳: Callback از بانک — Authority و Status دریافت می‌شود.
    روی OK: Verify حیاتی + کسر اتمیک موجودی + ثبت RefID → هدایت به صفحه موفقیت.
    در غیر این صورت: هدایت به صفحه خطا/لغو.
    """
    authority = request.GET.get("Authority")
    status = request.GET.get("Status")
    home = settings.FRONTEND_BASE_URL + "/"

    if not authority:
        return HttpResponseRedirect(f"{home}?payment=failed&reason=noparams")

    tx = Transaction.objects.select_related("order").filter(authority=authority).first()
    if not tx:
        return HttpResponseRedirect(f"{home}?payment=failed&reason=notx")

    order_code = tx.order.code

    if status != "OK":
        mark_transaction_failed(tx.id, f"Status={status}")
        tx.order.status = Order.Status.CANCELLED
        tx.order.save(update_fields=["status", "updated_at"])
        return HttpResponseRedirect(f"{home}?payment=cancelled&order={order_code}")

    result = verify_payment(authority, tx.amount)
    if not result["ok"]:
        mark_transaction_failed(tx.id, result["message"])
        return HttpResponseRedirect(
            f"{home}?payment=failed&order={order_code}&reason=verify"
        )

    try:
        finalize_order_on_success(tx.order_id, tx.id, result["ref_id"])
        return HttpResponseRedirect(
            f"{home}?payment=success&order={order_code}&ref={result['ref_id']}"
        )
    except Exception as e:
        mark_transaction_failed(tx.id, f"finalize: {e}")
        return HttpResponseRedirect(
            f"{home}?payment=failed&order={order_code}&reason=finalize"
        )
