import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Ticket purchase terms, refund conditions, event cancellation policy, organiser terms, platform fees and governing law for TicketNest Kenya.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      updated="1 October 2026"
      intro={`These Terms and Conditions govern your use of ${SITE.name} ("TicketNest", "we", "us") as a ticket buyer or event organiser. By creating an account, buying a ticket or publishing an event you accept these terms. If you do not agree, please do not use the platform.`}
      index={[
        { id: "ticket-purchase-terms", label: "Ticket Purchase Terms" },
        { id: "refund-policy", label: "No Refund Policy and Refund Conditions" },
        { id: "event-cancellation", label: "Event Cancellation Policy" },
        { id: "organiser-terms", label: "Organiser Terms" },
        { id: "platform-fees", label: "Platform Fees" },
        { id: "prohibited-activities", label: "Prohibited Activities" },
        { id: "governing-law", label: "Governing Law: Kenya" },
      ]}
    >
      <LegalSection id="ticket-purchase-terms" title="Ticket Purchase Terms">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>A ticket is a revocable licence to attend an event. It is not a security or an investment.</li>
          <li>Tickets are sold by the event organiser; TicketNest acts as the organiser&apos;s authorised ticketing agent.</li>
          <li>Your QR code is unique and signed. Each ticket scans once at the gate. Screenshots of forwarded QR codes that have already been scanned will be refused.</li>
          <li>For age-restricted (18+) events, you must present a valid national ID, passport or alien card matching the attendee name on the ticket.</li>
          <li>Tickets may be transferred to another attendee through the official <Link href="/my-tickets" className="font-semibold text-accent hover:underline">My Tickets</Link> transfer feature up to the event start time, where the tier is marked transferable.</li>
          <li>Buying tickets in bulk for resale above face value is prohibited and voids the licence.</li>
          <li>Buyers pay a KES 100 service fee per ticket at checkout.</li>
        </ul>
      </LegalSection>

      <LegalSection id="refund-policy" title="No Refund Policy and Refund Conditions">
        <p><strong>All ticket sales are final. Tickets are non-refundable.</strong> Our default position is a no refund policy, because organisers commit production costs based on sales. Exceptions apply in these circumstances, where face value (ticket price, excluding the KES 100 service fee) is refunded to the original payment method within 14 days:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The event is cancelled and not rescheduled.</li>
          <li>The event is postponed and you cannot attend the new date, provided you request the refund within 7 days of the postponement announcement.</li>
          <li>The event is materially different from what was advertised (headline act changed, venue moved to a different city) and the organiser approves refunds.</li>
          <li>You were charged in error due to a platform fault (duplicate charge, wrong amount).</li>
        </ul>
        <p>To request a refund under these conditions, submit a request through <Link href="/contact" className="font-semibold text-accent hover:underline">Buyer Support</Link> with your order reference. Refund requests are assessed within 3 business days.</p>
      </LegalSection>

      <LegalSection id="event-cancellation" title="Event Cancellation Policy">
        <p>If an organiser cancels an event, all buyers receive an automatic refund of face value to the original payment method, and the organiser&apos;s payout for that event is withheld. TicketNest may cancel or delist events that breach these terms, mislead buyers, or are unlawful, with refunds issued to affected buyers and deducted from the organiser&apos;s balance.</p>
        <p>In case of force majeure (government restrictions, natural disasters, civil unrest, public health directives), events may be rescheduled rather than refunded; if no new date is confirmed within 60 days, refunds are processed automatically.</p>
      </LegalSection>

      <LegalSection id="organiser-terms" title="Organiser Terms">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>You must be 18 or older and legally able to contract to publish events on TicketNest.</li>
          <li>You warrant that you have the right to sell tickets for the event, own or are licensed to use all media you upload, and that your event listing is accurate.</li>
          <li>You are responsible for delivering the event as described, including door control, safety and compliance with county and national regulations.</li>
          <li>Tier availability counters are enforced by the platform. Overselling beyond your stated capacity is not possible through TicketNest.</li>
          <li>Attendee data (names, emails, check-in status) is provided to you solely to run your event. You may not use it for marketing or share it with third parties.</li>
          <li>Payouts are released on request, next business day, via M-Pesa B2C or bank transfer, minus the platform fee.</li>
          <li>We may remove events that are fraudulent, unlawful, discriminatory or that repeatedly attract valid buyer complaints.</li>
        </ul>
      </LegalSection>

      <LegalSection id="platform-fees" title="Platform Fees">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Buyers:</strong> KES 100 service fee per ticket, shown before payment.</li>
          <li><strong>Organisers:</strong> 5% platform fee on ticket revenue, deducted from payouts. No setup or monthly fees.</li>
          <li>Payout minimum: KES 500. Payment processor fees for card transactions are included in the platform fee.</li>
        </ul>
        <p>Fees are displayed clearly before you publish an event or complete a purchase, and never change after the fact.</p>
      </LegalSection>

      <LegalSection id="prohibited-activities" title="Prohibited Activities">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Reselling tickets above face value or bulk buying for resale.</li>
          <li>Forging, altering or duplicating QR codes, or attempting to defeat door verification.</li>
          <li>Scraping, automated access, reverse engineering or load-testing the platform without written permission.</li>
          <li>Uploading content you do not own, or listings for events you are not authorised to sell.</li>
          <li>Using attendee data for marketing or sharing it with third parties.</li>
          <li>Publishing events that are unlawful, discriminatory, sexually exploitative, or that infringe any Kenyan law.</li>
          <li>Bypassing rate limits, spamming forms or otherwise abusing our endpoints.</li>
        </ul>
        <p>Violations may result in immediate account termination, event delisting, fund holds and, where warranted, referral to law enforcement.</p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing Law: Kenya">
        <p>These terms are governed by the laws of the Republic of Kenya. The courts of Kenya have exclusive jurisdiction over any dispute arising from your use of TicketNest. Nothing in these terms limits your statutory rights as a consumer under Kenyan law, including the Consumer Protection Act, 2012 and the Kenya Data Protection Act, 2019.</p>
        <p>If any provision of these terms is found unenforceable, the remaining provisions continue in full force.</p>
      </LegalSection>
    </LegalLayout>
  );
}
