// ---------------------------------------------------------------------------
// NextAuth configuration — buyer + organiser accounts, credentials provider,
// JWT sessions with role. Passwords hashed with node crypto scrypt.
// ---------------------------------------------------------------------------

import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { kvGet, kvSet, kvListPush, STORE_KEYS } from "@/lib/store";
import type { AppUser } from "@/types";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function seedDemoUsers(): Promise<void> {
  const seeded = await kvGet<boolean>("seeded:demo-users");
  if (seeded) return;
  const demoUsers: AppUser[] = [
    {
      id: "usr_buyer_demo",
      name: "Amina Wekesa",
      email: "buyer@demo.ticketnest.co.ke",
      passwordHash: hashPassword("Demo1234!"),
      role: "buyer",
      createdAt: "2026-09-01T10:00:00+03:00",
    },
    {
      id: "usr_org_demo",
      name: "Nest Live",
      email: "organiser@demo.ticketnest.co.ke",
      passwordHash: hashPassword("Demo1234!"),
      role: "organiser",
      createdAt: "2026-09-01T10:00:00+03:00",
      organiserProfile: {
        bio: "Nest Live produces East Africa's boldest live music experiences.",
        payoutMethod: "mpesa",
        payoutDetails: "+254 712 000 001",
      },
    },
  ];
  for (const u of demoUsers) {
    await kvSet(STORE_KEYS.user(u.id), u);
    await kvSet(STORE_KEYS.userByEmail(u.email), u.id);
    await kvListPush(STORE_KEYS.userIndex(), u.id);
  }
  await kvSet("seeded:demo-users", true);
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await seedDemoUsers();
        if (!credentials?.email || !credentials?.password) return null;
        // Server-side reCAPTCHA v3 verification on login (demo mode passes)
        const { verifyRecaptcha } = await import("@/lib/captcha");
        const captcha = await verifyRecaptcha(
          (credentials as { recaptchaToken?: string }).recaptchaToken ?? null
        );
        if (!captcha.ok) return null;
        const userId = await kvGet<string>(
          STORE_KEYS.userByEmail(credentials.email.trim().toLowerCase())
        );
        if (!userId) return null;
        const user = await kvGet<AppUser>(STORE_KEYS.user(userId));
        if (!user || !verifyPassword(credentials.password, user.passwordHash)) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "ticketnest-demo-secret-change-me",
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "buyer";
        token.uid = user.id;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string | undefined;
        (session.user as { role?: string }).role = (token.role as string) || "buyer";
      }
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
};

export async function getSessionUser(): Promise<AppUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const userId = await kvGet<string>(STORE_KEYS.userByEmail(session.user.email.toLowerCase()));
  if (!userId) return null;
  return kvGet<AppUser>(STORE_KEYS.user(userId));
}
