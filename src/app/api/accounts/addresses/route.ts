import { db } from "@/lib/db";
import { requireUser, json, errorJson } from "@/lib/auth";

// GET /api/accounts/addresses — list current user's addresses.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const addresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return json({ addresses });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}

// POST /api/accounts/addresses — create a new address.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const { recipient, phone, province, city, postal, detail, isDefault } = body;
    if (!recipient || !phone || !province || !city || !postal || !detail) {
      return errorJson("تمامی فیلدها الزامی هستند", 400);
    }
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    const addr = await db.address.create({
      data: {
        userId: user.id,
        recipient,
        phone,
        province,
        city,
        postal,
        detail,
        isDefault: !!isDefault,
      },
    });
    return json({ address: addr }, 201);
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا در ذخیره آدرس", 500);
  }
}
