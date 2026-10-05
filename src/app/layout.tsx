import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Loader from "@/components/ui/Loader";
import CookieConsent from "@/components/ui/CookieConsent";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import ServiceWorker from "@/components/ui/ServiceWorker";
import Providers from "@/components/providers";
import { SITE } from "@/lib/site";

// Fonts from the design source (theevent-1.0.0): Roboto (body) + Raleway
// (headings + nav), loaded from Google Fonts with preconnect — identical to
// the source's index.html <head>, with the same weight range.
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Event Tickets for East Africa`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "event tickets Kenya",
    "Nairobi events",
    "concert tickets",
    "M-Pesa ticketing",
    "East Africa events",
    "festival tickets",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Every Great Experience Starts With a Ticket`,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: "/images/zip/hero-bg.jpg", width: 1200, height: 630, alt: "TicketNest Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Event Tickets for East Africa`,
    description: SITE.description,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000820",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Organization schema
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.png`,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer support",
      areaServed: "East Africa",
    },
    sameAs: Object.values(SITE.socials),
  };

  return (
    <html lang="en-KE">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href={FONTS_URL} rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>
          <Loader />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999999] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
