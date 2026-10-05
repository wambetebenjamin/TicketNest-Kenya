import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getTicket, ticketQrPayload, verifyTokenPayload } from "@/lib/ticket-helpers";
import { verifyTicketToken } from "@/lib/qr";

/**
 * GET /api/tickets/[id] — ticket QR generation and verification.
 *   ?format=png  -> 200x200+ PNG QR code (download / WhatsApp delivery)
 *   ?token=...   -> verification result for door scanning
 *   default      -> ticket JSON
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticket = await getTicket(params.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get("format");
  const token = req.nextUrl.searchParams.get("token");

  if (format === "png") {
    const payload = ticketQrPayload(ticket.id);
    const png = await QRCode.toBuffer(payload, {
      width: 480, // crisp at 200x200 display, prints well
      margin: 2,
      color: { dark: "#0e1b4dff", light: "#ffffffff" },
    });
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="ticketnest-${ticket.id}.png"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (token) {
    const verifiedId = verifyTicketToken(token);
    const valid = verifiedId === ticket.id;
    return NextResponse.json({
      valid,
      checkedIn: ticket.checkedIn,
      ticket: valid
        ? {
            id: ticket.id,
            eventName: ticket.eventName,
            eventDate: ticket.eventDate,
            tierName: ticket.tierName,
            holderName: ticket.holderName,
            city: ticket.city,
            venue: ticket.venue,
          }
        : undefined,
    });
  }

  void verifyTokenPayload;
  return NextResponse.json({ ticket, qrPayload: ticketQrPayload(ticket.id) });
}
