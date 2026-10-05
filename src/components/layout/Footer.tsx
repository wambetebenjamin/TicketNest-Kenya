import Link from "next/link";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  Ticket,
  Megaphone,
} from "lucide-react";
import LogoMark from "@/components/ui/Logo";
import { SITE, WHATSAPP_HELP_URL, CATEGORIES } from "@/lib/site";

/** Payment method marks (inline, no external assets). */
function PaymentMarks() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-md bg-white px-2.5 py-1 font-display text-[11px] font-extrabold tracking-tight text-[#00a550]">
        M-PESA
      </span>
      <span className="rounded-md bg-[#1A1F71] px-2.5 py-1 font-display text-[11px] font-bold italic tracking-tight text-white">
        VISA
      </span>
      <span className="flex items-center gap-1 rounded-md bg-white px-2 py-1">
        <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
        <span className="-ml-2 h-3.5 w-3.5 rounded-full bg-[#F79E1B]" />
        <span className="ml-1 font-display text-[11px] font-bold italic text-[#2f3138]">mastercard</span>
      </span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="tn-dark-section">
      <div className="tn-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={34} />
              <span className="font-display text-[26px] font-extrabold tracking-wide text-white">
                Ticket<span className="text-accent">Nest</span>
              </span>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-white/70">
              East Africa&apos;s home for event tickets. Discover, buy and share experiences across
              Nairobi, Mombasa, Kisumu, Kampala and Dar es Salaam.
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-white/60">
              {SITE.address}
              <br />
              {SITE.phone} &middot; {SITE.email}
            </p>
            <div className="mt-5">
              <PaymentMarks />
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h4 className="font-display text-[16px] font-semibold text-white">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/70">
              <li><Link href="/events" className="hover:text-accent">Browse All Events</Link></li>
              <li><Link href="/how-it-works" className="hover:text-accent">How It Works</Link></li>
              <li><Link href="/blog" className="hover:text-accent">Blog and Event Guides</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Help and Contact</Link></li>
            </ul>
            <h4 className="mt-7 font-display text-[16px] font-semibold text-white">Top Categories</h4>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/70">
              {CATEGORIES.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link href={`/events/category/${c.slug}`} className="hover:text-accent">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Organiser CTA */}
          <div>
            <h4 className="font-display text-[16px] font-semibold text-white">For Organisers</h4>
            <p className="mt-4 text-[14px] leading-relaxed text-white/70">
              Sell tickets to thousands of East African event goers. M-Pesa and card payments,
              QR check-in, and next-day payouts.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/organiser/create-event" className="tn-btn tn-btn-primary tn-btn-sm self-start">
                <Ticket className="h-4 w-4" /> Create an Event
              </Link>
              <Link href="/auth/register?role=organiser" className="tn-btn tn-btn-ghost-light tn-btn-sm self-start">
                <Megaphone className="h-4 w-4" /> Open an Organiser Account
              </Link>
            </div>
          </div>

          {/* Legal */}
          <nav aria-label="Legal">
            <h4 className="font-display text-[16px] font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/70">
              <li><Link href="/legal/privacy-policy" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-accent">Terms and Conditions</Link></li>
              <li><Link href="/legal/cookie-policy" className="hover:text-accent">Cookie Policy</Link></li>
            </ul>
            <h4 className="mt-7 font-display text-[16px] font-semibold text-white">Follow Us</h4>
            <div className="mt-4 flex items-center gap-3">
              {[
                { href: SITE.socials.instagram, icon: Instagram, label: "Instagram" },
                { href: SITE.socials.twitter, icon: Twitter, label: "X (Twitter)" },
                { href: SITE.socials.facebook, icon: Facebook, label: "Facebook" },
                { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a
                href={WHATSAPP_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp us"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[#25D366] hover:text-[#25D366]"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12px] text-white/55 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            Made in Nairobi for East Africa. Every Great Experience Starts With a Ticket.
          </p>
        </div>
      </div>
    </footer>
  );
}
