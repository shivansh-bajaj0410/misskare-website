# MissKare — Boutique Lingerie E-Commerce

A full-stack, boutique-luxury e-commerce site for a premium lingerie brand. Built with
Next.js (App Router), Tailwind CSS, Framer Motion, and React Three Fiber, with a real
cart, checkout (Stripe test mode), accounts, and order history.

## What's included

- **Cinematic landing page** — full-viewport looping boutique video hero (seamlessly
  crossfaded loop point), staggered fade/rise text animation, scroll-triggered section
  reveals, mobile fallback to a static poster frame on small/slow connections.
- **New Arrivals, Shop by Category, and a 3D rotate-to-view product showcase**
  (React Three Fiber) for the signature hero product.
- **Brand story section, Instagram-style UGC gallery, newsletter signup, footer.**
- **Full product catalog** — listing pages with filters (category, color, size, price)
  and sorting, product detail pages with a hover-zoom image gallery, color swatches,
  size selector, size guide modal, add-to-cart, and "you may also like" recommendations.
- **Real cart** — slide-out drawer, quantity editing, removal, promo codes, persisted
  to the browser between visits.
- **Checkout flow** — shipping form → Stripe Checkout (test mode) → order confirmation
  page, with a graceful mock-payment fallback if Stripe isn't configured yet (so the
  whole flow is testable immediately, with zero setup).
- **Accounts** — signup/login (JWT in an httpOnly cookie), order history, saved
  addresses, and a wishlist (works for guests via local storage, and syncs
  server-side once signed in).
- **Search with autocomplete** in the header.
- **Seed data** — 4 categories, 14 products, 2 promo codes (`WELCOME10`, `CANDLELIGHT20`).

## Tech stack

- **Frontend:** Next.js 14 (App Router, JavaScript) + Tailwind CSS + Framer Motion +
  React Three Fiber / drei
- **Backend:** Next.js API routes
- **Database:** SQLite via `better-sqlite3` for zero-config local dev (see
  **"Moving to Postgres"** below for production)
- **Payments:** Stripe Checkout (test mode)
- **Auth:** Custom JWT session cookie + bcrypt password hashing (no third-party auth
  service required)

> **Why SQLite instead of Prisma+Postgres locally?** Prisma's query engine needs to
> download a platform binary from Prisma's CDN on first install, which isn't always
> reachable in locked-down sandboxes/CI. To guarantee this runs anywhere with zero
> extra setup, the data layer is a small `better-sqlite3`-backed module
> (`src/lib/db.js`) that exposes the same `prisma.model.method()` call shape used
> throughout the API routes. `docs/postgres-schema.prisma` has the equivalent Prisma
> schema, ready to drop in for a managed Postgres database — see below.

## Getting started

```bash
npm install
npm run seed     # creates dev.db and seeds categories/products/promo codes
npm run dev       # http://localhost:3000
```

That's it — no database server, no API keys required to browse the site, add to
cart, and complete a full mock checkout.

### Enabling real Stripe test payments

1. Create a free Stripe account and grab your **test mode** keys from
   https://dashboard.stripe.com/test/apikeys
2. Copy `.env.example` to `.env.local` and fill in:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Restart `npm run dev`. Checkout will now redirect to a real Stripe-hosted
   Checkout Session (still test mode — use card `4242 4242 4242 4242`, any future
   expiry, any CVC).
4. (Optional, for production) Set up a webhook endpoint pointing to
   `/api/checkout/webhook` and add `STRIPE_WEBHOOK_SECRET` — this confirms payment
   server-side instead of relying on the success-page redirect.

### Environment variables

See `.env.example` for the full list (JWT secret, Stripe keys, site URL).

## Project structure

```
src/
  app/                  # Next.js App Router pages + API routes
    page.js             # Landing page
    shop/                # Product listing (all + by category)
    product/[slug]/      # Product detail page
    search/               # Search results
    checkout/             # Shipping form + Stripe redirect
    checkout/success/     # Order confirmation
    account/              # Login, signup, dashboard, orders, addresses, wishlist
    api/                  # REST-ish API routes (products, auth, orders, etc.)
  components/            # Hero, CartDrawer, ProductShowcase3D, ShopBrowser, etc.
  lib/
    db.js                 # SQLite connection + Prisma-shaped query layer
    auth.js               # JWT session helpers
    stripe.js              # Stripe server client
    cartStore.js            # Zustand cart (persisted to localStorage)
    wishlistStore.js         # Zustand guest wishlist (persisted to localStorage)
scripts/seed.mjs         # Seed script (categories, products, promo codes)
public/media/            # Hero video (desktop + mobile) + poster frame
docs/postgres-schema.prisma  # Reference schema for a production Postgres migration
```

## Moving to Postgres + Prisma for production

The included SQLite layer is intentionally drop-in compatible with Prisma's call
shape, so migrating is mostly mechanical:

1. `npm install prisma @prisma/client`
2. Copy `docs/postgres-schema.prisma` to `prisma/schema.prisma`
3. Set `DATABASE_URL` to your managed Postgres connection string (Vercel Postgres,
   Neon, Supabase, Railway, etc.)
4. `npx prisma migrate dev` (or `db push`) to create tables, then adapt
   `scripts/seed.mjs` to use `@prisma/client` instead of raw SQL (the data shape is
   unchanged).
5. Replace `export const prisma = { ... }` in `src/lib/db.js` with:
   ```js
   import { PrismaClient } from '@prisma/client';
   export const prisma = globalThis.prisma || new PrismaClient();
   ```
   No changes are needed in any API route or page — they already call
   `prisma.product.findMany(...)`, `prisma.order.create(...)`, etc.

## Deploying

**Recommended: Vercel + a managed Postgres provider**

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Provision a Postgres database (Vercel Postgres, Neon, or Supabase all work) and
   complete the "Moving to Postgres" steps above before deploying, since Vercel's
   filesystem is read-only/ephemeral in production (SQLite won't persist there).
4. Add environment variables in the Vercel project settings: `DATABASE_URL`,
   `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
5. Deploy. Run your seed script once against the production database (e.g. via
   `vercel env pull` + `npm run seed` locally pointed at the prod `DATABASE_URL`,
   or a one-off Vercel CLI function).
6. Add a Stripe webhook in the Stripe dashboard pointing to
   `https://yourdomain.com/api/checkout/webhook` and copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.

## Known simplifications (by design, for a demo/dev build)

- **Product photography** uses neutral placeholder images (Picsum) rather than real
  product shots — swap the `images` field values in `scripts/seed.mjs` (or the
  database directly) for real Cloudinary/CDN URLs.
- **3D product viewer** uses the product's own photography mapped onto a rotating
  card rather than a true photogrammetry/3D model, per the brief's "or a convincing
  CSS/3D card-flip" fallback option — swap in a real `.glb` model via `useGLTF` from
  `@react-three/drei` if/when one exists.
- **Shipping cost** is hardcoded to free for the demo; wire up real rate calculation
  in `src/app/api/checkout/create-session/route.js` if needed.
- Guest wishlist is per-browser (localStorage); it syncs to a real per-account
  wishlist automatically once a user signs in.
