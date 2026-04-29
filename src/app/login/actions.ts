"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { env } from "@/lib/env";

// Crude in-memory rate limit (per server instance). Good enough for single-user.
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const passcode = String(formData.get("passcode") ?? "");
  const next = String(formData.get("next") ?? "/") || "/";

  const key = "single-user";
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && now - rec.firstAt < WINDOW_MS && rec.count >= MAX_ATTEMPTS) {
    return { error: "Too many attempts. Wait a minute and try again." };
  }

  if (!timingSafeEqual(passcode, env.appPasscode)) {
    const next = rec && now - rec.firstAt < WINDOW_MS
      ? { count: rec.count + 1, firstAt: rec.firstAt }
      : { count: 1, firstAt: now };
    attempts.set(key, next);
    return { error: "Incorrect passcode." };
  }

  attempts.delete(key);
  const session = await getSession();
  session.authenticated = true;
  session.loginAt = now;
  await session.save();

  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
