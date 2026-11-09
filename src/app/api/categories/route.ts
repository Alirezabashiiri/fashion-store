import { db } from "@/lib/db";
import { json } from "@/lib/auth";

// GET /api/categories — tree of categories.
export async function GET() {
  const roots = await db.category.findMany({
    where: { parentId: null },
    orderBy: { title: "asc" },
    include: { children: { orderBy: { title: "asc" } } },
  });
  return json({ categories: roots });
}
