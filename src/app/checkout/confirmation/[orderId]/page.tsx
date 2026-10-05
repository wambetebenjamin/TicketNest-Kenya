import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { CheckCircle, Mail, MessageCircle, Calendar, MapPin, Ticket } from "lucide-react";
import TicketQR from "@/components/tickets/TicketQR";
import { getOrder, ticketQrPayload } from "@/lib/events-service";
import { SITE, formatEventDate, formatKES } from "@/lib/site";

// Three.js confetti only on this page, client-side, no SSR
const Confetti = dynamicImport(() => import("@/components/effects/Confetti"), { ssr: false });

export const metadata: Metadata = { title: "Order Confirmed" };
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrder(params.orderId);
  if (!order) notFound();

  const paid = order.payment.status === "paid";
  const first = order.tickets[0];

  return (
    <>
      <Confetti />
      <section className="tn-section bg-light">
        <div className="tn-container max-w-3xl">
          {/* Success header */}
          <div className="text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
              <CheckCircle className="h-10 w-10 text-success" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold text-heading sm:text-4xl">
              {paid ? "You're Going!" : "Payment Received"}
            </h1>
            <p className="mt-2 text-[15px] text-ink/70">
              Order <strong className="text-heading">{order.id}</strong> &middot;{" "}
              {order.tickets.length} ticket{order.tickets.length === 1 ? "" : "s"} &middot;{" "}
              {formatKES(order.amounts.total)} paid via{" "}
              {order.payment.method === "mpesa" ? "M-Pesa" : "card"}.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[13px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-ink/75 shadow-sm">
                <Mail className="h-4 w-4 text-accent" /> Sent to {order.attendee.email}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-ink/75 shadow-sm">
                <MessageCircle className="h-4 w-4 text-[#25D366]" /> Sent to WhatsApp {order.attendee.phone}
              </span>
            </div>
          </div>

          {/* Ticket visuals */}
          <div className="mt-10 space-y-6">
            {order.tickets.map((t) => (
              <div key={t.id} className="tn-ticket-visual">
                <div className="tn-card overflow-hidden">
                  <div className="flex items-center justify-between bg-dark px-6 py-4">
                    <p className="font-display text-[15px] font-bold text-white">{t.eventName}</p>
                    <p className="font-display text-[12px] font-bold uppercase tracking-widest text-accent">
                      {t.tierName}
                    </p>
                  </div>
                  <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-display text-xl font-bold text-heading">{t.holderName}</p>
                      <div className="mt-3 space-y-1.5 text-[13.5px] text-ink/75">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-accent" /> {formatEventDate(t.eventDate)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" /> {t.venue}, {t.city}
                        </p>
                        <p className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-accent" /> Ticket ID {t.id}
                          {first && t.tierName !== first.tierName ? ` (${t.tierName})` : ""}
                        </p>
                      </div>
                    </div>
                    <TicketQR
                      payload={ticketQrPayload(t.id)}
                      caption="Scan at the gate"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next steps */}
          <div className="mt-10 rounded-2xl bg-dark p-8 text-center">
            <h2 className="font-display text-xl font-bold text-white">What happens next</h2>
            <div className="mt-5 grid gap-5 text-left sm:grid-cols-3">
              {[
                { title: "Email and WhatsApp", text: "Your QR tickets have been delivered to your inbox and WhatsApp." },
                { title: "24-hour reminder", text: "We will send you a reminder 24 hours before the event starts." },
                { title: "At the gate", text: "Show your QR code for instant scanning. Bring ID for 18+ events." },
              ].map((s) => (
                <div key={s.title} className="rounded-xl bg-dark-surface p-4">
                  <p className="font-display text-[14px] font-bold text-white">{s.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/my-tickets" className="tn-btn tn-btn-primary">
                View My Tickets
              </Link>
              <Link href="/events" className="tn-btn tn-btn-ghost-light">
                Browse More Events
              </Link>
            </div>
          </div>

          <p className="tn-meta mt-6 text-center">
            Questions about this order? WhatsApp us on {SITE.phone} quoting order {order.id}.
          </p>
        </div>
      </section>
    </>
  );
}
