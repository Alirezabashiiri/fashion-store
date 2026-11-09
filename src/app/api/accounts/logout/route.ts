import { db } from "@/lib/db";
import { getUserFromRequest, clearAuthCookie, json } from "@/lib/auth";

// POST /api/accounts/logout — invalidate session + clear cookie.
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const match = cookieHeader.match(/luxa_token=([^;]+)/);
      if (match) {
        await db.session.deleteMany({ where: { token: match[1] } });
      }
    }
    return json({ ok: true }, 200, { "Set-Cookie": clearAuthCookie() });
  } catch {
    return json({ ok: true }, 200, { "Set-Cookie": clearAuthCookie() });
  }
}
