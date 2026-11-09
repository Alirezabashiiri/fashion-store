import { db } from "@/lib/db";
import { json } from "@/lib/auth";

// GET /api/products?category=<slug>&brand=<name>&color=<name>&size=<s>&q=<text>&onlyStock=1&onlyDiscount=1&sort=<key>&page=1&pageSize=24
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const brand = url.searchParams.getAll("brand");
  const color = url.searchParams.getAll("color");
  const size = url.searchParams.getAll("size");
  const q = url.searchParams.get("q")?.trim();
  const onlyStock = url.searchParams.get("onlyStock") === "1";
  const onlyDiscount = url.searchParams.get("onlyDiscount") === "1";
  const sort = url.searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    48,
    Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "24")),
  );

  // Resolve category filter (incl. children for parent categories).
  let categoryIds: string[] | undefined;
  if (category && category !== "brands" && category !== "sale") {
    if (category === "women" || category === "men" || category === "kids") {
      const cats = await db.category.findMany({ where: { slug: category } });
      const parentIds = cats.map((c) => c.id);
      const children = await db.category.findMany({
        where: { parentId: { in: parentIds } },
      });
      categoryIds = [...parentIds, ...children.map((c) => c.id)];
    } else {
      const cat = await db.category.findUnique({ where: { slug: category } });
      categoryIds = cat ? [cat.id] : [];
    }
  }

  const where: any = { isActive: true };
  if (categoryIds) where.categoryId = { in: categoryIds };
  if (brand.length) where.brand = { is: { name: { in: brand } } };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nameEn: { contains: q } },
      { sku: { contains: q } },
      { brand: { is: { name: { contains: q } } } },
    ];
  }
  if (onlyDiscount) where.oldPrice = { not: null };
  if (color.length || size.length || onlyStock) {
    where.variants = { some: {} };
    if (color.length) where.variants.some.colorName = { in: color };
    if (size.length) where.variants.some.size = { in: size };
    if (onlyStock) where.variants.some.stock = { gt: 0 };
  }

  const orderBy: any =
    sort === "cheap"
      ? { price: "asc" }
      : sort === "expensive"
        ? { price: "desc" }
        : sort === "bestseller"
          ? { isBestseller: "desc" }
          : sort === "popular"
            ? { reviewCount: "desc" }
            : { createdAt: "desc" };

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        brand: true,
        category: true,
        variants: {
          select: {
            id: true,
            colorName: true,
            colorHex: true,
            size: true,
            stock: true,
            price: true,
          },
        },
      },
    }),
  ]);

  // Aggregate available colors for each product.
  const items = products.map((p) => {
    const colors = Array.from(
      new Map(p.variants.map((v) => [v.colorName, v])).values(),
    ).map((v) => ({ name: v.colorName, hex: v.colorHex }));
    const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
    const outOfStockSizes = Array.from(
      new Set(
        p.variants.filter((v) => v.stock === 0).map((v) => v.size),
      ),
    );
    const inStock = p.variants.some((v) => v.stock > 0);
    return {
      id: p.id,
      name: p.name,
      nameEn: p.nameEn,
      brand: p.brand?.name ?? null,
      sku: p.sku,
      category: p.category?.slug ?? null,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      hoverImage: p.hoverImage,
      rating: p.rating,
      reviewCount: p.reviewCount,
      colors,
      sizes,
      outOfStockSizes,
      inStock,
      description: p.description,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      isSpecial: p.isSpecial,
    };
  });

  return json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
