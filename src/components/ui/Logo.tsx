import Link from "next/link";

/** TicketNest logo mark: a ticket shape with a nest-branch ticket slot. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M4 14C4 10.6863 6.68629 8 10 8H38C41.3137 8 44 10.6863 44 14V20C40.6863 20 38 22.6863 38 26C38 29.3137 40.6863 32 44 32V38C44 41.3137 41.3137 44 38 44H10C6.68629 44 4 41.3137 4 38V32C7.31371 32 10 29.3137 10 26C10 22.6863 7.31371 20 4 20V14Z"
        fill="#f82249"
      />
      <path
        d="M18 26.5C18 22.9101 20.9101 20 24.5 20C28.0899 20 31 22.9101 31 26.5C31 30.0899 28.0899 33 24.5 33"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M24.5 33L20 33" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="14.5" r="1.6" fill="#0e1b4d" />
      <circle cx="30" cy="14.5" r="1.6" fill="#0e1b4d" />
    </svg>
  );
}

export default function Logo({
  variant = "dark",
  size = 34,
}: {
  variant?: "dark" | "light";
  size?: number;
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="TicketNest Kenya home">
      <LogoMark size={size} />
      <span
        className={`font-display font-extrabold tracking-wide leading-none text-[26px] ${
          variant === "light" ? "text-white" : "text-heading"
        }`}
      >
        Ticket<span className="text-accent">Nest</span>
      </span>
    </Link>
  );
}
