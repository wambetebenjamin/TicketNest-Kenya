import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  organiserEvents,
  eventSales,
  organiserPayouts,
  pendingPayoutBalance,
} from "@/lib/events-service";
import OrganiserDashboard from "@/components/organiser/Dashboard";

export const metadata: Metadata = { title: "Organiser Dashboard" };
export const dynamic = "force-dynamic"; // SSR only

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "organiser") {
    return (
      <section className="tn-section">
        <div className="tn-container max-w-lg text-center">
          <h1 className="font-display text-2xl font-bold text-heading">Organiser access required</h1>
          <p className="mt-2 text-[14px] text-ink/70">
            Sign in with an organiser account to open the dashboard.
          </p>
        </div>
      </section>
    );
  }

  const events = await organiserEvents(null);
  const sales = await Promise.all(
    events.map(async (e) => {
      const s = await eventSales(e.slug);
      return {
        slug: e.slug,
        name: e.name,
        status: e.status,
        startAt: e.startAt,
        city: e.venue.city,
        poster: e.poster,
        tiers: s?.tiers ?? [],
        daily: s?.daily ?? [],
        attendees: s?.attendees ?? [],
        ticketsSold: s?.ticketsSold ?? 0,
        revenue: s?.revenue ?? 0,
      };
    })
  );

  const gross = sales.reduce((s, e) => s + e.revenue, 0);
  const payouts = await organiserPayouts("usr_org_demo");
  const pending = await pendingPayoutBalance("usr_org_demo", gross);

  return (
    <OrganiserDashboard
      organiserName={session.user.name ?? "Organiser"}
      events={sales}
      payouts={payouts}
      pendingBalance={pending}
      grossRevenue={gross}
    />
  );
}
