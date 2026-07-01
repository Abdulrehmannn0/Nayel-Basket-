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
