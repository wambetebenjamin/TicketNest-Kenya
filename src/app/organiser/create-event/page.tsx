import type { Metadata } from "next";
import CreateEventForm from "@/components/organiser/CreateEventForm";

export const metadata: Metadata = { title: "Create an Event" };
export const dynamic = "force-dynamic";

export default function CreateEventPage() {
  return (
    <section className="tn-section bg-light">
      <div className="tn-container max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold text-heading">Create an Event</h1>
        <p className="mt-2 text-[14px] text-ink/70">
          Five quick steps. Save drafts any time, publish when you are ready.
        </p>
        <CreateEventForm />
      </div>
    </section>
  );
}
