"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

/** WhatsApp share + copy link, on every event page. */
export default function ShareButtons({ eventSlug }: { eventSlug: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/events/${eventSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const waShare = `https://wa.me/?text=${encodeURIComponent(
    `Check out this event on TicketNest Kenya: ${typeof window !== "undefined" ? window.location.origin : "https://ticketnest.co.ke"}/events/${eventSlug}`
  )}`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={waShare}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 font-display text-[12px] font-bold text-white transition-transform hover:scale-[1.03]"
      >
        <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.594 4.466 1.72 6.412L3.2 28.8l6.564-1.68a12.74 12.74 0 0 0 6.24 1.62c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.74-12.8-12.74zm0 23.02a10.2 10.2 0 0 1-5.196-1.418l-.372-.222-3.858.988 1.03-3.76-.244-.386A10.194 10.194 0 0 1 5.804 16c0-5.63 4.58-10.204 10.2-10.204S26.196 10.37 26.196 16 21.626 26.22 16.004 26.22zm5.606-7.638c-.308-.154-1.818-.897-2.099-.999-.282-.102-.486-.154-.69.154-.205.308-.794.998-.973 1.202-.18.205-.359.23-.667.078-.308-.155-1.3-.479-2.476-1.528-.915-.816-1.533-1.824-1.713-2.132-.179-.308-.019-.475.135-.629.154-.153.384-.374.538-.538.154-.163.226-.308.346-.513.12-.205.09-.423-.004-.581-.094-.157-.854-2.057-1.17-2.815-.308-.74-.62-.757-.854-.77-.22-.012-.472-.015-.724-.015-.252 0-.66.094-1.005.472-.344.377-1.314 1.283-1.314 3.13 0 1.846 1.345 3.63 1.532 3.885.186.254 2.558 4.047 6.252 5.5.874.343 1.556.548 2.088.702.877.278 1.675.239 2.306.145.704-.105 2.248-.919 2.565-1.807.318-.889.318-1.65.223-1.808-.094-.157-.299-.25-.607-.404z" />
        </svg>
        Share Event on WhatsApp
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border-2 border-heading/15 px-4 py-2 font-display text-[12px] font-bold text-heading transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? "Link Copied" : "Copy Link"}
      </button>
      <span className="sr-only">
        <Share2 className="h-4 w-4" />
      </span>
    </div>
  );
}
