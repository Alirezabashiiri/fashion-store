import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

// GET /api/admin/discounts
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const codes = await db.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return json({ items: codes });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}

// POST /api/admin/discounts  { code, type, value, maxUses, expiresAt, minSubtotal, isActive }
export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { code, type, value, maxUses, expiresAt, minSubtotal, isActive } = body;
    if (!code || !type || value === undefined) {
      return errorJson("کد، نوع و مقدار الزامی است", 400);
    }
    if (!["percent", "fixed"].includes(type)) {
      return errorJson("نوع باید percent یا fixed باشد", 400);
    }
    const exists = await db.discountCode.findUnique({ where: { code: String(code).toUpperCase() } });
    if (exists) return errorJson("کد تکراری است", 400);

    const created = await db.discountCode.create({
      data: {
        code: String(code).toUpperCase(),
        type,
        value: parseInt(value),
        maxUses: maxUses ? parseInt(maxUses) : 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        minSubtotal: minSubtotal ? parseInt(minSubtotal) : 0,
        isActive: isActive ?? true,
      },
    });
    return json({ discount: created }, 201);
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}
