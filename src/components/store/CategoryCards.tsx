"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { QUICK_CATEGORIES } from "@/lib/data";

export function CategoryCards() {
  const openListing = useStore((s) => s.openListing);
  return (
    <section dir="rtl" className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-ink sm:text-xl">دسته‌بندی‌های محبوب</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => openListing(c.slug, c.title)}
            className="card-hover group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-alt"
          >
            <Image
              src={c.image}
              alt={c.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <span className="absolute bottom-3 right-3 left-3 text-center text-sm font-bold text-white">
              {c.title}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
