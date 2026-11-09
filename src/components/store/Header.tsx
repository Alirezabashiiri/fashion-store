"use client";

import { Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { PRODUCTS, toFaDigits } from "@/lib/data";
import { MegaMenu } from "./MegaMenu";
import { useState, useMemo } from "react";

export function Header() {
  const setView = useStore((s) => s.setView);
  const openProduct = useStore((s) => s.openProduct);
  const openListing = useStore((s) => s.openListing);
  const cartCount = useStore((s) => s.cartCount());
  const wishlistCount = useStore((s) => s.wishlist.length);
  const isAuthed = useStore((s) => s.isAuthed);
  const userName = useStore((s) => s.userName);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.includes(q) ||
        p.nameEn.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.includes(q),
    ).slice(0, 6);
  }, [query]);

  return (
    <header dir="rtl" className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      {/* main row */}
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 lg:gap-6">
        {/* mobile menu button */}
        <button
          className="lg:hidden text-ink"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="منو"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo (right side in RTL) */}
        <button
          onClick={() => setView("home")}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white font-bold text-lg">
            L
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">
            لوکسا
            <span className="mr-1 text-[10px] font-normal align-top text-ink-soft">
              LUXA
            </span>
          </span>
        </button>

        {/* Search (center) */}
        <div className="relative flex-1 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="جستجوی محصول، برند یا دسته‌بندی..."
              className="h-10 w-full rounded-lg border border-border bg-surface-alt pr-10 pl-4 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-ink focus:bg-white transition"
            />
          </div>

          {/* Autocomplete dropdown */}
          {focused && (query.trim().length > 0) && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-white shadow-lg scrollbar-thin">
              {suggestions.length > 0 ? (
                suggestions.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={() => {
                      openProduct(p.id);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-right hover:bg-surface-alt"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 rounded-md object-cover bg-surface-alt"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs text-ink-soft">{p.brand}</div>
                      <div className="truncate text-sm font-medium text-ink">{p.name}</div>
                    </div>
                    <div className="text-xs font-bold text-ink whitespace-nowrap">
                      {toFaDigits(p.price.toLocaleString("fa-IR"))} ت
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-ink-soft">
                  نتیجه‌ای یافت نشد
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions (left side in RTL) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Auth */}
          <button
            onClick={() => setView(isAuthed ? "dashboard" : "auth")}
            className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-ink hover:bg-surface-alt"
          >
            <User className="h-5 w-5" />
            <span className="hidden text-[10px] sm:block">
              {isAuthed ? userName : "ورود / ثبت‌نام"}
            </span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setView("dashboard")}
            className="relative flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-ink hover:bg-surface-alt"
          >
            <Heart className="h-5 w-5" />
            <span className="hidden text-[10px] sm:block">علاقه‌مندی</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 left-1 grid h-4 min-w-4 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                {toFaDigits(wishlistCount)}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => setView("cart")}
            className="relative flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-ink hover:bg-surface-alt"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden text-[10px] sm:block">سبد خرید</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 left-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                {toFaDigits(cartCount)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mega menu (desktop) */}
      <div className="hidden lg:block">
        <MegaMenu />
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-ink">دسته‌بندی‌ها</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <MobileNav onClose={() => setMobileMenuOpen(false)} openListing={openListing} setView={setView} />
          </div>
        </div>
      )}
    </header>
  );
}

function MobileNav({
  onClose,
  openListing,
  setView,
}: {
  onClose: () => void;
  openListing: (slug: string, title: string) => void;
  setView: (v: "home" | "plp" | "pdp" | "cart" | "checkout" | "auth" | "dashboard") => void;
}) {
  const items: { label: string; slug: string; sub?: { label: string; slug: string }[] }[] = [
    {
      label: "زنانه",
      slug: "women",
      sub: [
        { label: "لباس", slug: "women-cloth" },
        { label: "کفش", slug: "women-shoes" },
        { label: "کیف", slug: "women-bag" },
        { label: "اکسسوری", slug: "women-accessory" },
        { label: "زیورآلات", slug: "women-jewelry" },
      ],
    },
    {
      label: "مردانه",
      slug: "men",
      sub: [
        { label: "لباس", slug: "men-cloth" },
        { label: "کفش", slug: "men-shoes" },
        { label: "کیف", slug: "men-bag" },
        { label: "اکسسوری", slug: "men-accessory" },
      ],
    },
    {
      label: "بچه‌گانه",
      slug: "kids",
      sub: [{ label: "دخترانه", slug: "kids-girl" }],
    },
    { label: "برندها", slug: "brands" },
    { label: "فروش ویژه", slug: "sale" },
  ];

  return (
    <nav className="mt-3 space-y-2">
      <button
        className="block w-full rounded-md px-3 py-2 text-right text-sm font-medium text-ink hover:bg-surface-alt"
        onClick={() => {
          setView("home");
          onClose();
        }}
      >
        صفحه اصلی
      </button>
      {items.map((it) => (
        <div key={it.slug}>
          <button
            className="block w-full rounded-md px-3 py-2 text-right text-sm font-bold text-ink hover:bg-surface-alt"
            onClick={() => {
              openListing(it.slug, it.label);
              onClose();
            }}
          >
            {it.label}
          </button>
          {it.sub && (
            <div className="mr-3 mt-1 space-y-1 border-r border-border pr-3">
              {it.sub.map((s) => (
                <button
                  key={s.slug}
                  className="block w-full rounded-md px-2 py-1.5 text-right text-xs text-ink-soft hover:bg-surface-alt"
                  onClick={() => {
                    openListing(s.slug, s.label);
                    onClose();
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}