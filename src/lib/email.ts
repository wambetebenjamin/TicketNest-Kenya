// ---------------------------------------------------------------------------
// Transactional email — ticket confirmations and 24-hour event reminders.
// Uses Nodemailer with SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER,
// SMTP_PASS, SMTP_FROM). In demo mode, emails are logged to the server
// console so the flow is observable without credentials.
// ---------------------------------------------------------------------------

import nodemailer from "nodemailer";

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export interface TicketEmailData {
  to: string;
  orderRef: string;
  eventName: string;
  eventDate: string;
  venue: string;
  tickets: { id: string; tier: string; holder: string }[];
  totalKES: number;
}

function buildTicketEmail(d: TicketEmailData): string {
  const rows = d.tickets
    .map(
      (t) =>
        `<tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-family:Roboto,Arial,sans-serif;font-size:14px;">
            <strong>${t.tier}</strong><br/>
            <span style="color:#2f3138;">Holder: ${t.holder}</span><br/>
            <span style="color:#f82249;font-weight:600;">Ticket ID: ${t.id}</span>
          </td>
        </tr>`
    )
    .join("");
  return `<div style="background:#f2f2f3;padding:32px 0;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:#000820;padding:28px 32px;">
        <span style="font-family:Raleway,Arial,sans-serif;font-weight:800;font-size:22px;color:#ffffff;">Ticket<span style="color:#f82249;">Nest</span></span>
        <p style="color:rgba(255,255,255,.75);font-family:Roboto,Arial,sans-serif;font-size:13px;margin:8px 0 0;">Every Great Experience Starts With a Ticket.</p>
      </div>
      <div style="padding:32px;">
        <h1 style="font-family:Raleway,Arial,sans-serif;color:#0e1b4d;font-size:22px;margin:0 0 6px;">Your tickets are confirmed</h1>
        <p style="font-family:Roboto,Arial,sans-serif;color:#2f3138;font-size:15px;margin:0 0 18px;">
          ${d.eventName}<br/>
          ${d.eventDate}<br/>${d.venue}
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;">${rows}</table>
        <p style="font-family:Roboto,Arial,sans-serif;color:#2f3138;font-size:15px;margin:18px 0 0;">
          Order reference: <strong>${d.orderRef}</strong><br/>
          Total paid: <strong>KES ${d.totalKES.toLocaleString("en-KE")}</strong>
        </p>
        <p style="font-family:Roboto,Arial,sans-serif;color:#2f3138;font-size:14px;margin:18px 0 0;">
          Your QR codes are attached and available any time in <a href="https://ticketnest.co.ke/my-tickets" style="color:#f82249;">My Tickets</a>.
          A reminder will land in your inbox 24 hours before the event. Karibu!
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendTicketConfirmation(d: TicketEmailData, qrZipBase64?: string): Promise<boolean> {
  if (!emailConfigured()) {
    console.info("[email:demo] ticket confirmation", { to: d.to, order: d.orderRef, tickets: d.tickets.length });
    return true;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "TicketNest Kenya <tickets@ticketnest.co.ke>",
    to: d.to,
    subject: `Your tickets for ${d.eventName}`,
    html: buildTicketEmail(d),
    ...(qrZipBase64
      ? {
          attachments: [
            {
              filename: `ticketnest-${d.orderRef}.zip`,
              content: qrZipBase64,
              encoding: "base64",
            },
          ],
        }
      : {}),
  });
  return true;
}

export async function sendEventReminder(d: TicketEmailData): Promise<boolean> {
  if (!emailConfigured()) {
    console.info("[email:demo] 24h reminder", { to: d.to, event: d.eventName });
    return true;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "TicketNest Kenya <tickets@ticketnest.co.ke>",
    to: d.to,
    subject: `Tomorrow: ${d.eventName}`,
    html: buildTicketEmail({ ...d, orderRef: `${d.orderRef} (reminder)` }),
  });
  return true;
}

export async function sendEnquiryEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  audience: string;
}): Promise<boolean> {
  if (!emailConfigured()) {
    console.info("[email:demo] contact enquiry", payload);
    return true;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "TicketNest Kenya <hello@ticketnest.co.ke>",
    to: process.env.SUPPORT_INBOX || "support@ticketnest.co.ke",
    replyTo: payload.email,
    subject: `[${payload.audience}] ${payload.subject}`,
    text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
  });
  return true;
}
