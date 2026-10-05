"use client";

// ---------------------------------------------------------------------------
// Google reCAPTCHA v3 client helper + visible v2 fallback.
//
// Loads the v3 script when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is present. When
// the server responds requireV2 (score below 0.5), a visible reCAPTCHA v2
// challenge is rendered and must be solved before resubmission.
// Demo mode (no keys): execute() returns null and forms submit directly.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      getResponse: (id?: number) => string;
      reset: (id?: number) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (!SITE_KEY) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src*="recaptcha/api.js"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      if (window.grecaptcha) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function recaptchaEnabled(): boolean {
  return Boolean(SITE_KEY);
}

/** Execute reCAPTCHA v3 for an action. Returns the token, or null in demo mode. */
export async function executeRecaptcha(action: string): Promise<string | null> {
  if (!SITE_KEY || typeof window === "undefined") return null;
  await loadScript();
  const g = window.grecaptcha;
  if (!g) return null;
  return new Promise((resolve) => {
    g.ready(() => {
      g.execute(SITE_KEY, { action }).then(resolve).catch(() => resolve(null));
    });
  });
}

/** Visible reCAPTCHA v2 challenge, shown when v3 score is below 0.5. */
export function RecaptchaV2Challenge({
  onSolved,
}: {
  onSolved: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!ref.current || widgetId.current !== null) return;
    const ensure = () => {
      if (window.grecaptcha && ref.current) {
        widgetId.current = window.grecaptcha.render(ref.current, {
          sitekey: SITE_KEY as string,
          callback: (token: string) => onSolved(token),
          theme: "light",
        });
      } else {
        setTimeout(ensure, 200);
      }
    };
    // v2 uses the same enterprise-free api.js entry; render explicit widget
    const s = document.createElement("script");
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      s.src = "https://www.google.com/recaptcha/api.js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    setTimeout(ensure, 250);
  }, [onSolved]);

  return (
    <div className="rounded-lg border border-danger/40 bg-danger/5 p-4">
      <p className="mb-3 text-[13px] font-semibold text-danger">
        Additional verification required. Please complete the challenge below.
      </p>
      <div ref={ref} />
    </div>
  );
}

/** Small hook managing the submit-with-captcha flow incl. v2 fallback. */
export function useRecaptchaForm() {
  const [v2Required, setV2Required] = useState(false);
  const [v2Token, setV2Token] = useState<string | null>(null);

  const run = useCallback(
    async (
      action: string,
      submit: (token: string | null, isV2: boolean) => Promise<Response>
    ): Promise<{ ok: boolean; data: unknown }> => {
      const token = v2Token && v2Required ? v2Token : await executeRecaptcha(action);
      const res = await submit(token, v2Required);
      const data = (await res.json().catch(() => ({}))) as { requireV2?: boolean };
      if (res.status === 400 && data?.requireV2 && !v2Required) {
        setV2Required(true);
        return { ok: false, data };
      }
      return { ok: res.ok, data };
    },
    [v2Required, v2Token]
  );

  return { run, v2Required, setV2Token, setV2Required };
}
