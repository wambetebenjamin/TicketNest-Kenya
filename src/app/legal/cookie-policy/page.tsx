import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "The cookies TicketNest Kenya uses, what each one does, and how to manage your consent under the Kenya Data Protection Act 2019.",
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      updated="1 October 2026"
      intro="This Cookie Policy explains what cookies are, which ones TicketNest Kenya uses, why we use them, and how you can control them at any time. It supplements our Privacy Policy and is provided in compliance with the Kenya Data Protection Act, 2019."
      index={[
        { id: "what-are-cookies", label: "What Are Cookies" },
        { id: "cookie-categories", label: "Cookie Categories We Use" },
        { id: "managing-consent", label: "Managing Your Consent" },
        { id: "browser-controls", label: "Browser Controls" },
      ]}
    >
      <LegalSection id="what-are-cookies" title="What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. They let the site remember your actions and preferences (like your sign-in session or your preferred city) over time. We also use similar technologies such as localStorage entries for your cart and consent choices.</p>
      </LegalSection>

      <LegalSection id="cookie-categories" title="Cookie Categories We Use">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b-2 border-heading/10 font-display text-[12px] uppercase tracking-wide text-ink/60">
                <th className="py-2.5 pr-4">Category</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/5">
                <td className="py-3 pr-4 font-semibold text-heading">Necessary</td>
                <td className="py-3 pr-4 text-[12px] font-bold text-success">ALWAYS ON</td>
                <td className="py-3">Sign-in session, checkout security, cart contents, load balancing and fraud prevention. The platform cannot function without these.</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="py-3 pr-4 font-semibold text-heading">Functional</td>
                <td className="py-3 pr-4 text-[12px] font-bold text-accent">YOUR CHOICE</td>
                <td className="py-3">Remembering your saved city and category preferences, and the state of filters between visits.</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="py-3 pr-4 font-semibold text-heading">Analytics</td>
                <td className="py-3 pr-4 text-[12px] font-bold text-accent">YOUR CHOICE</td>
                <td className="py-3">Understanding which events and pages help you most, so we can improve discovery. Aggregated and anonymised.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-heading">Marketing</td>
                <td className="py-3 pr-4 text-[12px] font-bold text-accent">YOUR CHOICE</td>
                <td className="py-3">Personalised event recommendations and measuring the performance of our campaigns.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Third parties we rely on (such as Google reCAPTCHA and Google Maps) also set strictly necessary cookies to deliver their services and prevent abuse.</p>
      </LegalSection>

      <LegalSection id="managing-consent" title="Managing Your Consent">
        <p>When you first visit TicketNest you see a consent banner with two options: <strong>Accept All</strong> or <strong>Manage Preferences</strong>. Managing preferences lets you switch Functional, Analytics and Marketing cookies on or off individually. Necessary cookies are locked on because the platform cannot operate without them.</p>
        <p>Your choice is stored on your device and honoured thereafter. You can change it any time by clearing your browser storage for this site, which makes the banner reappear so you can choose again.</p>
      </LegalSection>

      <LegalSection id="browser-controls" title="Browser Controls">
        <p>All major browsers let you block or delete cookies through their settings. Blocking all cookies (including Necessary ones) will prevent you from signing in, checking out or holding a cart. If you prefer a fully cookie-free experience, contact us and we will process your ticket order manually via WhatsApp or email.</p>
      </LegalSection>
    </LegalLayout>
  );
}
