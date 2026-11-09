"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import {
  type Product,
  discountPercent,
  formatToman,
  toFaDigits,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const openProduct = useStore((s) => s.openProduct);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = useStore((s) => s.isWishlisted(product.id));
  const addToCart = useStore((s) => s.addToCart);
  const { toast } = useToast();
  const [hover, setHover] = useState(false);

  const disc = discountPercent(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const firstColor = product.colors[0];
    const inStockSize =
      product.sizes.find(
        (sz) => !product.outOfStockSizes?.includes(sz),
      ) ?? product.sizes[0];
    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      colorName: firstColor.name,
      colorHex: firstColor.hex,
      size: inStockSize,
    });
    toast({
      title: "به سبد خرید اضافه شد",
      description: `${product.name} — ${firstColor.name} / ${inStockSize}`,
    });
  };

  return (
    <div
      dir="rtl"
      className="card-hover group relative cursor-pointer rounded-lg border border-border bg-card overflow-hidden"
      onClick={() => openProduct(product.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-alt">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
          className={cn(
            "object-cover transition-opacity duration-300",
            hover ? "opacity-0" : "opacity-100",
          )}
        />
        <Image
          src={product.hoverImage}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
          className={cn(
            "object-cover transition-opacity duration-300",
            hover ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Discount badge */}
        {disc && (
          <span className="absolute top-2 right-2 rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-white">
            {toFaDigits(disc)}٪ تخفیف
          </span>
        )}

        {/* New badge */}
        {product.isNew && (
          <span className="absolute top-2 left-2 rounded-md bg-ink px-2 py-0.5 text-[10px] font-medium text-white">
            جدید
          </span>
        )}

        {/* Wishlist */}
        <button
          aria-label="افزودن به علاقه‌مندی"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white"
        >
          <Heart
            className={cn("h-4 w-4", wishlisted && "fill-sale text-sale")}
          />
        </button>

        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-ink/90"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          افزودن سریع
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1.5 p-3">
        <div className="text-[11px] font-bold text-ink-soft">
          {product.brand}
        </div>
        <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-medium text-ink leading-snug">
          {product.name}
        </h3>

        {/* colors */}
        <div className="flex items-center gap-1 pt-0.5">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm font-bold text-ink">
            {toFaDigits(formatToman(product.price))}
            <span className="mr-1 text-[10px] font-normal text-ink-soft">
              تومان
            </span>
          </span>
          {product.originalPrice && (
            <span className="text-xs text-ink-soft/60 line-through">
              {toFaDigits(formatToman(product.originalPrice))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
