import { db } from "@/lib/db";
import { requireUser, json, errorJson } from "@/lib/auth";

// DELETE /api/accounts/addresses/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const addr = await db.address.findUnique({ where: { id } });
    if (!addr || addr.userId !== user.id) {
      return errorJson("آدرس یافت نشد", 404);
    }
    await db.address.delete({ where: { id } });
    return json({ ok: true });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}
