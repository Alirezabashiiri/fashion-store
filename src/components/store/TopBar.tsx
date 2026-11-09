"use client";

import { Truck, Gift, Percent } from "lucide-react";

export function TopBar() {
  return (
    <div
      dir="rtl"
      className="bg-ink text-white"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:text-xs">
        <div className="hidden items-center gap-4 sm:flex">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            ارسال رایگان برای خریدهای بالای ۱ میلیون تومان
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden sm:flex-none">
          <div className="flex items-center justify-center gap-6 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-sale" />
              تخفیف ویژه کلکسیون جدید تا ۴۰٪
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Gift className="h-3.5 w-3.5" />
              کد تخفیف WELCOME15 برای اولین خرید
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <button className="hover:text-white/80">پیگیری سفارش</button>
          <span className="text-white/30">|</span>
          <button className="hover:text-white/80">راهنمای خرید</button>
        </div>
      </div>
    </div>
  );
}
