import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  return (
    <section className="tn-section bg-light">
      <div className="tn-container max-w-md">
        <div className="tn-card p-8">
          <h1 className="font-display text-2xl font-extrabold text-heading">Create your account</h1>
          <p className="mt-1 text-[14px] text-ink/70">
            Buy tickets faster, or start selling your own events.
          </p>
          <RegisterForm defaultRole={searchParams?.role === "organiser" ? "organiser" : "buyer"} />
          <p className="mt-6 text-center text-[13px] text-ink/70">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
