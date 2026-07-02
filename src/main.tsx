import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeFirebase } from './lib/firebase';

// Programmatically boot Firebase Client configuration
initializeFirebase();

// Register the PWA service worker for native offline capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((reg) => console.log("PWA Service Worker registered successfully:", reg.scope))
      .catch((err) => console.error("PWA Service Worker registration failed:", err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

