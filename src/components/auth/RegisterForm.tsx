"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Ticket, Megaphone } from "lucide-react";
import { useRecaptchaForm, RecaptchaV2Challenge } from "@/lib/recaptcha";

export default function RegisterForm({ defaultRole }: { defaultRole: "buyer" | "organiser" }) {
  const router = useRouter();
  const { run, v2Required, setV2Token } = useRecaptchaForm();
  const [role, setRole] = useState<"buyer" | "organiser">(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // reCAPTCHA v3 on registration (buyer and organiser)
    const { ok, data } = await run("register", (token) =>
      fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, recaptchaToken: token }),
      })
    );
    if (!ok) {
      setError(((data as { error?: string })?.error) ?? "Could not create your account.");
      setLoading(false);
      return;
    }
    // Auto sign-in after registration
    const token = await import("@/lib/recaptcha").then((m) => m.executeRecaptcha("login"));
    const res = await signIn("credentials", {
      email,
      password,
      recaptchaToken: token,
      redirect: false,
    });
    if (res?.error) {
      router.push("/auth/signin");
      return;
    }
    router.push(role === "organiser" ? "/organiser/dashboard" : "/my-tickets");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
        <button
          type="button"
          role="radio"
          aria-checked={role === "buyer"}
          onClick={() => setRole("buyer")}
          className={`flex items-center gap-2.5 rounded-xl border-2 p-3.5 text-left transition-colors ${
            role === "buyer" ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
          }`}
        >
          <Ticket className="h-5 w-5 text-accent" />
          <div>
            <p className="font-display text-[13px] font-bold text-heading">Buy Tickets</p>
            <p className="tn-meta">Event goer</p>
          </div>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={role === "organiser"}
          onClick={() => setRole("organiser")}
          className={`flex items-center gap-2.5 rounded-xl border-2 p-3.5 text-left transition-colors ${
            role === "organiser" ? "border-accent bg-accent/5" : "border-black/10 hover:border-accent/40"
          }`}
        >
          <Megaphone className="h-5 w-5 text-accent" />
          <div>
            <p className="font-display text-[13px] font-bold text-heading">Sell Tickets</p>
            <p className="tn-meta">Event organiser</p>
          </div>
        </button>
      </div>

      <div>
        <label htmlFor="rg-name" className="tn-label">Full Name or Organiser Name</label>
        <input
          id="rg-name"
          required
          autoComplete="name"
          className="tn-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Amina Wekesa"
        />
      </div>
      <div>
        <label htmlFor="rg-email" className="tn-label">Email</label>
        <input
          id="rg-email"
          type="email"
          required
          autoComplete="email"
          className="tn-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="rg-password" className="tn-label">Password (min 8 characters)</label>
        <input
          id="rg-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="tn-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
        />
      </div>

      {v2Required && <RecaptchaV2Challenge onSolved={setV2Token} />}
      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] font-semibold text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="tn-btn tn-btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Create ${role === "organiser" ? "Organiser" : "Buyer"} Account`}
      </button>
      <p className="tn-meta text-center">
        By registering you accept our Terms and Privacy Policy. Protected by reCAPTCHA v3.
      </p>
    </form>
  );
}
