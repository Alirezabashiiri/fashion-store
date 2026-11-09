import { db } from "@/lib/db";
import { json, errorJson } from "@/lib/auth";

// GET /api/products/[id] — full product detail incl. all variants (color/size/stock).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const p = await db.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      brand: true,
      category: { include: { parent: true } },
      variants: {
        orderBy: [{ colorName: "asc" }, { size: "asc" }],
      },
    },
  });
  if (!p) return errorJson("محصول یافت نشد", 404);

  const colors = Array.from(
    new Map(p.variants.map((v) => [v.colorName, v])).values(),
  ).map((v) => ({ name: v.colorName, hex: v.colorHex }));
  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
  const outOfStockSizes = Array.from(
    new Set(p.variants.filter((v) => v.stock === 0).map((v) => v.size)),
  );

  // Group stock by color×size for the frontend.
  const stockMatrix = p.variants.map((v) => ({
    colorName: v.colorName,
    size: v.size,
    stock: v.stock,
    price: v.price ?? p.price,
    variantId: v.id,
  }));

  const related = await db.product.findMany({
    where: {
      categoryId: p.categoryId,
      id: { not: p.id },
      isActive: true,
    },
    take: 8,
    include: { brand: true, variants: { select: { colorName: true, colorHex: true, size: true, stock: true } } },
  });

  const relatedItems = related.map((r) => ({
    id: r.id,
    name: r.name,
    brand: r.brand?.name ?? null,
    price: r.price,
    oldPrice: r.oldPrice,
    image: r.image,
    hoverImage: r.hoverImage,
    colors: Array.from(
      new Map(r.variants.map((v) => [v.colorName, v])).values(),
    ).map((v) => ({ name: v.colorName, hex: v.colorHex })),
    inStock: r.variants.some((v) => v.stock > 0),
    rating: r.rating,
    reviewCount: r.reviewCount,
  }));

  return json({
    product: {
      id: p.id,
      name: p.name,
      nameEn: p.nameEn,
      brand: p.brand?.name ?? null,
      brandId: p.brandId,
      sku: p.sku,
      category: p.category?.slug ?? null,
      categoryTitle: p.category?.title ?? null,
      parentCategory: p.category?.parent?.slug ?? null,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      hoverImage: p.hoverImage,
      rating: p.rating,
      reviewCount: p.reviewCount,
      description: p.description,
      colors,
      sizes,
      outOfStockSizes,
      stockMatrix,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      isSpecial: p.isSpecial,
    },
    related: relatedItems,
  });
}
