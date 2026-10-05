import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TicketNest Kenya collects, uses and protects your personal data, including your rights under the Kenya Data Protection Act 2019.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="1 October 2026"
      intro={`This Privacy Policy explains how ${SITE.name} ("TicketNest", "we", "us") collects, uses, discloses and safeguards your personal data when you use our website, mobile apps and ticketing services. We are the data controller for this data and we process it in accordance with the Kenya Data Protection Act, 2019 ("KDPA").`}
      index={[
        { id: "information-we-collect", label: "Information We Collect" },
        { id: "ticket-purchase-data", label: "Ticket Purchase Data" },
        { id: "payment-processing", label: "Payment Processing" },
        { id: "third-party-integrations", label: "Third Party Integrations" },
        { id: "your-rights", label: "Your Rights Under the Kenya Data Protection Act" },
        { id: "cookies", label: "Cookies" },
        { id: "contact-us", label: "Contact Us" },
      ]}
    >
      <LegalSection id="information-we-collect" title="Information We Collect">
        <p>We collect information you provide directly and data collected automatically as you use the platform:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Account data:</strong> name, email address, phone number and hashed password when you register as a buyer or organiser.</li>
          <li><strong>Profile data:</strong> organiser bio, payout destination (M-Pesa number or bank details) and KRA PIN where required for tax reporting.</li>
          <li><strong>Usage data:</strong> pages visited, events viewed, searches made, device and browser type, IP address and approximate location derived from IP.</li>
          <li><strong>Communications:</strong> messages you send us through contact forms, email or WhatsApp.</li>
        </ul>
        <p>We only collect what we need to run the platform, deliver tickets and meet our legal obligations. We never sell your personal data.</p>
      </LegalSection>

      <LegalSection id="ticket-purchase-data" title="Ticket Purchase Data">
        <p>When you buy a ticket we process:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Attendee name, email, phone number and national ID or passport number (for age-restricted events and identity verification at the gate).</li>
          <li>The events you bought tickets for, tiers, quantities and order references.</li>
          <li>Per-ticket attendee names you optionally add for transferable tickets.</li>
        </ul>
        <p>Purchase data is retained for up to seven (7) years to satisfy accounting and tax obligations. Identity numbers are retained only as long as necessary for the event and any refund window, then deleted. We share attendee names with event organisers so they can run their events; organisers are contractually barred from using your data for any other purpose.</p>
      </LegalSection>

      <LegalSection id="payment-processing" title="Payment Processing">
        <p>We process M-Pesa payments through Safaricom&apos;s Daraja API and card payments through Stripe. We never see or store your M-Pesa PIN, card number, expiry or CVC. Payment processors return only a transaction reference, amount and status to us, which we store with your order for reconciliation and refunds.</p>
        <p>Organiser payouts are sent via M-Pesa B2C or bank transfer using the destination details you provide in your organiser settings.</p>
      </LegalSection>

      <LegalSection id="third-party-integrations" title="Third Party Integrations">
        <p>The platform integrates with these processors and service providers, each governed by their own privacy terms:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Safaricom Daraja</strong> (M-Pesa STK push and B2C payouts)</li>
          <li><strong>Stripe</strong> (card payments for international buyers)</li>
          <li><strong>Google reCAPTCHA and Google Maps</strong> (abuse prevention and venue maps)</li>
          <li><strong>WhatsApp / Meta Cloud API</strong> (ticket delivery and support chat)</li>
          <li><strong>SendGrid or our SMTP provider</strong> (order confirmations and event reminders)</li>
          <li><strong>Vercel</strong> (hosting, Vercel KV storage and Vercel Blob media storage)</li>
        </ul>
        <p>All processors are bound by data processing agreements and, where data leaves Kenya, appropriate safeguards including standard contractual clauses.</p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your Rights Under the Kenya Data Protection Act">
        <p>Under the KDPA you have the right to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Be informed about how your personal data is processed.</li>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of your data (&quot;right to be forgotten&quot;), subject to our legal retention duties.</li>
          <li>Object to processing of your data, including direct marketing.</li>
          <li>Data portability: receive your data in a structured, machine-readable format.</li>
          <li>Lodge a complaint with the Office of the Data Protection Commissioner (ODPC).</li>
        </ul>
        <p>To exercise any of these rights, email <strong>privacy@ticketnest.co.ke</strong> or use the contact details below. We respond within seven (7) days.</p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>We use cookies and similar technologies to keep you signed in, remember your city and category preferences, understand how the platform is used and, with your consent, personalise event recommendations. Full details, including the categories of cookies and how to change your choices at any time, are in our <a href="/legal/cookie-policy" className="font-semibold text-accent hover:underline">Cookie Policy</a>.</p>
      </LegalSection>

      <LegalSection id="contact-us" title="Contact Us">
        <p>
          TicketNest Kenya &middot; {SITE.address} &middot; {SITE.phone} &middot; {SITE.email}
        </p>
        <p>Data Protection enquiries: <strong>privacy@ticketnest.co.ke</strong>. You may also lodge a complaint with the Office of the Data Protection Commissioner at complaints@odpc.go.ke.</p>
      </LegalSection>
    </LegalLayout>
  );
}
