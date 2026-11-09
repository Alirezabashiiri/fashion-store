import { db } from "@/lib/db";
import { requireUser, json, errorJson } from "@/lib/auth";
import { requestPayment } from "@/lib/shaparak";

// POST /api/payments/request  { orderId }
// گام ۱: ایجاد تراکنش با وضعیت requested + درخواست توکن (Authority) از شاپرک.
// Returns the gateway redirect URL.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const { orderId } = await req.json();
    if (!orderId) return errorJson("شناسه سفارش الزامی است", 400);

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { transactions: true },
    });
    if (!order || order.userId !== user.id) {
      return errorJson("سفارش یافت نشد", 404);
    }
    if (order.status !== "pending") {
      return errorJson("این سفارش قابل پرداخت نیست", 400);
    }

    // Avoid duplicate transactions for the same order.
    let tx = order.transactions.find((t) => t.status === "requested");
    if (!tx) {
      tx = await db.transaction.create({
        data: {
          orderId: order.id,
          amount: order.total,
          status: "requested",
          gateway: "shaparak",
        },
      });
    }

    // Build the callback URL (absolute, points to our verify endpoint).
    const url = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_BASE_URL ?? `${url.protocol}//${url.host}`;
    const callbackUrl = `${origin}/api/payments/verify`;

    const { authority, redirectUrl } = await requestPayment(
      order.total,
      callbackUrl,
    );

    await db.transaction.update({
      where: { id: tx.id },
      data: { authority },
    });

    return json({ redirectUrl, authority, orderId: order.id, orderCode: order.code });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    console.error("payment request error", e);
    return errorJson("خطا در اتصال به درگاه پرداخت", 500);
  }
}
