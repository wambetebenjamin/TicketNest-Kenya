import { NextResponse } from "next/server";
import { withAvailability, isSoldOut } from "@/lib/events-service";

/** GET /api/events/[slug] — single event with live tier availability. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const { findEvent } = await import("@/lib/events-service");
  const event = await findEvent(params.slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const withAvail = await withAvailability(event);
  return NextResponse.json({
    event: withAvail,
    soldOut: isSoldOut(withAvail),
  });
}
