import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/captcha";
import { kvGet, kvSet } from "@/lib/store";
import type { NewsletterSubscriber } from "@/types";

/**
 * POST /api/newsletter — Vercel KV subscriber list. reCAPTCHA v3 verified.
 * Body: { email, city, categories[], recaptchaToken }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    city?: string;
    categories?: string[];
    recaptchaToken?: string | null;
  } | null;

  if (!body?.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? undefined);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge.", requireV2: captcha.requireV2 },
      { status: 400 }
    );
  }

  const subscribers = (await kvGet<NewsletterSubscriber[]>("newsletter")) ?? [];
  const email = body.email.toLowerCase();
  const existing = subscribers.find((s) => s.email === email);
  if (existing) {
    existing.city = body.city ?? existing.city;
    existing.categories = body.categories ?? existing.categories;
    await kvSet("newsletter", subscribers);
    return NextResponse.json({ ok: true, message: "Preferences updated." });
  }

  subscribers.push({
    email,
    city: body.city ?? "Nairobi",
    categories: body.categories ?? [],
    createdAt: new Date().toISOString(),
  });
  await kvSet("newsletter", subscribers);
  return NextResponse.json({ ok: true, message: "Subscribed." });
}
