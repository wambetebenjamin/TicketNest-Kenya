import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Video,
  ShieldAlert,
  ArrowLeft,
  Building2,
} from "lucide-react";
import TierTable from "@/components/events/TierTable";
import ShareButtons from "@/components/events/ShareButtons";
import MapEmbed from "@/components/events/MapEmbed";
import SimilarEvents from "@/components/events/SimilarEvents";
import Reveal from "@/components/ui/Reveal";
import { findEvent, withAvailability, isSoldOut, allEvents } from "@/lib/events-service";
import { getSimilarEvents } from "@/lib/data/events";
import {
  SITE,
  categoryName,
  formatEventDate,
  formatKES,
} from "@/lib/site";

// Near real-time availability — ISR revalidate 60
export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await allEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await findEvent(params.slug);
  if (!event) return { title: "Event Not Found" };
  const min = event.tiers.reduce((m, t) => Math.min(m, t.priceKES), Infinity);
  const description = `${event.name} at ${event.venue.name}, ${event.venue.city}. ${formatEventDate(event.startAt)}. Tickets from ${formatKES(Number.isFinite(min) ? min : 0)}.`;
  return {
    title: event.name,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.name} | ${SITE.name}`,
      description,
      images: [{ url: event.poster, width: 1200, height: 630, alt: event.name }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description,
      images: [event.poster],
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const baseEvent = await findEvent(params.slug);
  if (!baseEvent) notFound();

  const event = await withAvailability(baseEvent);
  const soldOut = isSoldOut(event);
  const similar = getSimilarEvents(event.slug).map((e) => ({
    slug: e.slug,
    name: e.name,
    startAt: e.startAt,
    venue: { name: e.venue.name, city: e.venue.city },
    tiers: e.tiers,
    poster: e.poster,
    category: e.category,
  }));

  const min = event.tiers.reduce((m, t) => Math.min(m, t.priceKES), Infinity);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.startAt,
    endDate: event.endAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.eventType === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.eventType === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location:
      event.eventType === "online"
        ? { "@type": "VirtualLocation", url: event.onlineLink ?? SITE.url }
        : {
            "@type": "Place",
            name: event.venue.name,
            address: {
              "@type": "PostalAddress",
              streetAddress: event.venue.address,
              addressLocality: event.venue.city,
              addressCountry: event.venue.city === "Kampala" ? "UG" : event.venue.city === "Dar es Salaam" ? "TZ" : "KE",
            },
            geo: { "@type": "GeoCoordinates", latitude: event.venue.lat, longitude: event.venue.lng },
          },
    image: [`${SITE.url}${event.poster}`],
    description: event.tagline,
    organizer: { "@type": "Organization", name: event.organiser.name },
    offers: event.tiers.map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: t.priceKES,
      priceCurrency: "KES",
      availability: t.quantityRemaining > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `${SITE.url}/events/${event.slug}`,
      validFrom: t.saleStart,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Full-width banner photo */}
      <section className="relative h-[46vh] min-h-[320px] w-full bg-dark">
        <Image
          src={event.poster}
          alt={`${event.name} banner`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/45 to-dark/25" />
        <div className="tn-container absolute inset-x-0 bottom-0 pb-8">
          <Link
            href="/events"
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All Events
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
              {categoryName(event.category)}
            </span>
            {event.eventType !== "physical" && (
              <span className="rounded-full bg-white/15 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                {event.eventType === "online" ? "Online" : "Hybrid"}
              </span>
            )}
            {soldOut && (
              <span className="rounded-full bg-white px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-dark">
                Sold Out
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {event.name}
          </h1>
          <p className="mt-2 max-w-2xl text-[16px] text-white/85">{event.tagline}</p>
        </div>
      </section>

      {/* Main content */}
      <section className="tn-section">
        <div className="tn-container grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div>
            {/* Key facts */}
            <Reveal>
              <div className="grid gap-4 rounded-xl bg-light p-5 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="tn-label !mb-0.5">Date and Time</p>
                    <p className="text-[13.5px] leading-snug text-ink/85">{formatEventDate(event.startAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="tn-label !mb-0.5">Venue</p>
                    <p className="text-[13.5px] leading-snug text-ink/85">
                      {event.venue.name}
                      <br />
                      {event.venue.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="tn-label !mb-0.5">Organiser</p>
                    <p className="text-[13.5px] leading-snug text-ink/85">{event.organiser.name}</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {event.ageRestricted && (
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
                <ShieldAlert className="h-5 w-5 shrink-0 text-accent" />
                <p className="text-[13.5px] text-ink/85">
                  This is an 18+ event. Bring a valid national ID, passport or alien card for entry.
                </p>
              </div>
            )}

            {/* Description */}
            <Reveal delay={65}>
              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold text-heading">About This Event</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-[1.8] text-ink/85">
                  {event.description.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Lineup */}
            {event.lineup.length > 0 && (
              <Reveal delay={65}>
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-bold text-heading">Lineup</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {event.lineup.map((member, i) => (
                      <div
                        key={member.name}
                        className="flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-heading font-display text-[16px] font-bold text-white">
                          {member.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <p className="font-display text-[15px] font-bold text-heading">{member.name}</p>
                          <p className="tn-meta">{member.role}</p>
                        </div>
                        <span className="ml-auto font-display text-[12px] font-bold text-accent/70">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Ticket tiers */}
            <Reveal delay={65}>
              <div className="mt-10" id="tickets">
                <h2 className="font-display text-2xl font-bold text-heading">Tickets</h2>
                <p className="mt-1 text-[14px] text-ink/70">
                  From {formatKES(Number.isFinite(min) ? min : 0)}. M-Pesa and card accepted.
                </p>
                <div className="mt-5">
                  <TierTable eventSlug={event.slug} eventName={event.name} tiers={event.tiers} />
                </div>
              </div>
            </Reveal>

            {/* Venue map */}
            {event.eventType !== "online" && (
              <Reveal delay={65}>
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-bold text-heading">Venue</h2>
                  <div className="mt-4">
                    <MapEmbed
                      query={`${event.venue.name}, ${event.venue.address}`}
                      title={event.venue.name}
                      lat={event.venue.lat}
                      lng={event.venue.lng}
                    />
                  </div>
                </div>
              </Reveal>
            )}

            {event.onlineLink && (
              <div className="mt-6 flex items-center gap-3 rounded-lg bg-heading/5 px-4 py-3">
                <Video className="h-5 w-5 shrink-0 text-accent" />
                <p className="text-[13.5px] text-ink/85">
                  This event is streamed online. The stream link is included with every virtual ticket.
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            <Reveal delay={65}>
              <div className="tn-card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                  <Clock className="h-5 w-5 text-accent" /> Share This Event
                </h3>
                <div className="mt-4">
                  <ShareButtons eventSlug={event.slug} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={130}>
              <div className="tn-card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                  <Building2 className="h-5 w-5 text-accent" /> Organiser
                </h3>
                <p className="mt-2 font-display text-[16px] font-bold text-heading">{event.organiser.name}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink/75">{event.organiser.bio}</p>
                <p className="tn-meta mt-4">
                  Verified organiser &middot; Payouts protected by TicketNest
                </p>
              </div>
            </Reveal>

            <Reveal delay={195}>
              <div className="rounded-xl bg-dark p-6 text-white">
                <p className="font-display text-lg font-bold">Buying for a group?</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75">
                  Add up to 10 tickets per tier and name each attendee for easy transfers. A flat
                  KES 100 service fee applies per ticket.
                </p>
                <Link href="/how-it-works" className="tn-btn tn-btn-primary tn-btn-sm mt-4">
                  How Buying Works
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Similar events carousel */}
      <section className="tn-section bg-light">
        <div className="tn-container">
          <SimilarEvents events={similar} />
        </div>
      </section>
    </>
  );
}
