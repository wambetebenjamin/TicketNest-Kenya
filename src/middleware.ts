import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ---------------------------------------------------------------------------
// Edge middleware:
// 1. Protects /my-tickets (any signed-in user) and /organiser/* (organiser).
// 2. Rate limits the checkout and organiser apply endpoints (sliding window,
//    in-memory per edge instance; backed by Vercel KV on the platform).
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

const RATE_LIMITED_PATHS = [
  "/api/checkout",
  "/api/organiser/events",
  "/api/organiser/payout",
  "/api/newsletter",
  "/api/contact",
];

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count++;
  if (bucket.count > MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Rate limiting ---
  if (RATE_LIMITED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const { ok, retryAfter } = rateLimit(`${ip}:${pathname}`);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  }

  // --- Route protection ---
  const isMyTickets = pathname.startsWith("/my-tickets");
  const isOrganiserArea = pathname.startsWith("/organiser");

  if (isMyTickets || isOrganiserArea) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "ticketnest-demo-secret-change-me" });
    if (!token) {
      const signIn = new URL("/auth/signin", req.url);
      signIn.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signIn);
    }
    if (isOrganiserArea && token.role !== "organiser") {
      const register = new URL("/auth/register", req.url);
      register.searchParams.set("role", "organiser");
      return NextResponse.redirect(register);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my-tickets/:path*", "/organiser/:path*", "/api/checkout", "/api/organiser/:path*", "/api/newsletter", "/api/contact"],
};
