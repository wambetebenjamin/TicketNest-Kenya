import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/** Shared legal page layout: title band, two-column content with sticky index. */
export default function LegalLayout({
  title,
  updated,
  intro,
  index,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  index: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="bg-dark py-12">
        <div className="tn-container">
          <p className="flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.2em] text-accent">
            <ShieldCheck className="h-4 w-4" /> Legal
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-[13px] text-white/60">Last updated: {updated}</p>
        </div>
      </section>

      <section className="tn-section">
        <div className="tn-container max-w-5xl">
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink/80">{intro}</p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
            <nav aria-label="Contents" className="h-fit rounded-xl bg-light p-5 lg:sticky lg:top-28">
              <p className="tn-label">On this page</p>
              <ul className="mt-2 space-y-1.5">
                {index.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-[13px] text-ink/70 hover:text-accent">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="legal-body space-y-8">{children}</div>
          </div>

          <p className="mt-12 rounded-xl bg-light p-5 text-[13px] leading-relaxed text-ink/70">
            Questions about this document? Email{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              our support team
            </Link>{" "}
            or write to TicketNest Kenya, {`4th Floor, Kasarani Road, Nairobi, Kenya`}.
          </p>
        </div>
      </section>
    </>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display text-xl font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-[1.8] text-ink/80">{children}</div>
    </section>
  );
}
