const CACHE_NAME = "civilian-v3";
const FORUM_FEED_URL = "/api/posts";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(["/"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API forum feed — network first, cache fallback
  if (url.pathname === FORUM_FEED_URL) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // JS/CSS chunks — always network first, never serve stale bundles
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // HTML documents — network first
  if (request.destination === "document") {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }
});
