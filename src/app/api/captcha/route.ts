import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/captcha";

/**
 * POST /api/captcha — server-side reCAPTCHA v3 verification.
 * Body: { token, action? } — returns { ok, score, demo, requireV2 }.
 * When RECAPTCHA_SECRET_KEY is absent the platform runs in demo mode and
 * verification passes.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const result = await verifyRecaptcha(body?.token ?? null);
  return NextResponse.json({
    ok: result.ok,
    score: result.score,
    demo: result.demo,
    requireV2: result.requireV2,
  });
}
