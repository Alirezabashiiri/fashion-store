import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

// GET /api/admin/orders/[id] — full order detail for invoice printing.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        items: true,
        transactions: true,
      },
    });
    if (!order) return errorJson("یافت نشد", 404);

    let addr = null;
    try {
      addr = order.addressSnapshot ? JSON.parse(order.addressSnapshot) : order.address;
    } catch {
      addr = order.address;
    }

    return json({
      order: {
        id: order.id,
        code: order.code,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        shippingMethod: order.shippingMethod,
        trackingCode: order.trackingCode,
        createdAt: order.createdAt,
        user: {
          fullName: order.user.fullName,
          phone: order.user.phone,
          nationalId: order.user.nationalId,
        },
        address: addr,
        items: order.items.map((i) => ({
          id: i.id,
          name: i.name,
          brand: i.brand,
          image: i.image,
          colorName: i.colorName,
          colorHex: i.colorHex,
          size: i.size,
          unitPrice: i.unitPrice,
          qty: i.qty,
          lineTotal: i.unitPrice * i.qty,
        })),
        transaction: order.transactions.find((t) => t.status === "verified") ?? order.transactions[0],
      },
    });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}

// PATCH /api/admin/orders/[id]  { status?, trackingCode? }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { status, trackingCode } = await req.json();
    const data: any = {};
    if (status) data.status = status;
    if (trackingCode !== undefined) data.trackingCode = trackingCode;
    const order = await db.order.update({ where: { id }, data });
    return json({ order });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}
