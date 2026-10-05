import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** PWA manifest — mobile ticket access with offline QR availability. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Event Tickets for East Africa`,
    short_name: "TicketNest",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000820",
    theme_color: "#000820",
    orientation: "portrait",
    categories: ["entertainment", "events", "lifestyle"],
    icons: [
      { src: "/favicon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
