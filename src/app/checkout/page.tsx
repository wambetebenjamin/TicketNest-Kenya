import type { Metadata } from "next";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your tickets, enter attendee details and pay with M-Pesa or card.",
};

export const dynamic = "force-dynamic"; // checkout is SSR only

export default function CheckoutPage() {
  return (
    <section className="tn-section">
      <div className="tn-container">
        <CheckoutFlow />
      </div>
    </section>
  );
}
