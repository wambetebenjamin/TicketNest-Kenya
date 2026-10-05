import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BuyerSteps, OrganiserSteps } from "@/components/home/HowItWorksSection";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Buying tickets in three steps, and selling them in three more. M-Pesa checkout, QR tickets and next-day payouts.",
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-dark py-14">
        <div className="tn-container text-center">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">How It Works</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] text-white/75">
            From finding your next night out to getting paid for the one you are running.
            Simple on both sides of the ticket.
          </p>
        </div>
      </section>

      {/* Buyers */}
      <section className="tn-section">
        <div className="tn-container">
          <div className="tn-section-title">
            <h2>For Event Goers</h2>
            <p>Find Event, Buy Ticket, Attend. That&apos;s it.</p>
          </div>
          <BuyerSteps />
          <Reveal delay={120}>
            <div className="mt-10 text-center">
              <Link href="/events" className="tn-btn tn-btn-primary">
                Browse All Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Organisers */}
      <section className="tn-section bg-light" id="organisers">
        <div className="tn-container">
          <div className="tn-section-title">
            <h2>For Organisers</h2>
            <p>Create Event, Sell Tickets, Get Paid.</p>
          </div>
          <OrganiserSteps />

          <Reveal delay={120}>
            <div className="mt-10 grid gap-4 rounded-2xl bg-dark p-8 text-white sm:grid-cols-3">
              {[
                { title: "5% platform fee", text: "On ticket revenue only. No setup fees, no monthly fees, no surprises." },
                { title: "KES 100 service fee", text: "Paid by buyers per ticket at checkout, never deducted from your payout." },
                { title: "Next-day payouts", text: "Withdraw to M-Pesa via B2C or bank transfer, any time above KES 500." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl bg-dark-surface p-5">
                  <p className="flex items-center gap-2 font-display text-[15px] font-bold text-white">
                    <ShieldCheck className="h-4 w-4 text-accent" /> {f.title}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/70">{f.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-10 text-center">
            <Link href="/auth/register?role=organiser" className="tn-btn tn-btn-primary">
              Start Selling Tickets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
