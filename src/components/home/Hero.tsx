"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import HeroSearchWidget from "@/components/home/HeroSearchWidget";

/**
 * Full-screen hero: real East African concert crowd photo (design source
 * hero-bg), minimal overlay so the photo stays clearly visible, and the
 * headline entering word by word (0.09s stagger, expo ease).
 */
export default function Hero() {
  const words = ["Every", "Great", "Experience", "Starts", "With", "a", "Ticket."];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Slight delay so words animate after first paint (and after loader)
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative -mt-[72px] flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-dark py-16 lg:-mt-[112px]">
      {/* Photo */}
      <div className="absolute inset-0">
        <Image
          src="/images/zip/hero-bg.jpg"
          alt="Live concert crowd at night in East Africa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Minimal overlay — photo stays clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/35 to-dark/80" aria-hidden="true" />

      <div className="tn-container relative z-10 flex flex-col items-center gap-7 text-center">
        <p
          className={`font-display text-[13px] font-semibold uppercase tracking-[0.22em] text-white/85 transition-opacity duration-700 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          Live events across East Africa
        </p>

        <h1 className="max-w-4xl font-display text-[34px] font-extrabold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
          {words.map((word, i) => (
            <span key={i} aria-hidden={i > 0 ? undefined : undefined}>
              <span
                className="tn-hero-word"
                style={{ animationDelay: `${i * 0.09}s` }}
              >
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </span>
            </span>
          ))}
        </h1>

        <p
          className={`max-w-2xl text-[17px] leading-relaxed text-white/85 transition-opacity delay-700 duration-700 sm:text-lg ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          Concerts, festivals, sports, comedy and conferences in Nairobi, Mombasa,
          Kisumu, Kampala and Dar es Salaam. Pay with M-Pesa or card, get your QR
          ticket instantly.
        </p>

        <div className="w-full">
          <HeroSearchWidget />
        </div>
      </div>
    </section>
  );
}
