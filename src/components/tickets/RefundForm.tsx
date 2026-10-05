"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";

/** Refund request form (per order) — reCAPTCHA v3 protected. */
export default function RefundForm({
  orderRef,
  onClose,
}: {
  orderRef: string;
  onClose: () => void;
}) {
  const { run, v2Required, setV2Token } = useRecaptchaForm();
  const [reason, setReason] = useState("cancelled");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { ok, data } = await run("refund_request", (token) =>
      fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef, reason, details, recaptchaToken: token }),
      })
    );
    if (ok) {
      setState("done");
      setMessage(
        `${((data as { message?: string })?.message) ?? "Request received."} Reference: ${
          (data as { reference?: string }).reference
        }.`
      );
    } else {
      setState("error");
      setMessage(((data as { error?: string })?.error) ?? "Could not submit your request.");
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl bg-light p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-[13px] font-bold text-heading">
          Request refund &middot; order {orderRef}
        </p>
        <button type="button" onClick={onClose} aria-label="Close refund form" className="text-ink/50 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div>
        <label className="tn-meta" htmlFor={`rf-reason-${orderRef}`}>Reason</label>
        <select
          id={`rf-reason-${orderRef}`}
          className="tn-select !py-2 !text-[13px]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="cancelled">Event was cancelled</option>
          <option value="postponed">Event postponed and I cannot attend</option>
          <option value="material-change">Event differs from what was advertised</option>
          <option value="duplicate-charge">I was charged in error</option>
          <option value="other">Other (explain below)</option>
        </select>
      </div>
      <div>
        <label className="tn-meta" htmlFor={`rf-details-${orderRef}`}>Details</label>
        <textarea
          id={`rf-details-${orderRef}`}
          required
          minLength={10}
          className="tn-input min-h-20 !py-2 !text-[13px]"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Tell us what happened..."
        />
      </div>
      {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}
      {state === "done" ? (
        <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
          <CheckCircle className="h-4 w-4" /> {message}
        </p>
      ) : (
        <button type="submit" disabled={state === "sending"} className="tn-btn tn-btn-primary tn-btn-sm">
          <RotateCcw className="h-3.5 w-3.5" /> {state === "sending" ? "Submitting..." : "Submit Request"}
        </button>
      )}
      {state === "error" && (
        <p className="flex items-center gap-2 text-[13px] font-semibold text-danger">
          <AlertCircle className="h-4 w-4" /> {message}
        </p>
      )}
      <p className="tn-meta">
        Tickets are non-refundable by default. Refund conditions are in our Terms, and refunds
        return face value to your original payment method within 14 days.
      </p>
    </form>
  );
}
