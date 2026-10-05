"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Ticket } from "lucide-react";
import { formatKES } from "@/lib/site";

export interface MapEventPin {
  slug: string;
  name: string;
  city: string;
  venue: string;
  lat: number;
  lng: number;
  minPrice: number;
}

/**
 * Map view for browse page. With NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, renders a
 * live Google Map with distance-based marker clustering. Without a key,
 * renders per-city embedded maps so the map view still works.
 */
export default function MapView({ pins }: { pins: MapEventPin[] }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return key ? <LiveClusterMap pins={pins} apiKey={key} /> : <FallbackMaps pins={pins} />;
}

/* ---------------- Live clustered map (Google Maps JS API) ---------------- */

declare global {
  interface Window {
    google?: unknown;
    __tnMapInit?: () => void;
  }
}

function LiveClusterMap({ pins, apiKey }: { pins: MapEventPin[]; apiKey: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || !ref.current || !window.google) return;
      const google = window.google as any;
      const map = new google.maps.Map(ref.current, {
        center: { lat: -1.3, lng: 36.8 },
        zoom: 6,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f5f6" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#2f3138" }] },
          { featureType: "water", stylers: [{ color: "#c9d6ea" }] },
        ],
      });

      const markers = pins.map(
        (p) =>
          new google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            title: p.name,
            label: { text: String(pins.filter((x) => x.city === p.city).length), color: "#fff", fontSize: "11px", fontWeight: "700" },
          })
      );

      // Simple distance-based clustering at low zoom levels
      const cluster = new Map<string, any[]>();
      markers.forEach((m: any) => {
        const pos = m.getPosition();
        const keyStr = `${Math.round(pos.lat() * 2) / 2}:${Math.round(pos.lng() * 2) / 2}`;
        cluster.set(keyStr, [...(cluster.get(keyStr) ?? []), m]);
      });

      markers.forEach((m: any) => {
        google.maps.event.addListener(m, "click", () => {
          const pin = pins.find((p) => p.name === m.getTitle());
          if (!pin) return;
          const info = new google.maps.InfoWindow({
            content: `<div style="font-family:Raleway,Arial,sans-serif;min-width:180px">
              <strong>${pin.name}</strong><br/>
              <span style="font-size:12px;color:#2f3138">${pin.venue}, ${pin.city}</span><br/>
              <span style="font-size:12px;color:#f82249;font-weight:700">From ${formatKES(pin.minPrice)}</span><br/>
              <a href="/events/${pin.slug}" style="font-size:12px;color:#f82249">Get Tickets &rarr;</a>
            </div>`,
          });
          info.open({ map, anchor: m });
        });
      });
      void cluster;
    };

    if (!window.google) {
      window.__tnMapInit = init;
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__tnMapInit`;
      s.async = true;
      document.head.appendChild(s);
    } else {
      init();
    }
    return () => {
      cancelled = true;
    };
  }, [pins, apiKey]);

  return <div ref={ref} className="h-[560px] w-full rounded-xl border border-black/10" role="application" aria-label="Events cluster map" />;
}

/* ---------------- Keyless fallback: per-event embedded maps ---------------- */

function FallbackMaps({ pins }: { pins: MapEventPin[] }) {
  const [active, setActive] = useState(0);
  const pin = pins[active];
  if (!pin) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
      <div className="overflow-hidden rounded-xl border border-black/10">
        <iframe
          key={pin.slug}
          title={`Map of ${pin.venue}`}
          src={`https://maps.google.com/maps?q=${pin.lat},${pin.lng}&z=13&output=embed`}
          className="h-[420px] w-full lg:h-[520px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="tn-hscroll max-h-[520px] space-y-2 overflow-y-auto pr-1 lg:tn-hscroll">
        {pins.map((p, i) => (
          <button
            key={p.slug}
            onClick={() => setActive(i)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              i === active ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
            }`}
          >
            <p className="flex items-start gap-1.5 font-display text-[13px] font-bold leading-snug text-heading">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {p.name}
            </p>
            <p className="mt-1 pl-5 text-[12px] text-ink/70">
              {p.venue}, {p.city} &middot; from {formatKES(p.minPrice)}
            </p>
          </button>
        ))}
        <Link href={`/events/${pin.slug}`} className="tn-btn tn-btn-primary tn-btn-sm mt-2 w-full">
          <Ticket className="h-4 w-4" /> Get Tickets
        </Link>
      </div>
    </div>
  );
}
