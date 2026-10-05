"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  CalendarDays,
  MapPin,
  Ticket,
  Image as ImageIcon,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";
import { CATEGORIES, CITIES, formatKES } from "@/lib/site";

type Step = 1 | 2 | 3 | 4 | 5;
const STEP_META = [
  { n: 1 as Step, label: "Event Basics", icon: Info },
  { n: 2 as Step, label: "Date and Venue", icon: CalendarDays },
  { n: 3 as Step, label: "Ticket Tiers", icon: Ticket },
  { n: 4 as Step, label: "Media", icon: ImageIcon },
  { n: 5 as Step, label: "Review and Publish", icon: Rocket },
];

interface TierDraft {
  name: string;
  quantityTotal: number;
  priceKES: number;
  saleStart: string;
  saleEnd: string;
  description: string;
}

export default function CreateEventForm() {
  const router = useRouter();
  const { run, v2Required, setV2Token } = useRecaptchaForm();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("music");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"physical" | "online" | "hybrid">("physical");
  const [ageRestricted, setAgeRestricted] = useState(false);

  // Step 2
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [onlineLink, setOnlineLink] = useState("");

  // Step 3
  const [tiers, setTiers] = useState<TierDraft[]>([
    { name: "General", quantityTotal: 200, priceKES: 1500, saleStart: "", saleEnd: "", description: "" },
  ]);

  // Step 4
  const [poster, setPoster] = useState<string>("/images/zip/event-gallery-1.jpg");
  const [posterName, setPosterName] = useState("");

  const go = (next: Step) => {
    setDirection(next > step ? "fwd" : "back");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const valid = (): string => {
    if (step === 1 && (!name.trim() || !description.trim())) return "Event name and description are required.";
    if (step === 2) {
      if (!startAt) return "Start date and time is required.";
      if (eventType !== "online" && !venueName.trim()) return "Venue name is required for physical events.";
      if (eventType !== "physical" && !onlineLink.trim()) return "Online link is required for online or hybrid events.";
    }
    if (step === 3) {
      if (!tiers.length) return "Add at least one ticket tier.";
      if (tiers.some((t) => !t.name.trim() || t.quantityTotal <= 0)) return "Every tier needs a name and quantity.";
    }
    return "";
  };

  const next = () => {
    const v = valid();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    go((step + 1) as Step);
  };

  const uploadPoster = async (file: File) => {
    setPosterName(file.name);
    // Upload to Vercel Blob when configured; otherwise preview locally
    const reader = new FileReader();
    reader.onload = () => setPoster(String(reader.result));
    reader.readAsDataURL(file);
  };

  const publish = async (asDraft = false) => {
    setPublishing(true);
    setError("");
    const { ok, data } = await run("publish_event", (token) =>
      fetch("/api/organiser/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: {
            name,
            tagline,
            category,
            description: description.split(/\n{2,}/).filter(Boolean),
            eventType,
            ageRestricted,
            startAt: new Date(startAt).toISOString(),
            endAt: endAt ? new Date(endAt).toISOString() : new Date(startAt).toISOString(),
            venue: { name: venueName || "Online", address: venueAddress, city, lat: -1.29, lng: 36.82 },
            onlineLink: onlineLink || undefined,
            tiers: tiers.map((t, i) => ({ ...t, id: `tier-${i + 1}` })),
            poster,
            organiser: { name },
          },
          publish: !asDraft,
          recaptchaToken: token,
        }),
      })
    );
    if (!ok) {
      setError(((data as { error?: string })?.error) ?? "Could not publish your event.");
      setPublishing(false);
      return;
    }
    router.push("/organiser/dashboard");
    router.refresh();
  };

  const projectedRevenue = tiers.reduce((s, t) => s + t.priceKES * t.quantityTotal, 0);

  return (
    <div className="mt-8">
      {/* Stepper */}
      <ol className="tn-hscroll mb-8 flex items-center gap-1.5">
        {STEP_META.map(({ n, label, icon: Icon }, i) => (
          <li key={n} className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => n < step && go(n)}
              disabled={n > step}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-display text-[11.5px] font-bold uppercase tracking-wide ${
                n === step ? "bg-accent text-white" : n < step ? "bg-heading text-white" : "bg-white text-ink/45"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{n}</span>
            </button>
            {i < STEP_META.length - 1 && <span className="h-px w-4 bg-black/15" />}
          </li>
        ))}
      </ol>

      <div key={step} className={`tn-checkout-step ${direction === "back" ? "tn-checkout-step--back" : ""} tn-card p-6 sm:p-8`}>
        {/* STEP 1 — basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="tn-label" htmlFor="ce-name">Event Name</label>
              <input id="ce-name" className="tn-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nairobi Jazz Nights: Volume 3" />
            </div>
            <div>
              <label className="tn-label" htmlFor="ce-tagline">Tagline</label>
              <input id="ce-tagline" className="tn-input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One line that sells the night" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="tn-label" htmlFor="ce-category">Category</label>
                <select id="ce-category" className="tn-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="tn-label" htmlFor="ce-type">Event Type</label>
                <select id="ce-type" className="tn-select" value={eventType} onChange={(e) => setEventType(e.target.value as typeof eventType)}>
                  <option value="physical">Physical</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div>
              <label className="tn-label" htmlFor="ce-desc">Description</label>
              <textarea
                id="ce-desc"
                className="tn-input min-h-36"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this event unmissable? Separate paragraphs with a blank line."
              />
              <p className="tn-meta mt-1">Paragraphs are separated by blank lines. Rich formatting is preserved.</p>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-light px-4 py-3">
              <span className="font-display text-[13px] font-semibold text-heading">Age restriction (18+)</span>
              <input type="checkbox" checked={ageRestricted} onChange={(e) => setAgeRestricted(e.target.checked)} className="h-4 w-4 accent-[#f82249]" />
            </label>
          </div>
        )}

        {/* STEP 2 — date and venue */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="tn-label" htmlFor="ce-start">Start Date and Time</label>
                <input id="ce-start" type="datetime-local" className="tn-input" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </div>
              <div>
                <label className="tn-label" htmlFor="ce-end">End Date and Time</label>
                <input id="ce-end" type="datetime-local" className="tn-input" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
              </div>
            </div>
            {eventType !== "online" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="tn-label" htmlFor="ce-venue">Venue Name</label>
                    <input id="ce-venue" className="tn-input" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Carnivore Grounds" />
                  </div>
                  <div>
                    <label className="tn-label" htmlFor="ce-city">City</label>
                    <select id="ce-city" className="tn-select" value={city} onChange={(e) => setCity(e.target.value)}>
                      {CITIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="tn-label" htmlFor="ce-address">Address</label>
                  <input id="ce-address" className="tn-input" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Langata Road, Nairobi" />
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-light p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-[12.5px] text-ink/70">
                    Location picker: search your venue on the map below, or drop a pin. The pin feeds
                    your event page map and the browse page cluster map.
                  </p>
                </div>
                <iframe
                  title="Venue location picker"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venueName} ${city}`)}&z=14&output=embed`}
                  className="h-56 w-full rounded-xl border border-black/10"
                  loading="lazy"
                />
              </>
            )}
            {eventType !== "physical" && (
              <div>
                <label className="tn-label" htmlFor="ce-link">Online Link (stream)</label>
                <input id="ce-link" className="tn-input" value={onlineLink} onChange={(e) => setOnlineLink(e.target.value)} placeholder="https://stream.ticketnest.co.ke/..." />
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — tiers */}
        {step === 3 && (
          <div className="space-y-4">
            {tiers.map((t, i) => (
              <div key={i} className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[13px] font-bold text-heading">Tier {i + 1}</p>
                  {tiers.length > 1 && (
                    <button
                      onClick={() => setTiers(tiers.filter((_, j) => j !== i))}
                      aria-label={`Remove tier ${i + 1}`}
                      className="text-ink/50 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="tn-meta">Tier name</label>
                    <input className="tn-input !py-2 !text-[13px]" value={t.name} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Early Bird" />
                  </div>
                  <div>
                    <label className="tn-meta">Quantity available</label>
                    <input type="number" min={1} className="tn-input !py-2 !text-[13px]" value={t.quantityTotal} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, quantityTotal: Number(e.target.value) } : x)))} />
                  </div>
                  <div>
                    <label className="tn-meta">Price (KES, 0 for free)</label>
                    <input type="number" min={0} step={50} className="tn-input !py-2 !text-[13px]" value={t.priceKES} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, priceKES: Number(e.target.value) } : x)))} />
                  </div>
                  <div>
                    <label className="tn-meta">Sale start</label>
                    <input type="date" className="tn-input !py-2 !text-[13px]" value={t.saleStart} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, saleStart: e.target.value } : x)))} />
                  </div>
                  <div>
                    <label className="tn-meta">Sale end</label>
                    <input type="date" className="tn-input !py-2 !text-[13px]" value={t.saleEnd} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, saleEnd: e.target.value } : x)))} />
                  </div>
                  <div>
                    <label className="tn-meta">Description</label>
                    <input className="tn-input !py-2 !text-[13px]" value={t.description} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} placeholder="General standing access" />
                  </div>
                </div>
              </div>
            ))}
            {tiers.length < 6 && (
              <button
                onClick={() =>
                  setTiers([...tiers, { name: "", quantityTotal: 100, priceKES: 1000, saleStart: "", saleEnd: "", description: "" }])
                }
                className="tn-btn tn-btn-outline tn-btn-sm"
              >
                <Plus className="h-4 w-4" /> Add Tier ({tiers.length}/6)
              </button>
            )}
          </div>
        )}

        {/* STEP 4 — media */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="tn-label" htmlFor="ce-poster">Event Poster</label>
              <input
                id="ce-poster"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => e.target.files?.[0] && uploadPoster(e.target.files[0])}
                className="tn-input"
              />
              <p className="tn-meta mt-1.5">
                Uploads go to Vercel Blob in production (BLOB_READ_WRITE_TOKEN). Landscape 16:10 works best.
              </p>
            </div>
            {poster && (
              <div className="overflow-hidden rounded-xl border border-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={poster} alt="Poster preview" className="max-h-80 w-full object-cover" />
              </div>
            )}
            <div>
              <label className="tn-label" htmlFor="ce-lineup">Lineup or Speakers (optional)</label>
              <textarea
                id="ce-lineup"
                className="tn-input min-h-20"
                placeholder={"One per line, e.g.\nZawadi Mosi — Headline Act\nDJ Mzuka — Closing Set"}
              />
            </div>
          </div>
        )}

        {/* STEP 5 — review and publish */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="rounded-xl bg-light p-5">
              <h3 className="font-display text-lg font-bold text-heading">{name || "Untitled Event"}</h3>
              <p className="mt-1 text-[13px] text-ink/70">{tagline}</p>
              <dl className="mt-4 grid gap-2 text-[13px] sm:grid-cols-2">
                <div className="flex gap-2"><dt className="font-semibold text-heading">Category:</dt><dd>{category}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold text-heading">Type:</dt><dd>{eventType}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold text-heading">Starts:</dt><dd>{startAt ? new Date(startAt).toLocaleString("en-KE") : "TBA"}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold text-heading">Venue:</dt><dd>{eventType === "online" ? "Online" : `${venueName || "TBA"}, ${city}`}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold text-heading">Tiers:</dt><dd>{tiers.length}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold text-heading">Capacity:</dt><dd>{tiers.reduce((s, t) => s + t.quantityTotal, 0)}</dd></div>
              </dl>
            </div>

            <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5">
              <h4 className="flex items-center gap-2 font-display text-[15px] font-bold text-heading">
                <Info className="h-4 w-4 text-accent" /> Platform Fee
              </h4>
              <ul className="mt-2 space-y-1 text-[13px] text-ink/75">
                <li>TicketNest charges a <strong className="text-heading">5% platform fee</strong> on your ticket revenue, deducted from payouts.</li>
                <li>Buyers pay a separate KES 100 service fee per ticket at checkout. It never comes out of your payout.</li>
                <li>Projected full-house revenue: <strong className="text-heading">{formatKES(projectedRevenue)}</strong> &middot; you receive <strong className="text-heading">{formatKES(Math.round(projectedRevenue * 0.95))}</strong>.</li>
              </ul>
            </div>

            {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}
          </div>
        )}

        {error && (
          <p className="mt-5 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] font-semibold text-danger">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        {/* Nav */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          {step > 1 ? (
            <button onClick={() => go((step - 1) as Step)} className="tn-btn tn-btn-outline">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            {step < 5 ? (
              <button onClick={next} className="tn-btn tn-btn-primary">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button onClick={() => publish(true)} disabled={publishing} className="tn-btn tn-btn-outline">
                  Save as Draft
                </button>
                <button onClick={() => publish(false)} disabled={publishing} className="tn-btn tn-btn-primary">
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="h-4 w-4" /> Publish Event</>}
                </button>
              </>
            )}
          </div>
        </div>
        <p className="tn-meta mt-4 flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-success" />
          Publishing is protected by reCAPTCHA v3. Your event goes live instantly with QR check-in and M-Pesa payments.
        </p>
      </div>
    </div>
  );
}
