"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";

/**
 * Branded loading screen.
 * - TicketNest logo mark appears from center.
 * - A scanning animation sweeps across a ticket shape, left to right.
 * - Progress percentage counts up to 100.
 * - Page content fades in on completion.
 * - Total duration under 2 seconds; shown once per browser session.
 */
export default function Loader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect users who have already seen the loader this session
    if (sessionStorage.getItem("tn_loader_done") === "1") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      sessionStorage.setItem("tn_loader_done", "1");
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const DURATION = 1500; // under 2s on fast connections
    let raf: number;
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / DURATION) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("tn_loader_done", "1");
          document.body.style.overflow = "";
        }, 120);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`tn-loader ${progress >= 100 ? "tn-loader--done" : ""}`}
      role="status"
      aria-label="Loading TicketNest"
    >
      <div className="tn-loader__logo">
        <LogoMark size={64} />
      </div>
      <div className="tn-loader__ticket" aria-hidden="true">
        <div className="tn-loader__scan" />
      </div>
      <div className="tn-loader__bar">
        <div className="tn-loader__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="tn-loader__progress">{progress}%</div>
    </div>
  );
}
