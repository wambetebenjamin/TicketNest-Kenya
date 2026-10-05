// ---------------------------------------------------------------------------
// Event catalogue service — merges the static seed catalogue with organiser
// created events (store) and live availability counters (store).
// Powers the API routes, pages and the organiser dashboard.
// ---------------------------------------------------------------------------

import { EVENTS, getEventBySlug as seedEvent } from "@/lib/data/events";
import {
  kvGet,
  kvSet,
  kvIncrBy,
  kvListAll,
  kvListPush,
  STORE_KEYS,
} from "@/lib/store";
import type {
  AppUser,
  AttendeeRow,
  CartLine,
  DailySale,
  EventItem,
  Order,
  OrderAmounts,
  PayoutRecord,
  Ticket,
  TierSale,
} from "@/types";
import { SITE } from "@/lib/site";
import { signTicket } from "@/lib/qr";
import { sendTicketConfirmation, sendEventReminder } from "@/lib/email";
import { sendWhatsAppText, ticketDeliveryMessage } from "@/lib/whatsapp";

export const PLATFORM_FEE_PER_TICKET = SITE.serviceFeePerTicket;
export const ORGANISER_PLATFORM_FEE_PERCENT = SITE.organiserPlatformFeePercent;

// --------------------------------------------------------------------------
// Catalogue
// --------------------------------------------------------------------------

/** All live events: seed catalogue + organiser-created events. */
export async function allEvents(): Promise<EventItem[]> {
  const created = await kvListAll<EventItem>("index:created-events", "event:");
  return [...EVENTS, ...created];
}

export async function findEvent(slug: string): Promise<EventItem | null> {
  const created = await kvGet<EventItem>(`event:${slug}`);
  return created ?? seedEvent(slug) ?? null;
}

export interface EventQuery {
  category?: string;
  city?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  maxPrice?: number;
  freeOnly?: boolean;
  page?: number;
  perPage?: number;
  sort?: "date" | "price-asc" | "price-desc" | "newest";
}

