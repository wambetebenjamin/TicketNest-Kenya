"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";

/** Contact form with reCAPTCHA v3 and buyer/organiser audience routing. */
export default function ContactForm() {
  const { run, v2Required, setV2Token } = useRecaptchaForm();
  const [audience, setAudience] = useState<"buyer" | "organiser">("buyer");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { ok, data } = await run("contact", (token) =>
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, audience, recaptchaToken: token }),
      })
    );
    if (ok) {
      setState("done");
      setMessage(((data as { message?: string })?.message) ?? "Message received.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } else {
      setState("error");
      setMessage(((data as { error?: string })?.error) ?? "Could not send your message.");
    }
  };

  return (
    <form onSubmit={submit} className="tn-card space-y-5 p-6 sm:p-8">
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Who are you?">
        <button
          type="button"
          role="radio"
          aria-checked={audience === "buyer"}
          onClick={() => setAudience("buyer")}
          className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
            audience === "buyer" ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
          }`}
        >
          <p className="font-display text-[13px] font-bold text-heading">Buyer Support</p>
          <p className="tn-meta">Tickets, orders, refunds</p>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={audience === "organiser"}
          onClick={() => setAudience("organiser")}
          className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
            audience === "organiser" ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
          }`}
        >
          <p className="font-display text-[13px] font-bold text-heading">Organiser Enquiry</p>
          <p className="tn-meta">Onboarding and payouts</p>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="tn-label">Name</label>
          <input
            id="ct-name"
            required
            className="tn-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="ct-email" className="tn-label">Email</label>
          <input
            id="ct-email"
            type="email"
            required
            className="tn-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="ct-subject" className="tn-label">Subject</label>
        <input
          id="ct-subject"
          required
          className="tn-input"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="How can we help?"
        />
      </div>
      <div>
        <label htmlFor="ct-message" className="tn-label">Message</label>
        <textarea
          id="ct-message"
          required
          minLength={10}
          className="tn-input min-h-32"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us what happened or what you are planning..."
        />
      </div>

      {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}

      {state === "done" ? (
        <p className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-[14px] font-semibold text-success">
          <CheckCircle className="h-5 w-5" /> {message}
        </p>
      ) : (
        <button type="submit" disabled={state === "sending"} className="tn-btn tn-btn-primary">
          <Send className="h-4 w-4" /> {state === "sending" ? "Sending..." : "Send Message"}
        </button>
      )}
      {state === "error" && (
        <p className="flex items-center gap-2 text-[13px] font-semibold text-danger">
          <AlertCircle className="h-4 w-4" /> {message}
        </p>
      )}
      <p className="tn-meta">Protected by reCAPTCHA v3. We reply within one business day.</p>
    </form>
  );
}
