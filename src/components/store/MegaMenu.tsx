"use client";

import { useStore } from "@/lib/store";
import { BRANDS } from "@/lib/data";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface SubLink {
  label: string;
  slug: string;
}
interface NavLink {
  label: string;
  slug: string;
  highlight?: boolean;
  children?: SubLink[];
}

const NAV: NavLink[] = [
  {
    label: "زنانه",
    slug: "women",
    children: [
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
    children: [
      { label: "لباس", slug: "men-cloth" },
      { label: "کفش", slug: "men-shoes" },
      { label: "کیف", slug: "men-bag" },
      { label: "اکسسوری", slug: "men-accessory" },
    ],
  },
  {
    label: "بچه‌گانه",
    slug: "kids",
    children: [
      { label: "دخترانه", slug: "kids-girl" },
      { label: "پسرانه", slug: "kids" },
      { label: "نوزاد", slug: "kids" },
    ],
  },
  {
    label: "برندها",
    slug: "brands",
  },
  {
    label: "فروش ویژه",
    slug: "sale",
    highlight: true,
  },
];

export function MegaMenu() {
  const openListing = useStore((s) => s.openListing);
  const [active, setActive] = useState<string | null>(null);

  return (
    <nav
      dir="rtl"
      className="mx-auto max-w-[1400px] px-4"
      onMouseLeave={() => setActive(null)}
    >
      <ul className="flex items-center gap-1">
        {NAV.map((item) => (
          <li
            key={item.slug}
            className="relative"
            onMouseEnter={() => setActive(item.slug)}
          >
            <button
              onClick={() => openListing(item.slug, item.label)}
              className={`flex items-center gap-1 px-3 py-3 text-sm font-medium transition ${
                item.highlight
                  ? "text-sale font-bold"
                  : "text-ink hover:text-ink/70"
              }`}
            >
              {item.label}
              {item.children && (
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              )}
            </button>

            {/* Dropdown */}
            {active === item.slug && item.children && (
              <div className="absolute right-0 top-full z-50 min-w-[180px] rounded-lg border border-border bg-white py-2 shadow-lg">
                {item.children.map((c) => (
                  <button
                    key={c.slug + c.label}
                    onClick={() => openListing(c.slug, c.label)}
                    className="block w-full px-4 py-2 text-right text-sm text-ink-soft hover:bg-surface-alt hover:text-ink"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {active === item.slug && item.slug === "brands" && (
              <div className="absolute right-0 top-full z-50 min-w-[520px] rounded-lg border border-border bg-white p-4 shadow-lg">
                <div className="mb-2 text-xs font-bold text-ink-soft">برترین برندها</div>
                <div className="grid grid-cols-2 gap-2">
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => openListing("brands", b.name)}
                      className="flex items-center gap-3 rounded-md p-2 text-right hover:bg-surface-alt"
                    >
                      <span className="grid h-9 w-16 place-items-center rounded border border-border bg-surface-alt text-xs font-bold text-ink">
                        {b.logoText}
                      </span>
                      <span className="text-sm text-ink">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
