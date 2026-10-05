"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import MapView, { type MapEventPin } from "@/components/events/MapView";
import type { EventItem } from "@/types";

type BrowseEvent = Pick<EventItem, "slug" | "name" | "startAt" | "venue" | "tiers" | "poster" | "category"> & {
  venue: { name: string; city: string; lat: number; lng: number };
};

/**
 * Results area with sort options and map/grid toggle.
 * Grid fades out, map fades in, 200ms (spec).
 */
export default function BrowseResults({
  events,
  total,
  page,
  totalPages,
}: {
  events: (BrowseEvent & { soldOut: boolean })[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const [view, setView] = useState<"grid" | "map">("grid");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "date";

  const setSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    router.push(`${pathname}?${next.toString()}`);
  };

  const goToPage = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`${pathname}?${next.toString()}`);
  };

  const pins: MapEventPin[] = events.map((e) => ({
    slug: e.slug,
    name: e.name,
    city: e.venue.city,
    venue: e.venue.name,
    lat: e.venue.lat,
    lng: e.venue.lng,
    minPrice: e.tiers.reduce((m, t) => Math.min(m, t.priceKES), Number.POSITIVE_INFINITY),
  }));

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-ink/70">
          <strong className="font-display text-heading">{total}</strong> event{total === 1 ? "" : "s"} found
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="tn-meta">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="tn-select !w-auto !py-2 !text-[13px]"
          >
            <option value="date">Soonest First</option>
            <option value="newest">Newest Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div className="flex overflow-hidden rounded-lg border border-black/15">
            <button
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold ${
                view === "grid" ? "bg-heading text-white" : "text-ink/70 hover:bg-light"
              }`}
            >
              <LayoutGrid className="h-4 w-4" /> Grid
            </button>
            <button
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              aria-label="Map view"
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold ${
                view === "map" ? "bg-heading text-white" : "text-ink/70 hover:bg-light"
              }`}
            >
              <MapIcon className="h-4 w-4" /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Views with 200ms fade swap */}
      <div className={`tn-fade-swap ${view === "map" ? "tn-fade-swap--hidden" : ""}`}>
        {view === "grid" && (
          <>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.slug} event={e} soldOut={e.soldOut} />
              ))}
            </div>
            {events.length === 0 && (
              <div className="rounded-xl bg-light p-12 text-center">
                <p className="font-display text-lg font-bold text-heading">No events match your filters</p>
                <p className="mt-2 text-[14px] text-ink/70">Try widening the date range or clearing filters.</p>
              </div>
            )}
            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`h-10 w-10 rounded-full font-display text-[13px] font-bold ${
                      p === page ? "bg-accent text-white" : "border border-black/15 text-ink/70 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
      {view === "map" && (
        <div className="tn-fade-swap">
          <MapView pins={pins} />
        </div>
      )}
    </div>
  );
}
