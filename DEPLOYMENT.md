# 🗺️ OmniShop Enterprise Multi-Platform Deployment & Integration Manual

This guide describes production publishing, external database synchronization, and compilation pipelines for building native iOS and Android packages for App Stores.

---

## 📂 Table of Contents
1. [Prerequisites & Server Installation](#1-prerequisites--server-installation)
2. [Production Web Hosting (Vercel, Render, Cloud Run)](#2-production-web-hosting-vercel-render-cloud-run)
3. [Supabase Backend Integration (PostgreSQL Migration)](#3-supabase-backend-integration-postgresql-migration)
4. [Android Play Store Release Compilation (Capacitor)](#4-android-play-store-release-compilation-capacitor)
5. [iOS App Store Release Compilation (Capacitor)](#5-ios-app-store-release-compilation-capacitor)

---

## 1. Prerequisites & Server Installation

Ensure the server is running on a stable UNIX or Windows environment with:
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Steps:
1. Extract or clone this workspace repository.
2. Initialize environment:
   ```bash
   npm install
   ```
3. Establish your secrets in `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   NODE_ENV=production
   ```
4. Verify compiling and linting passes:
   ```bash
   npm run lint
   * Line compiling...
   npm run build
   ```

---

## 2. Production Web Hosting (Vercel, Render, Cloud Run)

The server entrypoint is fully optimized to serve pre-compiled production static assets from `dist/` when `NODE_ENV=production`.

### Option A: Cloud Run (Recommended Containerized Route)
Because our server contains a customized Express backend proxying Gemini requests, containerizing is the cleanest approach.

1. Build your Docker image:
   ```bash
   docker build -t gcr.io/your-project/omnishop:v1 .
   ```
2. Push and Deploy to Google Cloud Run:
   ```bash
   docker push gcr.io/your-project/omnishop:v1
   gcloud run deploy omnishop --image gcr.io/your-project/omnishop:v1 --platform managed --port 3000 --set-env-vars="GEMINI_API_KEY=AIzaSy..."
   ```

### Option B: Render or Heroku
1. Hook your GitHub Repository to the Render / Heroku Web Service portal.
2. Configure environment settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Set Environment Variables: `GEMINI_API_KEY=AIzaSy...` and `NODE_ENV=production`.

---

## 3. Supabase Backend Integration (PostgreSQL Migration)

If you wish to migrate from client-side `localStorage` state simulation to a fully relational, multi-user Supabase cloud database, implement this migration strategy.

### 1. Database Schema Definitions
Run the following SQL queries in the **Supabase SQL Editor** to establish the primary schema tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Products Table
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    brand text not null,
    price numeric not null,
    image text not null,
    description text not null,
    category text not null,
    rating numeric default 4.5,
    stock_count integer default 10,
    sizes text[] default array['S', 'M', 'L', 'XL'],
    colors text[] default array['Midnight Matte', 'Core Black', 'Silver Grey'],
    features text[] default array[]
);

-- 2. Create Orders Table
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_email text not null,
    total numeric not null,
    status text default 'Processing',
    payment_method text not null,
    shipping_address jsonb not null,
    otp text not null,
    tracking jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Reviews Table
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade,
    user_name text not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text not null,
    likes integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- Create Open Read Policies
create policy "Products are readable by everyone" on public.products for select using (true);
create policy "Reviews are readable by everyone" on public.reviews for select using (true);
```

### 2. Connect Your App state to Supabase Client
1. Install Supabase SDK:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Set up the client in `/src/lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```
3. Update `AppContext.tsx` state loading hooks to execute dynamic SQL fetching queries (e.g., `await supabase.from('products').select('*')`) rather than indexing `localStorage`.

---

## 4. Android Play Store Release Compilation (Capacitor)

To compile this React/Vite app for the Google Play Store as a high-fidelity native application, we utilize Ionic Capacitor.

### 1. Integrate Capacitor Core & Android
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "OmniShop" "com.omnishop.app" --web-dir=dist
npm install @capacitor/android
npx cap add android
```

### 2. Align Build Script Flow
Modify your packaging scripts to ensure compilation builds before syncing Capacitor assets:
```bash
npm run build
npx cap sync
```

### 3. Open and Compile in Android Studio
```bash
npx cap open android
```
Once Android Studio boots:
1. Navigate to **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** (required for Play Store distribution) and tap Next.
3. Generate or configure a secure Keystore signature file, complete credentials, and set destination to `release`.
4. Tap Finish. The resultant production `.aab` package is generated at `android/app/release/app-release.aab` ready for upload to Google Play Console.

---

## 5. iOS App Store Release Compilation (Capacitor)

For compilation inside the Apple Developer pipeline, we use Capacitor iOS frameworks inside Xcode.

### 1. Integrate iOS Platform
```bash
npm install @capacitor/ios
npx cap add ios
```

### 2. Build Assets & Sync Project
```bash
npm run build
npx cap sync
```

### 3. Open in Xcode (macOS Required)
```bash
npx cap open ios
```
Once Xcode launches:
1. Under **Signing & Capabilities**, select your verified Apple Developer Profile.
2. Ensure Bundle Identifier is matching (e.g. `com.omnishop.app`).
3. Set the target destination scheme to **Any iOS Device (arm64)**.
4. Navigate to the top menu and click **Product > Archive**.
5. Once archiving completes, tap **Distribute App** in the Organizer window, choose **App Store Connect**, and submit. The bundle will instantly land on your App Store Connect account ready for TestFlight or release configuration!

---

*For technical concerns or custom configurations, please raise a ticket with the OmniShop Global Systems engineering team.*
