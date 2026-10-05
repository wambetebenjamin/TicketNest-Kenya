import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/captcha";
import { transferTicket, getTicket } from "@/lib/events-service";
import { normalisePhone } from "@/lib/mpesa";

/**
 * POST /api/tickets/transfer — transfer a transferable ticket to another
 * phone number. reCAPTCHA v3 verified server-side before processing.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    ticketId?: string;
    toName?: string;
    toPhone?: string;
    recaptchaToken?: string | null;
  } | null;

  if (!body?.ticketId || !body.toName || !body.toPhone) {
    return NextResponse.json({ error: "ticketId, toName and toPhone are required" }, { status: 400 });
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? undefined);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge.", requireV2: captcha.requireV2 },
      { status: 400 }
    );
  }

  const msisdn = normalisePhone(body.toPhone);
  if (!msisdn) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  // Ownership check: signed-in buyer email, or ticket buyer email matches session
  const session = await getServerSession(authOptions);
  const ticket = await getTicket(body.ticketId);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  if (session?.user?.email && ticket.buyerEmail !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "You can only transfer your own tickets" }, { status: 403 });
  }

  const updated = await transferTicket(body.ticketId, body.toName.trim(), msisdn);
  if (!updated) {
    return NextResponse.json({ error: "This ticket cannot be transferred" }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    ticket: updated,
    message: `Ticket sent to ${body.toName} on WhatsApp.`,
  });
}
