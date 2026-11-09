import { db } from "@/lib/db";
import { verifyPayment, finalizeOrderOnPaymentSuccess, markTransactionFailed } from "@/lib/shaparak";

// GET /api/payments/verify?Authority=<token>&Status=<OK|NOK>
// گام ۳: بازگشت از بانک + اعتبارسنجی حیاتی (Verify).
// روی موفقیت: کسر اتمیک موجودی + سفارش paid + ثبت RefID → هدایت به صفحه موفقیت.
// روی شکست: هدایت به صفحه خطا.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  const origin = process.env.NEXT_PUBLIC_BASE_URL ?? `${url.protocol}//${url.host}`;
  const home = `${origin}/`;

  if (!authority) {
    return Response.redirect(`${home}?payment=failed&reason=noparams`);
  }

  const tx = await db.transaction.findFirst({
    where: { authority },
    include: { order: true },
  });
  if (!tx) {
    return Response.redirect(`${home}?payment=failed&reason=notx`);
  }
  const orderCode = tx.order.code;

  // User cancelled or bank rejected.
  if (status !== "OK") {
    await markTransactionFailed(tx.id, `Status=${status}`);
    await db.order.update({
      where: { id: tx.orderId },
      data: { status: "cancelled" },
    });
    return Response.redirect(`${home}?payment=cancelled&order=${orderCode}`);
  }

  // Verify with the PSP (critical security check).
  const result = await verifyPayment(authority, tx.amount);
  if (!result.ok) {
    await markTransactionFailed(tx.id, result.message);
    return Response.redirect(`${home}?payment=failed&order=${orderCode}&reason=verify`);
  }

  // Atomic finalize: decrement stock + order→paid + transaction→verified with RefID.
  try {
    await finalizeOrderOnPaymentSuccess(tx.orderId, tx.id, result.refId ?? "");
    return Response.redirect(
      `${home}?payment=success&order=${orderCode}&ref=${result.refId ?? ""}`,
    );
  } catch (e: any) {
    // Stock race / error → refund would be needed in production.
    await markTransactionFailed(tx.id, `finalize: ${e.message}`);
    return Response.redirect(
      `${home}?payment=failed&order=${orderCode}&reason=finalize`,
    );
  }
}
