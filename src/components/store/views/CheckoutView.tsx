"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatToman, toFaDigits } from "@/lib/data";
import { api, ApiError } from "@/lib/api";
import { Stepper } from "./CartView";
import {
  MapPin,
  Truck,
  CreditCard,
  Plus,
  Trash2,
  Banknote,
  Wallet,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SHIPPING_COST = 120000;

export function CheckoutView() {
  const setView = useStore((s) => s.setView);
  const cart = useStore((s) => s.cart);
  const subtotal = useStore((s) => s.cartSubtotal());
  const promoDiscount = useStore((s) => s.promoDiscount);
  const promoCode = useStore((s) => s.promoCode);
  const isAuthed = useStore((s) => s.isAuthed);
  const addresses = useStore((s) => s.addresses);
  const loadAddresses = useStore((s) => s.loadAddresses);
  const addAddressApi = useStore((s) => s.addAddressApi);
  const removeAddressApi = useStore((s) => s.removeAddressApi);
  const { toast } = useToast();

  const [selectedAddr, setSelectedAddr] = useState("");
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipient: "",
    phone: "",
    province: "تهران",
    city: "تهران",
    postal: "",
    detail: "",
  });
  const [shippingMethod, setShippingMethod] = useState<"post" | "bike" | "tipax">("post");
  const [deliveryDay, setDeliveryDay] = useState("tomorrow-am");
  const [payMethod, setPayMethod] = useState<"shaparak" | "wallet" | "credit">("shaparak");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (isAuthed) loadAddresses();
  }, [isAuthed, loadAddresses]);

  // Derive the effective selected address (default/first if none chosen).
  const activeAddr =
    addresses.find((a) => a.id === selectedAddr) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0];

  const shippingFee =
    shippingMethod === "bike" ? 60000 : shippingMethod === "tipax" ? 80000 : subtotal >= 1000000 ? 0 : SHIPPING_COST;
  const total = Math.max(0, subtotal - promoDiscount) + shippingFee;

  const handleSaveAddr = async () => {
    if (!newAddr.recipient || !newAddr.phone || !newAddr.postal || !newAddr.detail) {
      toast({ title: "لطفاً همه فیلدها را پر کنید" });
      return;
    }
    const ok = await addAddressApi(newAddr);
    if (ok) {
      setNewAddr({ recipient: "", phone: "", province: "تهران", city: "تهران", postal: "", detail: "" });
      setShowAddrForm(false);
      toast({ title: "آدرس جدید ذخیره شد" });
    } else {
      toast({ title: "خطا در ذخیره آدرس" });
    }
  };

  const handlePay = async () => {
    if (!activeAddr) {
      toast({ title: "یک آدرس تحویل انتخاب کنید" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "سبد خرید خالی است" });
      setView("cart");
      return;
    }
    setPlacing(true);
    try {
      // Step 1: create pending order (backend validates stock atomically).
      const items = cart.map((c) => ({
        productId: c.productId,
        colorName: c.colorName,
        size: c.size,
        qty: c.qty,
      }));
      const orderRes = await api.createOrder({
        items,
        addressId: activeAddr.id,
        shippingMethod,
        deliverySlot: deliveryDay,
        discountCode: promoCode ?? undefined,
      });

      // Step 2: request Shaparak token → get redirect URL.
      const payRes = await api.requestPayment(orderRes.order.id);

      // Step 3: redirect to bank gateway (demo: loops back to /api/payments/verify).
      window.location.href = payRes.redirectUrl;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "خطا در ثبت سفارش";
      toast({ title: "خطا در فرایند پرداخت", description: msg });
      setPlacing(false);
    }
  };

  if (!isAuthed) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-ink">برای ادامه خرید وارد شوید</h2>
          <p className="mt-1 text-sm text-ink-soft">برای ثبت سفارش نیاز به ورود یا ثبت‌نام است</p>
          <button
            onClick={() => setView("auth")}
            className="mt-4 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white"
          >
            ورود / ثبت‌نام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      <Stepper step={2} setView={setView} />

      <h1 className="mb-4 text-xl font-bold text-ink sm:text-2xl">تسویه حساب</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Address */}
          <section className="rounded-lg border border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <MapPin className="h-4 w-4" />
                آدرس تحویل
              </h2>
              <button
                onClick={() => setShowAddrForm((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" />
                آدرس جدید
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                      activeAddr?.id === a.id ? "border-ink bg-surface-alt" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addr"
                      checked={activeAddr?.id === a.id}
                      onChange={() => setSelectedAddr(a.id)}
                      className="mt-1 accent-ink"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-ink">{a.recipient} — {toFaDigits(a.phone)}</div>
                      <div className="mt-0.5 text-ink-soft">{a.province}، {a.city}، {a.detail}</div>
                      <div className="mt-0.5 text-ink-soft/70">کد پستی: {toFaDigits(a.postal)}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeAddressApi(a.id);
                      }}
                      className="text-ink-soft hover:text-sale"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </label>
                ))}
              </div>
            ) : (
              !showAddrForm && (
                <p className="py-4 text-center text-xs text-ink-soft">آدرسی ثبت نشده — یک آدرس جدید اضافه کنید</p>
              )
            )}

            {showAddrForm && (
              <div className="mt-3 space-y-3 rounded-md border border-dashed border-border bg-surface-alt p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input value={newAddr.recipient} onChange={(e) => setNewAddr({ ...newAddr, recipient: e.target.value })} placeholder="نام تحویل‌گیرنده" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
                  <input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} placeholder="شماره تماس" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={newAddr.province} onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })} className="h-9 rounded-md border border-border bg-white px-2 text-xs focus:outline-none focus:border-ink">
                    {["تهران", "اصفهان", "فارس", "خراسان رضوی", "گیلان", "آذربایجان شرقی"].map((p) => (<option key={p}>{p}</option>))}
                  </select>
                  <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} placeholder="شهر" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
                </div>
                <input value={newAddr.postal} onChange={(e) => setNewAddr({ ...newAddr, postal: e.target.value })} placeholder="کد پستی (۱۰ رقم)" className="h-9 w-full rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" dir="ltr" />
                <textarea value={newAddr.detail} onChange={(e) => setNewAddr({ ...newAddr, detail: e.target.value })} placeholder="آدرس پستی کامل" rows={2} className="w-full rounded-md border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:border-ink" />
                <div className="flex gap-2">
                  <button onClick={handleSaveAddr} className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-white">ذخیره آدرس</button>
                  {addresses.length > 0 && (<button onClick={() => setShowAddrForm(false)} className="rounded-md border border-border bg-white px-4 py-2 text-xs text-ink-soft">انصراف</button>)}
                </div>
              </div>
            )}
          </section>

          {/* Shipping method */}
          <section className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink"><Truck className="h-4 w-4" />شیوه ارسال</h2>
            <div className="space-y-2">
              {[
                { k: "post", label: "پست پیشتاز", desc: "۲ تا ۴ روز کاری", fee: subtotal >= 1000000 ? 0 : SHIPPING_COST },
                { k: "bike", label: "پیک اختصاصی فوری", desc: "همان روز (فقط تهران)", fee: 60000 },
                { k: "tipax", label: "تیپاکس", desc: "۲۴ تا ۴۸ ساعت", fee: 80000 },
              ].map((m) => (
                <label key={m.k} className={`flex cursor-pointer items-center justify-between rounded-md border p-3 ${shippingMethod === m.k ? "border-ink bg-surface-alt" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="ship" checked={shippingMethod === m.k} onChange={() => setShippingMethod(m.k as typeof shippingMethod)} className="accent-ink" />
                    <div>
                      <div className="text-sm font-medium text-ink">{m.label}</div>
                      <div className="text-[11px] text-ink-soft">{m.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink">{m.fee === 0 ? "رایگان" : `${toFaDigits(formatToman(m.fee))} ت`}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Delivery time */}
          <section className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-ink">بازه زمانی تحویل</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { k: "today-eve", label: "امروز", sub: "عصر" },
                { k: "tomorrow-am", label: "فردا", sub: "صبح" },
                { k: "tomorrow-pm", label: "فردا", sub: "عصر" },
                { k: "dayafter", label: "پس‌فردا", sub: "صبح" },
              ].map((d) => (
                <button key={d.k} onClick={() => setDeliveryDay(d.k)} className={`rounded-md border p-2 text-center ${deliveryDay === d.k ? "border-ink bg-surface-alt" : "border-border"}`}>
                  <div className="text-xs font-medium text-ink">{d.label}</div>
                  <div className="text-[10px] text-ink-soft">{d.sub}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink"><CreditCard className="h-4 w-4" />روش پرداخت</h2>
            <div className="space-y-2">
              {[
                { k: "shaparak", label: "درگاه مستقیم بانکی (شاپرک)", desc: "انتقال به درگاه بانک", icon: Banknote },
                { k: "wallet", label: "کیف پول لوکسا", desc: "موجودی: ۵۰۰٬۰۰۰ تومان", icon: Wallet },
                { k: "credit", label: "خرید اعتباری", desc: "پرداخت در ۳ قسط", icon: CreditCard },
              ].map((m) => (
                <label key={m.k} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${payMethod === m.k ? "border-ink bg-surface-alt" : "border-border"}`}>
                  <input type="radio" name="pay" checked={payMethod === m.k} onChange={() => setPayMethod(m.k as typeof payMethod)} className="accent-ink" />
                  <m.icon className="h-5 w-5 text-ink" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink">{m.label}</div>
                    <div className="text-[11px] text-ink-soft">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-md bg-surface-alt p-2 text-[11px] text-ink-soft">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              تمام تراکنش‌ها از طریق درگاه امن شاپرک و با Verify سرورسمی انجام می‌شود.
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-ink">خلاصه سفارش</h2>
            <div className="mb-3 max-h-48 space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <img src={item.image} alt="" className="h-10 w-10 rounded-md border border-border object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">{item.name}</div>
                    <div className="text-[10px] text-ink-soft">{item.colorName} / {item.size} × {toFaDigits(item.qty)}</div>
                  </div>
                  <span className="font-medium text-ink">{toFaDigits(formatToman(item.price * item.qty))} ت</span>
                </div>
              ))}
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">مجموع کالاها</dt><dd className="text-ink">{toFaDigits(formatToman(subtotal))} ت</dd></div>
              {promoDiscount > 0 && (<div className="flex justify-between text-sale"><dt>تخفیف {promoCode && `(${promoCode})`}</dt><dd>− {toFaDigits(formatToman(promoDiscount))} ت</dd></div>)}
              <div className="flex justify-between"><dt className="text-ink-soft">ارسال</dt><dd className={shippingFee === 0 ? "text-emerald-600" : "text-ink"}>{shippingFee === 0 ? "رایگان" : `${toFaDigits(formatToman(shippingFee))} ت`}</dd></div>
            </dl>

            <div className="my-3 border-t border-border" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-ink">مبلغ نهایی</span>
              <span className="text-lg font-bold text-ink">{toFaDigits(formatToman(total))}<span className="mr-1 text-xs font-normal text-ink-soft">تومان</span></span>
            </div>

            <button
              onClick={handlePay}
              disabled={placing}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-60"
            >
              {placing ? (<><Loader2 className="h-4 w-4 animate-spin" />در حال اتصال به درگاه...</>) : (<><ShieldCheck className="h-4 w-4" />پرداخت و ثبت سفارش</>)}
            </button>
            <p className="mt-2 text-center text-[10px] text-ink-soft">با کلیک روی دکمه، سفارش ثبت و به درگاه شاپرک منتقل می‌شوید</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
