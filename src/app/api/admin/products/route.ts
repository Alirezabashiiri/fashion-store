import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

// GET /api/admin/products?q=&category=&page=&pageSize=
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const category = url.searchParams.get("category");
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20")));

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
      ];
    }
    if (category) {
      const cat = await db.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: true,
          category: true,
          variants: true,
        },
      }),
    ]);

    const items = products.map((p) => {
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name ?? null,
        category: p.category?.title ?? null,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.image,
        isActive: p.isActive,
        variantCount: p.variants.length,
        totalStock,
        lowStock: p.variants.some((v) => v.stock <= 3),
        variants: p.variants,
      };
    });

    return json({ items, total, page, pageSize });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا", 500);
  }
}

interface VariantInput {
  id?: string;
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
  price?: number | null;
  sku?: string | null;
}

// POST /api/admin/products — create product with variants (TabularInline equivalent).
export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { name, nameEn, sku, brandId, categoryId, description, price, oldPrice, image, hoverImage, isNew, isBestseller, isSpecial, isActive, variants } = body;

    if (!name || !sku || !price || !image) {
      return errorJson("نام، کد کالا، قیمت و تصویر الزامی است", 400);
    }
    const exists = await db.product.findUnique({ where: { sku } });
    if (exists) return errorJson("کد کالا تکراری است", 400);

    const product = await db.product.create({
      data: {
        name,
        nameEn: nameEn ?? null,
        slug: sku,
        sku,
        brandId: brandId || null,
        categoryId: categoryId || null,
        description: description ?? "",
        price: parseInt(price),
        oldPrice: oldPrice ? parseInt(oldPrice) : null,
        image,
        hoverImage: hoverImage ?? null,
        isNew: !!isNew,
        isBestseller: !!isBestseller,
        isSpecial: !!isSpecial,
        isActive: isActive ?? true,
        variants: {
          create: (variants ?? []).map((v: VariantInput) => ({
            colorName: v.colorName,
            colorHex: v.colorHex,
            size: v.size,
            stock: parseInt(v.stock) || 0,
            price: v.price ? parseInt(v.price) : null,
            sku: v.sku ?? null,
          })),
        },
      },
      include: { variants: true, brand: true, category: true },
    });

    return json({ product }, 201);
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    console.error(e);
    return errorJson("خطا در ایجاد محصول", 500);
  }
}
