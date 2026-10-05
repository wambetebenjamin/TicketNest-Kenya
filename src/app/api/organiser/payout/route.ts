import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  kvSet,
  kvListPush,
  kvListAll,
  STORE_KEYS,
} from "@/lib/store";
import { eventSales, organiserEvents, organiserPayouts, pendingPayoutBalance } from "@/lib/events-service";
import { b2cPayout } from "@/lib/mpesa";
import type { PayoutRecord } from "@/types";

/**
 * /api/organiser/payout — payout request, triggers M-Pesa B2C via Daraja.
 * GET  -> payout history + pending balance
 * POST -> request payout (amount, destination)
 */
async function organiserContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  if ((session.user as { role?: string }).role !== "organiser") {
    return { error: NextResponse.json({ error: "Organiser account required" }, { status: 403 }) };
  }
  return { userId: (session.user as { id?: string }).id ?? "usr_org_demo" };
}

async function grossRevenue(): Promise<number> {
  const events = await organiserEvents(null);
  let total = 0;
  for (const e of events) {
    total += (await eventSales(e.slug))?.revenue ?? 0;
  }
  return total;
}

export async function GET() {
  const ctx = await organiserContext();
  if (ctx.error) return ctx.error;
  const gross = await grossRevenue();
  const pending = await pendingPayoutBalance(ctx.userId!, gross);
  const payouts = await organiserPayouts(ctx.userId!);
  return NextResponse.json({ pendingBalance: pending, grossRevenue: gross, payouts });
}

export async function POST(req: NextRequest) {
  const ctx = await organiserContext();
  if (ctx.error) return ctx.error;

  const body = (await req.json().catch(() => null)) as {
    amountKES?: number;
    method?: "mpesa" | "bank";
    destination?: string;
  } | null;

  if (!body?.amountKES || body.amountKES < 500 || !body.destination) {
    return NextResponse.json(
      { error: "Payout amount (minimum KES 500) and destination are required" },
      { status: 400 }
    );
  }

  const gross = await grossRevenue();
  const pending = await pendingPayoutBalance(ctx.userId!, gross);
  if (body.amountKES > pending) {
    return NextResponse.json(
      { error: `Payout exceeds your pending balance of KES ${pending.toLocaleString()}` },
      { status: 400 }
    );
  }

  const payout: PayoutRecord = {
    id: `PO-${Date.now().toString(36).toUpperCase()}`,
    organiserId: ctx.userId!,
    amountKES: Math.round(body.amountKES),
    method: body.method ?? "mpesa",
    destination: body.destination,
    status: "processing",
    reference: "",
    requestedAt: new Date().toISOString(),
  };

  // Trigger M-Pesa B2C via Daraja (demo settles as processing -> paid)
  try {
    const result = await b2cPayout(body.destination, payout.amountKES, `TicketNest payout ${payout.id}`);
    if (result.demo) {
      payout.status = "paid";
      payout.reference = `DEMO-B2C-${Date.now()}`;
    } else {
      payout.reference = result.conversationId ?? payout.id;
    }
  } catch (err) {
    payout.status = "pending";
    console.error("[payout] B2C failed", (err as Error).message);
  }

  await kvSet(STORE_KEYS.payout(payout.id), payout);
  await kvListPush(STORE_KEYS.payoutIndex(ctx.userId!), payout.id);

  const payouts = await kvListAll<PayoutRecord>(STORE_KEYS.payoutIndex(ctx.userId!), STORE_KEYS.payout(""));
  return NextResponse.json({
    ok: true,
    payout,
    payouts: payouts.sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)),
    pendingBalance: await pendingPayoutBalance(ctx.userId!, gross),
  });
}
