import { db } from "@/lib/db";
import { requireAdmin, json, errorJson } from "@/lib/auth";

// GET /api/admin/products/[id] — product with full variant list for inline editing.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const p = await db.product.findUnique({
      where: { id },
      include: { brand: true, category: true, variants: { orderBy: [{ colorName: "asc" }, { size: "asc" }] } },
    });
    if (!p) return errorJson("یافت نشد", 404);
    return json({ product: p });
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

// PUT /api/admin/products/[id] — update product + replace all variants (inline save).
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { name, nameEn, sku, brandId, categoryId, description, price, oldPrice, image, hoverImage, isNew, isBestseller, isSpecial, isActive, variants } = body;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return errorJson("یافت نشد", 404);
    if (sku && sku !== existing.sku) {
      const dupe = await db.product.findUnique({ where: { sku } });
      if (dupe) return errorJson("کد کالا تکراری است", 400);
    }

    // Replace variants atomically.
    await db.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.product.update({
        where: { id },
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
      });
    });

    const updated = await db.product.findUnique({
      where: { id },
      include: { variants: true, brand: true, category: true },
    });
    return json({ product: updated });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    console.error(e);
    return errorJson("خطا در بروزرسانی", 500);
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return json({ ok: true });
  } catch (e: any) {
    if (e?.status) return errorJson(e.message, e.status);
    return errorJson("خطا در حذف", 500);
  }
}
