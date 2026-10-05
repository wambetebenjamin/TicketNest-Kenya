// ---------------------------------------------------------------------------
// Stripe card payments (fallback for international buyers), via the Stripe
// REST API so no SDK is bundled. STRIPE_SECRET_KEY in env only.
//
// Creates a Stripe Checkout Session for the order total (in KES — Stripe
// supports KES as a presentment currency) and returns the hosted URL.
// Demo mode returns a simulated session so the flow stays testable.
// ---------------------------------------------------------------------------

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface StripeSessionResult {
  demo: boolean;
  url?: string;
  sessionId?: string;
}

export async function createCheckoutSession(
  orderId: string,
  amountKES: number,
  eventNames: string[],
  successUrl: string,
  cancelUrl: string
): Promise<StripeSessionResult> {
  if (!stripeConfigured()) {
    return { demo: true, sessionId: `demo_cs_${orderId}` };
  }
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "kes",
    "line_items[0][price_data][unit_amount]": String(Math.round(amountKES * 100)),
    "line_items[0][price_data][product_data][name]": `TicketNest: ${eventNames.join(", ")}`.slice(0, 120),
    client_reference_id: orderId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });
  const data = (await res.json()) as { url?: string; id?: string; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return { demo: false, url: data.url, sessionId: data.id };
}
