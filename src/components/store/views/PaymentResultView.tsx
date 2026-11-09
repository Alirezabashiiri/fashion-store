"use client";

import { useStore } from "@/lib/store";
import { formatToman, toFaDigits } from "@/lib/data";
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, Package } from "lucide-react";
import { useEffect } from "react";

export function PaymentResultView() {
  const result = useStore((s) => s.paymentResult);
  const setView = useStore((s) => s.setView);
  const clearCart = useStore((s) => s.clearCart);
  const loadOrders = useStore((s) => s.loadOrders);

  // On success, clear the cart (order is now persisted server-side).
  useEffect(() => {
    if (result?.status === "success") {
      clearCart();
      loadOrders();
    }
  }, [result, clearCart, loadOrders]);

  if (!result) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-16 text-center">
        <p className="text-sm text-ink-soft">نتیجه‌ای موجود نیست</p>
        <button onClick={() => setView("home")} className="mt-3 text-ink underline">بازگشت به خانه</button>
      </div>
    );
  }

  const success = result.status === "success";

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-white p-8 text-center">
        {success ? (
          <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-emerald-600" />
        ) : result.status === "cancelled" ? (
          <AlertCircle className="mx-auto mb-3 h-16 w-16 text-amber-500" />
        ) : (
          <XCircle className="mx-auto mb-3 h-16 w-16 text-sale" />
        )}

        <h2 className="text-xl font-bold text-ink">
          {success ? "پرداخت با موفقیت انجام شد" : result.status === "cancelled" ? "پرداخت لغو شد" : "پرداخت ناموفق بود"}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {success
            ? "سفارش شما ثبت شد و در حال پردازش است. موجودی انبار به‌روزرسانی شد."
            : result.status === "cancelled"
              ? "تراکنش توسط شما یا بانک لغو شد. سفارش همچنان در پنل شما قابل مشاهده است."
              : "متأسفانه در پرداخت خطایی رخ داد. در صورت کسر وجه، ظرف ۲۴ ساعت برگردانده می‌شود."}
        </p>

        {result.orderCode && (
          <div className="mt-5 space-y-2 rounded-lg bg-surface-alt p-4 text-right text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">شماره سفارش:</span>
              <span className="font-bold text-ink" dir="ltr">{result.orderCode}</span>
            </div>
            {result.refId && (
              <div className="flex justify-between">
                <span className="text-ink-soft">کد پیگیری بانک:</span>
                <span className="font-bold text-ink" dir="ltr">{result.refId}</span>
              </div>
            )}
            {result.reason && (
              <div className="flex justify-between">
                <span className="text-ink-soft">علت:</span>
                <span className="font-medium text-sale">{result.reason}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setView("dashboard")}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-ink py-2.5 text-sm font-medium text-white"
          >
            <Package className="h-4 w-4" />
            مشاهده سفارش‌ها
          </button>
          <button
            onClick={() => setView("home")}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-white py-2.5 text-sm font-medium text-ink"
          >
            <ShoppingBag className="h-4 w-4" />
            بازگشت به فروشگاه
          </button>
        </div>
      </div>
    </div>
  );
}
