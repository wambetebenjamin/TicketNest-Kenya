import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/captcha";
import {
  createOrder,
  getOrder,
  markOrderPaid,
} from "@/lib/events-service";
import { stkPush, mpesaConfigured, normalisePhone } from "@/lib/mpesa";
import { createCheckoutSession, stripeConfigured } from "@/lib/payments";
import type { CartLine } from "@/types";

/**
 * POST /api/checkout — payment initiation. Verifies reCAPTCHA v3 server-side
 * BEFORE processing. Initiates M-Pesa STK push (Daraja) or Stripe card
 * payment. Demo mode (no keys) settles instantly via the same confirmation
 * path used by the real Daraja callback.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    cart?: CartLine[];
    attendee?: { name: string; email: string; phone: string; idNumber: string };
    perTicketAttendees?: { ticketKey: string; name: string }[];
    payment?: { method: "mpesa" | "card"; phone?: string };
    recaptchaToken?: string | null;
  } | null;

  if (!body?.cart?.length || !body.attendee) {
    return NextResponse.json({ error: "Cart and attendee details are required" }, { status: 400 });
  }
  const { name, email, phone, idNumber } = body.attendee;
  if (!name || !email || !phone || !idNumber) {
    return NextResponse.json({ error: "All attendee fields are required" }, { status: 400 });
  }

  // Server-side CAPTCHA verification before processing
  const captcha = await verifyRecaptcha(body.recaptchaToken ?? undefined);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge and try again.", requireV2: captcha.requireV2 },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const order = await createOrder({
    cart: body.cart,
    attendee: { name, email, phone, idNumber },
    perTicketAttendees: body.perTicketAttendees ?? [],
    userId: (session?.user as { id?: string })?.id ?? null,
  });
  if ("error" in order) {
    return NextResponse.json({ error: order.error }, { status: 400 });
  }

  const method = body.payment?.method ?? "mpesa";

  if (method === "mpesa") {
    const msisdn = normalisePhone(body.payment?.phone ?? phone);
    if (!msisdn) {
      return NextResponse.json({ error: "Enter a valid Safaricom M-Pesa number" }, { status: 400 });
    }
    if (!mpesaConfigured()) {
      // Demo mode: settle instantly through the same path as the callback
      const paid = await markOrderPaid(order.id, "mpesa", `DEMO-${Date.now()}`);
      return NextResponse.json({
        orderId: order.id,
        status: paid?.payment.status ?? "paid",
        demo: true,
        message: "Demo mode: M-Pesa STK push simulated and payment settled.",
      });
    }
    try {
      const push = await stkPush(
        msisdn,
        order.amounts.total,
        order.id,
        order.tickets[0]?.eventName ?? "TicketNest tickets"
      );
      return NextResponse.json({
        orderId: order.id,
        status: "pending",
        demo: false,
        checkoutRequestId: push.checkoutRequestId,
        message: push.customerMessage ?? "STK push sent. Enter your M-Pesa PIN.",
      });
    } catch (err) {
      return NextResponse.json(
        { error: `M-Pesa initiation failed: ${(err as Error).message}`, orderId: order.id },
        { status: 502 }
      );
    }
  }

  // Card via Stripe
  if (!stripeConfigured()) {
    const paid = await markOrderPaid(order.id, "card", `DEMO-CARD-${Date.now()}`);
    return NextResponse.json({
      orderId: order.id,
      status: paid?.payment.status ?? "paid",
      demo: true,
      message: "Demo mode: Stripe card payment simulated and settled.",
    });
  }
  const origin = req.nextUrl.origin;
  const stripeSession = await createCheckoutSession(
    order.id,
    order.amounts.total,
    [order.tickets[0]?.eventName ?? "TicketNest"],
    `${origin}/checkout/confirmation/${order.id}`,
    `${origin}/checkout`
  );
  if (stripeSession.demo || !stripeSession.url) {
    const paid = await markOrderPaid(order.id, "card", stripeSession.sessionId ?? `CS-${Date.now()}`);
    return NextResponse.json({
      orderId: order.id,
      status: paid?.payment.status ?? "paid",
      demo: true,
      message: "Stripe test mode: payment settled.",
    });
  }
  return NextResponse.json({
    orderId: order.id,
    status: "redirect",
    url: stripeSession.url,
  });
}

/** GET /api/checkout?orderId=... — payment status polling (STK push flow). */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
  const order = await getOrder(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ status: order.payment.status, orderId: order.id });
}
