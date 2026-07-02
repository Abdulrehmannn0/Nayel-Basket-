/**
 * Nayel Basket - Luxury Artisanal Home Decor
 * PWA Service Worker (service-worker.js)
 * Implements high-end offline caching, stale-while-revalidate, and SPA navigation fallback.
 */

const CACHE_NAME = "nayel-basket-cache-v2";
const OFFLINE_URL = "/index.html";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "/icon-512.jpg",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline SPA shell and brand assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Invalidating legacy cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Bypass service worker caching for Firebase Auth, Firestore streams, and internal APIs
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("identitytoolkit.googleapis.com")
  ) {
    return;
  }

  // Handle SPA routing and navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Keep cached index page refreshed with the latest compiled assets
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(OFFLINE_URL, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback: serve the cached SPA shell
          console.log("[Service Worker] Offline fallback activated for navigation:", event.request.url);
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Stale-while-revalidate strategy for same-origin static files and approved CDNs
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve immediately, then revalidate in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Background fetch fails silently (e.g. when fully offline) */
          });
        return cachedResponse;
      }

      // Network fallback for non-cached resources
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin || 
             url.hostname.includes("unsplash.com") || 
             url.hostname.includes("googleapis.com") || 
             url.hostname.includes("gstatic.com"))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline assets fallback
          if (event.request.destination === "image") {
            return caches.match("/icon-512.jpg");
          }
        });
    })
  );
});
