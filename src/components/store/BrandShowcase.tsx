"use client";

import { useStore } from "@/lib/store";
import { BRANDS } from "@/lib/data";

export function BrandShowcase() {
  const openListing = useStore((s) => s.openListing);
  return (
    <section dir="rtl" className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-ink sm:text-xl">برندهای منتخب</h2>
        <button
          onClick={() => openListing("brands", "برندها")}
          className="text-xs font-medium text-ink-soft hover:text-ink"
        >
          مشاهده همه
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {BRANDS.map((b) => (
          <button
            key={b.id}
            onClick={() => openListing("brands", b.name)}
            className="card-hover flex aspect-[3/2] items-center justify-center rounded-lg border border-border bg-white px-3"
          >
            <span className="text-sm font-bold tracking-wide text-ink">
              {b.logoText}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
