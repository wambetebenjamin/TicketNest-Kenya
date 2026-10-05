import { NextRequest, NextResponse } from "next/server";
import { queryEvents } from "@/lib/events-service";

/**
 * GET /api/events — paginated event listings with filters.
 * Query params: category, city, q, from, to, maxPrice, free, sort, page, perPage
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await queryEvents({
    category: sp.get("category") ?? undefined,
    city: sp.get("city") ?? undefined,
    search: sp.get("q") ?? undefined,
    dateFrom: sp.get("from") ?? undefined,
    dateTo: sp.get("to") ?? undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    freeOnly: sp.get("free") === "1",
    sort: (sp.get("sort") as "date" | "price-asc" | "price-desc" | "newest") ?? "date",
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    perPage: sp.get("perPage") ? Math.min(50, Number(sp.get("perPage"))) : 9,
  });
  return NextResponse.json(result);
}
