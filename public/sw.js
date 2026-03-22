const CACHE_NAME = "civilian-v1";
const FORUM_FEED_URL = "/api/posts";

// On install — cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/forum", "/map", "/compose"])
    )
  );
  self.skipWaiting();
});

// On activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never try to cache non-GET requests — Cache API doesn't support them
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cache forum feed for offline use
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

  // Static assets — cache first
  if (request.destination === "document" || request.destination === "script" || request.destination === "style") {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }
});
