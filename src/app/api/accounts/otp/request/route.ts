import { db } from "@/lib/db";
import { generateOtp, json, errorJson } from "@/lib/auth";

// POST /api/accounts/otp/request  { phone }
// Sends (or simulates sending) an OTP to the phone number.
export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^09\d{9}$/.test(String(phone).replace(/\s/g, ""))) {
      return errorJson("شماره موبایل نامعتبر است", 400);
    }
    const clean = String(phone).replace(/\s/g, "");

    // Invalidate previous unconsumed codes.
    await db.otpCode.updateMany({
      where: { phone: clean, consumed: false },
      data: { consumed: true },
    });

    const code = generateOtp();
    await db.otpCode.create({
      data: {
        phone: clean,
        code,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min
      },
    });

    // In production: call SMS provider here. In demo: return the code.
    return json({
      ok: true,
      message: "کد یکبار مصرف ارسال شد",
      demoCode: code, // REMOVE in production
    });
  } catch (e) {
    return errorJson("خطا در ارسال کد", 500);
  }
}
