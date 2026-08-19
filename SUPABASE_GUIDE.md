# ZENOV Games — Supabase Backend Integration Guide

> সম্পূর্ণ step-by-step guide। এই ফাইল follow করলে পুরো backend ready হয়ে যাবে।

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Supabase Project Setup](#2-supabase-project-setup)
3. [Database Tables (SQL)](#3-database-tables-sql)
4. [Row Level Security (RLS)](#4-row-level-security-rls)
5. [Environment Variables](#5-environment-variables)
6. [Install Dependencies](#6-install-dependencies)
7. [Supabase Client Setup](#7-supabase-client-setup)
8. [API Routes](#8-api-routes)
9. [AppStateContext Update](#9-appstatecontext-update)
10. [Authentication](#10-authentication)
11. [Admin Dashboard Integration](#11-admin-dashboard-integration)
12. [Vercel Deployment](#12-vercel-deployment)
13. [Payment Flow (bKash / Nagad)](#13-payment-flow-bkash--nagad)
14. [Testing Checklist](#14-testing-checklist)

---

## 1. Stack Overview

ZENOV Games runs on a hybrid architecture:
- **Frontend**: Next.js (App Router) client-side pages and components.
- **Backend Middleware / Controller**: Next.js API Routes (located in `src/app/api/...`) which run on serverless environments.
- **Database & Auth**: Supabase (PostgreSQL) as the persistent store. Next.js API Routes call Supabase securely using the `@supabase/supabase-js` SDK client.

This design ensures:
1. **Offline Resiliency**: If Supabase credentials are not provided, the frontend automatically falls back to `localStorage` caching and mock memory stores (configured in [AppStateContext.tsx](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/lib/AppStateContext.tsx)).
2. **Auto-Seeding**: When the app starts up and tables are empty, Next.js API routes will auto-populate the database tables with mock data from [initialData.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/data/initialData.ts).

---

## 2. Supabase Project Setup

1. **Create an Account / Log In**: Go to [Supabase Dashboard](https://supabase.com) and log in.
2. **New Project**: Click on **New Project**.
   - **Name**: `zenvo-gaming-store` (বা আপনার পছন্দের নাম)
   - **Database Password**: একটি সুরক্ষিত পাসওয়ার্ড দিন (পরবর্তীতে ব্যবহারের জন্য সংরক্ষণ করুন)
   - **Region**: Chattogram / Bangladesh এর কাছাকাছি ভালো লেটেন্সির জন্য `Southeast Asia (Singapore)` বা `South Asia (Mumbai)` সিলেক্ট করুন।
   - **Pricing Plan**: Free Tier সিলেক্ট করুন।
3. **Copy Credentials**: প্রজেক্ট তৈরি হওয়ার পর **Project Settings > API** সেকশনে যান। সেখান থেকে নিচের দুটি কী কপি করে রাখুন:
   - `Project URL` (e.g. `https://xxxxxx.supabase.co`)
   - `Anon Public Key` (e.g. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## 3. Database Tables (SQL)

Supabase-এর **SQL Editor**-এ যান, একটি **New Query** খুলুন এবং নিচের সম্পূর্ণ Master SQL স্ক্রিপ্টটি কপি করে **Run** বাটনে ক্লিক করুন। 

একজন Senior Backend Engineer এর স্ট্যান্ডার্ড অনুযায়ী এটি আপনার ডাটাবেসে ইন্ডেক্সিং, ট্রিগার, অটো-ইউজার প্রোফাইল সিঙ্ক এবং ওয়ালেট লেজার সহ ৫টি প্রধান টেবিল তৈরি ও কনফিগার করবে:

```sql
-- ========================================================
-- ZENOV GAMES — PRODUCTION MASTER BACKEND SQL SCHEMA
-- Senior Backend Architecture: Indexes, Triggers, RLS, & Auto Auth Sync
-- ========================================================

-- 1. Helper Function: Auto Update "updatedAt" Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- TABLE 1: PRODUCTS (Game Top-Ups, Gift Cards & Subscriptions)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.products (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "bannerImage" TEXT DEFAULT '',
  "publisher" TEXT DEFAULT '',
  "region" TEXT DEFAULT 'Global',
  "deliveryType" TEXT DEFAULT 'Instant',
  "inStock" BOOLEAN DEFAULT true,
  "isHot" BOOLEAN DEFAULT false,
  "isNew" BOOLEAN DEFAULT false,
  "discountPercent" NUMERIC DEFAULT 0,
  "rating" NUMERIC DEFAULT 5.0,
  "reviewCount" INTEGER DEFAULT 0,
  "description" TEXT DEFAULT '',
  "instructions" TEXT DEFAULT '',
  "playerIdLabel" TEXT DEFAULT 'Player ID',
  "playerIdPlaceholder" TEXT DEFAULT '',
  "howToFindPlayerId" JSONB DEFAULT '[]'::jsonb,
  "hasServerId" BOOLEAN DEFAULT false,
  "requiresServerId" BOOLEAN DEFAULT false,
  "serverIdLabel" TEXT DEFAULT '',
  "denominations" JSONB DEFAULT '[]'::jsonb,
  "tags" JSONB DEFAULT '[]'::jsonb,
  "unitId" TEXT DEFAULT '',
  "unitName" TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Product Catalog Filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products("category");
CREATE INDEX IF NOT EXISTS idx_products_instock ON public.products("inStock");

-- Auto-update Trigger for Products
DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========================================================
-- TABLE 2: ORDERS (Instant Game Top-Ups & Checkout System)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.orders (
  "id" TEXT PRIMARY KEY,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "userId" TEXT DEFAULT 'guest',
  "userEmail" TEXT NOT NULL,
  "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "totalUSD" NUMERIC NOT NULL CHECK ("totalUSD" >= 0),
  "currency" TEXT NOT NULL DEFAULT 'BDT',
  "paidAmountCurrency" NUMERIC NOT NULL CHECK ("paidAmountCurrency" >= 0),
  "paymentMethod" TEXT NOT NULL,
  "paymentStatus" TEXT DEFAULT 'Paid',
  "fulfillmentStatus" TEXT DEFAULT 'Processing',
  "playerId" TEXT NOT NULL,
  "serverId" TEXT DEFAULT '',
  "transactionId" TEXT NOT NULL UNIQUE,
  "notes" TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Order Search & Admin Tracking
CREATE INDEX IF NOT EXISTS idx_orders_ordernumber ON public.orders("orderNumber");
CREATE INDEX IF NOT EXISTS idx_orders_transactionid ON public.orders("transactionId");
CREATE INDEX IF NOT EXISTS idx_orders_useremail ON public.orders("userEmail");
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders("fulfillmentStatus");

-- Auto-update Trigger for Orders
DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========================================================
-- TABLE 3: SUPPORT TICKETS (24/7 Support Queue & AI Chat)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  "id" TEXT PRIMARY KEY,
  "ticketNumber" TEXT NOT NULL UNIQUE,
  "userId" TEXT DEFAULT 'guest',
  "userEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Open',
  "priority" TEXT DEFAULT 'Medium',
  "messages" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Ticket Lookup
CREATE INDEX IF NOT EXISTS idx_tickets_ticketnumber ON public.tickets("ticketNumber");
CREATE INDEX IF NOT EXISTS idx_tickets_useremail ON public.tickets("userEmail");
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets("status");

-- Auto-update Trigger for Tickets
DROP TRIGGER IF EXISTS tr_tickets_updated_at ON public.tickets;
CREATE TRIGGER tr_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========================================================
-- TABLE 4: PROFILES (User Accounts & Wallet Balance)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "avatar" TEXT DEFAULT '',
  "walletBalanceUSD" NUMERIC DEFAULT 0.00 CHECK ("walletBalanceUSD" >= 0),
  "role" TEXT DEFAULT 'user',
  "vipTier" TEXT DEFAULT 'Bronze',
  "totalOrders" INTEGER DEFAULT 0,
  "phone" TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Auto Create Profile Trigger when user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles ("id", "name", "email", "avatar", "walletBalanceUSD", "role", "vipTier")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200'),
    0.00,
    'user',
    'Bronze'
  )
  ON CONFLICT ("id") DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ========================================================
-- TABLE 5: WALLET TRANSACTIONS (Financial Audit Ledger)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  "id" TEXT PRIMARY KEY,
  "userId" UUID REFERENCES public.profiles("id") ON DELETE SET NULL,
  "userEmail" TEXT DEFAULT '',
  "type" TEXT NOT NULL, -- 'deposit', 'purchase', 'refund', 'bonus'
  "amount" NUMERIC NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "paymentMethod" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Completed',
  "reference" TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_userid ON public.wallet_transactions("userId");
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON public.wallet_transactions("reference");


-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update/delete products" ON public.products;
CREATE POLICY "Allow public insert/update/delete products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Tickets Policies
DROP POLICY IF EXISTS "Allow public select tickets" ON public.tickets;
CREATE POLICY "Allow public select tickets" ON public.tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert tickets" ON public.tickets;
CREATE POLICY "Allow public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update tickets" ON public.tickets;
CREATE POLICY "Allow public update tickets" ON public.tickets FOR UPDATE USING (true) WITH CHECK (true);

-- Profiles Policies
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
CREATE POLICY "Allow public update profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Wallet Transactions Policies
DROP POLICY IF EXISTS "Allow public select wallet_tx" ON public.wallet_transactions;
CREATE POLICY "Allow public select wallet_tx" ON public.wallet_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert wallet_tx" ON public.wallet_transactions;
CREATE POLICY "Allow public insert wallet_tx" ON public.wallet_transactions FOR INSERT WITH CHECK (true);
```

> [!NOTE]
> প্রডাকশনে যাওয়ার সময় আপনি চাইলে Supabase Auth কনফিগার করে User-specific RLS পলিসি লাগাতে পারেন, যেমন: `auth.uid() = user_id`.

---

## 5. Environment Variables

প্রজেক্টের রুট ডিরেক্টরিতে `.env.local` নামে একটি ফাইল তৈরি করুন (যদি না থাকে) এবং নিচের ভ্যালুগুলো দিন:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://oijnhqutzolkotsnnlix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini AI Client API Key (optional but recommended for Cyber AI Assistant)
GEMINI_API_KEY=your_gemini_api_key_here
```

> [!WARNING]
> `.env.local` ফাইলটিকে কখনো গিটহাবে পুশ করবেন না। নিশ্চিত করুন যে আপনার `.gitignore` ফাইলে `.env.local` যোগ করা আছে।

---

## 6. Install Dependencies

কমান্ড লাইনে নিচের কমান্ডটি দিয়ে Supabase Client SDK ইনস্টল করুন:
```bash
npm install @supabase/supabase-js
# অথবা pnpm ব্যবহার করলে:
pnpm add @supabase/supabase-js
```
*(আমাদের `package.json`-এ ইতিমধ্যে `@supabase/supabase-js` যোগ করা আছে, তাই `npm install` বা `pnpm install` দিলেই হবে)*

---

## 7. Supabase Client Setup

আমাদের প্রজেক্টে Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন ফাইলটি [src/lib/supabase.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/lib/supabase.ts) এ অবস্থিত। এটি স্বয়ংক্রিয়ভাবে পরিবেশের ভেরিয়েবল চেক করে কানেকশন তৈরি করে:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'WARNING: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Supabase operations will be bypassed.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

---

## 8. API Routes

Next.js-এর API গেটওয়েগুলো নিচের ডিরেক্টরিতে তৈরি করা আছে:
1. **Products API**:
   - `GET` & `POST`: [/api/products/route.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/api/products/route.ts) (প্রথমবার ডাটাবেস খালি থাকলে এটি স্বয়ংক্রিয়ভাবে Mock Products দিয়ে ডাটাবেস সিড করে দেবে)
   - `PUT` & `DELETE`: [/api/products/[id]/route.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/api/products/%5Bid%5D/route.ts)
2. **Orders API**:
   - `GET` & `POST`: [/api/orders/route.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/api/orders/route.ts) (ডাটাবেস খালি থাকলে সিডিং সহ নতুন অর্ডার প্রসেস ও ডাটাবেসে সেভ করার সুবিধা)
   - `PUT`: [/api/orders/[id]/route.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/api/orders/%5Bid%5D/route.ts) (অর্ডারের Fulfillment Status পরিবর্তন বা Track করার জন্য)
3. **Tickets API**:
   - `GET` & `POST`: [/api/tickets/route.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/api/tickets/route.ts)
   - `PUT`: [/api/tickets/[id]/route.ts](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/api/tickets/%5Bid%5D/route.ts) (সাপোর্ট টিকেট রিপ্লাই সেভ বা স্ট্যাটাস ক্লোজ করার জন্য)

---

## 9. AppStateContext Update

আমাদের গ্লোবাল স্টেট প্রোভাইডার [AppStateContext.tsx](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/lib/AppStateContext.tsx) অ্যাপটি মাউন্ট হওয়ার সাথে সাথে `/api/products`, `/api/orders` এবং `/api/tickets` রাউটগুলোতে ফেচ রিকোয়েস্ট পাঠায়।
- **ডাটাবেস কানেক্টেড থাকলে**: ডাটাবেসের লাইভ রিয়েলটাইম ডাটা লোড হবে।
- **ডাটাবেস কানেক্টেড না থাকলে (বা এরর হলে)**: `localStorage` থেকে ডাটা রিড করবে অথবা লোকাল ফলব্যাক মক ডাটা ব্যবহার করবে। এর ফলে প্রজেক্ট ডেভলপমেন্টে কোনো সমস্যা হয় না।

---

## 10. Authentication

Supabase Auth ব্যবহার করে ইউজার রেজিস্ট্রেশন ও লগইন ইন্টিগ্রেশন করার প্রসেস:
1. **রেজিস্ট্রেশন**: ইউজার ইমেইল ও পাসওয়ার্ড দিয়ে সাইন-আপ করার কোড:
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: userEmail,
     password: userPassword,
     options: {
       data: {
         name: userName,
         avatar: 'https://images.unsplash.com/...',
         walletBalanceUSD: 0.00,
         role: 'user',
         vipTier: 'Bronze',
       }
     }
   });
   ```
2. **লগইন**: সাইন-ইন কোড:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: userEmail,
     password: userPassword,
   });
   ```
3. **স্টেট আপডেট**: সাইন-ইন হওয়ার পর `supabase.auth.getUser()` ব্যবহার করে `user` স্টেট আপডেট করে ফেলুন।

---

## 11. Admin Dashboard Integration

এডমিন প্যানেলে ([src/app/admin/page.tsx](file:///Users/almumeetusaikat/Documents/GitHuB/Gamming/zenvo/src/app/admin/page.tsx)) প্রোডাক্ট ম্যানেজমেন্ট অপশন রয়েছে। যখনই এডমিন নতুন প্রোডাক্ট অ্যাড করে, বা প্রোডাক্ট আপডেট/ডিলিট করে, অ্যাপ স্টেট প্রোভাইডারের অ্যাকশনগুলো (`addProduct`, `updateProduct`, `deleteProduct`) ব্যাকএন্ডে API রিকোয়েস্ট পাঠিয়ে ডাটাবেসে সেভ করে।
- **অর্ডার ডেলিভারি**: এডমিন ড্যাশবোর্ড থেকে অর্ডার `Delivered` বা `Refunded` করলে তা ব্যাকএন্ডের `PUT /api/orders/[id]` এর মাধ্যমে ডাটাবেসে ইনস্ট্যান্ট স্ট্যাটাস আপডেট করে দেয়।

---

## 12. Vercel Deployment

আপনার প্রজেক্টটি Vercel-এ ডেপ্লয় করার সময়:
1. আপনার গিটহাব রিপোজিটরি কানেক্ট করুন।
2. **Environment Variables** সেকশনে যান।
3. নিচের ভেরিয়েবলগুলো হুবহু যোগ করুন:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. **Deploy** বাটনে ক্লিক করুন। বিল্ড সফল হলে আপনার সাইট লাইভ হয়ে যাবে।

---

## 13. Payment Flow (bKash / Nagad)

আমাদের সিস্টেমে পেমেন্ট ফ্লোটি সিমুলেটেড এবং অত্যন্ত নিখুঁত:
1. ইউজার কার্ট থেকে **Checkout** বাটনে ক্লিক করে পেমেন্ট মেথড (যেমন: bKash বা Nagad) সিলেক্ট করে।
2. ট্রানজেকশন আইডি এবং মোবাইল নম্বর দিয়ে পেমেন্ট কনফার্ম করলে ফ্রন্টএন্ড থেকে `POST /api/orders` এ ডাটা পাঠানো হয়।
3. ব্যাকএন্ড একটি নতুন অর্ডার আইডি এবং ট্রানজেকশন আইডি সহ Supabase-এর `orders` টেবিলে ডাটা এন্ট্রি দেয়।
4. এডমিন পরবর্তীতে এডমিন প্যানেল থেকে এই ট্রানজেকশন আইডি চেক করে অর্ডারটি প্রসেস করতে পারে।

---

## 14. Testing Checklist

ডাটাবেস কানেকশন ঠিকমতো কাজ করছে কিনা তা নিশ্চিত করতে নিচের টেস্টিং ধাপগুলো অনুসরণ করুন:

- [ ] `.env.local` ফাইল তৈরি করে Supabase এর URL ও Anon Key বসিয়েছেন।
- [ ] Supabase SQL Editor-এ ৩টি টেবিল স্ক্রিপ্ট রান করে টেবিলগুলো সফলভাবে তৈরি করেছেন।
- [ ] লোকাল সার্ভার চালু করেছেন (`pnpm run dev` বা `npm run dev`)।
- [ ] ব্রাউজারে কনসোল চেক করেছেন: `Supabase API initialized successfully.` মেসেজটি দেখতে পাচ্ছেন।
- [ ] শপ পেজে যেকোনো একটি গেমের উপরে ক্লিক করে টেস্ট অর্ডার (Checkout) দিয়েছেন।
- [ ] Supabase ড্যাশবোর্ডে **Table Editor > orders**-এ গিয়ে আপনার প্লেস করা অর্ডারটি দেখতে পাচ্ছেন।
- [ ] এডমিন প্যানেলে নতুন একটি প্রোডাক্ট যোগ করেছেন এবং তা ডাটাবেসের `products` টেবিলে যোগ হয়েছে।
- [ ] সাপোর্ট পেজে একটি টিকেট ক্রিয়েট করেছেন এবং তা ডাটাবেসের `tickets` টেবিলে রিফ্লেক্ট হয়েছে।

---
*আপনার গেমিং শপের ব্যাকএন্ড এখন সম্পূর্ণ প্রস্তুত এবং স্কেলেবল! কোনো এরর বা কোয়েরি থাকলে আমাদের জানান।*
