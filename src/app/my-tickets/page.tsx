import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTicketsForEmail, ticketQrPayload } from "@/lib/events-service";
import MyTicketsList from "@/components/tickets/MyTicketsList";

export const metadata: Metadata = { title: "My Tickets" };
export const dynamic = "force-dynamic"; // SSR only

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";
  const tickets = (await getTicketsForEmail(email)).map((t) => ({
    ...t,
    qrPayload: ticketQrPayload(t.id),
  }));

  return (
    <section className="tn-section bg-light">
      <div className="tn-container max-w-4xl">
        <h1 className="font-display text-3xl font-extrabold text-heading">My Tickets</h1>
        <p className="mt-2 text-[14px] text-ink/70">
          Karibu, {session?.user?.name ?? "friend"}. Your tickets live here, offline-ready with QR
          codes for the gate.
        </p>
        <MyTicketsList tickets={tickets} />
      </div>
    </section>
  );
}
