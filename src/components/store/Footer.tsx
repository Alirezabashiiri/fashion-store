"use client";

import { useStore } from "@/lib/store";
import { ShieldCheck, RotateCcw, Truck, Headphones } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const openListing = useStore((s) => s.openListing);
  const setView = useStore((s) => s.setView);
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast({
      title: "عضویت شما ثبت شد",
      description: "کد تخفیف ۱۵٪ به ایمیل شما ارسال شد",
    });
    setEmail("");
  };

  const valueProps = [
    { icon: ShieldCheck, title: "ضمانت اصالت کالا", desc: "تمام محصولات اصل و گارانتی‌دار" },
    { icon: RotateCcw, title: "۷ روز ضمانت بازگشت", desc: "بازگشت آسان و بدون دردسر" },
    { icon: Truck, title: "تحویل سریع", desc: "ارسال به سراسر کشور" },
    { icon: Headphones, title: "پشتیبانی ۲۴ ساعته", desc: "همیشه در کنار شما هستیم" },
  ];

  const links = [
    { title: "راهنمای خرید", items: ["راهنمای ثبت سفارش", "روش‌های پرداخت", "شرایط ارسال", "پیگیری سفارش"] },
    { title: "خدمات مشتریان", items: ["قوانین بازگشت کالا", "حریم خصوصی", "شرایط استفاده", "سوالات متداول"] },
    { title: "با لوکسا", items: ["درباره ما", "تماس با ما", "فرصت‌های شغلی", "وبلاگ مد"] },
  ];

  return (
    <footer dir="rtl" className="mt-auto border-t border-border bg-surface-alt">
      {/* Value propositions */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {valueProps.map((v) => (
            <div key={v.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-alt text-ink">
                <v.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-ink">{v.title}</div>
                <div className="text-xs text-ink-soft">{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-[1400px] px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white font-bold">
                L
              </span>
              <span className="text-xl font-bold text-ink">لوکسا</span>
            </div>
            <p className="mb-4 max-w-md text-sm leading-6 text-ink-soft">
              عضو خبرنامه لوکسا شوید و از تخفیف‌های ویژه، کلکسیون‌های جدید و
              رویدادهای اختصاصی زودتر از همه باخبر شوید.
            </p>
            <form onSubmit={subscribe} className="flex max-w-md gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل شما"
                className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:border-ink"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-lg bg-ink px-5 text-sm font-medium text-white hover:bg-ink/90"
              >
                عضویت
              </button>
            </form>
            <div className="mt-4 flex items-center gap-3">
              {/* Trust badges */}
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] text-ink-soft">
                <span className="grid h-5 w-5 place-items-center rounded bg-sky-600 text-[9px] font-bold text-white">
                  e
                </span>
                نماد اعتماد الکترونیکی
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] text-ink-soft">
                <span className="grid h-5 w-5 place-items-center rounded bg-emerald-600 text-[9px] font-bold text-white">
                  س
                </span>
                ساماندهی
              </span>
            </div>
          </div>

          {/* Link columns */}
          {links.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-bold text-ink">{col.title}</h4>
              <ul className="space-y-2">
                {col.items.map((it) => (
                  <li key={it}>
                    <button
                      onClick={() =>
                        it === "پیگیری سفارش"
                          ? setView("dashboard")
                          : it === "قوانین بازگشت کالا"
                            ? openListing("sale", "فروش ویژه")
                            : undefined
                      }
                      className="text-xs text-ink-soft hover:text-ink"
                    >
                      {it}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-ink-soft sm:flex-row">
          <span>© ۱۴۰۳ لوکسا — تمامی حقوق محفوظ است.</span>
          <div className="flex items-center gap-3">
            <span>روش‌های پرداخت:</span>
            <span className="rounded border border-border bg-white px-2 py-1 text-[10px]">شاپرک</span>
            <span className="rounded border border-border bg-white px-2 py-1 text-[10px]">زرین‌پال</span>
            <span className="rounded border border-border bg-white px-2 py-1 text-[10px]">درگاه بانکی</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