export interface EventQueryResult {
  events: (EventItem & { soldOut: boolean })[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

function tierStats(ev: EventItem) {
  const total = ev.tiers.reduce((s, t) => s + t.quantityTotal, 0);
  const sold = ev.tiers.reduce((s, t) => s + Math.max(0, t.quantityTotal - t.quantityRemaining), 0);
  const min = ev.tiers.reduce((m, t) => Math.min(m, t.priceKES), Number.POSITIVE_INFINITY);
  const max = ev.tiers.reduce((m, t) => Math.max(m, t.priceKES), 0);
  return { total, sold, min: Number.isFinite(min) ? min : 0, max };
}

export function isSoldOut(ev: EventItem): boolean {
  return ev.tiers.length > 0 && ev.tiers.every((t) => t.quantityRemaining <= 0);
}

export async function queryEvents(q: EventQuery): Promise<EventQueryResult> {
  let events = await allEvents();
  events = events.filter((e) => e.status !== "draft");
  if (q.category) events = events.filter((e) => e.category === q.category);
  if (q.city && q.city !== "All Cities") events = events.filter((e) => e.venue.city === q.city);
  if (q.search) {
    const s = q.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.venue.name.toLowerCase().includes(s) ||
        e.venue.city.toLowerCase().includes(s) ||
        e.tagline.toLowerCase().includes(s)
    );
  }
  if (q.dateFrom) events = events.filter((e) => new Date(e.startAt) >= new Date(q.dateFrom!));
  if (q.dateTo) {
    const to = new Date(q.dateTo!);
    to.setHours(23, 59, 59, 999);
    events = events.filter((e) => new Date(e.startAt) <= to);
  }
  if (q.maxPrice !== undefined) events = events.filter((e) => tierStats(e).min <= q.maxPrice!);
  if (q.freeOnly) events = events.filter((e) => tierStats(e).min === 0);

  switch (q.sort) {
    case "price-asc":
      events.sort((a, b) => tierStats(a).min - tierStats(b).min);
      break;
    case "price-desc":
      events.sort((a, b) => tierStats(b).min - tierStats(a).min);
      break;
    case "newest":
      events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      events.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  const page = Math.max(1, q.page ?? 1);
  const perPage = q.perPage ?? 9;
  const total = events.length;
  const start = (page - 1) * perPage;
  return {
    events: events.slice(start, start + perPage).map((e) => ({ ...e, soldOut: isSoldOut(e) })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// --------------------------------------------------------------------------
// Availability counters
// --------------------------------------------------------------------------

async function getRemaining(slug: string, tierId: string, fallback: number): Promise<number> {
  const key = STORE_KEYS.availability(slug, tierId);
  const v = await kvGet<number>(key);
  if (v !== null) return v;
  await kvSet(key, fallback);
  return fallback;
}

export async function withAvailability(ev: EventItem): Promise<EventItem> {
  const tiers = await Promise.all(
    ev.tiers.map(async (t) => ({
      ...t,
      quantityRemaining: await getRemaining(ev.slug, t.id, t.quantityRemaining),
    }))
  );
  return { ...ev, tiers };
}

// --------------------------------------------------------------------------
// Orders and tickets
// --------------------------------------------------------------------------

function makeId(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}

export function computeAmounts(lines: { priceKES: number; quantity: number }[]): OrderAmounts {
  const subtotal = lines.reduce((s, l) => s + l.priceKES * l.quantity, 0);
  const ticketCount = lines.reduce((s, l) => s + l.quantity, 0);
  const serviceFee = ticketCount * PLATFORM_FEE_PER_TICKET;
  return { subtotal, serviceFee, total: subtotal + serviceFee };
}

export interface CreateOrderInput {
  cart: CartLine[];
  attendee: Order["attendee"];
  perTicketAttendees: Order["perTicketAttendees"];
  userId: string | null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order | { error: string }> {
  const first = input.cart[0];
  if (!first) return { error: "Cart is empty" };
  const ev = await findEvent(first.eventSlug);
  if (!ev) return { error: "Event not found" };

  // Validate + reserve
  for (const line of input.cart) {
    const event = line.eventSlug === ev.slug ? ev : await findEvent(line.eventSlug);
    const tier = event?.tiers.find((t) => t.id === line.tierId);
    if (!event || !tier) return { error: "Invalid tier in cart" };
    const remaining = await getRemaining(event.slug, tier.id, tier.quantityRemaining);
    if (remaining < line.quantity) return { error: `Not enough tickets left for ${tier.name}` };
  }
  for (const line of input.cart) {
    const event = line.eventSlug === ev.slug ? ev : await findEvent(line.eventSlug);
    const tier = event!.tiers.find((t) => t.id === line.tierId)!;
    await kvIncrBy(STORE_KEYS.availability(event!.slug, tier.id), -line.quantity);
  }

  const orderId = makeId("TN");
  const tickets: Ticket[] = [];
  let ticketIndex = 0;
  for (const line of input.cart) {
    const event = line.eventSlug === ev.slug ? ev : await findEvent(line.eventSlug);
    const tier = event!.tiers.find((t) => t.id === line.tierId)!;
    for (let i = 0; i < line.quantity; i++) {
      const perTicket = input.perTicketAttendees.find(
        (p) => p.ticketKey === `${line.eventSlug}:${line.tierId}:${i}`
      );
      const ticket: Ticket = {
        id: makeId("TK"),
        orderId,
        eventSlug: event!.slug,
        eventName: event!.name,
        eventDate: event!.startAt,
        venue: event!.venue.name,
        city: event!.venue.city,
        tierName: tier.name,
        holderName: perTicket?.name || input.attendee.name,
        holderPhone: input.attendee.phone,
        buyerEmail: input.attendee.email.toLowerCase(),
        transferable: tier.transferable,
        checkedIn: false,
        createdAt: new Date().toISOString(),
      };
      tickets.push(ticket);
      ticketIndex++;
    }
  }

  const order: Order = {
    id: orderId,
    userId: input.userId,
    eventSlug: ev.slug,
    items: input.cart.map((l) => ({
      tierId: l.tierId,
      tierName: l.tierName,
      quantity: l.quantity,
      priceKES: l.priceKES,
    })),
    attendee: input.attendee,
    perTicketAttendees: input.perTicketAttendees,
    amounts: computeAmounts(input.cart),
    payment: { method: "mpesa", status: "pending", providerRef: "" },
    tickets,
    createdAt: new Date().toISOString(),
  };

  await kvSet(STORE_KEYS.order(orderId), order);
  await kvListPush(STORE_KEYS.orderIndex(), orderId);
  await kvListPush(STORE_KEYS.ordersByEmail(input.attendee.email), orderId);
  for (const line of input.cart) await kvListPush(STORE_KEYS.ordersByEvent(line.eventSlug), orderId);
  for (const t of tickets) {
    await kvSet(STORE_KEYS.ticket(t.id), t);
    await kvListPush(STORE_KEYS.ticketIndex(), t.id);
    await kvListPush(STORE_KEYS.ticketsByEmail(t.buyerEmail), t.id);
  }
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  return kvGet<Order>(STORE_KEYS.order(id));
}

export async function markOrderPaid(
  orderId: string,
  method: "mpesa" | "card",
  providerRef: string
): Promise<Order | null> {
  const order = await getOrder(orderId);
  if (!order) return null;
  if (order.payment.status === "paid") return order;
  order.payment = { method, status: "paid", providerRef };
  await kvSet(STORE_KEYS.order(orderId), order);

  // Deliver tickets: email + WhatsApp
  const primaryEvent = await findEvent(order.eventSlug);
  void primaryEvent;
  const emailData = {
    to: order.attendee.email,
    orderRef: order.id,
    eventName: order.tickets[0]?.eventName ?? "Your event",
    eventDate: order.tickets[0]?.eventDate ?? "",
    venue: `${order.tickets[0]?.venue ?? ""}, ${order.tickets[0]?.city ?? ""}`,
    tickets: order.tickets.map((t) => ({ id: t.id, tier: t.tierName, holder: t.holderName })),
    totalKES: order.amounts.total,
  };
  void sendTicketConfirmation(emailData).catch(() => undefined);
  void sendEventReminder(emailData).catch(() => undefined); // scheduled job would send 24h before; demo logs intent
  for (const t of order.tickets) {
    void sendWhatsAppText(
      t.holderPhone,
      ticketDeliveryMessage({
        holderName: t.holderName,
        eventName: t.eventName,
        eventDate: t.eventDate,
        venue: `${t.venue}, ${t.city}`,
        ticketId: t.id,
        qrUrl: `${SITE.url}/api/tickets/${t.id}?format=png`,
      })
    ).catch(() => undefined);
  }
  return order;
}

export async function getTicketsForEmail(email: string): Promise<Ticket[]> {
  const ids = (await kvGet<string[]>(STORE_KEYS.ticketsByEmail(email.toLowerCase()))) ?? [];
  const tickets = await Promise.all(ids.map((id) => kvGet<Ticket>(STORE_KEYS.ticket(id))));
  return tickets.filter((t): t is Ticket => t !== null).sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));
}

export async function getTicket(id: string): Promise<Ticket | null> {
  return kvGet<Ticket>(STORE_KEYS.ticket(id));
}

export async function transferTicket(ticketId: string, toName: string, toPhone: string): Promise<Ticket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket || !ticket.transferable) return null;
  ticket.holderName = toName;
  ticket.holderPhone = toPhone;
  await kvSet(STORE_KEYS.ticket(ticketId), ticket);
  void sendWhatsAppText(
    toPhone,
    ticketDeliveryMessage({
      holderName: toName,
      eventName: ticket.eventName,
      eventDate: ticket.eventDate,
      venue: `${ticket.venue}, ${ticket.city}`,
      ticketId: ticket.id,
      qrUrl: `${SITE.url}/api/tickets/${ticket.id}?format=png`,
    })
  ).catch(() => undefined);
  return ticket;
}

export async function setCheckedIn(ticketId: string, checkedIn: boolean): Promise<Ticket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;
  ticket.checkedIn = checkedIn;
  await kvSet(STORE_KEYS.ticket(ticketId), ticket);
  return ticket;
}

export function ticketQrPayload(ticketId: string): string {
  return signTicket(ticketId);
}

// --------------------------------------------------------------------------
// Organiser: events, sales analytics, attendees, payouts
// --------------------------------------------------------------------------

const DEMO_ORGANISER_SLUG = "nest-live";

/** Events visible on the organiser dashboard (demo organiser owns Nest Live seed events). */
export async function organiserEvents(user: AppUser | null): Promise<EventItem[]> {
  const createdIds = (await kvGet<string[]>(STORE_KEYS.organiserEvents(user?.id ?? "usr_org_demo"))) ?? [];
  const created = (
    await Promise.all(createdIds.map((slug) => kvGet<EventItem>(`event:${slug}`)))
  ).filter((e): e is EventItem => e !== null);
  const isDemoOrganiser = !user || user.id === "usr_org_demo";
  const owned = isDemoOrganiser
    ? EVENTS.filter((e) => e.organiser.slug === DEMO_ORGANISER_SLUG)
    : [];
  return [...owned, ...created];
}

/** Deterministic pseudo-random daily sales history for demo analytics. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export interface EventSales {
  event: EventItem;
  ticketsSold: number;
  revenue: number;
  daily: DailySale[];
  tiers: TierSale[];
  attendees: AttendeeRow[];
}

export async function eventSales(slug: string): Promise<EventSales | null> {
  const ev = await findEvent(slug);
  if (!ev) return null;
  const rand = seededRandom(slug);
  const tiers: TierSale[] = [];
  let ticketsSold = 0;
  for (const t of ev.tiers) {
    const sold = Math.max(0, Math.round(t.quantityTotal * (0.35 + rand() * 0.6)));
    ticketsSold += sold;
    tiers.push({ tierName: t.name, tickets: sold, revenue: sold * t.priceKES });
  }
  const revenue = tiers.reduce((s, t) => s + t.revenue, 0);

  // Daily series across the last 30 days
  const daily: DailySale[] = [];
  const today = new Date();
  let remaining = ticketsSold;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const wave = Math.sin((29 - i) / 5) * 0.5 + 0.5;
    const base = remaining > 0 ? Math.round((0.01 + wave * 0.035) * ticketsSold) : 0;
    const tickets = Math.min(remaining, Math.max(0, base + Math.round(rand() * 3) - 1));
    remaining -= tickets;
    daily.push({
      date: d.toISOString().slice(0, 10),
      tickets,
      revenue: tiers.reduce((s, t) => s + Math.round((tickets / Math.max(1, ticketsSold)) * t.tickets) * t.revenue, 0) / Math.max(1, ticketsSold) * tickets,
    });
  }
  // Fix rounding drift on the last day
  if (remaining > 0) {
    const last = daily[daily.length - 1];
    last.tickets += remaining;
  }

  const orderIds = (await kvGet<string[]>(STORE_KEYS.ordersByEvent(slug))) ?? [];
  const realOrders = (
    await Promise.all(orderIds.map((id) => kvGet<Order>(STORE_KEYS.order(id))))
  ).filter((o): o is Order => o !== null && o.payment.status === "paid");
  for (const o of realOrders) {
    for (const t of o.tickets) {
      const tier = tiers.find((x) => x.tierName === t.tierName);
      if (tier) {
        tier.tickets += 1;
        tier.revenue += o.items.find((i) => i.tierName === t.tierName)?.priceKES ?? 0;
      }
      ticketsSold += 1;
    }
  }

  const attendees: AttendeeRow[] = realOrders.flatMap((o) =>
    o.tickets.map((t) => ({
      ticketId: t.id,
      name: t.holderName,
      email: t.buyerEmail,
      tierName: t.tierName,
      checkedIn: t.checkedIn,
      purchasedAt: o.createdAt,
    }))
  );

  return { event: ev, ticketsSold, revenue, daily, tiers, attendees };
}

export async function pendingPayoutBalance(organiserId: string, grossRevenue: number): Promise<number> {
  const payouts = await kvListAll<PayoutRecord>(STORE_KEYS.payoutIndex(organiserId), STORE_KEYS.payout(""));
  const paidOut = payouts.reduce((s, p) => s + p.amountKES, 0);
  const net = Math.round(grossRevenue * (1 - ORGANISER_PLATFORM_FEE_PERCENT / 100));
  return Math.max(0, net - paidOut);
}

export async function organiserPayouts(organiserId: string): Promise<PayoutRecord[]> {
  const payouts = await kvListAll<PayoutRecord>(STORE_KEYS.payoutIndex(organiserId), STORE_KEYS.payout(""));
  return payouts.sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
}
