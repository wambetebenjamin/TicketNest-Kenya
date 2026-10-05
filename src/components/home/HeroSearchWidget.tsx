"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CITIES, CATEGORIES } from "@/lib/site";

/** Hero event search: keyword, city, category, date range, Find Events. */
export default function HeroSearchWidget() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("All Cities");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (city !== "All Cities") params.set("city", city);
    if (category) params.set("category", category);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    router.push(`/events${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Find events"
      className="mx-auto w-full max-w-4xl rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="hw-keyword" className="tn-label">
            Keyword
          </label>
          <input
            id="hw-keyword"
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Artist, event or venue"
            className="tn-input"
          />
        </div>
        <div>
          <label htmlFor="hw-city" className="tn-label">
            City
          </label>
          <select id="hw-city" value={city} onChange={(e) => setCity(e.target.value)} className="tn-select">
            <option>All Cities</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hw-category" className="tn-label">
            Category
          </label>
          <select
            id="hw-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="tn-select"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:grid-cols-1 lg:grid-rows-[1fr_auto]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="hw-from" className="tn-label">
                From
              </label>
              <input
                id="hw-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="tn-input"
              />
            </div>
            <div>
              <label htmlFor="hw-to" className="tn-label">
                To
              </label>
              <input
                id="hw-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="tn-input"
              />
            </div>
          </div>
          <button type="submit" className="tn-btn tn-btn-primary h-[42px] lg:mt-[26px] lg:w-full">
            <Search className="h-4 w-4" /> Find Events
          </button>
        </div>
      </div>
    </form>
  );
}
