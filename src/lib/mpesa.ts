// ---------------------------------------------------------------------------
// M-Pesa Daraja API client — STK Push (C2B ticket payments) and B2C
// (organiser payouts). Implemented against the Daraja REST API via fetch so
// no SDK is bundled. All credentials come from environment variables only.
//
// MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE,
// MPESA_PASSKEY, MPESA_ENVIRONMENT (sandbox|production),
// MPESA_CALLBACK_URL, MPESA_B2C_INITIATOR_NAME, MPESA_B2C_SECURITY_CREDENTIAL
//
// Demo mode (no keys): requests are simulated so checkout and payouts work
// end-to-end locally.
// ---------------------------------------------------------------------------

const BASE =
  process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export function mpesaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  );
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: string };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000,
  };
  return cachedToken.token;
}

export interface StkPushResult {
  demo: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
}

/** Initiate an STK push to charge a buyer via M-Pesa. */
export async function stkPush(
  phone: string,
  amountKES: number,
  accountReference: string,
  description: string
): Promise<StkPushResult> {
  if (!mpesaConfigured()) {
    return { demo: true, customerMessage: "Demo mode: STK push simulated." };
  }
  const token = await getAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");
  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amountKES),
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: description.slice(0, 60),
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    CustomerMessage?: string;
    errorMessage?: string;
  };
  if (data.errorMessage) throw new Error(data.errorMessage);
  return {
    demo: false,
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    customerMessage: data.CustomerMessage,
  };
}

export interface B2CResult {
  demo: boolean;
  conversationId?: string;
  originatorConversationId?: string;
}

/** Send an organiser payout via B2C. */
export async function b2cPayout(
  phoneOrMsisdn: string,
  amountKES: number,
  remarks: string
): Promise<B2CResult> {
  const configured = Boolean(
    process.env.MPESA_B2C_INITIATOR_NAME && process.env.MPESA_B2C_SECURITY_CREDENTIAL
  );
  if (!mpesaConfigured() || !configured) {
    return { demo: true };
  }
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/mpesa/b2c/v3/paymentrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      OriginatorConversationID: `TN-${Date.now()}`,
      InitiatorName: process.env.MPESA_B2C_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL,
      CommandID: "BusinessPayment",
      Amount: Math.round(amountKES),
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: phoneOrMsisdn,
      Remarks: remarks.slice(0, 100),
      QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL?.replace(/\/mpesa\/callback$/, "") || "https://ticketnest.co.ke"}/api/mpesa/callback`,
      ResultURL: process.env.MPESA_CALLBACK_URL,
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    ConversationID?: string;
    OriginatorConversationID?: string;
    errorMessage?: string;
  };
  if (data.errorMessage) throw new Error(data.errorMessage);
  return {
    demo: false,
    conversationId: data.ConversationID,
    originatorConversationId: data.OriginatorConversationID,
  };
}

/** Normalise a Kenyan phone number to 2547XXXXXXXX format. */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^(7|1)\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}
