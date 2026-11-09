"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { type Product } from "@/lib/data";
import { useRef } from "react";

interface Props {
  title: string;
  products: Product[];
  accentTimer?: boolean;
}

function FlashTimer() {
  // static demo countdown (visual only)
  return (
    <div className="flex items-center gap-1.5">
      <span className="rounded bg-sale px-2 py-0.5 text-xs font-bold text-white">شگفت‌انگیز</span>
      <div className="flex items-center gap-1 text-xs font-bold text-ink">
        <span className="rounded bg-ink px-1.5 py-0.5 text-white">۱۲</span>
        :
        <span className="rounded bg-ink px-1.5 py-0.5 text-white">۴۵</span>
        :
        <span className="rounded bg-ink px-1.5 py-0.5 text-white">۳۰</span>
      </div>
    </div>
  );
}

export function ProductSlider({ title, products, accentTimer }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "next" | "prev") => {
    const el = ref.current;
    if (!el) return;
    // RTL: scrollLeft decreases when going right; we want "next" = show later items
    const amt = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "next" ? -amt : amt, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
        <div className="flex items-center gap-2">
          {accentTimer && <FlashTimer />}
          <div className="hidden sm:flex">
            <button
              aria-label="قبلی"
              onClick={() => scroll("prev")}
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-white text-ink hover:bg-surface-alt"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              aria-label="بعدی"
              onClick={() => scroll("next")}
              className="mr-1 grid h-8 w-8 place-items-center rounded-md border border-border bg-white text-ink hover:bg-surface-alt"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[170px] shrink-0 sm:w-[220px] lg:w-[260px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
