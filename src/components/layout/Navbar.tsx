"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, MapPin, LayoutDashboard, LogOut } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useCart } from "@/lib/cart-context";
import { CITIES } from "@/lib/site";

const NAV_LINKS = [
  { href: "/events", label: "Explore Events" },
  { href: "/organiser/create-event", label: "Sell Tickets" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Help" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { count } = useCart();
  const [activeCity, setActiveCity] = useState<string>("All Cities");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    if (city) setActiveCity(city);
  }, [pathname]);

  const onHero = pathname === "/" && !scrolled;
  const linkColor = onHero ? "text-white/70 hover:text-white" : "text-ink/70 hover:text-accent";

  const selectCity = (city: string) => {
    setActiveCity(city);
    const params = new URLSearchParams(window.location.search);
    if (city === "All Cities") params.delete("city");
    else params.set("city", city);
    const qs = params.toString();
    router.push(`/events${qs ? `?${qs}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-[1000] w-full">
      <nav
        aria-label="Main navigation"
        className={`w-full transition-all duration-500 ${
          onHero ? "bg-transparent" : "tn-navbar--scrolled bg-dark"
        }`}
      >
        <div className="tn-container flex h-[72px] items-center justify-between gap-4">
          <Logo variant="light" size={32} />

          {/* Center links — desktop */}
          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`tn-nav-link relative py-1 ${linkColor} ${
                  pathname.startsWith(l.href) && l.href !== "/" ? "text-accent" : ""
                } after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {session?.user ? (
              <>
                <Link
                  href={session.user.role === "organiser" ? "/organiser/dashboard" : "/my-tickets"}
                  className="hidden items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 tn-nav-link text-white hover:border-white md:inline-flex"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {session.user.role === "organiser" ? "Dashboard" : "My Tickets"}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden items-center gap-1.5 rounded-full px-3 py-2 tn-nav-link text-white/75 hover:text-white md:inline-flex"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="hidden tn-nav-link text-white/80 hover:text-white md:inline-flex">
                  Sign In
                </Link>
                <Link href="/auth/register" className="tn-btn tn-btn-primary tn-btn-sm hidden md:inline-flex">
                  Register
                </Link>
              </>
            )}

            <Link
              href="/checkout"
              aria-label={`Cart with ${count} tickets`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white"
            >
              <ShoppingCart className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-display text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* City filter strip — desktop only, below navbar */}
        <div className="hidden border-t border-white/10 bg-dark/85 backdrop-blur-md lg:block">
          <div className="tn-container flex h-10 items-center gap-1">
            <MapPin className="mr-1 h-3.5 w-3.5 text-accent" />
            {["All Cities", ...CITIES].map((city) => (
              <button
                key={city}
                onClick={() => selectCity(city)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  activeCity === city && pathname.startsWith("/events")
                    ? "bg-accent text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-white/10 bg-dark lg:hidden">
            <div className="tn-container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-3 font-display text-[15px] font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
              {session?.user ? (
                <>
                  <Link
                    href={session.user.role === "organiser" ? "/organiser/dashboard" : "/my-tickets"}
                    className="rounded-lg px-3 py-3 font-display text-[15px] font-semibold text-white/85 hover:bg-white/10"
                  >
                    {session.user.role === "organiser" ? "Dashboard" : "My Tickets"}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-lg px-3 py-3 text-left font-display text-[15px] font-semibold text-white/85 hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="mt-2 flex gap-3 px-3">
                  <Link href="/auth/signin" className="tn-btn tn-btn-ghost-light tn-btn-sm flex-1">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="tn-btn tn-btn-primary tn-btn-sm flex-1">
                    Register
                  </Link>
                </div>
              )}
              <div className="tn-hscroll mt-3 flex gap-2 px-3 pb-1">
                {["All Cities", ...CITIES].map((city) => (
                  <button
                    key={city}
                    onClick={() => selectCity(city)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] ${
                      activeCity === city
                        ? "border-accent bg-accent text-white"
                        : "border-white/25 text-white/75"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
