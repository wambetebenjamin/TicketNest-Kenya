import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setCheckedIn, getTicket } from "@/lib/events-service";
import { verifyTicketToken } from "@/lib/qr";

/**
 * /api/checkin — QR scan door check-in endpoint.
 * POST { token | ticketId, checkedIn } — organiser protected toggle
 * POST { token, scan: true } — door scanner verify + check in
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    token?: string;
    ticketId?: string;
    checkedIn?: boolean;
    scan?: boolean;
  } | null;

  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Door scanner mode: verify signed QR payload and check the ticket in
  if (body.scan) {
    if (!body.token) return NextResponse.json({ error: "QR token required" }, { status: 400 });
    const ticketId = verifyTicketToken(body.token);
    if (!ticketId) return NextResponse.json({ valid: false, reason: "invalid-signature" }, { status: 200 });
    const ticket = await getTicket(ticketId);
    if (!ticket) return NextResponse.json({ valid: false, reason: "unknown-ticket" }, { status: 200 });
    if (ticket.checkedIn) {
      return NextResponse.json({ valid: true, alreadyCheckedIn: true, ticket }, { status: 200 });
    }
    const updated = await setCheckedIn(ticketId, true);
    return NextResponse.json({ valid: true, checkedIn: true, ticket: updated });
  }

  // Dashboard toggle mode — organiser protected
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "organiser") {
    return NextResponse.json({ error: "Organiser sign in required" }, { status: 401 });
  }

  const ticketId = body.token ? verifyTicketToken(body.token) : body.ticketId;
  if (!ticketId) return NextResponse.json({ error: "Valid ticketId or token required" }, { status: 400 });

  const updated = await setCheckedIn(ticketId, body.checkedIn ?? true);
  if (!updated) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  return NextResponse.json({ ok: true, ticket: updated });
}
