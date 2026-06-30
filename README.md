# 🌐 OmniShop: Enterprise AI-Powered Retail Ecosystem

OmniShop is a production-ready, high-fidelity full-stack eCommerce application that pairs a beautiful cyberpunk retail storefront with an advanced **Google Gemini-3.5** AI Shopping Concierge, an independent **Seller Merchant Portal**, and a global **Admin Control Infrastructure console**.

Developed in React 19, TypeScript, Express, and styled with high-performance Tailwind CSS, the platform operates with an offline-first resilient sync ledger (persisted via `localStorage`) and high-fidelity page transition motion layout engines.

---

## 🚀 Architectural Overview

```
                      +-----------------------------+
                      |       Browser Client        |
                      |  (React 19 + Tailwind CSS)  |
                      +--------------+--------------+
                                     |
                                     | HTTP REST API (port 3000)
                                     v
                      +--------------+--------------+
                      |      Express Web Server     |
                      |      (TypeScript/ESM)       |
                      +--------------+--------------+
                                     |
                                     | @google/genai SDK
                                     v
                      +--------------+--------------+
                      |    Google Gemini-3.5 API    |
                      | (chat, outfits, size advice)|
                      +-----------------------------+
```

### 💎 Key Core Modules

1. **Bespoke Customer Shop**:
   - High-contrast, responsive catalog displaying premium gear with advanced dynamic filters.
   - Live **AI Review Summarizer** proxying product ratings into consensus reports.
   - Interactive Q&A and size-recommendation system utilizing personalized measurements.
   - Secure checkout flow featuring custom promotional discount codes and wallet refund ledgers.

2. **AI Concierge**:
   - Powered by standard `gemini-3.5-flash` model utilizing the official `@google/genai` TypeScript SDK.
   - Full context-awareness with dynamic injection of current inventory catalog, sizing parameters, and shipping/return agreements.

3. **Seller Merchant Portal**:
   - Manage local merchant inventory stock limits and create new products on-the-fly.
   - Real-time transaction auditing charts showing revenues, pending settlements, and total orders.

4. **Central Admin Console**:
   - Worldwide system metrics monitor containing instant transaction ledgers.
   - Audit and approve customer return claims with automated wallet refund routing.
   - Toggle promotions, override prices, and track live logistics delivery fulfillment pipelines.

---

## 🛠️ Local Quickstart Guide

Ensure you have **Node.js (v18+)** and **npm** installed.

### 1. Configure Secrets

Copy the example environment template and add your Gemini API Key:

```bash
cp .env.example .env
```

Open `.env` and configure:
```env
GEMINI_API_KEY=your_actual_api_key_here
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```
The application will boot successfully at `http://localhost:3000`.

---

## 📦 Production Compiling & Building

OmniShop incorporates a unified compilation system. Running `npm run build` will:
1. Build and bundle client assets into `dist/` using Vite.
2. Compile the backend `server.ts` into a self-contained, high-performance CommonJS file at `dist/server.cjs` via `esbuild`.

To trigger the production build:
```bash
npm run build
```

To run the production build locally:
```bash
npm start
```

---

## 🗺️ Extended Deployment Manuals

For complete multi-platform publishing pipelines (including App Store builds, Play Store configurations, Supabase migrations, and hosting guidelines), please consult the extensive [DEPLOYMENT.md](./DEPLOYMENT.md) documentation file.

---

*Handcrafted with high-contrast precision, modern typography pairings, and robust architectural patterns for Google AI Studio.*
