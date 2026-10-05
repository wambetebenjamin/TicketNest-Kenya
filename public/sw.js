/* TicketNest Kenya service worker — offline access to purchased tickets.
   Strategy:
   - Precache the app shell.
   - Network-first for pages; cache fallback for offline.
   - Cache QR code PNGs (stale-while-revalidate) so tickets work offline.
*/
const VERSION = "ticketnest-v1";
const SHELL = ["/", "/my-tickets", "/manifest.webmanifest", "/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // QR ticket PNGs: stale-while-revalidate
  if (url.pathname.startsWith("/api/tickets/") && url.searchParams.get("format") === "png") {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && url.pathname.startsWith("/events")) {
          const clone = res.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Response.error()))
  );
});
