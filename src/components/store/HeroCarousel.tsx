"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  slug: string;
  align: "right" | "left";
}

const SLIDES: Slide[] = [
  {
    image: "/images/hero-women.png",
    eyebrow: "کلکسیون پاییز و زمستان",
    title: "زیبایی در جزئیات",
    desc: "کلکسیون جدید پوشاک زنانه با طراحی مینیمال و پارچه‌های مرغوب",
    cta: "مشاهده کلکسیون زنانه",
    slug: "women",
    align: "right",
  },
  {
    image: "/images/hero-men.png",
    eyebrow: "استایل مردانه",
    title: "اصالت و ظرافت",
    desc: "پوشاک مردانه رسمی و کژوال با دوخت حرفه‌ای و چرم طبیعی",
    cta: "مشاهده کلکسیون مردانه",
    slug: "men",
    align: "left",
  },
  {
    image: "/images/hero-sale.png",
    eyebrow: "فروش ویژه",
    title: "تا ۴۰٪ تخفیف",
    desc: "فرصت محدود برای خرید کالاهای منتخب با بهترین قیمت",
    cta: "مشاهده محصولات حراج",
    slug: "sale",
    align: "right",
  },
];

export function HeroCarousel() {
  const openListing = useStore((s) => s.openListing);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-surface-alt">
      <div className="relative h-[300px] sm:h-[420px] lg:h-[520px]">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/25 to-transparent" />
            <div
              className={`absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20 ${
                s.align === "right" ? "justify-start" : "justify-end"
              }`}
            >
              <div className="max-w-md text-white">
                <span className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  {s.eyebrow}
                </span>
                <h2 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  {s.title}
                </h2>
                <p className="mb-5 text-sm leading-6 text-white/85 sm:text-base">
                  {s.desc}
                </p>
                <button
                  onClick={() => openListing(s.slug, s.eyebrow)}
                  className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-ink transition hover:bg-white/90"
                >
                  {s.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        aria-label="قبلی"
        onClick={() => go(index - 1)}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink shadow hover:bg-white sm:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        aria-label="بعدی"
        onClick={() => go(index + 1)}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink shadow hover:bg-white sm:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`اسلاید ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
