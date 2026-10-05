import Link from "next/link";
import Image from "next/image";
import {
  Music,
  Trophy,
  Laugh,
  Utensils,
  Presentation,
  Palette,
  Users,
  Baby,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import EventCard from "@/components/events/EventCard";
import Reveal from "@/components/ui/Reveal";
import { allEvents, isSoldOut } from "@/lib/events-service";
import { CATEGORIES, formatEventDateShort } from "@/lib/site";
import { getBlogPosts } from "@/lib/data/blog";

export const revalidate = 60;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  music: Music,
  sports: Trophy,
  comedy: Laugh,
  "food-and-drink": Utensils,
  conferences: Presentation,
  "arts-and-culture": Palette,
  networking: Users,
  family: Baby,
};

export default async function HomePage() {
  const events = await allEvents();
  const live = events.filter((e) => e.status === "live");
  const featured = live
    .filter((e) => e.featured)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 6);
  const posts = getBlogPosts().slice(0, 3);

  return (
    <>
      <Hero />

      {/* Featured and upcoming events */}
      <section className="tn-section" id="featured-events">
        <div className="tn-container">
          <div className="tn-section-title">
            <h2>Featured and Upcoming Events</h2>
            <p>Hand-picked experiences happening across East Africa.</p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event, i) => (
              <Reveal key={event.slug} delay={i * 65} className="h-full">
                <EventCard event={event} soldOut={isSoldOut(event)} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/events" className="tn-btn tn-btn-outline">
              Browse All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="tn-section bg-light">
        <div className="tn-container">
          <div className="tn-section-title">
            <h2>Browse by Category</h2>
            <p>Whatever your crowd, we have a ticket for it.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Music;
              return (
                <Reveal key={c.slug} delay={i * 65}>
                  <Link
                    href={`/events/category/${c.slug}`}
                    className="tn-card group flex flex-col items-center gap-3 px-4 py-7 text-center transition-all hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 transition-colors group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-5 w-5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                    </span>
                    <span className="font-display text-[15px] font-semibold text-heading group-hover:text-accent">
                      {c.name}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* Trust band */}
      <section className="tn-section tn-dark-section">
        <div className="tn-container grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: "M-Pesa and Card",
              text: "Pay with M-Pesa STK push in seconds, or Visa and Mastercard for international buyers.",
            },
            {
              icon: ShieldCheck,
              title: "Verified QR Tickets",
              text: "Every ticket carries a signed QR code checked at the door. No fakes, no double sales.",
            },
            {
              icon: Zap,
              title: "Instant Delivery",
              text: "Tickets arrive by email and WhatsApp the moment payment clears. Transfer them any time.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 65}>
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dark-surface">
                  <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                <p className="max-w-xs text-[14px] leading-relaxed text-white/70">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Blog teaser */}
      <section className="tn-section">
        <div className="tn-container">
          <div className="tn-section-title">
            <h2>Event Guides and Stories</h2>
            <p>Planning tips, ticketing guides and post-event recaps.</p>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 65} className="h-full">
                <Link href={`/blog/${post.slug}`} className="tn-card group flex h-full flex-col">
                  <div className="relative aspect-[16/9] overflow-hidden bg-dark">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="tn-meta">
                      {post.category} &middot; {post.readMinutes} min read
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-heading group-hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[14px] text-ink/70">{post.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/blog" className="tn-btn tn-btn-outline">
              Read the Blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
