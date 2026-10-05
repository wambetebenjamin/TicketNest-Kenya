"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Download,
  Send,
  Wallet,
  QrCode,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import TicketQR from "@/components/tickets/TicketQR";
import RefundForm from "@/components/tickets/RefundForm";
import { RotateCcw } from "lucide-react";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";
import { formatEventDate } from "@/lib/site";
import type { Ticket } from "@/types";

type TicketWithQr = Ticket & { qrPayload: string };

/** List of purchased tickets grouped per event, with QR download, transfer and wallet placeholders. */
export default function MyTicketsList({ tickets }: { tickets: TicketWithQr[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, TicketWithQr[]>();
    for (const t of tickets) {
      const arr = map.get(t.eventSlug) ?? [];
      arr.push(t);
      map.set(t.eventSlug, arr);
    }
    return Array.from(map.entries());
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-card">
        <QrCode className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-4 font-display text-xl font-bold text-heading">No tickets yet</h2>
        <p className="mt-2 text-[14px] text-ink/70">
          When you buy a ticket it lands here with its QR code, ready for the gate.
        </p>
        <Link href="/events" className="tn-btn tn-btn-primary mt-6">
          Browse All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {grouped.map(([slug, eventTickets]) => (
        <EventGroup key={slug} slug={slug} eventTickets={eventTickets} />
      ))}
    </div>
  );
}

function EventGroup({ slug, eventTickets }: { slug: string; eventTickets: TicketWithQr[] }) {
  const [refundOpen, setRefundOpen] = useState(false);
  return (
        <div className="tn-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-heading">
                <Link href={`/events/${slug}`} className="hover:text-accent">
                  {eventTickets[0].eventName}
                </Link>
              </h2>
              <div className="mt-1.5 space-y-1 text-[13px] text-ink/70">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" /> {formatEventDate(eventTickets[0].eventDate)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" /> {eventTickets[0].venue}, {eventTickets[0].city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefundOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/70 hover:border-accent hover:text-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Request Refund
              </button>
              <span className="rounded-full bg-heading px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
                {eventTickets.length} ticket{eventTickets.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {refundOpen && <RefundForm orderRef={eventTickets[0].orderId} onClose={() => setRefundOpen(false)} />}

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {eventTickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketWithQr }) {
  const [transferOpen, setTransferOpen] = useState(false);
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-heading">{ticket.tierName}</p>
          <p className="tn-meta mt-0.5">Holder: {ticket.holderName}</p>
          <p className="tn-meta">Ticket ID: {ticket.id}</p>
          {ticket.checkedIn && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
              <CheckCircle className="h-3.5 w-3.5" /> Checked in
            </p>
          )}
        </div>
        <div className="scale-[0.72] origin-top-right sm:hidden">
          <TicketQR payload={ticket.qrPayload} size={140} />
        </div>
        <div className="hidden sm:block">
          <TicketQR payload={ticket.qrPayload} size={140} caption={`ID ${ticket.id}`} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`/api/tickets/${ticket.id}?format=png`}
          download
          className="tn-btn tn-btn-outline tn-btn-sm"
        >
          <Download className="h-3.5 w-3.5" /> QR Code
        </a>
        {ticket.transferable && (
          <button onClick={() => setTransferOpen((v) => !v)} className="tn-btn tn-btn-dark tn-btn-sm">
            <Send className="h-3.5 w-3.5" /> Transfer
          </button>
        )}
        <button
          disabled
          title="Coming soon"
          className="tn-btn tn-btn-outline tn-btn-sm opacity-60"
        >
          <Wallet className="h-3.5 w-3.5" /> Wallet
        </button>
      </div>

      <p className="tn-meta mt-3">
        Apple Wallet and Google Wallet passes are coming soon. Your QR works at every TicketNest gate.
      </p>

      {transferOpen && <TransferForm ticketId={ticket.id} onClose={() => setTransferOpen(false)} />}
    </div>
  );
}

function TransferForm({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { run, v2Required, setV2Token } = useRecaptchaForm();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { ok, data } = await run("ticket_transfer", (token) =>
      fetch("/api/tickets/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, toName: name, toPhone: phone, recaptchaToken: token }),
      })
    );
    if (ok) {
      setState("done");
      setMessage(((data as { message?: string })?.message) ?? "Ticket transferred.");
    } else {
      setState("error");
      setMessage(((data as { error?: string })?.error) ?? "Transfer failed.");
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl bg-light p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-[13px] font-bold text-heading">Transfer ticket</p>
        <button type="button" onClick={onClose} aria-label="Close transfer form" className="text-ink/50 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="tn-meta" htmlFor={`tf-name-${ticketId}`}>New holder name</label>
          <input
            id={`tf-name-${ticketId}`}
            className="tn-input !py-2 !text-[13px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Wanjiku"
            required
          />
        </div>
        <div>
          <label className="tn-meta" htmlFor={`tf-phone-${ticketId}`}>Their phone (WhatsApp)</label>
          <input
            id={`tf-phone-${ticketId}`}
            className="tn-input !py-2 !text-[13px]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            required
          />
        </div>
      </div>
      {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}
      {state === "done" ? (
        <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
          <CheckCircle className="h-4 w-4" /> {message}
        </p>
      ) : (
        <button type="submit" disabled={state === "sending"} className="tn-btn tn-btn-primary tn-btn-sm">
          {state === "sending" ? "Sending..." : "Send Ticket"}
        </button>
      )}
      {state === "error" && (
        <p className="flex items-center gap-2 text-[13px] font-semibold text-danger">
          <AlertCircle className="h-4 w-4" /> {message}
        </p>
      )}
      <p className="tn-meta">The new holder receives the QR ticket on WhatsApp instantly.</p>
    </form>
  );
}
