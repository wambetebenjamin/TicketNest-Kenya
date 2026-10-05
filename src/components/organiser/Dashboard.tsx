"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  BarChart3,
  Users,
  Wallet,
  Settings,
  PlusCircle,
  Download,
  Banknote,
  CheckCircle,
  AlertCircle,
  Pencil,
  Ban,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { formatKES, formatEventDateShort } from "@/lib/site";
import type { AttendeeRow, DailySale, PayoutRecord, TierSale } from "@/types";

export interface DashboardEvent {
  slug: string;
  name: string;
  status: "draft" | "live" | "ended";
  startAt: string;
  city: string;
  poster: string;
  tiers: TierSale[];
  daily: DailySale[];
  attendees: AttendeeRow[];
  ticketsSold: number;
  revenue: number;
}

type Tab = "events" | "sales" | "attendees" | "payouts" | "settings";

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "events", label: "My Events", icon: CalendarDays },
  { id: "sales", label: "Ticket Sales", icon: BarChart3 },
  { id: "attendees", label: "Attendees", icon: Users },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function OrganiserDashboard({
  organiserName,
  events,
  payouts,
  pendingBalance,
  grossRevenue,
}: {
  organiserName: string;
  events: DashboardEvent[];
  payouts: PayoutRecord[];
  pendingBalance: number;
  grossRevenue: number;
}) {
  const [tab, setTab] = useState<Tab>("events");
  const [selectedEvent, setSelectedEvent] = useState<string>(events[0]?.slug ?? "");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const active = events.find((e) => e.slug === selectedEvent) ?? events[0];

  // Combined daily revenue across all events (mobile: fewer data points)
  const combinedDaily = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; tickets: number }>();
    for (const ev of events) {
      for (const d of ev.daily) {
        const cur = map.get(d.date) ?? { date: d.date, revenue: 0, tickets: 0 };
        cur.revenue += d.revenue;
        cur.tickets += d.tickets;
        map.set(d.date, cur);
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [events]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const chartData = isMobile
    ? combinedDaily.filter((_, i) => i % 2 === 0) // reduce data points on mobile
    : combinedDaily;

  return (
    <section className="tn-section bg-light">
      <div className="tn-container">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-heading">Organiser Dashboard</h1>
            <p className="mt-1 text-[14px] text-ink/70">Karibu back, {organiserName}.</p>
          </div>
          <Link href="/organiser/create-event" className="tn-btn tn-btn-primary">
            <PlusCircle className="h-4 w-4" /> Create Event
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={formatKES(grossRevenue)} sub="before platform fee" />
          <StatCard label="Pending Balance" value={formatKES(pendingBalance)} sub="available to withdraw" />
          <StatCard
            label="Tickets Sold"
            value={String(events.reduce((s, e) => s + e.ticketsSold, 0))}
            sub={`across ${events.length} event${events.length === 1 ? "" : "s"}`}
          />
          <StatCard
            label="Live Events"
            value={String(events.filter((e) => e.status === "live").length)}
            sub={`${events.filter((e) => e.status === "ended").length} ended`}
          />
        </div>

        {/* Tabs — horizontal scroll on mobile */}
        <div className="tn-hscroll mt-8 mb-6">
          <div className="flex min-w-max gap-1 rounded-full bg-white p-1.5 shadow-card">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id ? "true" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 font-display text-[13px] font-semibold transition-colors ${
                  tab === id ? "bg-accent text-white" : "text-ink/70 hover:bg-light"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- My Events ---------------- */}
        {tab === "events" && (
          <div className="tn-card tn-hscroll p-2 sm:p-6">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b-2 border-heading/10 font-display text-[12px] uppercase tracking-wide text-ink/60">
                  <th className="py-3 pr-4 font-semibold">Event</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Tickets Sold</th>
                  <th className="py-3 pr-4 font-semibold">Revenue</th>
                  <th className="py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.slug} className="border-b border-black/5">
                    <td className="py-4 pr-4">
                      <Link href={`/events/${e.slug}`} className="font-display text-[14px] font-bold text-heading hover:text-accent">
                        {e.name}
                      </Link>
                      <p className="tn-meta">{formatEventDateShort(e.startAt)} &middot; {e.city}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-4 pr-4 font-display text-[14px] font-bold text-heading">
                      {e.ticketsSold.toLocaleString()}
                    </td>
                    <td className="py-4 pr-4 font-display text-[14px] font-bold text-accent">
                      {formatKES(e.revenue)}
                    </td>
                    <td className="py-4">
                      <EventActions slug={e.slug} status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Ticket Sales ---------------- */}
        {tab === "sales" && active && (
          <div className="space-y-6">
            <div className="tn-card p-5">
              <label htmlFor="sales-event" className="tn-label">Event</label>
              <select
                id="sales-event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="tn-select max-w-sm"
              >
                {events.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Revenue line chart by date — bars/lines animate from 0 on load */}
            <div className="tn-card p-5">
              <h3 className="font-display text-lg font-bold text-heading">Revenue by Date</h3>
              <p className="tn-meta mb-4">Combined daily revenue across all your events (KES)</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,27,77,0.08)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.slice(5)}
                      stroke="#2f3138"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#2f3138" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === "revenue" ? [formatKES(value), "Revenue"] : [value, "Tickets"]
                      }
                      labelStyle={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, color: "#0e1b4d" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f82249"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      isAnimationActive={!reducedMotion}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tier breakdown bar chart */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="tn-card p-5">
                <h3 className="font-display text-lg font-bold text-heading">Tier Breakdown</h3>
                <p className="tn-meta mb-4">{active.name}</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={active.tiers} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,27,77,0.08)" />
                      <XAxis dataKey="tierName" tick={{ fontSize: 11 }} stroke="#2f3138" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#2f3138" />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === "revenue" ? [formatKES(value), "Revenue"] : [value, "Tickets"]
                        }
                        labelStyle={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, color: "#0e1b4d" }}
                      />
                      <Bar dataKey="revenue" fill="#0e1b4d" radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion} animationDuration={700} />
                      <Bar dataKey="tickets" fill="#f82249" radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion} animationDuration={700} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily sales table */}
              <div className="tn-card tn-hscroll p-5">
                <h3 className="font-display text-lg font-bold text-heading">Daily Sales</h3>
                <p className="tn-meta mb-4">{active.name} &middot; last 30 days</p>
                <table className="w-full min-w-[320px] text-left">
                  <thead>
                    <tr className="border-b-2 border-heading/10 font-display text-[11px] uppercase tracking-wide text-ink/60">
                      <th className="py-2.5 pr-4 font-semibold">Date</th>
                      <th className="py-2.5 pr-4 font-semibold">Tickets</th>
                      <th className="py-2.5 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="max-h-48 overflow-y-auto">
                    {active.daily.slice(-14).reverse().map((d) => (
                      <tr key={d.date} className="border-b border-black/5">
                        <td className="py-2.5 pr-4 text-[13px]">{d.date}</td>
                        <td className="py-2.5 pr-4 text-[13px] font-semibold">{d.tickets}</td>
                        <td className="py-2.5 text-[13px]">{formatKES(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Attendees ---------------- */}
        {tab === "attendees" && (
          <div className="space-y-6">
            <div className="tn-card p-5">
              <label htmlFor="att-event" className="tn-label">Event</label>
              <select
                id="att-event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="tn-select max-w-sm"
              >
                {events.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <AttendeesPanel event={active} />
          </div>
        )}

        {/* ---------------- Payouts ---------------- */}
        {tab === "payouts" && <PayoutsPanel initialPayouts={payouts} pendingBalance={pendingBalance} />}

        {/* ---------------- Settings ---------------- */}
        {tab === "settings" && <SettingsPanel organiserName={organiserName} />}
      </div>
    </section>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="tn-card p-5">
      <p className="tn-label !mb-1">{label}</p>
      <p className="font-display text-2xl font-extrabold text-heading">{value}</p>
      <p className="tn-meta mt-0.5">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: "bg-success/10 text-success",
    draft: "bg-heading/10 text-heading",
    ended: "bg-ink/10 text-ink/60",
  };
  return (
    <span className={`rounded-full px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  );
}

function EventActions({ slug, status }: { slug: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const patch = async (next: "live" | "ended") => {
    setBusy(true);
    await fetch("/api/organiser/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, status: next }),
    }).catch(() => undefined);
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/organiser/create-event?edit=${slug}`}
        className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-2.5 py-1.5 text-[12px] font-semibold text-heading hover:border-accent hover:text-accent"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Link>
      {status === "live" ? (
        <button
          onClick={() => patch("ended")}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-2.5 py-1.5 text-[12px] font-semibold text-danger hover:bg-danger/5"
        >
          <Ban className="h-3.5 w-3.5" /> Cancel
        </button>
      ) : status === "draft" ? (
        <button
          onClick={() => patch("live")}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-success/40 px-2.5 py-1.5 text-[12px] font-semibold text-success hover:bg-success/5"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Go Live
        </button>
      ) : null}
    </div>
  );
}

function AttendeesPanel({ event }: { event?: DashboardEvent }) {
  const router = useRouter();
  const [rows, setRows] = useState<AttendeeRow[]>([]);

  useEffect(() => {
    setRows(event?.attendees ?? []);
  }, [event]);

  const toggleCheckIn = async (ticketId: string, next: boolean) => {
    setRows((r) => r.map((row) => (row.ticketId === ticketId ? { ...row, checkedIn: next } : row)));
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, checkedIn: next }),
    }).catch(() => undefined);
    router.refresh();
  };

  if (!event) return null;

  return (
    <div className="tn-card tn-hscroll p-2 sm:p-6">
      {rows.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-accent" />
          <p className="mt-3 font-display text-[15px] font-bold text-heading">No ticket sales recorded yet</p>
          <p className="mt-1 text-[13px] text-ink/70">
            Real orders appear here instantly. Door scanning toggles check-in status.
          </p>
        </div>
      ) : (
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b-2 border-heading/10 font-display text-[12px] uppercase tracking-wide text-ink/60">
              <th className="py-3 pr-4 font-semibold">Name</th>
              <th className="py-3 pr-4 font-semibold">Email</th>
              <th className="py-3 pr-4 font-semibold">Tier</th>
              <th className="py-3 font-semibold">Checked In</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ticketId} className="border-b border-black/5">
                <td className="py-3.5 pr-4 text-[13.5px] font-semibold text-heading">{r.name}</td>
                <td className="py-3.5 pr-4 text-[13px] text-ink/70">{r.email}</td>
                <td className="py-3.5 pr-4 text-[13px]">{r.tierName}</td>
                <td className="py-3.5">
                  <button
                    role="switch"
                    aria-checked={r.checkedIn}
                    aria-label={`Toggle check-in for ${r.name}`}
                    onClick={() => toggleCheckIn(r.ticketId, !r.checkedIn)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      r.checkedIn ? "bg-success" : "bg-black/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        r.checkedIn ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PayoutsPanel({
  initialPayouts,
  pendingBalance,
}: {
  initialPayouts: PayoutRecord[];
  pendingBalance: number;
}) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [balance, setBalance] = useState(pendingBalance);
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("+254 712 000 001");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const requestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/organiser/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountKES: Number(amount), method: "mpesa", destination }),
    });
    const data = (await res.json()) as { error?: string; payouts?: PayoutRecord[]; pendingBalance?: number };
    if (res.ok) {
      setPayouts(data.payouts ?? []);
      setBalance(data.pendingBalance ?? balance);
      setState("done");
      setMessage(`Payout of ${formatKES(Number(amount))} requested via M-Pesa B2C.`);
      setAmount("");
    } else {
      setState("error");
      setMessage(data.error ?? "Payout request failed.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <div className="tn-card p-6">
          <p className="tn-label">Pending Balance</p>
          <p className="font-display text-3xl font-extrabold text-heading">{formatKES(balance)}</p>
          <p className="tn-meta mt-1">After 5% platform fee. Minimum payout KES 500.</p>
        </div>
        <form onSubmit={requestPayout} className="tn-card space-y-4 p-6">
          <h3 className="font-display text-lg font-bold text-heading">Request Payout</h3>
          <div>
            <label htmlFor="po-amount" className="tn-label">Amount (KES)</label>
            <input
              id="po-amount"
              type="number"
              min={500}
              max={balance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="tn-input"
              placeholder="5000"
            />
          </div>
          <div>
            <label htmlFor="po-dest" className="tn-label">M-Pesa Number</label>
            <input
              id="po-dest"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="tn-input"
              placeholder="0712 345 678"
            />
          </div>
          <button type="submit" disabled={state === "busy" || balance < 500} className="tn-btn tn-btn-primary w-full">
            <Banknote className="h-4 w-4" /> {state === "busy" ? "Requesting..." : "Request Payout"}
          </button>
          {state === "done" && (
            <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
              <CheckCircle className="h-4 w-4" /> {message}
            </p>
          )}
          {state === "error" && (
            <p className="flex items-center gap-2 text-[13px] font-semibold text-danger">
              <AlertCircle className="h-4 w-4" /> {message}
            </p>
          )}
          <p className="tn-meta">Sent via M-Pesa B2C (Daraja). Settles next business day.</p>
        </form>
      </div>

      <div className="tn-card tn-hscroll p-2 sm:p-6">
        <h3 className="font-display text-lg font-bold text-heading">Payout History</h3>
        <table className="mt-4 w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b-2 border-heading/10 font-display text-[12px] uppercase tracking-wide text-ink/60">
              <th className="py-3 pr-4 font-semibold">Reference</th>
              <th className="py-3 pr-4 font-semibold">Date</th>
              <th className="py-3 pr-4 font-semibold">Amount</th>
              <th className="py-3 pr-4 font-semibold">Destination</th>
              <th className="py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[13px] text-ink/60">
                  No payouts yet. Your balance is ready whenever you are.
                </td>
              </tr>
            )}
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-black/5">
                <td className="py-3.5 pr-4 text-[12.5px] font-semibold text-heading">{p.reference || p.id}</td>
                <td className="py-3.5 pr-4 text-[12.5px]">{new Date(p.requestedAt).toLocaleDateString("en-KE")}</td>
                <td className="py-3.5 pr-4 text-[13px] font-bold text-accent">{formatKES(p.amountKES)}</td>
                <td className="py-3.5 pr-4 text-[12.5px]">{p.destination}</td>
                <td className="py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase ${
                      p.status === "paid" ? "bg-success/10 text-success" : "bg-heading/10 text-heading"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tn-meta mt-4">
          <Download className="mr-1 inline h-3.5 w-3.5" />
          Statements export as CSV from your payout emails.
        </p>
      </div>
    </div>
  );
}

