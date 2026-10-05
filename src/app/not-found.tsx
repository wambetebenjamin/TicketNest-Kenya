import Link from "next/link";
import { Search, Ticket } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import NotFoundSearch from "@/components/ui/NotFoundSearch";

/** Branded 404 — "This event or page could not be found." with search bar below CTA. */
export default function NotFound() {
  return (
    <section className="tn-section tn-dark-section flex min-h-[70vh] items-center">
      <div className="tn-container max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-dark-surface">
          <LogoMark size={44} />
        </div>
        <p className="mt-6 font-display text-[64px] font-extrabold leading-none text-white/12">404</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
          This event or page could not be found.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/70">
          The event may have ended, been cancelled, or the link might have a typo. Try a search, or
          browse everything happening near you.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/events" className="tn-btn tn-btn-primary">
            <Ticket className="h-4 w-4" /> Browse All Events
          </Link>
        </div>

        <div className="mx-auto mt-5 max-w-md">
          <NotFoundSearch />
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-white/50">
          <Search className="h-3.5 w-3.5" />
          Still stuck? WhatsApp us and we will point you to the right gate.
        </p>
      </div>
    </section>
  );
}
