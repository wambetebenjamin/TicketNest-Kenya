import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/store";
import type { CartLine } from "@/types";

/**
 * /api/cart — manage the ticket cart in a Vercel KV session.
 * GET  ?sessionId=...  returns the stored cart lines
 * POST { sessionId, lines }  replaces the cart
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  const lines = (await kvGet<CartLine[]>(`cart:${sessionId}`)) ?? [];
  return NextResponse.json({ lines });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { sessionId?: string; lines?: CartLine[] }
    | null;
  if (!body?.sessionId || !Array.isArray(body.lines)) {
    return NextResponse.json({ error: "sessionId and lines required" }, { status: 400 });
  }
  if (body.lines.length > 20) {
    return NextResponse.json({ error: "Cart too large" }, { status: 400 });
  }
  await kvSet(`cart:${body.sessionId}`, body.lines);
  return NextResponse.json({ ok: true, count: body.lines.reduce((s, l) => s + l.quantity, 0) });
}
