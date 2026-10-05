"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  UserRound,
  CreditCard,
  CheckCircle,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";
import { formatKES, SITE } from "@/lib/site";

type Step = 1 | 2 | 3;
type PayMethod = "mpesa" | "card";

const STEPS: { n: Step; label: string; icon: typeof ShoppingCart }[] = [
  { n: 1, label: "Cart Review", icon: ShoppingCart },
  { n: 2, label: "Attendee Details", icon: UserRound },
  { n: 3, label: "Payment", icon: CreditCard },
];

export default function CheckoutFlow() {
  const router = useRouter();
  const { data: session } = useSession();
  const { lines, setQuantity, remove, clear, ready } = useCart();
  const { run, v2Required, setV2Token } = useRecaptchaForm();

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const [error, setError] = useState("");

  // Attendee
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [perTicket, setPerTicket] = useState<Record<string, string>>({});

  // Payment
  const [method, setMethod] = useState<PayMethod>("mpesa");
  const [payPhone, setPayPhone] = useState("");
  const [cardDemo, setCardDemo] = useState({ number: "", exp: "", cvc: "" });
  const [status, setStatus] = useState<"idle" | "processing" | "polling">("idle");
  const [pollInfo, setPollInfo] = useState<{ orderId: string } | null>(null);

  const amounts = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.priceKES * l.quantity, 0);
    const ticketCount = lines.reduce((s, l) => s + l.quantity, 0);
    const serviceFee = ticketCount * SITE.serviceFeePerTicket;
    return { subtotal, serviceFee, total: subtotal + serviceFee, ticketCount };
  }, [lines]);

  const transferableLines = lines.filter((l) => l.transferable);

  const go = (next: Step) => {
    setDirection(next > step ? "fwd" : "back");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateAttendee = (): boolean => {
    if (!name.trim() || !email.trim() || !phone.trim() || !idNumber.trim()) {
      setError("Please fill in all attendee fields.");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

  const startPayment = async () => {
    setError("");
    if (method === "mpesa" && !payPhone.trim()) {
      setError("Enter the M-Pesa phone number to receive the STK push.");
      return;
    }
    if (method === "card" && cardDemo.number.replace(/\s/g, "").length < 12) {
      setError("Enter your card details.");
      return;
    }

    setStatus("processing");
    const perTicketAttendees = Object.entries(perTicket)
      .filter(([, n]) => n.trim())
      .map(([ticketKey, n]) => ({ ticketKey, name: n.trim() }));

    const { ok, data } = await run("checkout", (token) =>
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: lines,
          attendee: { name, email, phone, idNumber },
          perTicketAttendees,
          payment: { method, phone: method === "mpesa" ? payPhone : undefined, card: method === "card" ? cardDemo : undefined },
          recaptchaToken: token,
        }),
      })
    );

    if (!ok) {
      const d = data as { error?: string; orderId?: string; status?: string };
      if (d?.orderId && d?.status === "pending") {
        // Real STK push flow — poll until the Daraja callback confirms
        setPollInfo({ orderId: d.orderId });
        setStatus("polling");
        pollOrder(d.orderId);
        return;
      }
      setStatus("idle");
      setError(d?.error ?? "Payment could not be initiated. Please try again.");
      return;
    }

    const d = data as { orderId: string };
    clear();
    router.push(`/checkout/confirmation/${d.orderId}`);
  };

  const pollOrder = async (orderId: string) => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/checkout?orderId=${orderId}`);
        const data = (await res.json()) as { status?: string };
        if (data.status === "paid") {
          clearInterval(timer);
          clear();
          router.push(`/checkout/confirmation/${orderId}`);
        } else if (attempts > 30) {
          clearInterval(timer);
          setStatus("idle");
          setError("Payment confirmation timed out. If you completed the M-Pesa prompt, your tickets will still arrive by email.");
        }
      } catch {
        if (attempts > 30) {
          clearInterval(timer);
          setStatus("idle");
        }
      }
    }, 2000);
  };

  if (!ready) {
    return <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-xl bg-light" />;
  }

  if (lines.length === 0 && status !== "polling") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-light p-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-4 font-display text-2xl font-bold text-heading">Your cart is empty</h1>
        <p className="mt-2 text-[14px] text-ink/70">
          Browse events and add tickets to get started.
        </p>
        <Link href="/events" className="tn-btn tn-btn-primary mt-6">
          Browse All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Stepper */}
      <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map(({ n, label, icon: Icon }, i) => {
          const state = n === step ? "current" : n < step ? "done" : "todo";
          return (
            <li key={n} className="flex items-center gap-2 sm:gap-4">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 ${
                  state === "current"
                    ? "bg-accent text-white"
                    : state === "done"
                      ? "bg-heading text-white"
                      : "bg-light text-ink/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden font-display text-[12px] font-bold uppercase tracking-wide sm:inline">
                  {label}
                </span>
                <span className="font-display text-[12px] font-bold sm:hidden">{n}</span>
              </div>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-black/15 sm:w-10" />}
            </li>
          );
        })}
      </ol>

      <div key={step} className={`tn-checkout-step ${direction === "back" ? "tn-checkout-step--back" : ""}`}>
        {/* ---------------- STEP 1: Cart review ---------------- */}
        {step === 1 && (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {lines.map((l) => (
                <div key={`${l.eventSlug}:${l.tierId}`} className="tn-card flex items-center gap-4 p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[15px] font-bold text-heading">{l.eventName}</p>
                    <p className="tn-meta mt-0.5">
                      {l.tierName} &middot; {formatKES(l.priceKES)} each
                    </p>
                    <div className="mt-3 inline-flex items-center rounded-lg border border-black/15">
                      <button
                        aria-label={`Decrease ${l.tierName} quantity`}
                        onClick={() => setQuantity(l.tierId, l.eventSlug, l.quantity - 1)}
                        className="px-3 py-1.5 text-ink/70 hover:text-accent"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-display text-[14px] font-bold">{l.quantity}</span>
                      <button
                        aria-label={`Increase ${l.tierName} quantity`}
                        onClick={() => setQuantity(l.tierId, l.eventSlug, l.quantity + 1)}
                        className="px-3 py-1.5 text-ink/70 hover:text-accent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[16px] font-bold text-heading">
                      {formatKES(l.priceKES * l.quantity)}
                    </p>
                    <button
                      onClick={() => remove(l.tierId, l.eventSlug)}
                      className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-ink/50 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <Link href="/events" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:underline">
                <ArrowLeft className="h-4 w-4" /> Continue shopping
              </Link>
            </div>

            <Summary amounts={amounts}>
              <button
                onClick={() => go(2)}
                className="tn-btn tn-btn-primary w-full"
              >
                Attendee Details <ArrowRight className="h-4 w-4" />
              </button>
            </Summary>
          </div>
        )}

        {/* ---------------- STEP 2: Attendee details ---------------- */}
        {step === 2 && (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="tn-card space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="at-name" className="tn-label">Full Name</label>
                  <input
                    id="at-name"
                    className="tn-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Amina Wekesa"
                  />
                </div>
                <div>
                  <label htmlFor="at-email" className="tn-label">Email</label>
                  <input
                    id="at-email"
                    type="email"
                    className="tn-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="at-phone" className="tn-label">Phone (WhatsApp)</label>
                  <input
                    id="at-phone"
                    className="tn-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="0712 345 678"
                  />
                </div>
                <div>
                  <label htmlFor="at-id" className="tn-label">ID Number (identity verification)</label>
                  <input
                    id="at-id"
                    className="tn-input"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="National ID or passport number"
                  />
                </div>
              </div>

              {transferableLines.length > 0 && (
                <div className="rounded-xl bg-light p-4">
                  <p className="font-display text-[14px] font-bold text-heading">
                    Name attendees for transferable tickets (optional)
                  </p>
                  <p className="tn-meta mt-1">
                    Leave blank to use your name. Named attendees can receive tickets by WhatsApp.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {transferableLines.flatMap((l) =>
                      Array.from({ length: l.quantity }, (_, i) => {
                        const key = `${l.eventSlug}:${l.tierId}:${i}`;
                        return (
                          <div key={key}>
                            <label htmlFor={`pt-${key}`} className="tn-meta">
                              {l.tierName} ticket {i + 1}
                            </label>
                            <input
                              id={`pt-${key}`}
                              className="tn-input !py-2 !text-[13px]"
                              value={perTicket[key] ?? ""}
                              onChange={(e) => setPerTicket((p) => ({ ...p, [key]: e.target.value }))}
                              placeholder="Attendee name"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {error && <FormError message={error} />}
            </div>

            <Summary amounts={amounts}>
              <div className="space-y-3">
                <button
                  onClick={() => validateAttendee() && go(3)}
                  className="tn-btn tn-btn-primary w-full"
                >
                  Continue to Payment <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => go(1)} className="tn-btn tn-btn-outline w-full">
                  <ArrowLeft className="h-4 w-4" /> Back to Cart
                </button>
              </div>
            </Summary>
          </div>
        )}

        {/* ---------------- STEP 3: Payment ---------------- */}
        {step === 3 && (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="tn-card space-y-6 p-6">
              {/* Method selector */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setMethod("mpesa")}
                  aria-pressed={method === "mpesa"}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                    method === "mpesa" ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-display text-[14px] font-bold text-heading">M-Pesa</p>
                    <p className="tn-meta">STK push to your phone</p>
                  </div>
                </button>
                <button
                  onClick={() => setMethod("card")}
                  aria-pressed={method === "card"}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                    method === "card" ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-display text-[14px] font-bold text-heading">Card</p>
                    <p className="tn-meta">Visa or Mastercard, via Stripe</p>
                  </div>
                </button>
              </div>

              {method === "mpesa" ? (
                <div>
                  <label htmlFor="mp-phone" className="tn-label">M-Pesa Phone Number</label>
                  <input
                    id="mp-phone"
                    className="tn-input max-w-xs"
                    value={payPhone}
                    onChange={(e) => setPayPhone(e.target.value)}
                    placeholder="0712 345 678 or 2547..."
                  />
                  <p className="tn-meta mt-2">
                    You will receive an STK push prompt. Enter your M-Pesa PIN to complete payment.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_120px_90px]">
                    <div>
                      <label htmlFor="cc-num" className="tn-label">Card Number</label>
                      <input
                        id="cc-num"
                        className="tn-input"
                        value={cardDemo.number}
                        onChange={(e) => setCardDemo({ ...cardDemo, number: e.target.value })}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label htmlFor="cc-exp" className="tn-label">Expiry</label>
                      <input
                        id="cc-exp"
                        className="tn-input"
                        value={cardDemo.exp}
                        onChange={(e) => setCardDemo({ ...cardDemo, exp: e.target.value })}
                        placeholder="12/28"
                      />
                    </div>
                    <div>
                      <label htmlFor="cc-cvc" className="tn-label">CVC</label>
                      <input
                        id="cc-cvc"
                        className="tn-input"
                        value={cardDemo.cvc}
                        onChange={(e) => setCardDemo({ ...cardDemo, cvc: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <p className="tn-meta mt-2 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Card details are encrypted and processed by Stripe. TicketNest never stores them.
                  </p>
                </div>
              )}

              {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}
              {error && <FormError message={error} />}

              {status === "polling" && pollInfo && (
                <div className="flex items-center gap-3 rounded-xl bg-heading/5 p-4">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="text-[13.5px] text-ink/80">
                    STK push sent. Check your phone and enter your M-Pesa PIN. Waiting for
                    confirmation (order {pollInfo.orderId})...
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-light px-4 py-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
                <p className="text-[12.5px] text-ink/75">
                  Protected by reCAPTCHA v3. Payments are processed by Safaricom Daraja (M-Pesa) and
                  Stripe. By paying you accept our{" "}
                  <Link href="/legal/terms" className="font-semibold text-accent hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy-policy" className="font-semibold text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <Summary amounts={amounts}>
              <div className="space-y-3">
                <button
                  onClick={startPayment}
                  disabled={status !== "idle"}
                  className="tn-btn tn-btn-primary w-full"
                >
                  {status === "processing" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>Pay {formatKES(amounts.total)}</>
                  )}
                </button>
                <button onClick={() => go(2)} disabled={status !== "idle"} className="tn-btn tn-btn-outline w-full">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>
            </Summary>
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({
  amounts,
  children,
}: {
  amounts: { subtotal: number; serviceFee: number; total: number; ticketCount: number };
  children: React.ReactNode;
}) {
  return (
    <aside className="tn-card h-fit space-y-4 p-6">
      <h3 className="font-display text-lg font-bold text-heading">Order Summary</h3>
      <dl className="space-y-2.5 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-ink/70">Subtotal ({amounts.ticketCount} ticket{amounts.ticketCount === 1 ? "" : "s"})</dt>
          <dd className="font-semibold text-heading">{formatKES(amounts.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/70">Service fee (KES 100 per ticket)</dt>
          <dd className="font-semibold text-heading">{formatKES(amounts.serviceFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-3">
          <dt className="font-display font-bold text-heading">Total</dt>
          <dd className="font-display text-lg font-extrabold text-accent">{formatKES(amounts.total)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] font-semibold text-danger">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </p>
  );
}
