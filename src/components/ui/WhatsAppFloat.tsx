"use client";

import { useState } from "react";
import { WHATSAPP_HELP_URL } from "@/lib/site";

/** Floating WhatsApp button, bottom-right, with tooltip. */
export default function WhatsAppFloat() {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[999990] flex items-center gap-3">
      {showTip && (
        <div className="tn-fade-swap max-w-[220px] rounded-lg bg-dark px-3.5 py-2.5 text-[12px] leading-snug text-white shadow-xl">
          Ask about an event or get ticketing help
        </div>
      )}
      <a
        href={WHATSAPP_HELP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with TicketNest on WhatsApp"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        className="tn-wa-float flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
          <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.594 4.466 1.72 6.412L3.2 28.8l6.564-1.68a12.74 12.74 0 0 0 6.24 1.62c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.74-12.8-12.74zm0 23.02a10.2 10.2 0 0 1-5.196-1.418l-.372-.222-3.858.988 1.03-3.76-.244-.386A10.194 10.194 0 0 1 5.804 16c0-5.63 4.58-10.204 10.2-10.204S26.196 10.37 26.196 16 21.626 26.22 16.004 26.22zm5.606-7.638c-.308-.154-1.818-.897-2.099-.999-.282-.102-.486-.154-.69.154-.205.308-.794.998-.973 1.202-.18.205-.359.23-.667.078-.308-.155-1.3-.479-2.476-1.528-.915-.816-1.533-1.824-1.713-2.132-.179-.308-.019-.475.135-.629.154-.153.384-.374.538-.538.154-.163.226-.308.346-.513.12-.205.09-.423-.004-.581-.094-.157-.854-2.057-1.17-2.815-.308-.74-.62-.757-.854-.77-.22-.012-.472-.015-.724-.015-.252 0-.66.094-1.005.472-.344.377-1.314 1.283-1.314 3.13 0 1.846 1.345 3.63 1.532 3.885.186.254 2.558 4.047 6.252 5.5.874.343 1.556.548 2.088.702.877.278 1.675.239 2.306.145.704-.105 2.248-.919 2.565-1.807.318-.889.318-1.65.223-1.808-.094-.157-.299-.25-.607-.404z" />
        </svg>
      </a>
    </div>
  );
}
