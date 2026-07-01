// ==========================================================
// NAYEL BASKET - FIREBASE CLOUD MESSAGING SERVICE WORKER
// ==========================================================
// This service worker runs in the background to handle push
// notifications when the app is closed, minimized, or terminated.

importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Fallback configuration values or from injected env
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || "AIzaSyA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "nayel-basket.firebaseapp.com",
  projectId: self.FIREBASE_PROJECT_ID || "nayel-basket",
  storageBucket: self.FIREBASE_STORAGE_BUCKET || "nayel-basket.appspot.com",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "412796370605",
  appId: self.FIREBASE_APP_ID || "1:412796370605:android:bca7d86f772ba6f92ef776",
  measurementId: self.FIREBASE_MEASUREMENT_ID || "G-TEST1234"
};

firebase.initializeApp(firebaseConfig);

let messaging;
try {
  messaging = firebase.messaging();
} catch (err) {
  console.warn("Firebase Messaging Compat not supported in this browser background context:", err);
}

if (messaging) {
  // Handle background notifications
  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message: ", payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || "Nayel Basket Update";
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || "New catalog item or offer is live!",
      icon: payload.notification?.icon || payload.data?.icon || "/assets/logo.png",
      badge: "/assets/logo.png",
      data: payload.data || {},
      actions: [
        { action: "view_shop", title: "Open Shop" },
        { action: "dismiss", title: "Dismiss" }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Service worker actions on notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Open the application tab
  const urlToOpen = new URL("/", self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: "window",
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus();
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

// ==========================================================
// OFFLINE SUPPORT & PWA CACHING STRATEGY
// ==========================================================
const CACHE_NAME = "nayel-basket-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/metadata.json"
];

// 1. Install event: Cache core skeletal files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline skeleton assets...");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[Service Worker] Pre-cache warning (some files may compile dynamically):", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Clean older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[Service Worker] Destroying legacy cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch event: Stale-While-Revalidate with network failover
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass chrome-extension or other external non-http schemas
  if (!req.url.startsWith("http")) return;

  // For live API endpoints, use Network-First, with a custom offline mock response if server is fully offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Clone and cache successful GET responses
          if (res.status === 200 && req.method === "GET") {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => {
          // If offline, try cached API or return offline-friendly JSON
          return caches.match(req).then((cachedRes) => {
            if (cachedRes) return cachedRes;
            
            // Fallback JSON for health check and general APIs
            if (url.pathname.includes("/api/health")) {
              return new Response(JSON.stringify({ status: "offline_synced", time: new Date().toISOString() }), {
                headers: { "Content-Type": "application/json" }
              });
            }
            return new Response(JSON.stringify({ 
              error: "You are currently offline. Live AI and payments will resume once internet connection is restored.",
              offline: true 
            }), {
              headers: { "Content-Type": "application/json" }
            });
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for static assets
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log("[Service Worker] Network request failed; serving cached copy if present.", err);
      });

      return cachedResponse || fetchPromise;
    })
  );
});
