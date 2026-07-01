// ==========================================================
// NAYEL BASKET - UNIFIED FIREBASE & NATIVE ANDROID INTEGRATION SERVICE
// ==========================================================
// Handles FCM notifications, Analytics, and Crashlytics mapping
// while maintaining Supabase as the primary relational database.

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

// 1. Firebase configuration from Vite Environment variables safely typed for TypeScript compiler
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "nayel-basket.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "nayel-basket",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "nayel-basket.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "412796370605",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:412796370605:android:bca7d86f772ba6f92ef776",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-TEST1234"
};

// VAPID Key for Web Push (Firebase Console -> Project Settings -> Cloud Messaging)
const VAPID_KEY = metaEnv.VITE_FIREBASE_VAPID_KEY || "";

/**
 * Safely verify if real Firebase credentials are provided
 */
export function isRealFirebaseConfig(): boolean {
  const apiKey = metaEnv.VITE_FIREBASE_API_KEY;
  if (!apiKey || apiKey === "AIzaSyA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E" || apiKey.includes("your-")) {
    return false;
  }
  return true;
}

let firebaseApp;
let analytics;
let messaging;

/**
 * Safely verify if browser context supports service workers & push messaging
 */
export function isNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Initializes the Firebase Web SDK Client
 */
export function initializeFirebase() {
  if (typeof window === "undefined") return null;

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    // Initialize Analytics if supported and config is real
    if (isRealFirebaseConfig()) {
      try {
        analytics = getAnalytics(firebaseApp);
        logAnalyticsEvent("app_initialized", { platform: "web_or_capacitor" });
      } catch (e) {
        console.warn("Firebase Analytics could not be initialized in this window context:", e);
      }
    } else {
      console.log("Firebase Analytics initialization skipped because a mock/empty API Key is used.");
    }

    // Initialize Messaging if supported and config is real
    if (isRealFirebaseConfig() && isNotificationSupported()) {
      try {
        messaging = getMessaging(firebaseApp);
      } catch (e) {
        console.warn("FCM messaging initialization failed in this browser tab:", e);
      }
    } else {
      console.log("FCM messaging initialization skipped because a mock/empty API Key is used.");
    }

    // Setup Custom Crashlytics Tracker for unhandled web exceptions
    setupWebCrashlytics();

    return firebaseApp;
  } catch (err) {
    console.error("Failed to initialize Firebase SDK services:", err);
    return null;
  }
}

/**
 * Generate or refresh FCM tokens
 */
export async function getFcmToken(): Promise<string | null> {
  if (!isRealFirebaseConfig() || !isNotificationSupported()) {
    console.warn("FCM Token generation bypassed or not supported (mock config).");
    return "mock_fcm_token_" + Math.random().toString(36).substring(7);
  }

  try {
    const fcmMessaging = messaging || getMessaging(firebaseApp);
    if (!fcmMessaging) return null;

    // Standard registration for Service Worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/"
    });

    const token = await getToken(fcmMessaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log("FCM Registration Token generated successfully:", token);
      localStorage.setItem("nb_fcm_token", token);
      logAnalyticsEvent("fcm_token_generated", { token_present: true });
      return token;
    } else {
      console.warn("No registration token available. Check firebase configuration or request permission.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving FCM token:", err);
    return "simulated_fcm_token_secure_sandbox";
  }
}

/**
 * Register background message service worker registration hook for tokens
 */
export async function registerServiceWorkerForFCM(): Promise<ServiceWorkerRegistration | null> {
  if (!isNotificationSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("FCM background service worker registered scope:", reg.scope);
    return reg;
  } catch (error) {
    console.error("Failed to register background FCM service worker:", error);
    return null;
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    logAnalyticsEvent("notification_permission_requested", { result: permission });
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "default";
  }
}

/**
 * Handle foreground messages when application tab is currently active and focused
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  if (!isRealFirebaseConfig()) {
    return () => {};
  }
  const fcmMessaging = messaging || (firebaseApp ? getMessaging(firebaseApp) : null);
  if (!fcmMessaging) {
    console.warn("FCM messaging is not active or supported in this browser tab context.");
    return () => {};
  }

  return onMessage(fcmMessaging, (payload) => {
    console.log("Received foreground message in live browser tab:", payload);
    logAnalyticsEvent("notification_received_foreground", {
      title: payload.notification?.title || "No Title"
    });
    callback(payload);
  });
}

/**
 * Log analytics event to Firebase Analytics
 */
export function logAnalyticsEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (err) {
      console.warn(`Analytics log failure for event: ${eventName}`, err);
    }
  } else {
    // console.log(`[Firebase Analytics Sim] Event: ${eventName}`, params);
  }
}

/**
 * Custom Crashlytics reporter. Since native Crashlytics is Android-specific,
 * this captures errors and alerts developers or submits telemetry loggers.
 */
export function logCrashlyticsError(error: Error | string, fatal = false) {
  const errMessage = error instanceof Error ? error.message : error;
  const errStack = error instanceof Error ? error.stack : "No Stack";

  console.warn(`[Firebase Crashlytics Sim] ${fatal ? "FATAL " : ""}Error logged:`, errMessage, errStack);
  
  logAnalyticsEvent("app_crash_logged", {
    message: errMessage.substring(0, 100),
    fatal
  });

  // Here, developers can map errors directly to Supabase logs for remote tracking
}

/**
 * Global unhandled error hook for simulated web Crashlytics
 */
function setupWebCrashlytics() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    logCrashlyticsError(
      new Error(`Global Window Error: ${event.message} at ${event.filename}:${event.lineno}`),
      true
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    logCrashlyticsError(
      `Unhandled Promise Rejection: ${event.reason}`,
      false
    );
  });
}
