import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <section className="tn-section bg-light">
      <div className="tn-container max-w-md">
        <div className="tn-card p-8">
          <h1 className="font-display text-2xl font-extrabold text-heading">Welcome back</h1>
          <p className="mt-1 text-[14px] text-ink/70">
            Sign in to access your tickets or organiser dashboard.
          </p>
          <SignInForm />
          <p className="mt-6 text-center text-[13px] text-ink/70">
            New to TicketNest?{" "}
            <Link href="/auth/register" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
          <div className="mt-6 rounded-lg bg-light p-4 text-[12px] leading-relaxed text-ink/65">
            <p className="font-semibold text-heading">Demo accounts</p>
            <p>Buyer: buyer@demo.ticketnest.co.ke</p>
            <p>Organiser: organiser@demo.ticketnest.co.ke</p>
            <p>Password for both: Demo1234!</p>
          </div>
        </div>
      </div>
    </section>
  );
}
