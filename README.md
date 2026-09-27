# E-Com — Next.js + Supabase e-commerce store

A full-stack e-commerce storefront built with Next.js (App Router) and Supabase,
using Supabase's native features:

- **Auth** — email/password sign up, log in, password reset, session refresh via middleware
- **Postgres + Row Level Security** — products, categories, cart, orders, order items, profiles
- **Storage** — product image uploads (public bucket with admin-only write policies)
- **Database trigger** — auto-creates a `profiles` row when a user signs up
- **Role-based access** — `admin` vs `customer`, enforced by RLS policies and route checks

Features: product catalog with categories, product detail pages, persistent cart (per
signed-in user), checkout flow (simulated payment — see note below), order history,
and an admin dashboard to create/edit/delete products with image upload.

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Wait for it to finish provisioning.

## 2. Run the database schema

1. In your Supabase project, open **SQL Editor > New query**.
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.
   This creates all tables, RLS policies, the storage bucket, and some demo product data.

## 3. Get your credentials

Go to **Settings > API** in your Supabase project and copy:

- **Project URL**
- **anon public** key
- **service_role** key (keep this secret — server-only)

## 4. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=          # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # anon public key
SUPABASE_SERVICE_ROLE_KEY=         # service_role key (secret!)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## 6. Make yourself an admin

1. Sign up for an account in the running app.
2. In Supabase, go to **Table Editor > profiles**, find your user row, and set `role` to `admin`
   (or run `update public.profiles set role = 'admin' where id = '<your-user-uuid>';` in the SQL editor).
3. Reload the app — you'll see an **Admin** link in the nav.

## Admin panel

Visiting `/admin` (admins only) gives you:

- **Dashboard** (`/admin`) — quick counts of products, categories, and orders.
- **Products** (`/admin/products`) — create, edit, delete products; upload an image per product
  (stored in the `product-images` Supabase Storage bucket); toggle a product active/hidden.
- **Categories** (`/admin/categories`) — add or delete categories used to organize products.

All of this is enforced server-side by Postgres Row Level Security (not just hidden in the UI) —
only a `profiles.role = 'admin'` user can insert/update/delete products or categories.

## Auth email redirects

For signup confirmation / password reset emails to redirect correctly:

- In Supabase, go to **Authentication > URL Configuration**.
- Set **Site URL** to `http://localhost:3000` (or your deployed URL).
- Add `http://localhost:3000/auth/callback` (and your production equivalent) to **Redirect URLs**.

## Payments (Razorpay)

Checkout takes real payments via [Razorpay](https://razorpay.com) Checkout. The flow is:

1. `createCheckoutOrder()` ([lib/actions/payment.ts](./lib/actions/payment.ts)) re-reads your
   cart from the database and creates a Razorpay order **server-side**, from the product's
   actual price — the browser never gets to say what the amount should be.
2. The client ([components/CheckoutForm.tsx](./components/CheckoutForm.tsx)) opens Razorpay's
   Checkout popup with that order id.
3. After payment, `confirmPayment()` verifies Razorpay's signature (HMAC with your key
   secret) **before** creating the order row in Supabase, decrementing stock, and clearing
   the cart. A payment that isn't genuinely verified never becomes an order.

### Setup

1. Create a [Razorpay account](https://dashboard.razorpay.com/signup) (or use an existing one).
2. Go to **Settings > API Keys** and generate a **Test** key pair.
3. Add both to `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
4. Restart the dev server. Go through checkout — Razorpay's test mode accepts card
   `4111 1111 1111 1111`, any future expiry, any CVV (see
   [Razorpay's test card docs](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
   for more test cards/UPI IDs).
5. Switch to your **Live** key pair (same two env vars) when you're ready to accept real
   payments — no code changes needed.

Note: this store's demo products are priced in USD. Whichever currency your products use,
your Razorpay account needs to support it — INR works out of the box for any Indian
account; other currencies (like USD) require international payments to be enabled on the
account, or you can just change the seeded products' `currency`/prices to INR.

## Notes / next steps

- **Realtime**: Supabase Realtime isn't wired up yet, but could be added (e.g. live order
  status updates) by subscribing to the `orders` table via `supabase.channel(...)`.
- **OAuth providers** (Google/GitHub login, etc.) can be enabled in Supabase Auth settings
  and added to the login/signup pages via `supabase.auth.signInWithOAuth(...)`.
