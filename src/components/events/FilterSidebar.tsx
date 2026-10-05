"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CITIES, CATEGORIES, formatKES } from "@/lib/site";

/**
 * Filter sidebar: Category, City, Date range, Price range slider,
 * Free events toggle. Filters sync to URL search params.
 */
export default function FilterSidebar({ maxPriceCap }: { maxPriceCap: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [openMobile, setOpenMobile] = useState(false);

  const category = params.get("category") ?? "";
  const city = params.get("city") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const maxPrice = Number(params.get("maxPrice") ?? maxPriceCap);
  const free = params.get("free") === "1";

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    });
    next.delete("page");
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpenMobile((v) => !v)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-black/15 px-4 py-3 font-display text-[13px] font-semibold text-heading lg:hidden"
        aria-expanded={openMobile}
      >
        <SlidersHorizontal className="h-4 w-4 text-accent" />
        {openMobile ? "Hide Filters" : "Show Filters"}
      </button>

      <aside
        className={`${openMobile ? "block" : "hidden"} lg:block`}
        aria-label="Event filters"
      >
        <div className="tn-card space-y-6 p-5">
          <div>
            <h3 className="tn-label">Category</h3>
            <div className="mt-2 space-y-1">
              <FilterOption
                label="All Categories"
                active={!category}
                onClick={() => update({ category: null })}
              />
              {CATEGORIES.map((c) => (
                <FilterOption
                  key={c.slug}
                  label={c.name}
                  active={category === c.slug}
                  onClick={() => update({ category: category === c.slug ? null : c.slug })}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="tn-label">City</h3>
            <div className="mt-2 space-y-1">
              <FilterOption label="All Cities" active={!city} onClick={() => update({ city: null })} />
              {CITIES.map((c) => (
                <FilterOption
                  key={c}
                  label={c}
                  active={city === c}
                  onClick={() => update({ city: city === c ? null : c })}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="tn-label">Date Range</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="f-from" className="tn-meta">
                  From
                </label>
                <input
                  id="f-from"
                  type="date"
                  value={from}
                  onChange={(e) => update({ from: e.target.value })}
                  className="tn-input !px-2.5 !py-1.5 !text-[13px]"
                />
              </div>
              <div>
                <label htmlFor="f-to" className="tn-meta">
                  To
                </label>
                <input
                  id="f-to"
                  type="date"
                  value={to}
                  onChange={(e) => update({ to: e.target.value })}
                  className="tn-input !px-2.5 !py-1.5 !text-[13px]"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="tn-label">Max Price</h3>
            <input
              type="range"
              min={0}
              max={maxPriceCap}
              step={100}
              value={maxPrice}
              onChange={(e) => update({ maxPrice: e.target.value })}
              className="mt-3 w-full accent-[#f82249]"
              aria-label="Maximum ticket price"
            />
            <div className="mt-1 flex items-center justify-between text-[12px] text-ink/70">
              <span>KES 0</span>
              <span className="font-semibold text-heading">{formatKES(maxPrice)}</span>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-light px-3.5 py-3">
            <span className="font-display text-[13px] font-semibold text-heading">Free events only</span>
            <input
              type="checkbox"
              checked={free}
              onChange={(e) => update({ free: e.target.checked ? "1" : null })}
              className="h-4 w-4 accent-[#f82249]"
            />
          </label>

          <button
            onClick={() => router.push(pathname)}
            className="w-full text-center text-[12px] font-semibold uppercase tracking-wide text-accent hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      </aside>
    </>
  );
}

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors ${
        active ? "bg-accent/10 font-semibold text-accent" : "text-ink/75 hover:bg-light"
      }`}
    >
      {label}
      {active && <span className="text-accent">&bull;</span>}
    </button>
  );
}
