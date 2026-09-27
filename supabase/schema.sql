-- ════════════════════════════════════════════════════════════════
-- E-com schema for Supabase
-- Run this whole file in: Supabase Dashboard > SQL Editor > New query
-- ════════════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- PROFILES (1:1 with auth.users)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Lets an admin promote/demote other users by email via RLS-respecting RPC
-- calls (no service-role key needed in the app). Both are SECURITY DEFINER
-- but self-check is_admin() first, so only an actual admin can use them.
create or replace function public.admin_set_user_role(target_email text, new_role text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;

  if new_role not in ('customer', 'admin') then
    raise exception 'Invalid role: %', new_role;
  end if;

  select id into target_id from auth.users where email = lower(target_email);
  if target_id is null then
    raise exception 'No user found with email %', target_email;
  end if;

  insert into public.profiles (id, role)
  values (target_id, new_role)
  on conflict (id) do update set role = excluded.role;
end;
$$;

grant execute on function public.admin_set_user_role(text, text) to authenticated;

create or replace function public.admin_list_admins()
returns table (id uuid, email text, full_name text, created_at timestamptz)
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can list admins';
  end if;

  return query
    select p.id, u.email::text, p.full_name, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'admin'
    order by p.created_at;
end;
$$;

grant execute on function public.admin_list_admins() to authenticated;

-- ────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories for update
  using (public.is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'INR',
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true);

create policy "Admins can view all products"
  on public.products for select
  using (public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- CART ITEMS (persisted per signed-in user)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "Users manage their own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- ORDERS + ORDER ITEMS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'paid' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  promo_code text,
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'INR',
  shipping_name text,
  shipping_phone text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_address text,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins update orders"
  on public.orders for update
  using (public.is_admin());

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0)
);

alter table public.order_items enable row level security;

create policy "Users view items of their own orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users create items for their own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins view all order items"
  on public.order_items for select
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- ADDRESSES (saved shipping addresses, Amazon-style address book)
-- ────────────────────────────────────────────────────────────────
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

create policy "Users manage their own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- PROMO CODES
-- ────────────────────────────────────────────────────────────────
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

create policy "Active promo codes are viewable by everyone"
  on public.promo_codes for select
  using (is_active = true);

create policy "Admins can view all promo codes"
  on public.promo_codes for select
  using (public.is_admin());

create policy "Admins can insert promo codes"
  on public.promo_codes for insert
  with check (public.is_admin());

create policy "Admins can update promo codes"
  on public.promo_codes for update
  using (public.is_admin());

create policy "Admins can delete promo codes"
  on public.promo_codes for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- STORAGE: product-images bucket (public read, admin write)
-- ────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- SEED DATA (optional demo data — safe to delete)
-- ────────────────────────────────────────────────────────────────
insert into public.categories (name, slug) values
  ('Electronics', 'electronics'),
  ('Apparel', 'apparel'),
  ('Home & Kitchen', 'home-kitchen')
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, price_cents, image_url, stock)
select c.id, p.name, p.slug, p.description, p.price_cents, p.image_url, p.stock
from (values
  ('electronics', 'Wireless Headphones', 'wireless-headphones', 'Noise-cancelling over-ear headphones with 30h battery life.', 8999, 'https://placehold.co/600x600?text=Headphones', 25),
  ('electronics', 'Smart Watch', 'smart-watch', 'Fitness tracking smart watch with heart-rate monitor.', 14999, 'https://placehold.co/600x600?text=Smart+Watch', 15),
  ('apparel', 'Classic T-Shirt', 'classic-t-shirt', '100% organic cotton crew neck t-shirt.', 1999, 'https://placehold.co/600x600?text=T-Shirt', 100),
  ('home-kitchen', 'Ceramic Mug Set', 'ceramic-mug-set', 'Set of 4 handcrafted ceramic mugs.', 2499, 'https://placehold.co/600x600?text=Mug+Set', 40)
) as p(cat_slug, name, slug, description, price_cents, image_url, stock)
join public.categories c on c.slug = p.cat_slug
on conflict (slug) do nothing;

insert into public.promo_codes (code, description, discount_type, discount_value, max_discount_cents, min_order_cents) values
  ('WELCOME10', '10% off your first order', 'percent', 10, 50000, 0),
  ('FLAT200', '₹200 off orders over ₹1,500', 'fixed', 20000, null, 150000)
on conflict (code) do nothing;

-- ────────────────────────────────────────────────────────────────
-- To make a user an admin, run (after they've signed up once):
-- update public.profiles set role = 'admin' where id = '<user-uuid>';
-- ────────────────────────────────────────────────────────────────
