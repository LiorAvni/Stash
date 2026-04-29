// Minimal service worker: shell + runtime caching.
// Designed for iOS Safari PWA install. Don't aggressively cache HTML.

const VERSION = "v1";
const APP_SHELL = `stash-shell-${VERSION}`;
const RUNTIME = `stash-runtime-${VERSION}`;

const PRECACHE_URLS = ["/login", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_SHELL).then((c) => c.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_SHELL && k !== RUNTIME)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML & API
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/login"))),
    );
    return;
  }

  // Cache-first for static assets
  if (url.pathname.startsWith("/_next/static") || /\.(?:png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
  }
});
