import { MapPin } from "lucide-react";

/**
 * Google Maps venue embed. Uses the Maps Embed API when
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is present; otherwise falls back to the
 * keyless maps embed endpoint so venue maps always render.
 */
export default function MapEmbed({
  query,
  title,
  lat,
  lng,
  height = 300,
}: {
  query: string;
  title: string;
  lat?: number;
  lng?: number;
  height?: number;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const q = lat !== undefined && lng !== undefined ? `${lat},${lng}` : query;
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(q)}&zoom=15`
    : `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;

  return (
    <div className="overflow-hidden rounded-xl border border-black/10">
      <iframe
        title={`${title} map`}
        src={src}
        width="100%"
        height={height}
        style={{ border: 0, height }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="flex items-center gap-2 bg-light px-4 py-2.5 text-[13px] text-ink/75">
        <MapPin className="h-4 w-4 shrink-0 text-accent" />
        {query}
      </p>
    </div>
  );
}
