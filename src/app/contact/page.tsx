import type { Metadata } from "next";
import { Mail, MessageCircle, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { SITE, WHATSAPP_HELP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact and Help",
  description:
    "Buyer support and organiser onboarding enquiries. WhatsApp us for the fastest response.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-dark py-12">
        <div className="tn-container">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Help and Contact</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-white/75">
            Buyer support and organiser onboarding. We reply within one business day, usually much
            faster on WhatsApp.
          </p>
        </div>
      </section>

      <section className="tn-section">
        <div className="tn-container grid gap-8 lg:grid-cols-[1fr_360px]">
          <ContactForm />

          <aside className="space-y-4">
            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl bg-[#25D366] p-5 text-white transition-transform hover:scale-[1.01]"
            >
              <MessageCircle className="h-8 w-8 shrink-0" />
              <div>
                <p className="font-display text-[16px] font-bold">Chat on WhatsApp</p>
                <p className="text-[13px] text-white/90">Fastest response, 8am to 8pm EAT</p>
              </div>
            </a>

            <div className="tn-card space-y-4 p-6 text-[13.5px]">
              <p className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="block text-heading">Email</strong>
                  {SITE.supportEmail} for buyers, {SITE.email} for everything else
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="block text-heading">Phone</strong>
                  {SITE.phone}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="block text-heading">Office</strong>
                  {SITE.address}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="block text-heading">Hours</strong>
                  Monday to Saturday, 8:00 AM to 8:00 PM EAT
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-dark p-6 text-white">
              <p className="font-display text-[15px] font-bold">Running an event?</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/75">
                Our onboarding team will set up your organiser account, walk you through tiers and
                payouts, and have you selling the same day.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
