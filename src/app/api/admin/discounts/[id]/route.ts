import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

// DELETE /api/admin/discounts/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await db.discountCode.delete({ where: { id } });
    return json({ ok: true });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}
