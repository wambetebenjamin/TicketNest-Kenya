// ---------------------------------------------------------------------------
// TicketNest Kenya — shared domain types
// ---------------------------------------------------------------------------

export type CityName =
  | "Nairobi"
  | "Mombasa"
  | "Kisumu"
  | "Kampala"
  | "Dar es Salaam";

export type EventStatus = "draft" | "live" | "ended";

export type EventType = "physical" | "online" | "hybrid";

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide icon name key, resolved in components
}

export interface TicketTier {
  id: string;
  name: string;
  priceKES: number;
  quantityTotal: number;
  quantityRemaining: number;
  saleStart: string; // ISO
  saleEnd: string; // ISO
  description: string;
  transferable: boolean;
}

export interface LineupMember {
  name: string;
  role: string;
  photo?: string;
}

export interface EventItem {
  slug: string;
  name: string;
  tagline: string;
  category: string; // category slug
  eventType: EventType;
  ageRestricted: boolean;
  description: string[]; // rich text paragraphs
  organiser: { name: string; slug: string; bio: string };
  startAt: string; // ISO
  endAt: string; // ISO
  venue: {
    name: string;
    address: string;
    city: CityName;
    lat: number;
    lng: number;
  };
  onlineLink?: string;
  lineup: LineupMember[];
  tiers: TicketTier[];
  poster: string;
  featured: boolean;
  status: EventStatus;
  createdAt: string;
}

/** Loose event shape used by cards and carousels. */
export type CardEvent = Pick<
  EventItem,
  "slug" | "name" | "startAt" | "tiers" | "poster" | "category"
> & {
  venue: { name: string; city: string };
};

export interface CartItem {
  tierId: string;
  eventSlug: string;
  quantity: number;
}

export interface CartLine extends CartItem {
  eventName: string;
  tierName: string;
  priceKES: number;
  transferable: boolean;
}

export interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
  idNumber: string;
}

export interface PerTicketAttendee {
  ticketKey: string; // `${eventSlug}:${tierId}:${index}`
  name: string;
}

export interface OrderAmounts {
  subtotal: number;
  serviceFee: number; // KES 100 per ticket
  total: number;
}

export interface Ticket {
  id: string; // TN-XXXXXXXX
  orderId: string;
  eventSlug: string;
  eventName: string;
  eventDate: string;
  venue: string;
  city: string;
  tierName: string;
  holderName: string;
  holderPhone: string;
  buyerEmail: string;
  transferable: boolean;
  checkedIn: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string | null;
  eventSlug: string;
  items: { tierId: string; tierName: string; quantity: number; priceKES: number }[];
  attendee: AttendeeInfo;
  perTicketAttendees: PerTicketAttendee[];
  amounts: OrderAmounts;
  payment: {
    method: "mpesa" | "card";
    status: "pending" | "paid" | "failed";
    providerRef: string;
    phone?: string;
  };
  tickets: Ticket[];
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // scrypt
  role: "buyer" | "organiser";
  createdAt: string;
  organiserProfile?: {
    bio: string;
    payoutMethod: "mpesa" | "bank";
    payoutDetails: string;
  };
}

export interface NewsletterSubscriber {
  email: string;
  city: string;
  categories: string[];
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  organiserId: string;
  amountKES: number;
  method: "mpesa" | "bank";
  destination: string;
  status: "pending" | "processing" | "paid";
  reference: string;
  requestedAt: string;
}

export interface DailySale {
  date: string; // YYYY-MM-DD
  tickets: number;
  revenue: number;
}

export interface TierSale {
  tierName: string;
  tickets: number;
  revenue: number;
}

export interface AttendeeRow {
  ticketId: string;
  name: string;
  email: string;
  tierName: string;
  checkedIn: boolean;
  purchasedAt: string;
}
