import type { Metadata } from "next";
import { Suspense } from "react";
import FilterSidebar from "@/components/events/FilterSidebar";
import BrowseResults from "@/components/events/BrowseResults";
import { queryEvents } from "@/lib/events-service";

export const metadata: Metadata = {
  title: "Explore Events",
  description:
    "Browse concerts, festivals, sports, comedy, conferences and experiences across Nairobi, Mombasa, Kisumu, Kampala and Dar es Salaam.",
};

export default async function BrowseEventsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams;
  const q = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const result = await queryEvents({
    category: q("category"),
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

  return (
    <>
      <section className="bg-dark py-12">
        <div className="tn-container">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Explore Events</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-white/75">
            Filter by category, city, date and price. Switch to map view to see everything
            happening around you.
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
