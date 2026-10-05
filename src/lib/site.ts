// ---------------------------------------------------------------------------
// TicketNest Kenya — global site constants
// ---------------------------------------------------------------------------

export const SITE = {
  name: "TicketNest Kenya",
  shortName: "TicketNest",
  tagline: "Every Great Experience Starts With a Ticket.",
  description:
    "TicketNest Kenya is East Africa's home for event tickets — concerts, festivals, sports, comedy, conferences and experiences across Nairobi, Mombasa, Kisumu, Kampala and Dar es Salaam.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ticketnest.co.ke",
  email: "hello@ticketnest.co.ke",
  supportEmail: "support@ticketnest.co.ke",
  phone: "+254 112 272 061",
  whatsappNumber: "254112272061",
  whatsappDefaultMessage:
    "Hello! I need help with TicketNest Kenya.",
  address: "4th Floor, Kasarani Road, Nairobi, Kenya",
  serviceFeePerTicket: 100, // KES
  organiserPlatformFeePercent: 5, // deducted from organiser payout
  socials: {
    instagram: "https://instagram.com/ticketnestke",
    twitter: "https://twitter.com/ticketnestke",
    facebook: "https://facebook.com/ticketnestke",
    tiktok: "https://tiktok.com/@ticketnestke",
  },
} as const;

export const WHATSAPP_HELP_URL = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  SITE.whatsappDefaultMessage
)}`;

export const CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Kampala",
  "Dar es Salaam",
] as const;

export const CATEGORIES = [
  { slug: "music", name: "Music", icon: "music" },
  { slug: "sports", name: "Sports", icon: "trophy" },
  { slug: "comedy", name: "Comedy", icon: "laugh" },
  { slug: "food-and-drink", name: "Food and Drink", icon: "utensils" },
  { slug: "conferences", name: "Conferences", icon: "presentation" },
  { slug: "arts-and-culture", name: "Arts and Culture", icon: "palette" },
  { slug: "networking", name: "Networking", icon: "users" },
  { slug: "family", name: "Family", icon: "baby" },
] as const;

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function formatKES(amount: number): string {
  if (amount === 0) return "Free";
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/** Formats an ISO date like "Sat, 7 Nov 2026 at 7:00 PM" — uses "at", never em dashes. */
export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })} at ${d.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" })}`;
}

export function formatEventDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${d.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" })}`;
}
