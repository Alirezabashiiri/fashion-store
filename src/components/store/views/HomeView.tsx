"use client";

import { HeroCarousel } from "../HeroCarousel";
import { CategoryCards } from "../CategoryCards";
import { ProductSlider } from "../ProductSlider";
import { BrandShowcase } from "../BrandShowcase";
import { PRODUCTS } from "@/lib/data";

export function HomeView() {
  const newest = PRODUCTS.filter((p) => p.isNew).concat(PRODUCTS.slice(0, 8));
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller);
  const flash = PRODUCTS.filter((p) => p.isSpecial);

  return (
    <div dir="rtl">
      <HeroCarousel />
      <CategoryCards />

      <ProductSlider
        title="جدیدترین محصولات"
        products={dedupe(newest).slice(0, 10)}
      />
      <ProductSlider
        title="پرفروش‌ترین‌ها"
        products={dedupe(bestsellers).slice(0, 10)}
      />
      <ProductSlider
        title="پیشنهادهای شگفت‌انگیز"
        products={dedupe(flash).slice(0, 10)}
        accentTimer
      />

      {/* Mid promo banner */}
      <section className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="relative overflow-hidden rounded-lg bg-ink px-8 py-10 text-white">
          <div className="relative z-10 max-w-md">
            <span className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs">
              کلاب لوکسا
            </span>
            <h3 className="mb-2 text-2xl font-bold">عضو کلاب شوید، بیشتر خرید کنید</h3>
            <p className="mb-4 text-sm text-white/80">
              با عضویت در کلاب لوکسا از ارسال رایگان، تخفیف‌های اختصاصی و
              پیش‌فروش محصولات بهره‌مند شوید.
            </p>
            <button className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-ink hover:bg-white/90">
              عضویت رایگان
            </button>
          </div>
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-sale/30 blur-3xl" />
          <div className="absolute left-1/3 top-0 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        </div>
      </section>

      <BrandShowcase />
    </div>
  );
}

function dedupe(arr: typeof PRODUCTS) {
  const seen = new Set<string>();
  const out: typeof PRODUCTS = [];
  for (const p of arr) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}
