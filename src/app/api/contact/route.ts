import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/captcha";
import { sendEnquiryEmail } from "@/lib/email";
import { kvSet, kvListPush } from "@/lib/store";

/**
 * POST /api/contact — general enquiry via Nodemailer. reCAPTCHA v3 verified.
 * Body: { name, email, audience ('buyer'|'organiser'), subject, message, recaptchaToken }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    audience?: string;
    subject?: string;
    message?: string;
    recaptchaToken?: string | null;
  } | null;

  if (!body?.name || !body.email || !body.subject || !body.message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
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

  const id = `ENQ-${Date.now().toString(36).toUpperCase()}`;
  await kvSet(`enquiry:${id}`, { ...body, id, createdAt: new Date().toISOString() });
  await kvListPush("index:enquiries", id);

  await sendEnquiryEmail({
    name: body.name,
    email: body.email,
    subject: body.subject,
    message: body.message,
    audience: body.audience === "organiser" ? "Organiser" : "Buyer Support",
  }).catch((err) => console.error("[contact] email failed", err));

  return NextResponse.json({ ok: true, message: "Message received. We reply within one business day." });
}
