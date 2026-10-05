"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

/**
 * Cookie consent banner — Kenya Data Protection Act 2019 compliant.
 * Fixed to bottom, full width, above all content. Consent stored in
 * localStorage; banner hidden permanently after consent.
 */
const STORAGE_KEY = "tn_cookie_consent";

interface Consent {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  ts: string;
}

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({ functional: true, analytics: true, marketing: false });

  useEffect(() => {
    if (!readConsent()) setShow(true);
  }, []);

  const save = (choice: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    } catch {
      /* storage unavailable — session-only consent */
    }
    setShow(false);
    setShowPrefs(false);
  };

  const acceptAll = () =>
    save({ necessary: true, functional: true, analytics: true, marketing: true, ts: new Date().toISOString() });

  if (!show) return null;

  return (
    <>
      {/* Backdrop for preferences modal */}
      {showPrefs && (
        <div className="fixed inset-0 z-[999997] bg-black/50" onClick={() => setShowPrefs(false)} aria-hidden="true" />
      )}

      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed bottom-0 left-0 right-0 z-[999998] w-full bg-dark/97 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        <div className="tn-container py-4 sm:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3 max-w-3xl">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-[13px] leading-relaxed text-white/85">
                We use cookies to personalise your experience, show relevant events, and analyse
                traffic. Read our{" "}
                <Link href="/legal/cookie-policy" className="font-semibold text-accent underline underline-offset-2">
                  Cookie Policy
                </Link>{" "}
                for more details.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                onClick={() => setShowPrefs(true)}
                className="tn-btn tn-btn-ghost-light tn-btn-sm"
              >
                Manage Preferences
              </button>
              <button onClick={acceptAll} className="tn-btn tn-btn-primary tn-btn-sm">
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manage preferences modal */}
      {showPrefs && (
        <div
          role="dialog"
          aria-label="Manage cookie preferences"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-heading">Manage Preferences</h3>
                <p className="tn-meta mt-1">
                  Choose which cookies we may use. Necessary cookies keep the platform working and
                  cannot be switched off.
                </p>
              </div>
              <button
                onClick={() => setShowPrefs(false)}
                aria-label="Close preferences"
                className="rounded-full p-1.5 text-ink/60 hover:bg-light hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Toggle
                label="Necessary"
                description="Session security, checkout and cart function. Always on."
                checked
                disabled
              />
              <Toggle
                label="Functional"
                description="Remember city and category preferences, saved searches."
                checked={prefs.functional}
                onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
              />
              <Toggle
                label="Analytics"
                description="Understand which events and pages help you most."
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <Toggle
                label="Marketing"
                description="Personalised event recommendations and offers."
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[11px] text-ink/60">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Compliant with the Kenya Data Protection Act, 2019
              </p>
              <button
                onClick={() =>
                  save({
                    necessary: true,
                    functional: prefs.functional,
                    analytics: prefs.analytics,
                    marketing: prefs.marketing,
                    ts: new Date().toISOString(),
                  })
                }
                className="tn-btn tn-btn-primary tn-btn-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-black/10 px-4 py-3">
      <div>
        <p className="font-display text-sm font-semibold text-heading">
          {label}
          {disabled && <span className="ml-2 rounded-full bg-light px-2 py-0.5 text-[10px] font-semibold text-ink/60">Locked on</span>}
        </p>
        <p className="text-[12px] leading-snug text-ink/70">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-black/20"
        } ${disabled ? "opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
