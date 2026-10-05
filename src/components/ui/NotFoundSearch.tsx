"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Search bar on the 404 page — routes to /events with the keyword. */
export default function NotFoundSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/events?q=${encodeURIComponent(q.trim())}` : "/events");
      }}
      role="search"
      aria-label="Search events"
      className="relative"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events, artists or venues..."
        aria-label="Search events, artists or venues"
        className="tn-input !border-white/20 !bg-white/10 !py-3 !pl-11 !text-white placeholder:!text-white/40"
      />
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40" style={{ width: 18, height: 18 }} />
      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 tn-btn tn-btn-primary tn-btn-sm !py-2">
        Search
      </button>
    </form>
  );
}
