// ---------------------------------------------------------------------------
// Ticket QR payloads — HMAC-SHA256 signed tokens verified at the door.
// Payload format: `${ticketId}.${signature}`
// ---------------------------------------------------------------------------

import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.TICKET_QR_SECRET || process.env.NEXTAUTH_SECRET || "ticketnest-qr-demo-secret";

export function signTicket(ticketId: string): string {
  const sig = createHmac("sha256", SECRET).update(ticketId).digest("base64url");
  return `${ticketId}.${sig}`;
}

export function verifyTicketToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const ticketId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", SECRET).update(ticketId).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return ticketId;
}
