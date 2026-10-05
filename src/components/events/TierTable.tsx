"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, CheckCircle, Ticket } from "lucide-react";
import type { TicketTier } from "@/types";
import { formatKES } from "@/lib/site";
import { useCart } from "@/lib/cart-context";

/** Ticket tier table with quantity selector and Add to Cart per tier. */
export default function TierTable({
  eventSlug,
  eventName,
  tiers,
}: {
  eventSlug: string;
  eventName: string;
  tiers: TicketTier[];
}) {
  const { add } = useCart();
  const [added, setAdded] = useState<Record<string, number>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(tiers.map((t) => [t.id, 1]))
  );

  const anyAvailable = tiers.some((t) => t.quantityRemaining > 0);

  return (
    <div className="tn-hscroll w-full">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-heading/10 font-display text-[12px] uppercase tracking-wide text-ink/60">
            <th className="py-3 pr-4 font-semibold">Tier</th>
            <th className="py-3 pr-4 font-semibold">Price</th>
            <th className="py-3 pr-4 font-semibold">Availability</th>
            <th className="py-3 pr-4 font-semibold">Quantity</th>
            <th className="py-3 font-semibold">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => {
            const remaining = tier.quantityRemaining;
            const soldOut = remaining <= 0;
            const qty = quantities[tier.id] ?? 1;
            return (
              <tr key={tier.id} className="border-b border-black/5 align-middle">
                <td className="py-4 pr-4">
                  <p className="font-display text-[15px] font-bold text-heading">{tier.name}</p>
                  <p className="tn-meta mt-0.5 max-w-[220px]">{tier.description}</p>
                </td>
                <td className="py-4 pr-4 font-display text-[16px] font-bold text-accent">
                  {formatKES(tier.priceKES)}
                </td>
                <td className="py-4 pr-4 text-[13px]">
                  {soldOut ? (
                    <span className="font-semibold text-ink/50">Sold out</span>
                  ) : remaining <= 100 ? (
                    <span className="font-semibold text-accent">{remaining} remaining</span>
                  ) : (
                    <span className="text-ink/70">{remaining} remaining</span>
                  )}
                </td>
                <td className="py-4 pr-4">
                  <div className="inline-flex items-center rounded-lg border border-black/15">
                    <button
                      type="button"
                      aria-label={`Decrease ${tier.name} quantity`}
                      disabled={soldOut || qty <= 1}
                      onClick={() => setQuantities((q) => ({ ...q, [tier.id]: Math.max(1, qty - 1) }))}
                      className="px-3 py-1.5 text-ink/70 hover:text-accent disabled:opacity-40"
                    >
                      &minus;
                    </button>
                    <span className="w-8 text-center font-display text-[14px] font-bold">{qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${tier.name} quantity`}
                      disabled={soldOut || qty >= Math.min(10, remaining)}
                      onClick={() =>
                        setQuantities((q) => ({ ...q, [tier.id]: Math.min(10, remaining, qty + 1) }))
                      }
                      className="px-3 py-1.5 text-ink/70 hover:text-accent disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-4">
                  {soldOut ? (
                    <button className="tn-btn tn-btn-primary tn-btn-sm" disabled>
                      Sold Out
                    </button>
                  ) : added[tier.id] ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-success">
                      <CheckCircle className="h-4 w-4" /> Added
                    </span>
                  ) : (
                    <button
                      className="tn-btn tn-btn-primary tn-btn-sm"
                      onClick={() => {
                        add(
                          {
                            tierId: tier.id,
                            eventSlug,
                            tierName: tier.name,
                            priceKES: tier.priceKES,
                            transferable: tier.transferable,
                            eventName,
                          },
                          qty
                        );
                        setAdded((a) => ({ ...a, [tier.id]: qty }));
                        setTimeout(() => setAdded((a) => ({ ...a, [tier.id]: 0 })), 2200);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {anyAvailable && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-light px-4 py-3">
          <p className="flex items-center gap-2 text-[13px] text-ink/70">
            <Ticket className="h-4 w-4 text-accent" />
            A KES 100 service fee per ticket applies at checkout.
          </p>
          <Link href="/checkout" className="tn-btn tn-btn-dark tn-btn-sm">
            Go to Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
