import { db } from "@/lib/db";
import { getUserFromRequest, json, errorJson } from "@/lib/auth";

// GET /api/accounts/me — current authenticated user.
export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return errorJson("احراز هویت نشده", 401);
  const full = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      phone: true,
      fullName: true,
      firstName: true,
      lastName: true,
      nationalId: true,
      email: true,
      isStaff: true,
    },
  });
  return json({ user: full });
}
