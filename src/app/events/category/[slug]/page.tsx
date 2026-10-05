import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FilterSidebar from "@/components/events/FilterSidebar";
import BrowseResults from "@/components/events/BrowseResults";
import { queryEvents } from "@/lib/events-service";
import { CATEGORIES, categoryName } from "@/lib/site";

export const revalidate = 60;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const name = categoryName(params.slug);
  return {
    title: `${name} Events`,
    description: `Browse ${name.toLowerCase()} events across East Africa on TicketNest Kenya.`,
  };
}

const CATEGORY_BLURBS: Record<string, string> = {
  music: "Concerts, festivals, block parties and live bands across East Africa.",
  sports: "Derbies, tournaments and finals, live and loud.",
  comedy: "Stand-up nights, sketch shows and the punchlines everyone quotes.",
  "food-and-drink": "Food fairs, street food festivals and tasting experiences.",
  conferences: "Summits, forums and industry gatherings worth the badge.",
  "arts-and-culture": "Film, art biennales, theatre and cultural celebrations.",
  networking: "Mixers, pitch nights and rooms where deals happen.",
  family: "Carnivals, fun days and events for all ages.",
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!CATEGORIES.some((c) => c.slug === params.slug)) notFound();
  const sp = searchParams;
  const q = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const result = await queryEvents({
    category: params.slug,
    city: q("city"),
    search: q("q"),
    dateFrom: q("from"),
    dateTo: q("to"),
    maxPrice: q("maxPrice") ? Number(q("maxPrice")) : undefined,
    freeOnly: q("free") === "1",
    sort: (q("sort") as "date" | "price-asc" | "price-desc" | "newest") ?? "date",
    page: q("page") ? Number(q("page")) : 1,
    perPage: 9,
  });

  const name = categoryName(params.slug);

  return (
    <>
      <section className="bg-dark py-12">
        <div className="tn-container">
          <p className="font-display text-[12px] font-bold uppercase tracking-[0.2em] text-accent">Category</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{name} Events</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-white/75">
            {CATEGORY_BLURBS[params.slug] ?? `Browse ${name.toLowerCase()} events.`}
          </p>
        </div>
      </section>

      <section className="tn-section">
        <div className="tn-container grid gap-8 lg:grid-cols-[280px_1fr]">
          <Suspense fallback={<div className="tn-card h-96 animate-pulse bg-light" />}>
            <FilterSidebar maxPriceCap={12000} />
          </Suspense>
          <div>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-light" />}>
              <BrowseResults
                events={result.events}
                total={result.total}
                page={result.page}
                totalPages={result.totalPages}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
