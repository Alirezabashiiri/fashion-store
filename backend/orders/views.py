"""JSON API for orders: create (stock-validated) + list."""
import json
import random
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from products.models import Product, ProductVariant
from accounts.models import Address
from .models import Order, OrderItem
from payments.shaparak import validate_discount


def _json(data, status=200):
    return JsonResponse(data, status=status, json_dumps_params={"ensure_ascii": False})


def _parse(body):
    try:
        return json.loads(body) or {}
    except (ValueError, TypeError):
        return {}


@csrf_exempt
@login_required
@require_http_methods(["GET", "POST"])
def order_dispatch(request):
    """GET → list user's orders; POST → create a pending order."""
    if request.method == "GET":
        return order_list(request)
    return order_create(request)


@login_required
@require_http_methods(["GET"])
def order_list(request):
    orders = request.user.orders.order_by("-created_at").prefetch_related("items", "transactions")
    return _json({
        "orders": [
            {
                "id": o.id, "code": o.code, "status": o.status,
                "total": o.total, "subtotal": o.subtotal, "discount": o.discount,
                "shipping": o.shipping, "trackingCode": o.tracking_code,
                "shippingMethod": o.shipping_method,
                "createdAt": o.created_at.isoformat(),
                "items": [
                    {"name": it.name, "image": it.image, "colorName": it.color_name,
                     "size": it.size, "qty": it.qty, "price": it.unit_price}
                    for it in o.items.all()
                ],
            }
            for o in orders
        ]
    })


@csrf_exempt
@login_required
@require_http_methods(["POST"])
def order_create(request):
    """ایجاد سفارش pending با اعتبارسنجی موجودی و snapshot قیمت فاکتور."""
    data = _parse(request.body)
    items = data.get("items", [])
    address_id = data.get("addressId")
    shipping_method = data.get("shippingMethod", "post")
    delivery_slot = data.get("deliverySlot", "")
    discount_code = data.get("discountCode")
    note = data.get("note", "")

    if not items:
        return _json({"error": "سبد خرید خالی است"}, 400)
    if not address_id:
        return _json({"error": "آدرس تحویل را انتخاب کنید"}, 400)

    try:
        address = request.user.addresses.get(pk=address_id)
    except Address.DoesNotExist:
        return _json({"error": "آدرس نامعتبر است"}, 400)

    try:
        with transaction.atomic():
            subtotal = 0
            order_items = []
            for line in items:
                product = Product.objects.get(pk=line["productId"], is_active=True)
                variant = ProductVariant.objects.select_for_update().get(
                    product=product, color_name=line["colorName"], size=line["size"]
                )
                qty = int(line["qty"])
                if variant.stock < qty:
                    return _json({
                        "error": f"موجودی ناکافی برای {product.name} "
                                 f"({variant.color_name}/{variant.size})"
                    }, 400)
                unit_price = variant.effective_price
                subtotal += unit_price * qty
                order_items.append(OrderItem(
                    product=product, variant=variant,
                    name=product.name,
                    brand=product.brand.name if product.brand else "",
                    image=product.image.url if product.image else "",
                    color_name=variant.color_name, color_hex=variant.color_hex,
                    size=variant.size, unit_price=unit_price, qty=qty,
                ))

            discount_amount = 0
            if discount_code:
                d = validate_discount(discount_code, subtotal)
                if not d["ok"]:
                    return _json({"error": d["message"]}, 400)
                discount_amount = d["amount"]

            net = max(0, subtotal - discount_amount)
            if shipping_method == "bike":
                shipping = 60000
            elif shipping_method == "tipax":
                shipping = 80000
            else:
                shipping = 0 if net >= settings.FREE_SHIPPING_THRESHOLD else settings.SHIPPING_COST
            total = net + shipping

            code = f"LX-{random.randint(10000, 99999)}"
            order = Order.objects.create(
                code=code, user=request.user, address=address,
                address_snapshot={
                    "recipient": address.recipient, "phone": address.phone,
                    "province": address.province, "city": address.city,
                    "detail": address.detail, "postal": address.postal,
                },
                subtotal=subtotal, discount=discount_amount,
                shipping=shipping, total=total, status=Order.Status.PENDING,
                shipping_method=shipping_method, delivery_slot=delivery_slot, note=note,
            )
            for oi in order_items:
                oi.order = order
                oi.save()

            if discount_code and discount_amount:
                _increment_discount(discount_code.upper())

            return _json({"order": _order_repr(order)}, status=201)
    except Product.DoesNotExist:
        return _json({"error": "محصول یافت نشد"}, 400)
    except ProductVariant.DoesNotExist:
        return _json({"error": "این ترکیب رنگ/سایز موجود نیست"}, 400)
    except Exception as e:
        return _json({"error": f"خطا در ثبت سفارش: {e}"}, 500)


def _increment_discount(code):
    from discounts.models import DiscountCode
    obj = DiscountCode.objects.get(code=code)
    obj.uses = obj.uses + 1
    obj.save(update_fields=["uses"])


def _order_repr(o):
    return {
        "id": o.id, "code": o.code, "status": o.status,
        "subtotal": o.subtotal, "discount": o.discount,
        "shipping": o.shipping, "total": o.total,
    }
