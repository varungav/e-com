-- Adds the address book, promo codes, and related order columns.
-- Safe to run on a database that already has schema.sql applied.

create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

drop policy if exists "Users manage their own addresses" on public.addresses;
create policy "Users manage their own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  max_discount_cents integer,
  min_order_cents integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

drop policy if exists "Active promo codes are viewable by everyone" on public.promo_codes;
create policy "Active promo codes are viewable by everyone"
  on public.promo_codes for select
  using (is_active = true);

drop policy if exists "Admins can view all promo codes" on public.promo_codes;
create policy "Admins can view all promo codes"
  on public.promo_codes for select
  using (public.is_admin());

drop policy if exists "Admins can insert promo codes" on public.promo_codes;
create policy "Admins can insert promo codes"
  on public.promo_codes for insert
  with check (public.is_admin());

drop policy if exists "Admins can update promo codes" on public.promo_codes;
create policy "Admins can update promo codes"
  on public.promo_codes for update
  using (public.is_admin());

drop policy if exists "Admins can delete promo codes" on public.promo_codes;
create policy "Admins can delete promo codes"
  on public.promo_codes for delete
  using (public.is_admin());

alter table public.orders
  add column if not exists subtotal_cents integer not null default 0,
  add column if not exists discount_cents integer not null default 0,
  add column if not exists promo_code text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_line1 text,
  add column if not exists shipping_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text;

-- Backfill subtotal for existing orders (no discounts existed before this).
update public.orders set subtotal_cents = total_cents where subtotal_cents = 0;

insert into public.promo_codes (code, description, discount_type, discount_value, max_discount_cents, min_order_cents) values
  ('WELCOME10', '10% off your first order', 'percent', 10, 50000, 0),
  ('FLAT200', '₹200 off orders over ₹1,500', 'fixed', 20000, null, 150000)
on conflict (code) do nothing;
