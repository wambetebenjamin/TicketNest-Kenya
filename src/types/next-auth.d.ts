import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "buyer" | "organiser";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "buyer" | "organiser";
  }
}
