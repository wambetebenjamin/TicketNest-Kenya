import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eventSales, organiserEvents } from "@/lib/events-service";

/**
 * GET /api/organiser/sales?slug=... — sales analytics data (protected).
 * Without slug, returns sales for every event this organiser owns.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "organiser") {
    return NextResponse.json({ error: "Organiser account required" }, { status: 403 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const sales = await eventSales(slug);
    if (!sales) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ sales });
  }

  const events = await organiserEvents(null);
  const all = await Promise.all(
    events.map(async (e) => ({
      slug: e.slug,
      name: e.name,
      status: e.status,
      startAt: e.startAt,
      ticketsSold: (await eventSales(e.slug))?.ticketsSold ?? 0,
      revenue: (await eventSales(e.slug))?.revenue ?? 0,
    }))
  );
  return NextResponse.json({ events: all });
}
