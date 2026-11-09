"use client";

import { useMemo, useState } from "react";
import {
  PRODUCTS,
  ALL_BRAND_NAMES,
  ALL_COLORS,
  ALL_SIZES,
  productsByCategory,
  toFaDigits,
  type Product,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "../ProductCard";
import { ChevronLeft, Home, SlidersHorizontal, X, Check } from "lucide-react";

type SortKey = "newest" | "bestseller" | "cheap" | "expensive" | "popular";

export function ProductListingView() {
  const plpSlug = useStore((s) => s.plpSlug ?? "women");
  const plpTitle = useStore((s) => s.plpTitle ?? "محصولات");
  const setView = useStore((s) => s.setView);
  const openListing = useStore((s) => s.openListing);

  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(3000000);
  const [onlyStock, setOnlyStock] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [cols, setCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");

  const base = useMemo(() => productsByCategory(plpSlug), [plpSlug]);

  const filtered = useMemo(() => {
    let list: Product[] = [...base];
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c.name)));
    if (sizes.length) list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    list = list.filter((p) => p.price <= priceMax);
    if (onlyStock) list = list.filter((p) => !p.outOfStockSizes || p.outOfStockSizes.length < p.sizes.length);
    if (onlyDiscount) list = list.filter((p) => p.originalPrice);

    switch (sort) {
      case "cheap":
        list.sort((a, b) => a.price - b.price);
        break;
      case "expensive":
        list.sort((a, b) => b.price - a.price);
        break;
      case "bestseller":
        list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      case "popular":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return list;
  }, [base, brands, colors, sizes, priceMax, onlyStock, onlyDiscount, sort]);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const filteredBrands = ALL_BRAND_NAMES.filter((b) =>
    b.includes(brandQuery.trim()),
  );

  const clearAll = () => {
    setBrands([]);
    setColors([]);
    setSizes([]);
    setPriceMax(3000000);
    setOnlyStock(false);
    setOnlyDiscount(false);
  };

  const activeCount =
    brands.length + colors.length + sizes.length + (onlyStock ? 1 : 0) + (onlyDiscount ? 1 : 0);

  const FiltersBody = (
    <div className="space-y-6">
      {/* Brands */}
      <FilterSection title="برندها">
        <input
          value={brandQuery}
          onChange={(e) => setBrandQuery(e.target.value)}
          placeholder="جستجوی برند..."
          className="mb-2 h-9 w-full rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink"
        />
        <div className="max-h-40 space-y-1.5 overflow-y-auto scrollbar-thin pr-1">
          {filteredBrands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
              <span
                className={`grid h-4 w-4 place-items-center rounded border ${
                  brands.includes(b) ? "border-ink bg-ink text-white" : "border-border bg-white"
                }`}
                onClick={() => setBrands(toggle(brands, b))}
              >
                {brands.includes(b) && <Check className="h-3 w-3" />}
              </span>
              <input type="checkbox" className="sr-only" checked={brands.includes(b)} onChange={() => setBrands(toggle(brands, b))} />
              {b}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="سایز">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.filter((s) => !["ONE"].includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => setSizes(toggle(sizes, s))}
              className={`min-w-9 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                sizes.includes(s)
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink-soft hover:border-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="رنگ">
        <div className="flex flex-wrap gap-2">
          {ALL_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => setColors(toggle(colors, c.name))}
              title={c.name}
              className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
                colors.includes(c.name) ? "border-ink" : "border-border"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {colors.includes(c.name) && (
                <Check className="h-3.5 w-3.5 text-white mix-blend-difference" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="حداکثر قیمت">
        <input
          type="range"
          min={300000}
          max={3000000}
          step={100000}
          value={priceMax}
          onChange={(e) => setPriceMax(+e.target.value)}
          className="w-full accent-ink"
        />
        <div className="mt-1 text-xs text-ink-soft">
          تا {toFaDigits(priceMax.toLocaleString("fa-IR"))} تومان
        </div>
      </FilterSection>

      {/* Toggles */}
      <FilterSection title="فیلترهای سریع">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-between text-sm text-ink-soft">
            <span>فقط کالاهای موجود</span>
            <ToggleSwitch on={onlyStock} set={setOnlyStock} />
          </label>
          <label className="flex cursor-pointer items-center justify-between text-sm text-ink-soft">
            <span>فقط کالاهای تخفیف‌دار</span>
            <ToggleSwitch on={onlyDiscount} set={setOnlyDiscount} />
          </label>
        </div>
      </FilterSection>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full rounded-md border border-border bg-white py-2 text-xs font-medium text-ink-soft hover:bg-surface-alt"
        >
          حذف همه فیلترها ({toFaDigits(activeCount)})
        </button>
      )}
    </div>
  );

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-ink-soft">
        <button onClick={() => setView("home")} className="flex items-center gap-1 hover:text-ink">
          <Home className="h-3.5 w-3.5" />
          خانه
        </button>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-ink">{plpTitle}</span>
      </nav>

      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{plpTitle}</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-border bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-ink" />
              <span className="text-sm font-bold text-ink">فیلترها</span>
            </div>
            {FiltersBody}
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                فیلترها
                {activeCount > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] text-white">
                    {toFaDigits(activeCount)}
                  </span>
                )}
              </button>
              <span className="text-xs text-ink-soft">
                {toFaDigits(filtered.length)} کالا یافت شد
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-md border border-border bg-white px-2 text-xs text-ink focus:outline-none focus:border-ink"
              >
                <option value="newest">جدیدترین</option>
                <option value="bestseller">پرفروش‌ترین</option>
                <option value="cheap">ارزان‌ترین</option>
                <option value="expensive">گران‌ترین</option>
                <option value="popular">محبوب‌ترین</option>
              </select>

              <div className="hidden items-center gap-1 rounded-md border border-border p-0.5 sm:flex">
                <button
                  onClick={() => setCols(3)}
                  className={`grid h-7 w-7 place-items-center rounded ${cols === 3 ? "bg-ink text-white" : "text-ink-soft"}`}
                  aria-label="نمای ۳ ستونه"
                >
                  <span className="grid grid-cols-3 gap-0.5">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="h-1 w-1 rounded-[1px] bg-current" />
                    ))}
                  </span>
                </button>
                <button
                  onClick={() => setCols(4)}
                  className={`grid h-7 w-7 place-items-center rounded ${cols === 4 ? "bg-ink text-white" : "text-ink-soft"}`}
                  aria-label="نمای ۴ ستونه"
                >
                  <span className="grid grid-cols-4 gap-0.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <span key={i} className="h-1 w-1 rounded-[1px] bg-current" />
                    ))}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div
              className={`grid gap-3 ${
                cols === 4
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center">
              <p className="text-sm text-ink-soft">محصولی با این فیلترها یافت نشد</p>
              <button
                onClick={clearAll}
                className="mt-3 rounded-md bg-ink px-4 py-2 text-xs font-medium text-white"
              >
                حذف فیلترها
              </button>
            </div>
          )}

          {/* Related quick links */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs">
            <span className="text-ink-soft">دسته‌های مرتبط:</span>
            {["women-cloth", "women-shoes", "women-bag", "men-cloth", "sale"].map((s) => (
              <button
                key={s}
                onClick={() => openListing(s, s === "sale" ? "فروش ویژه" : s)}
                className="rounded-full border border-border px-3 py-1 text-ink-soft hover:border-ink hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-xl scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-ink">فیلترها</span>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {FiltersBody}
            <button
              onClick={() => setShowFilters(false)}
              className="mt-4 w-full rounded-md bg-ink py-2.5 text-sm font-medium text-white"
            >
              نمایش {toFaDigits(filtered.length)} کالا
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <h3 className="mb-2.5 text-sm font-bold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function ToggleSwitch({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      onClick={() => set(!on)}
      className={`relative h-5 w-9 rounded-full transition ${on ? "bg-ink" : "bg-border"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          on ? "right-0.5" : "right-4"
        }`}
      />
    </button>
  );
}
