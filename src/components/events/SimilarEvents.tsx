"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import type { CardEvent } from "@/types";

/** Similar events carousel below event detail. */
export default function SimilarEvents({
  events,
  soldOutMap = {},
}: {
  events: CardEvent[];
  soldOutMap?: Record<string, boolean>;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!events.length) return null;

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-heading">You Might Also Like</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll similar events left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-ink/70 hover:border-accent hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll similar events right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-ink/70 hover:border-accent hover:text-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={scroller} className="tn-hscroll flex snap-x gap-6 pb-2">
        {events.map((e) => (
          <div key={e.slug} className="w-[300px] shrink-0 snap-start sm:w-[320px]">
            <EventCard event={e} soldOut={soldOutMap[e.slug]} />
          </div>
        ))}
      </div>
    </div>
  );
}
