"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { executeRecaptcha } from "@/lib/recaptcha";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // reCAPTCHA v3 on login (server verifies when configured)
    const token = await executeRecaptcha("login");
    const res = await signIn("credentials", {
      email,
      password,
      recaptchaToken: token,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    router.push("/my-tickets");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="si-email" className="tn-label">Email</label>
        <input
          id="si-email"
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
        <label htmlFor="si-password" className="tn-label">Password</label>
        <input
          id="si-password"
          type="password"
          required
          autoComplete="current-password"
          className="tn-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
      </div>
      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] font-semibold text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="tn-btn tn-btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
      </button>
      <p className="tn-meta text-center">Protected by reCAPTCHA v3 and the Kenya Data Protection Act 2019.</p>
    </form>
  );
}
