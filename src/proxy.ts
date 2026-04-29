import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const SESSION_COOKIE = "stash_session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths
  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/icons/") ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png"
  ) {
    return NextResponse.next();
  }

  const password = process.env.SESSION_SECRET;
  if (!password) return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, {
    password,
    cookieName: SESSION_COOKIE,
  });

  if (!session.authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|icon.png|apple-icon.png).*)",
  ],
};
