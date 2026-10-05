// Thin re-export module so API route files stay tidy.
import { getTicket, ticketQrPayload } from "@/lib/events-service";
import { verifyTicketToken } from "@/lib/qr";

export { getTicket, ticketQrPayload };
export const verifyTokenPayload = verifyTicketToken;
