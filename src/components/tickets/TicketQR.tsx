"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";

/**
 * QR reveal with scan line sweeping top to bottom, 600ms (spec).
 * QR always rendered at a legible minimum of 200x200 pixels.
 */
export default function TicketQR({
  payload,
  size = 200,
  caption,
}: {
  payload: string;
  size?: number;
  caption?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        className={`tn-qr-wrap rounded-xl border-4 border-white bg-white p-3 shadow-lg ${
          visible ? "" : "opacity-0"
        }`}
        style={{ minWidth: size + 24, minHeight: size + 24 }}
      >
        {visible && (
          <>
            <QRCode value={payload} size={size} bgColor="#ffffff" fgColor="#0e1b4d" level="M" />
            <span className="tn-qr-scanline" aria-hidden="true" />
          </>
        )}
      </div>
      {caption && <p className="tn-meta">{caption}</p>}
    </div>
  );
}
