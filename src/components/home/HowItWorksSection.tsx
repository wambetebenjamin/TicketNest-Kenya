import Link from "next/link";
import {
  Search,
  CreditCard,
  QrCode,
  CalendarPlus,
  BarChart3,
  Wallet,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BUYER_STEPS: Step[] = [
  {
    icon: Search,
    title: "Find Event",
    description:
      "Search by keyword, city, category or date. Browse verified events across East Africa, from Nairobi block parties to Kampala derbies.",
  },
  {
    icon: CreditCard,
    title: "Buy Ticket",
    description:
      "Pay in seconds with M-Pesa STK push or card. Your QR ticket lands in your email and WhatsApp instantly.",
  },
  {
    icon: QrCode,
    title: "Attend",
    description:
      "Show your QR code at the gate for instant scanning. Transfer tickets to friends any time before the event.",
  },
];

const ORGANISER_STEPS: Step[] = [
  {
    icon: CalendarPlus,
    title: "Create Event",
    description:
      "Publish in minutes with poster, venue, lineup and up to six ticket tiers. Draft privately, go live when ready.",
  },
  {
    icon: BarChart3,
    title: "Sell Tickets",
    description:
      "Track sales in real time, scan QR codes at the door and watch your revenue chart grow, day by day.",
  },
  {
    icon: Wallet,
    title: "Get Paid",
    description:
      "Request payouts straight to M-Pesa or bank. Transparent platform fees, no surprises, next-business-day settlement.",
  },
];

function StepColumn({ step, delay }: { step: Step; delay: number }) {
  const Icon = step.icon;
  return (
    <Reveal delay={delay} className="h-full">
      <div className="tn-card flex h-full flex-col p-7 text-center transition-shadow hover:shadow-card-hover">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
        <h3 className="mt-5 font-display text-xl font-bold text-heading">{step.title}</h3>
        <p className="mt-3 text-[14px] leading-relaxed text-ink/75">{step.description}</p>
      </div>
    </Reveal>
  );
}

export function BuyerSteps() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {BUYER_STEPS.map((s, i) => (
        <StepColumn key={s.title} step={s} delay={i * 65} />
      ))}
    </div>
  );
}

export function OrganiserSteps() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {ORGANISER_STEPS.map((s, i) => (
        <StepColumn key={s.title} step={s} delay={i * 65} />
      ))}
    </div>
  );
}

/** Home page section: buyers steps + organiser CTA band. */
export default function HowItWorksSection() {
  return (
    <section className="tn-section bg-light">
      <div className="tn-container">
        <div className="tn-section-title">
          <h2>How It Works</h2>
          <p>Three steps from discovery to the front row.</p>
        </div>
        <BuyerSteps />

        <Reveal delay={120}>
          <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl bg-dark px-8 py-8 text-center md:flex-row md:text-left">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                Running an event? Sell tickets with TicketNest.
              </h3>
              <p className="mt-2 max-w-xl text-[14px] text-white/75">
                M-Pesa and card payments, QR door scanning, real-time analytics and
                fast payouts. Platform fee from just 5%.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/how-it-works#organisers" className="tn-btn tn-btn-ghost-light">
                How Selling Works
              </Link>
              <Link href="/organiser/create-event" className="tn-btn tn-btn-primary">
                Start Selling <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
