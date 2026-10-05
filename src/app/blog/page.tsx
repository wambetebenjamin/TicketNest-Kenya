import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { getBlogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog and Event Guides",
  description:
    "Event planning tips, ticketing guides and post-event recaps from the TicketNest Kenya team.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <section className="bg-dark py-12">
        <div className="tn-container">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Blog and Event Guides</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-white/75">
            Planning tips, ticketing guides and post-event recaps from the team and the organisers
            who run East Africa&apos;s best nights.
          </p>
        </div>
      </section>

      <section className="tn-section">
        <div className="tn-container">
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
                      {post.category} &middot; {new Date(post.publishedAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })} &middot; {post.readMinutes} min read
                    </p>
                    <h2 className="mt-2 font-display text-lg font-bold leading-snug text-heading group-hover:text-accent">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{post.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold uppercase tracking-wide text-accent">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
