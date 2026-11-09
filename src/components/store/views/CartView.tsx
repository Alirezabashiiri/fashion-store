"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { formatToman, toFaDigits } from "@/lib/data";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { useState } from "react";

const SHIPPING_THRESHOLD = 1000000;
const SHIPPING_COST = 120000;

export function CartView() {
  const cart = useStore((s) => s.cart);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const setView = useStore((s) => s.setView);
  const openProduct = useStore((s) => s.openProduct);
  const subtotal = useStore((s) => s.cartSubtotal());
  const applyPromo = useStore((s) => s.applyPromo);
  const clearPromo = useStore((s) => s.clearPromo);
  const promoCode = useStore((s) => s.promoCode);
  const promoDiscount = useStore((s) => s.promoDiscount);

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = Math.max(0, subtotal - promoDiscount) + shipping;

  const handleApply = () => {
    const r = applyPromo(code);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) setCode("");
  };

  if (cart.length === 0) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center">
          <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-ink-soft/40" />
          <h2 className="text-lg font-bold text-ink">سبد خرید شما خالی است</h2>
          <p className="mt-1 text-sm text-ink-soft">
            هنوز محصولی به سبد خرید اضافه نکرده‌اید
          </p>
          <button
            onClick={() => setView("home")}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/90"
          >
            <ArrowLeft className="h-4 w-4" />
            شروع خرید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      <Stepper step={1} setView={setView} />

      <h1 className="mb-4 text-xl font-bold text-ink sm:text-2xl">سبد خرید</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {cart.map((item, i) => (
            <div
              key={`${item.productId}-${item.colorName}-${item.size}-${i}`}
              className="flex gap-3 rounded-lg border border-border bg-white p-3"
            >
              <button
                onClick={() => openProduct(item.productId)}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-alt"
              >
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-ink-soft">{item.brand}</div>
                <button
                  onClick={() => openProduct(item.productId)}
                  className="line-clamp-2 text-right text-sm font-medium text-ink hover:underline"
                >
                  {item.name}
                </button>
                <div className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
                  <span className="flex items-center gap-1">
                    رنگ:
                    <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex }} />
                    {item.colorName}
                  </span>
                  <span>سایز: {item.size}</span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  {/* qty */}
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      onClick={() => updateQty(i, item.qty - 1)}
                      className="grid h-8 w-8 place-items-center text-ink hover:bg-surface-alt"
                      aria-label="کاهش"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-bold text-ink">{toFaDigits(item.qty)}</span>
                    <button
                      onClick={() => updateQty(i, item.qty + 1)}
                      className="grid h-8 w-8 place-items-center text-ink hover:bg-surface-alt"
                      aria-label="افزایش"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-bold text-ink">
                      {toFaDigits(formatToman(item.price * item.qty))} ت
                    </div>
                    {item.qty > 1 && (
                      <div className="text-[10px] text-ink-soft">
                        ({toFaDigits(formatToman(item.price))} ت × {toFaDigits(item.qty)})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(i)}
                className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-md text-ink-soft hover:bg-sale-soft hover:text-sale"
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            ادامه خرید
          </button>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-4 text-sm font-bold text-ink">خلاصه فاکتور</h2>

            {/* promo */}
            <div className="mb-4 rounded-md border border-dashed border-border bg-surface-alt p-3">
              {promoCode ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <Tag className="h-3.5 w-3.5 text-sale" />
                    {promoCode} اعمال شد
                  </span>
                  <button onClick={() => { clearPromo(); setMsg(null); }} className="text-[10px] text-ink-soft underline">
                    حذف
                  </button>
                </div>
              ) : (
                <>
                  <label className="mb-1.5 block text-xs text-ink-soft">کد تخفیف / کارت هدیه</label>
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="مثلاً LUXA10"
                      className="h-9 flex-1 rounded-md border border-border bg-white px-3 text-xs uppercase focus:outline-none focus:border-ink"
                    />
                    <button
                      onClick={handleApply}
                      className="h-9 shrink-0 rounded-md bg-ink px-3 text-xs font-medium text-white hover:bg-ink/90"
                    >
                      اعمال
                    </button>
                  </div>
                  {msg && (
                    <p className={`mt-1.5 text-[11px] ${msg.ok ? "text-emerald-600" : "text-sale"}`}>{msg.text}</p>
                  )}
                </>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">مجموع کالاها</dt>
                <dd className="text-ink">{toFaDigits(formatToman(subtotal))} ت</dd>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sale">
                  <dt>تخفیف ({promoCode})</dt>
                  <dd>− {toFaDigits(formatToman(promoDiscount))} ت</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">هزینه ارسال</dt>
                <dd className={shipping === 0 ? "text-emerald-600" : "text-ink"}>
                  {shipping === 0 ? "رایگان" : `${toFaDigits(formatToman(shipping))} ت`}
                </dd>
              </div>
              {shipping > 0 && (
                <div className="rounded bg-surface-alt p-2 text-[11px] text-ink-soft">
                  با خرید {toFaDigits(formatToman(SHIPPING_THRESHOLD - subtotal))} تومان دیگر، ارسال رایگان می‌شود
                </div>
              )}
            </dl>

            <div className="my-3 border-t border-border" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-ink">مبلغ قابل پرداخت</span>
              <span className="text-lg font-bold text-ink">
                {toFaDigits(formatToman(total))}
                <span className="mr-1 text-xs font-normal text-ink-soft">تومان</span>
              </span>
            </div>

            <button
              onClick={() => setView("checkout")}
              className="mt-4 w-full rounded-md bg-ink py-3 text-sm font-bold text-white transition hover:bg-ink/90"
            >
              ادامه فرایند خرید
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-ink-soft">
              <span>پرداخت امن از طریق درگاه شاپرک</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Stepper({
  step,
  setView,
}: {
  step: 1 | 2 | 3;
  setView: (v: "cart" | "checkout") => void;
}) {
  const steps = [
    { n: 1, label: "سبد خرید", key: "cart" as const },
    { n: 2, label: "آدرس و ارسال", key: null },
    { n: 3, label: "پرداخت و ثبت", key: null },
  ];
  return (
    <div className="mb-6 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => s.key && setView(s.key)}
            disabled={s.n > step}
            className="flex items-center gap-2"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                s.n < step
                  ? "bg-ink text-white"
                  : s.n === step
                    ? "bg-ink text-white ring-4 ring-ink/10"
                    : "bg-surface-alt text-ink-soft"
              }`}
            >
              {s.n < step ? "✓" : toFaDigits(s.n)}
            </span>
            <span className={`hidden text-xs sm:block ${s.n <= step ? "font-medium text-ink" : "text-ink-soft"}`}>
              {s.label}
            </span>
          </button>
          {i < steps.length - 1 && (
            <span className={`h-px w-8 sm:w-16 ${s.n < step ? "bg-ink" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
