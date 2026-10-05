import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import type { CardEvent } from "@/types";
import { formatEventDateShort, formatKES, categoryName } from "@/lib/site";

export default function EventCard({
  event,
  soldOut = false,
}: {
  event: CardEvent;
  soldOut?: boolean;
}) {
  const min = event.tiers.reduce((m, t) => Math.min(m, t.priceKES), Number.POSITIVE_INFINITY);
  const max = event.tiers.reduce((m, t) => Math.max(m, t.priceKES), 0);
  const priceLabel =
    min === 0 && max === 0
      ? "Free"
      : min === max
        ? formatKES(min)
        : `${formatKES(min)} to ${formatKES(max)}`;

  return (
    <article
      className={`tn-event-card tn-card group relative flex h-full flex-col ${
        soldOut ? "tn-event-card--soldout" : ""
      }`}
    >
      <Link
        href={`/events/${event.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-dark"
        aria-label={event.name}
      >
        <Image
          src={event.poster}
          alt={`${event.name} event poster`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="tn-event-card__poster object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-dark/80 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {categoryName(event.category)}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
            Sold Out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[19px] font-bold leading-snug text-heading">
          <Link href={`/events/${event.slug}`} className="hover:text-accent">
            {event.name}
          </Link>
        </h3>

        <div className="mt-3 space-y-1.5 text-[13px] text-ink/75">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{formatEventDateShort(event.startAt)}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span className="truncate">
              {event.venue.name}, {event.venue.city}
            </span>
          </p>
          <p className="flex items-center gap-2 font-semibold text-heading">
            <Ticket className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{priceLabel}</span>
          </p>
        </div>

        <div className="mt-auto pt-5">
          {soldOut ? (
            <button className="tn-btn tn-btn-primary w-full" disabled aria-disabled="true">
              Sold Out
            </button>
          ) : (
            <Link href={`/events/${event.slug}`} className="tn-btn tn-btn-primary w-full">
              Get Tickets
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
