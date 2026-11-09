"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  getProductById,
  PRODUCTS,
  formatToman,
  toFaDigits,
  discountPercent,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "../ProductCard";
import { ProductSlider } from "../ProductSlider";
import {
  ChevronLeft,
  Home,
  Heart,
  ShoppingBag,
  Bell,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ZoomIn,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProductDetailView() {
  const id = useStore((s) => s.activeProductId);
  const product = id ? getProductById(id) : undefined;
  const addToCart = useStore((s) => s.addToCart);
  const setView = useStore((s) => s.setView);
  const openListing = useStore((s) => s.openListing);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = useStore((s) => (product ? s.isWishlisted(product.id) : false));
  const { toast } = useToast();

  const [activeImg, setActiveImg] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"specs" | "desc" | "reviews">("desc");
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const images = useMemo(
    () => (product ? [product.image, product.hoverImage, product.image] : []),
    [product],
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 text-center">
        <p className="text-ink-soft">محصول یافت نشد</p>
        <button onClick={() => setView("home")} className="mt-3 text-ink underline">
          بازگشت به خانه
        </button>
      </div>
    );
  }

  const disc = discountPercent(product);
  const outOfStock = product.outOfStockSizes ?? [];
  const isSizeOut = size ? outOfStock.includes(size) : false;
  const related = PRODUCTS.filter(
    (p) => p.subcategory === product.subcategory && p.id !== product.id,
  ).slice(0, 10);

  const handleAdd = () => {
    if (!size) {
      toast({ title: "سایز را انتخاب کنید", description: "ابتدا سایز مورد نظر را انتخاب نمایید" });
      return;
    }
    if (isSizeOut) {
      toast({ title: "این سایز ناموجود است", description: "می‌توانید «اطلاع به من» را فعال کنید" });
      return;
    }
    const c = product.colors[colorIdx];
    addToCart(
      {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image,
        price: product.price,
        colorName: c.name,
        colorHex: c.hex,
        size,
      },
      qty,
    );
    toast({ title: "به سبد خرید اضافه شد", description: `${product.name} — ${c.name} / سایز ${size}` });
  };

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-ink-soft">
        <button onClick={() => setView("home")} className="flex items-center gap-1 hover:text-ink">
          <Home className="h-3.5 w-3.5" />
          خانه
        </button>
        <ChevronLeft className="h-3.5 w-3.5" />
        <button onClick={() => openListing(product.category, product.category === "women" ? "زنانه" : product.category === "men" ? "مردانه" : "بچه‌گانه")} className="hover:text-ink">
          {product.category === "women" ? "زنانه" : product.category === "men" ? "مردانه" : "بچه‌گانه"}
        </button>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {/* Thumbnails */}
          <div className="flex gap-2 sm:flex-col">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-surface-alt ${
                  activeImg === i ? "border-ink" : "border-border"
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main image with zoom */}
          <div
            className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface-alt"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <div className="relative aspect-square">
              <Image
                src={images[activeImg]}
                alt={product.name}
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
                className="object-cover"
                style={{
                  transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center",
                  transform: zoom ? "scale(1.8)" : "scale(1)",
                  transition: "transform 0.1s",
                }}
              />
            </div>
            <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] text-ink">
              <ZoomIn className="h-3 w-3" />
              برای زوم نشانگر را روی تصویر ببرید
            </span>
            {disc && (
              <span className="absolute top-3 right-3 rounded-md bg-sale px-2.5 py-1 text-xs font-bold text-white">
                {toFaDigits(disc)}٪ تخفیف
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <button
              onClick={() => openListing("brands", product.brand)}
              className="text-sm font-bold text-ink-soft hover:text-ink"
            >
              {product.brand}
            </button>
            <h1 className="mt-1 text-xl font-bold leading-snug text-ink sm:text-2xl">
              {product.name}
            </h1>
            <p className="mt-1 text-xs text-ink-soft/70" dir="ltr">
              {product.nameEn}
            </p>
          </div>

          {/* rating + sku */}
          <div className="flex items-center gap-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-ink text-ink" />
              {toFaDigits(product.rating)}
              <span className="text-ink-soft/60">({toFaDigits(product.reviewCount)} نظر)</span>
            </span>
            <span>کد کالا: <span dir="ltr" className="font-mono">{product.sku}</span></span>
          </div>

          {/* Price */}
          <div className="rounded-lg border border-border bg-surface-alt p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-ink">
                {toFaDigits(formatToman(product.price))}
                <span className="mr-1 text-sm font-normal text-ink-soft">تومان</span>
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-ink-soft/60 line-through">
                    {toFaDigits(formatToman(product.originalPrice))}
                  </span>
                  <span className="rounded bg-sale-soft px-2 py-0.5 text-xs font-bold text-sale">
                    {toFaDigits(formatToman(product.originalPrice - product.price))} تومان سود شما
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-ink">رنگ:</span>
              <span className="text-xs text-ink-soft">{product.colors[colorIdx].name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  title={c.name}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 ${
                    colorIdx === i ? "border-ink" : "border-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {colorIdx === i && <Check className="h-4 w-4 text-white mix-blend-difference" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-ink">سایز:</span>
              <SizeGuideDialog product={product} />
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const out = outOfStock.includes(s);
                return (
                  <button
                    key={s}
                    disabled={out}
                    onClick={() => setSize(s)}
                    className={`relative min-w-12 rounded-md border px-3 py-2 text-xs font-medium transition ${
                      size === s
                        ? "border-ink bg-ink text-white"
                        : out
                          ? "border-border bg-surface-alt text-ink-soft/40 line-through cursor-not-allowed"
                          : "border-border bg-white text-ink hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {isSizeOut && (
              <p className="mt-2 text-xs text-sale">این سایز ناموجود است — می‌توانید «اطلاع به من» را بزنید</p>
            )}
          </div>

          {/* Qty + actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center text-ink hover:bg-surface-alt"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-bold text-ink">{toFaDigits(qty)}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-10 w-10 place-items-center text-ink hover:bg-surface-alt"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-bold text-white transition hover:bg-ink/90"
            >
              <ShoppingBag className="h-4 w-4" />
              افزودن به سبد خرید
            </button>
            <button
              onClick={() => {
                toggleWishlist(product.id);
                toast({ title: wishlisted ? "از علاقه‌مندی حذف شد" : "به علاقه‌مندی اضافه شد" });
              }}
              className="grid h-12 w-12 place-items-center rounded-md border border-border text-ink hover:bg-surface-alt"
              aria-label="افزودن به علاقه‌مندی"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-sale text-sale" : ""}`} />
            </button>
          </div>

          {isSizeOut && (
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-ink bg-white py-3 text-sm font-medium text-ink hover:bg-surface-alt">
              <Bell className="h-4 w-4" />
              اطلاع به من هنگام موجود شدن
            </button>
          )}

          {/* Quick guarantees */}
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-white p-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5 text-ink" />
              <span className="text-[10px] text-ink-soft">ارسال سریع</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="h-5 w-5 text-ink" />
              <span className="text-[10px] text-ink-soft">۷ روز بازگشت</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-ink" />
              <span className="text-[10px] text-ink-soft">اصالت کالا</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 rounded-lg border border-border bg-white">
        <div className="flex border-b border-border">
          {[
            { k: "desc", label: "توضیحات معرفی" },
            { k: "specs", label: "مشخصات فنی" },
            { k: "reviews", label: "نظرات خریداران" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              className={`relative px-5 py-3 text-sm font-medium transition ${
                tab === t.k ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
              {tab === t.k && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "desc" && (
            <p className="max-w-3xl text-sm leading-7 text-ink-soft">{product.description}</p>
          )}

          {tab === "specs" && (
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-surface-alt" : ""}>
                    <td className="w-1/3 px-4 py-2.5 font-medium text-ink">{row.label}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "reviews" && <Reviews product={product} />}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-8">
          <ProductSlider title="محصولات مشابه" products={related} />
        </div>
      )}

      {/* Mini suggested set */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRODUCTS.filter((p) => p.isBestseller && p.id !== product.id).slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function SizeGuideDialog({ product }: { product: { category: string } }) {
  const rows = [
    { size: "S", chest: "۹۰", waist: "۷۰", length: "۶۰" },
    { size: "M", chest: "۹۶", waist: "۷۶", length: "۶۲" },
    { size: "L", chest: "۱۰۲", waist: "۸۲", length: "۶۴" },
    { size: "XL", chest: "۱۰۸", waist: "۸۸", length: "۶۶" },
    { size: "XXL", chest: "۱۱۴", waist: "۹۴", length: "۶۸" },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-ink-soft underline hover:text-ink">
          راهنمای سایز
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>راهنمای انتخاب سایز</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-ink-soft">ابعاد بر حسب سانتی‌متر:</p>
        <table className="mt-2 w-full text-center text-xs">
          <thead>
            <tr className="border-b border-border text-ink">
              <th className="py-2">سایز</th>
              <th className="py-2">دور سینه</th>
              <th className="py-2">دور کمر</th>
              <th className="py-2">قد</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-b border-border/60">
                <td className="py-2 font-bold text-ink">{r.size}</td>
                <td className="py-2 text-ink-soft">{r.chest}</td>
                <td className="py-2 text-ink-soft">{r.waist}</td>
                <td className="py-2 text-ink-soft">{r.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[11px] leading-5 text-ink-soft">
          اندازه‌گیری باید در حالت ایستادن و با لباس نازک انجام شود. در صورت
          بودن بین دو سایز، سایز بزرگ‌تر را انتخاب کنید.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Reviews({ product }: { product: { rating: number; reviewCount: number } }) {
  const demo = [
    { name: "نگار م.", rating: 5, date: "۱۴۰۳/۰۸/۲۲", size: "M", fit: "سایز استاندارد است", text: "کیفیت دوخت عالی و پارچه بسیار خوش‌دست. دقیقا مطابق عکس ارسال شد." },
    { name: "سینا ر.", rating: 4, date: "۱۴۰۳/۰۸/۱۸", size: "L", fit: "کمی بزرگ‌تر است", text: "رنگش زیباتر از عکسه ولی سایز یکم بزرگ بود. در کل راضی‌ام." },
    { name: "مریم ک.", rating: 5, date: "۱۴۰۳/۰۸/۱۰", size: "S", fit: "سایز استاندارد است", text: "ارسال سریع و بسته‌بندی شیک. حتما دوباره خرید می‌کنم." },
  ];

  return (
    <div className="space-y-6">
      {/* summary */}
      <div className="flex flex-wrap items-center gap-6 rounded-lg bg-surface-alt p-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-ink">{toFaDigits(product.rating)}</div>
          <div className="mt-1 flex justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(product.rating) ? "fill-ink text-ink" : "text-border"}`} />
            ))}
          </div>
          <div className="mt-1 text-xs text-ink-soft">از {toFaDigits(product.reviewCount)} نظر</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-xs text-ink-soft">
              <span className="w-3">{toFaDigits(star)}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${star === 5 ? 68 : star === 4 ? 20 : star === 3 ? 8 : star === 2 ? 3 : 1}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button className="rounded-md border border-ink bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-surface-alt">
          ثبت نظر جدید
        </button>
      </div>

      {/* list */}
      <div className="space-y-4">
        {demo.map((r, i) => (
          <div key={i} className="border-b border-border pb-4 last:border-0">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-xs font-bold text-ink">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-medium text-ink">{r.name}</div>
                  <div className="text-[10px] text-ink-soft">{r.date} — سایز: {r.size}</div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-ink text-ink" : "text-border"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm leading-6 text-ink-soft">{r.text}</p>
            <span className="mt-2 inline-block rounded-full bg-surface-alt px-2 py-0.5 text-[10px] text-ink-soft">
              {r.fit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