function SettingsPanel({ organiserName }: { organiserName: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="tn-card space-y-4 p-6">
        <h3 className="font-display text-lg font-bold text-heading">Organiser Profile</h3>
        <div>
          <label className="tn-label" htmlFor="set-name">Display Name</label>
          <input id="set-name" className="tn-input" defaultValue={organiserName} />
        </div>
        <div>
          <label className="tn-label" htmlFor="set-bio">Public Bio</label>
          <textarea
            id="set-bio"
            className="tn-input min-h-24"
            defaultValue="We produce East Africa's boldest live experiences."
          />
        </div>
        <button className="tn-btn tn-btn-primary tn-btn-sm" disabled title="Connect your account to save settings">
          Save Profile
        </button>
        <p className="tn-meta">Settings save to your account once storage is connected.</p>
      </div>

      <div className="tn-card space-y-4 p-6">
        <h3 className="font-display text-lg font-bold text-heading">Payout Details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="tn-label" htmlFor="set-method">Payout Method</label>
            <select id="set-method" className="tn-select" defaultValue="mpesa">
              <option value="mpesa">M-Pesa (B2C)</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="tn-label" htmlFor="set-dest">Destination</label>
            <input id="set-dest" className="tn-input" defaultValue="+254 712 000 001" />
          </div>
        </div>
        <div>
          <label className="tn-label" htmlFor="set-kra">KRA PIN (for tax records)</label>
          <input id="set-kra" className="tn-input" placeholder="A001234567X" />
        </div>
        <div className="rounded-lg bg-light p-4 text-[12.5px] leading-relaxed text-ink/70">
          Platform fee is 5% of ticket revenue, deducted before payout. Buyers pay a separate
          KES 100 service fee per ticket. Payouts settle next business day via M-Pesa B2C.
        </div>
      </div>
    </div>
  );
}
