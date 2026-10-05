"use client";

import { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";
import { CITIES, CATEGORIES } from "@/lib/site";

/** Newsletter signup — email, city preference, category preferences, reCAPTCHA v3. */
export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [cats, setCats] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const { run, v2Required, setV2Token } = useRecaptchaForm();

  const toggleCat = (slug: string) =>
    setCats((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const { ok, data } = await run("newsletter", (token) =>
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, city, categories: cats, recaptchaToken: token }),
      })
    );
    if (ok) {
      setStatus("done");
      setMessage("You are on the list. Event alerts are on the way.");
      setEmail("");
      setCats([]);
    } else {
      setStatus("error");
      setMessage(((data as { error?: string })?.error) ?? "Could not subscribe. Please try again.");
    }
  };

  return (
    <section className="tn-section tn-dark-section">
      <div className="tn-container">
        <div className="tn-section-title">
          <h2 className="!text-white">Be the first to know</h2>
          <p className="text-white/75">
            Be the first to know about events near you. Fresh drops, presales and
            festival lineups, straight to your inbox.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mx-auto grid w-full max-w-3xl gap-4 rounded-2xl bg-dark-surface p-6 sm:p-8"
        >
          <div>
            <label htmlFor="nl-email" className="tn-label !text-white/85">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                id="nl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="tn-input !border-white/20 !bg-white/10 !pl-10 !text-white placeholder:!text-white/40"
              />
            </div>
          </div>

          <div>
            <label htmlFor="nl-city" className="tn-label !text-white/85">
              City preference
            </label>
            <select
              id="nl-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="tn-select !border-white/20 !bg-white/10 !text-white [&>option]:text-ink"
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="tn-label !text-white/85">Category preferences</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() => toggleCat(c.slug)}
                  aria-pressed={cats.includes(c.slug)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                    cats.includes(c.slug)
                      ? "border-accent bg-accent text-white"
                      : "border-white/25 text-white/75 hover:border-white/60"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>

          {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}

          {status === "done" ? (
            <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <CheckCircle className="h-5 w-5 text-success" /> {message}
            </p>
          ) : (
            <button type="submit" disabled={status === "loading"} className="tn-btn tn-btn-primary">
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          )}
          {status === "error" && (
            <p className="flex items-center gap-2 text-[13px] text-accent">
              <AlertCircle className="h-4 w-4" /> {message}
            </p>
          )}
          <p className="tn-meta !text-white/50">
            We respect your privacy under the Kenya Data Protection Act 2019. Unsubscribe any time.
          </p>
        </form>
      </div>
    </section>
  );
}
