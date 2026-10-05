// ---------------------------------------------------------------------------
// WhatsApp integration.
//
// Delivery path A (configured): WhatsApp Cloud API with WHATSAPP_TOKEN and
// WHATSAPP_PHONE_NUMBER_ID env vars.
// Delivery path B (always available): wa.me deep links.
// ---------------------------------------------------------------------------

import { SITE } from "@/lib/site";

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsAppText(toPhone: string, body: string): Promise<boolean> {
  if (!whatsappConfigured()) {
    console.info("[whatsapp:demo] message", { to: toPhone, body: body.slice(0, 120) });
    return true;
  }
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body },
      }),
      cache: "no-store",
    }
  );
  return res.ok;
}

export function ticketDeliveryMessage(params: {
  holderName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketId: string;
  qrUrl: string;
}): string {
  return [
    `Karibu ${params.holderName}! Your TicketNest ticket is confirmed.`,
    ``,
    `${params.eventName}`,
    `${params.eventDate}`,
    `${params.venue}`,
    ``,
    `Ticket ID: ${params.ticketId}`,
    `Show this QR at the gate: ${params.qrUrl}`,
    ``,
    `Manage your ticket any time at ${SITE.url}/my-tickets`,
  ].join("\n");
}

export function shareEventUrl(eventSlug: string): string {
  return `https://wa.me/?text=${encodeURIComponent(
    `Check out this event on TicketNest Kenya: ${SITE.url}/events/${eventSlug}`
  )}`;
}
