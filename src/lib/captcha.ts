// ---------------------------------------------------------------------------
// Google reCAPTCHA v3 — server-side verification.
//
// RECAPTCHA_SECRET_KEY in environment variables only. When the key is absent
// (demo mode) verification passes so the platform remains fully usable, and
// the response reports demo mode. Scores below RECAPTCHA_MIN_SCORE (0.5)
// trigger a visible reCAPTCHA v2 challenge on the client.
// ---------------------------------------------------------------------------

export interface CaptchaResult {
  ok: boolean;
  demo: boolean;
  score: number | null;
  requireV2: boolean;
  errors?: string[];
}

export const RECAPTCHA_MIN_SCORE = 0.5;

export async function verifyRecaptcha(token: string | undefined | null): Promise<CaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { ok: true, demo: true, score: null, requireV2: false };
  }
  if (!token) {
    return { ok: false, demo: false, score: null, requireV2: true, errors: ["missing-input-response"] };
  }
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
      cache: "no-store",
    });
    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      "error-codes"?: string[];
    };
    if (!data.success) {
      return { ok: false, demo: false, score: data.score ?? null, requireV2: true, errors: data["error-codes"] };
    }
    const score = data.score ?? 1;
    return {
      ok: score >= RECAPTCHA_MIN_SCORE,
      demo: false,
      score,
      requireV2: score < RECAPTCHA_MIN_SCORE,
    };
  } catch {
    // Fail closed on network errors when configured, but never block demo mode.
    return { ok: false, demo: false, score: null, requireV2: true, errors: ["verification-network-error"] };
  }
}
