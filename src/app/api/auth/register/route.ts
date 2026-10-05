import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/captcha";
import { kvGet, kvSet, kvListPush, STORE_KEYS } from "@/lib/store";
import { hashPassword } from "@/lib/auth";
import type { AppUser } from "@/types";

/**
 * POST /api/auth/register — create a buyer or organiser account.
 * reCAPTCHA v3 verified server-side before creation.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    role?: "buyer" | "organiser";
    recaptchaToken?: string | null;
  } | null;

  if (!body?.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (body.password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? undefined);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge.", requireV2: captcha.requireV2 },
      { status: 400 }
    );
  }

  const email = body.email.toLowerCase();
  const existing = await kvGet<string>(STORE_KEYS.userByEmail(email));
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user: AppUser = {
    id: `usr_${Date.now().toString(36)}`,
    name: body.name.trim(),
    email,
    passwordHash: hashPassword(body.password),
    role: body.role === "organiser" ? "organiser" : "buyer",
    createdAt: new Date().toISOString(),
    ...(body.role === "organiser"
      ? { organiserProfile: { bio: "", payoutMethod: "mpesa", payoutDetails: "" } }
      : {}),
  };

  await kvSet(STORE_KEYS.user(user.id), user);
  await kvSet(STORE_KEYS.userByEmail(email), user.id);
  await kvListPush(STORE_KEYS.userIndex(), user.id);

  return NextResponse.json({ ok: true, message: "Account created. You can sign in now." });
}
