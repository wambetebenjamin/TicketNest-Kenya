# TicketNest Kenya

East Africa's event ticketing platform — built with **Next.js 14 (App Router, TypeScript)** from the uploaded **TheEvent** design source (`theevent-1.0.0.zip`).

Every Great Experience Starts With a Ticket.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

The platform runs **fully in demo mode with zero configuration** — M-Pesa, Stripe,
reCAPTCHA, email and WhatsApp calls are simulated when their env keys are absent,
while all production code paths activate automatically once keys are provided.

### Demo accounts (seeded on first sign-in attempt)

| Role | Email | Password |
| --- | --- | --- |
| Buyer | `buyer@demo.ticketnest.co.ke` | `Demo1234!` |
| Organiser | `organiser@demo.ticketnest.co.ke` | `Demo1234!` |

## What's inside

- **Buyer flow:** browse/filter events (grid + map view), event pages with tier
  tables, multi-step checkout (cart → attendee → M-Pesa STK push / Stripe card →
  confirmation with Three.js confetti and animated QR tickets), My Tickets with
  QR download, WhatsApp transfer and wallet placeholders.
- **Organiser flow:** 5-step event creation (up to 6 tiers, poster upload,
  platform-fee disclosure, reCAPTCHA v3 on publish), dashboard with Recharts
  revenue/tier analytics, attendee check-in toggles, M-Pesa B2C payout requests.
- **Trust and legal:** reCAPTCHA v3 on every user-facing form (server-verified,
  v2 challenge fallback below score 0.5), KDPA-compliant cookie consent with
  preference toggles, Privacy Policy / Terms / Cookie Policy, branded 404 and
  500 pages.
- **SEO / PWA:** Event and Organization JSON-LD, per-event Open Graph, dynamic
  sitemap, robots, PWA manifest, offline ticket service worker, ISR (60s) on
  event pages, SSR-only checkout/dashboards, edge rate limiting, security
  headers via `next.config.mjs` and `vercel.json`.

## Environment variables

See [`.env.example`](./.env.example) for every variable the code references
(NextAuth, reCAPTCHA, M-Pesa Daraja, Stripe, Vercel KV/Blob, SMTP, WhatsApp
Cloud API, Google Maps). Secrets live in environment variables only.

## Design source

The zip in the repository root is the design source. Full inspection report:
[`docs/ZIP-INSPECTION.md`](./docs/ZIP-INSPECTION.md). Photo credits:
[`image-credits.md`](./image-credits.md).

## API surface

`/api/events` · `/api/events/[slug]` · `/api/cart` · `/api/checkout` ·
`/api/mpesa/callback` · `/api/tickets/[id]` (QR PNG + verification) ·
`/api/tickets/transfer` · `/api/organiser/events` · `/api/organiser/sales` ·
`/api/organiser/payout` · `/api/checkin` · `/api/blog` · `/api/newsletter` ·
`/api/contact` · `/api/captcha` · `/api/auth/[...nextauth]`

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add a **Vercel KV** store (cart sessions, newsletter, availability counters)
   and **Vercel Blob** store (event posters) — env vars are injected automatically.
3. Fill the remaining env vars from `.env.example` (Daraja, Stripe, reCAPTCHA,
   SMTP, WhatsApp, Maps).
4. Set `MPESA_CALLBACK_URL=https://<your-domain>/api/mpesa/callback`.
