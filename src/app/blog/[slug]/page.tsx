import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import { getBlogPosts, getBlogPostContent } from "@/lib/data/blog";

export const revalidate = 300;

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPosts().find((p) => p.slug === params.slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPosts().find((p) => p.slug === params.slug);
  if (!post) notFound();
  const content = await getBlogPostContent(post.slug);
  if (!content) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "TicketNest Kenya" },
    datePublished: post.publishedAt,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        <section className="relative h-[36vh] min-h-[260px] bg-dark">
          <Image src={post.cover} alt={post.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-dark/25" />
          <div className="tn-container absolute inset-x-0 bottom-0 pb-8">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All Articles
            </Link>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {post.title}
            </h1>
          </div>
        </section>

        <section className="tn-section">
          <div className="tn-container max-w-3xl">
            <p className="tn-meta border-b border-black/10 pb-5">
              {post.category} &middot; by {post.author} &middot;{" "}
              {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              &middot; {post.readMinutes} min read
            </p>

            <div className="prose-ticket mt-8">
              <MDXRemote source={content} />
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
