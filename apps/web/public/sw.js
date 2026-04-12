const CACHE = "raijin-shell-v1";

// App shell assets to pre-cache on install
const SHELL = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Remove old caches from previous versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests — let API calls and cross-origin go straight to network
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip Vite HMR and dev-server internals
  if (url.pathname.startsWith("/@") || url.pathname.includes("__vite")) return;

  // API calls: network-first, no caching
  if (url.pathname.startsWith("/api/")) return;

  // Static assets (JS/CSS/images): cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Navigation requests: network-first, fall back to cached "/" shell
  event.respondWith(
    fetch(request).catch(() => caches.match("/") ?? caches.match("/offline.html"))
  );
});
