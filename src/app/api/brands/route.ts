import { db } from "@/lib/db";
import { json } from "@/lib/auth";

// GET /api/brands
export async function GET() {
  const brands = await db.brand.findMany({ orderBy: { name: "asc" } });
  return json({ brands });
}
