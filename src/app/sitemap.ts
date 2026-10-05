import type { MetadataRoute } from "next";
import { EVENTS } from "@/lib/data/events";
import { getBlogPosts } from "@/lib/data/blog";
import { CATEGORIES, SITE } from "@/lib/site";

/** Dynamic sitemap from event and blog slugs. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/events",
    "/how-it-works",
    "/blog",
    "/contact",
    "/legal/privacy-policy",
    "/legal/terms",
    "/legal/cookie-policy",
    "/auth/signin",
    "/auth/register",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const eventRoutes = EVENTS.map((e) => ({
    url: `${SITE.url}/events/${e.slug}`,
    lastModified: new Date(e.createdAt),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${SITE.url}/events/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const blogRoutes = getBlogPosts().map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...eventRoutes, ...categoryRoutes, ...blogRoutes];
}
