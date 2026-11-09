// Shaparak payment gateway integration (Zarinpal/PSP protocol).
// Implements the 3-step flow: Request (token) → Redirect → Callback Verify.
//
// In production, set SHAPARAK_MERCHANT_ID and SHAPARAK_MODE=live.
// In demo mode (default), the request returns a local redirect that simulates
// the bank callback so the full Verify + atomic stock-decrement path is exercised.

import { db } from "./db";
import { Prisma } from "@prisma/client";

const MERCHANT_ID = process.env.SHAPARAK_MERCHANT_ID ?? "00000000-0000-0000-0000-000000000000";
const MODE = (process.env.SHAPARAK_MODE ?? "demo") as "demo" | "live";
const GATEWAY_REQUEST_URL =
  process.env.SHAPARAK_REQUEST_URL ?? "https://api.zarinpal.com/pg/v4/payment/request.json";
const GATEWAY_VERIFY_URL =
  process.env.SHAPARAK_VERIFY_URL ?? "https://api.zarinpal.com/pg/v4/payment/verify.json";
const GATEWAY_REDIRECT_BASE =
  process.env.SHAPARAK_REDIRECT_BASE ?? "https://www.zarinpal.com/pg/StartPay/";

export interface RequestResult {
  authority: string;
  redirectUrl: string;
}

/**
 * گام ۱: درخواست توکن (Authority) از درگاه شاپرک.
 * POST { MerchantID, Amount(rial), CallbackURL } → returns Authority.
 */
export async function requestPayment(
  amountToman: number,
  callbackUrl: string,
): Promise<RequestResult> {
  const amountRial = amountToman * 10; // PSP expects rial

  if (MODE === "demo") {
    // Simulate the PSP returning an Authority token.
    const authority = "A" + generateAuthority();
    // Redirect URL points back to our own verify endpoint, mimicking a bank callback.
    const redirectUrl = `${callbackUrl.split("?")[0]}?Authority=${authority}&Status=OK`;
    return { authority, redirectUrl };
  }

  const body = {
    merchant_id: MERCHANT_ID,
    amount: amountRial,
    callback_url: callbackUrl,
    description: "خرید از فروشگاه لوکسا",
  };
  const res = await fetch(GATEWAY_REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const authority = data?.data?.authority;
  if (!authority || data?.errors) {
    throw new Error(
      `Shaparak request failed: ${JSON.stringify(data?.errors ?? data)}`,
    );
  }
  return { authority, redirectUrl: `${GATEWAY_REDIRECT_BASE}${authority}` };
}

export interface VerifyResult {
  ok: boolean;
  refId: string | null;
  code: number;
  message: string;
}

/**
 * گام ۳: اعتبارسنجی حیاتی — Verify تراکنش از سرور بانک.
 * جلوگیری از دست‌کاری پارامترهای مرورگر توسط کاربر.
 * روی موفقیت (Code == 100) وضعیت سفارش paid می‌شود و موجودی کسر می‌شود.
 */
export async function verifyPayment(
  authority: string,
  amountToman: number,
): Promise<VerifyResult> {
  const amountRial = amountToman * 10;

  if (MODE === "demo") {
    // Simulate bank verify success (Code 100 = verified).
    return {
      ok: true,
      refId: String(Math.floor(100000000 + Math.random() * 900000000)),
      code: 100,
      message: "Verified (demo)",
    };
  }

  const body = {
    merchant_id: MERCHANT_ID,
    amount: amountRial,
    authority,
  };
  const res = await fetch(GATEWAY_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const code = data?.data?.code;
  const refId = data?.data?.ref_id ? String(data.data.ref_id) : null;
  if (code === 100) {
    return { ok: true, refId, code, message: "Verified" };
  }
  return {
    ok: false,
    refId,
    code: code ?? 0,
    message: data?.errors?.message ?? "Verify failed",
  };
}

/**
 * فرآیند اتمیک: کسر موجودی انبار + ثبت سفارش paid + ثبت RefID.
 * داخل transaction.atomic — اگر هر مرحله خطا دهد، همه rollback می‌شود.
 */
export async function finalizeOrderOnPaymentSuccess(
  orderId: string,
  transactionId: string,
  refId: string,
): Promise<void> {
  await db.$transaction(async (tx) => {
    // 1. Lock & verify the order is still pending (idempotency guard).
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found");
    if (order.status !== "pending") {
      // Already finalized — idempotent no-op.
      return;
    }

    // 2. Decrement stock for every variant atomically.
    for (const item of order.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant) throw new Error(`Variant ${item.variantId} missing`);
        if (variant.stock < item.qty) {
          throw new Error(
            `Insufficient stock for ${item.name} (${item.colorName}/${item.size})`,
          );
        }
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.qty } },
        });
      }
    }

    // 3. Mark order paid.
    await tx.order.update({
      where: { id: orderId },
      data: { status: "paid" },
    });

    // 4. Record verified transaction with RefID.
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "verified", refId },
    });
  });
}

export async function markTransactionFailed(
  transactionId: string,
  message: string,
): Promise<void> {
  await db.transaction.update({
    where: { id: transactionId },
    data: { status: "failed", message },
  });
}

function generateAuthority(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Discount calculator (campaigns / discount codes).
export interface DiscountResult {
  ok: boolean;
  message: string;
  amount: number; // toman off
  codeId?: string;
}

export async function validateDiscount(
  code: string,
  subtotal: number,
): Promise<DiscountResult> {
  const c = await db.discountCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!c || !c.isActive) {
    return { ok: false, message: "کد تخفیف نامعتبر است", amount: 0 };
  }
  if (c.expiresAt && c.expiresAt < new Date()) {
    return { ok: false, message: "کد تخفیف منقضی شده است", amount: 0 };
  }
  if (c.maxUses > 0 && c.uses >= c.maxUses) {
    return { ok: false, message: "سقف استفاده از این کد تکمیل شده است", amount: 0 };
  }
  if (subtotal < c.minSubtotal) {
    return {
      ok: false,
      message: `حداقل خرید برای این کد ${c.minSubtotal.toLocaleString("fa-IR")} تومان است`,
      amount: 0,
    };
  }
  let amount = 0;
  if (c.type === "percent") {
    amount = Math.round((subtotal * c.value) / 100);
  } else {
    amount = c.value;
  }
  amount = Math.min(amount, subtotal);
  return { ok: true, message: "کد تخفیف اعمال شد", amount, codeId: c.id };
}

export async function consumeDiscount(codeId: string): Promise<void> {
  await db.discountCode.update({
    where: { id: codeId },
    data: { uses: { increment: 1 } },
  });
}

// Re-export Prisma types for convenience in routes.
export type { Prisma };
