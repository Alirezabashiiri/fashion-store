import { db } from "@/lib/db";
import { requireUser, json, errorJson } from "@/lib/auth";
import { validateDiscount, consumeDiscount } from "@/lib/shaparak";

const SHIPPING_COST = 120000;
const FREE_SHIPPING_THRESHOLD = 1000000;

// GET /api/orders — current user's orders.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const orders = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true, transactions: true },
    });
    return json({ orders });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}

interface CartLine {
  productId: string;
  colorName: string;
  size: string;
  qty: number;
}

// POST /api/orders — create a PENDING order from cart contents.
// Validates stock for each variant, snapshots prices/variants (fixed invoice).
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const {
      items,
      addressId,
      shippingMethod = "post",
      deliverySlot,
      discountCode,
      note,
    } = body as { items: CartLine[]; addressId?: string; shippingMethod?: string; deliverySlot?: string; discountCode?: string; note?: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorJson("سبد خرید خالی است", 400);
    }
    if (!addressId) return errorJson("آدرس تحویل را انتخاب کنید", 400);

    const address = await db.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!address) return errorJson("آدرس نامعتبر است", 400);

    // Build order items with stock validation.
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      variantId: string;
      name: string;
      brand: string;
      image: string;
      colorName: string;
      colorHex: string;
      size: string;
      unitPrice: number;
      qty: number;
    }> = [];

    for (const line of items) {
      const product = await db.product.findUnique({
        where: { id: line.productId },
        include: { brand: true },
      });
      if (!product || !product.isActive) {
        return errorJson(`محصول یافت نشد: ${line.productId}`, 400);
      }
      const variant = await db.productVariant.findFirst({
        where: {
          productId: product.id,
          colorName: line.colorName,
          size: line.size,
        },
      });
      if (!variant) {
        return errorJson(
          `این ترکیب رنگ/سایز موجود نیست: ${product.name} (${line.colorName}/${line.size})`,
          400,
        );
      }
      if (variant.stock < line.qty) {
        return errorJson(
          `موجودی ناکافی برای ${product.name} (${line.colorName}/${line.size}): موجودی ${variant.stock}`,
          400,
        );
      }
      const unitPrice = variant.price ?? product.price;
      subtotal += unitPrice * line.qty;
      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        brand: product.brand?.name ?? "",
        image: product.image,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        size: variant.size,
        unitPrice,
        qty: line.qty,
      });
    }

    // Discount
    let discountAmount = 0;
    let discountCodeId: string | undefined;
    if (discountCode) {
      const d = await validateDiscount(discountCode, subtotal);
      if (!d.ok) return errorJson(d.message, 400);
      discountAmount = d.amount;
      discountCodeId = d.codeId;
    }

    const shipping =
      shippingMethod === "bike"
        ? 60000
        : shippingMethod === "tipax"
          ? 80000
          : subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD
            ? 0
            : SHIPPING_COST;
    const total = Math.max(0, subtotal - discountAmount) + shipping;

    // Generate human order code.
    const code = `LX-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await db.order.create({
      data: {
        code,
        userId: user.id,
        addressId: address.id,
        addressSnapshot: JSON.stringify({
          recipient: address.recipient,
          phone: address.phone,
          province: address.province,
          city: address.city,
          detail: address.detail,
          postal: address.postal,
        }),
        subtotal,
        discount: discountAmount,
        shipping,
        total,
        status: "pending",
        shippingMethod,
        deliverySlot,
        note,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    if (discountCodeId) await consumeDiscount(discountCodeId);

    return json({ order }, 201);
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    console.error("create order error", e);
    return errorJson("خطا در ثبت سفارش", 500);
  }
}
