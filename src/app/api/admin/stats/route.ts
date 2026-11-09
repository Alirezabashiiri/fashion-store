import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

// GET /api/admin/stats — dashboard overview.
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      totalUsers,
      lowStockVariants,
      revenueAgg,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.count({ where: { status: "pending" } }),
      db.order.count({ where: { status: "paid" } }),
      db.user.count(),
      db.productVariant.count({ where: { stock: { lte: 3 } } }),
      db.transaction.aggregate({
        where: { status: "verified" },
        _sum: { amount: true },
      }),
    ]);

    // recent orders
    const recentOrders = await db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true },
    });

    return json({
      totalProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      totalUsers,
      lowStockVariants,
      revenue: revenueAgg._sum.amount ?? 0,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        code: o.code,
        status: o.status,
        total: o.total,
        user: o.user.fullName ?? o.user.phone,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}
