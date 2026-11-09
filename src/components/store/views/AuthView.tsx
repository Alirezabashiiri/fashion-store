"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Smartphone, KeyRound, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AuthView() {
  const login = useStore((s) => s.login);
  const setView = useStore((s) => s.setView);
  const { toast } = useToast();

  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [remember, setRemember] = useState(true);

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(phone.replace(/\s/g, ""))) {
      toast({ title: "شماره موبایل نامعتبر است", description: "فرمت: 09123456789" });
      return;
    }
    setStage("otp");
    toast({ title: "کد یکبار مصرف ارسال شد", description: `کد تستی: ۱۲۳۴۵` });
    setTimeout(() => inputs.current[0]?.focus(), 100);
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 5) {
      toast({ title: "کد را کامل وارد کنید" });
      return;
    }
    login(phone, remember ? "کاربر لوکسا" : undefined);
    toast({ title: "ورود موفقیت‌آمیز بود", description: "خوش آمدید" });
    setView("dashboard");
  };

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 4) inputs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (txt) {
      setOtp(txt.split(""));
      e.preventDefault();
    }
  };

  return (
    <div dir="rtl" className="mx-auto flex max-w-[1400px] items-start justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => setView("home")}
          className="mb-4 flex items-center gap-1 text-xs text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          بازگشت به فروشگاه
        </button>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-ink text-white font-bold text-xl">
              L
            </span>
            <h1 className="text-lg font-bold text-ink">ورود / ثبت‌نام</h1>
            <p className="mt-1 text-xs text-ink-soft">
              {stage === "phone"
                ? "با شماره موبایل خود وارد شوید یا حساب بسازید"
                : "کد ارسال‌شده به شماره خود را وارد کنید"}
            </p>
          </div>

          {stage === "phone" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink">شماره موبایل</label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    dir="ltr"
                    inputMode="tel"
                    className="h-11 w-full rounded-lg border border-border bg-surface-alt pr-10 pl-4 text-sm text-ink focus:outline-none focus:border-ink focus:bg-white"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-ink"
                />
                ایجاد رمز عبور ثابت برای ورودهای بعدی
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90"
              >
                دریافت کد یکبار مصرف
              </button>

              <p className="text-center text-[11px] leading-5 text-ink-soft">
                با ورود به لوکسا، <span className="text-ink underline">قوانین و شرایط استفاده</span> را می‌پذیرم.
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-ink-soft">
                  کد ۵ رقمی به شماره
                </p>
                <p className="mt-0.5 text-sm font-bold text-ink" dir="ltr">{phone}</p>
              </div>

              <div className="flex justify-center gap-2" dir="ltr" onPaste={onPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-12 rounded-lg border border-border bg-surface-alt text-center text-lg font-bold text-ink focus:outline-none focus:border-ink focus:bg-white"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90"
              >
                <KeyRound className="h-4 w-4" />
                تأیید و ورود
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStage("phone")}
                  className="text-ink-soft hover:text-ink"
                >
                  تغییر شماره
                </button>
                <button
                  type="button"
                  onClick={() => toast({ title: "کد مجدداً ارسال شد" })}
                  className="text-ink hover:underline"
                >
                  ارسال مجدد کد
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
