import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/captcha";
import { kvSet, kvListPush } from "@/lib/store";
import { sendEnquiryEmail } from "@/lib/email";

/**
 * POST /api/refunds — refund request form. reCAPTCHA v3 verified server-side
 * before processing. Refund conditions are set out in /legal/terms.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    orderRef?: string;
    ticketId?: string;
    name?: string;
    email?: string;
    reason?: "cancelled" | "postponed" | "material-change" | "duplicate-charge" | "other";
    details?: string;
    recaptchaToken?: string | null;
  } | null;

  if (!body?.orderRef || !body.name || !body.email || !body.reason || !body.details) {
    return NextResponse.json(
      { error: "Order reference, name, email, reason and details are required" },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? undefined);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge.", requireV2: captcha.requireV2 },
      { status: 400 }
    );
  }

  const id = `REF-${Date.now().toString(36).toUpperCase()}`;
  await kvSet(`refund:${id}`, { ...body, id, status: "received", createdAt: new Date().toISOString() });
  await kvListPush("index:refunds", id);

  await sendEnquiryEmail({
    name: body.name,
    email: body.email,
    subject: `Refund request ${id} (order ${body.orderRef})`,
    message: `Reason: ${body.reason}\nTicket: ${body.ticketId ?? "n/a"}\n\n${body.details}`,
    audience: "Refunds",
  }).catch((err) => console.error("[refunds] email failed", err));

  return NextResponse.json({
    ok: true,
    reference: id,
    message: "Refund request received. We assess requests within 3 business days.",
  });
}
