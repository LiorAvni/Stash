import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { env } from "@/lib/env";

export type SessionData = {
  authenticated?: boolean;
  loginAt?: number;
};

export const sessionOptions: SessionOptions = {
  password: env.sessionSecret,
  cookieName: "stash_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session.authenticated);
}
