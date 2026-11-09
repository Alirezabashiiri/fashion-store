import { db } from "@/lib/db";
import { createSession, setAuthCookie, json, errorJson } from "@/lib/auth";

// POST /api/accounts/otp/verify  { phone, code }
// Verifies the OTP, creates or fetches the user, issues a session token.
export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return errorJson("شماره و کد الزامی است", 400);
    const clean = String(phone).replace(/\s/g, "");

    const record = await db.otpCode.findFirst({
      where: { phone: clean, consumed: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) return errorJson("کد یافت نشد، مجدداً درخواست کنید", 400);
    if (record.expiresAt < new Date())
      return errorJson("کد منقضی شده است", 400);
    if (record.attempts >= 5)
      return errorJson("تعداد تلاش‌ها بیش از حد مجاز", 400);

    await db.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    if (record.code !== String(code)) {
      return errorJson("کد نادرست است", 400);
    }

    // Consume code.
    await db.otpCode.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    // Find-or-create user (phone is USERNAME_FIELD).
    let user = await db.user.findUnique({ where: { phone: clean } });
    if (!user) {
      user = await db.user.create({
        data: { phone: clean, fullName: "کاربر لوکسا" },
      });
    }

    const token = await createSession(user.id);
    const body = {
      ok: true,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        isStaff: user.isStaff,
      },
    };
    return json(body, 200, {
      "Set-Cookie": setAuthCookie(token),
    });
  } catch (e) {
    return errorJson("خطا در تأیید کد", 500);
  }
}
