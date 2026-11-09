import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغو شده",
};

// GET /api/admin/orders?status=&page=&pageSize=
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20")));

    const where: any = {};
    if (status) where.status = status;

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: true, items: true, transactions: true },
      }),
    ]);

    return json({
      items: orders.map((o) => ({
        id: o.id,
        code: o.code,
        status: o.status,
        statusLabel: STATUS_LABELS[o.status] ?? o.status,
        total: o.total,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        trackingCode: o.trackingCode,
        shippingMethod: o.shippingMethod,
        user: { id: o.user.id, phone: o.user.phone, fullName: o.user.fullName },
        itemCount: o.items.length,
        createdAt: o.createdAt,
        paidAt: o.transactions.find((t) => t.status === "verified")?.updatedAt ?? null,
      })),
      total,
      page,
      pageSize,
      statusLabels: STATUS_LABELS,
    });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}

// PATCH /api/admin/orders  { ids: [...], status: "shipped", trackingCode?: "..." }
// Bulk status update (e.g. mark many as shipped + set tracking code).
export async function PATCH(req: Request) {
  try {
    await requireAdmin(req);
    const { ids, status, trackingCode } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return errorJson("شناسه‌ها و وضعیت الزامی است", 400);
    }
    const data: any = { status };
    if (trackingCode) data.trackingCode = trackingCode;
    const result = await db.order.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return json({ updated: result.count });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}
