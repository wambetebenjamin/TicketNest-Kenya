"use client";

import { RotateCcw } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

/** Branded 500 — "Something went wrong. We are looking into it." with Try Again. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="tn-section tn-dark-section flex min-h-[70vh] items-center">
      <div className="tn-container max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-dark-surface">
          <LogoMark size={44} />
        </div>
        <p className="mt-6 font-display text-[64px] font-extrabold leading-none text-white/12">500</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
          Something went wrong. We are looking into it.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/70">
          Our team has been notified automatically. This is usually temporary, so give it another
          try.
        </p>
        <button onClick={reset} className="tn-btn tn-btn-primary mt-7">
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
      </div>
    </section>
  );
}
