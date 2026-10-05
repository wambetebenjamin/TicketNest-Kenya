import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/events-service";

/**
 * POST /api/mpesa/callback — Daraja payment callback handler.
 * Receives STK push result callbacks (and B2C result URLs) and marks the
 * matching order paid. AccountReference carries the TicketNest order ID.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    Body?: {
      stkCallback?: {
        CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] };
        ResultCode?: number;
        ResultDesc?: string;
      };
    };
    Result?: {
      ResultParameters?: { ResultParameter?: { Key: string; Value?: string | number }[] };
      ResultCode?: number;
      ResultDesc?: string;
    };
  } | null;

  if (!body) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // STK Push callback
  const stk = body.Body?.stkCallback;
  if (stk) {
    const items = stk.CallbackMetadata?.Item ?? [];
    const orderId = String(
      items.find((i) => i.Name === "AccountReference")?.Value ?? ""
    );
    const mpesaReceipt = String(items.find((i) => i.Name === "MpesaReceiptNumber")?.Value ?? "");
    if (stk.ResultCode === 0 && orderId) {
      await markOrderPaid(orderId, "mpesa", mpesaReceipt || "MPESA-OK");
    } else if (orderId) {
      console.warn("[mpesa:callback] STK failed", { orderId, desc: stk.ResultDesc });
    }
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // B2C payout result
  const b2c = body.Result;
  if (b2c) {
    const params = b2c.ResultParameters?.ResultParameter ?? [];
    const ref = String(params.find((p) => p.Key === "TransactionReceipt")?.Value ?? "");
    console.info("[mpesa:callback] B2C result", { code: b2c.ResultCode, desc: b2c.ResultDesc, ref });
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
