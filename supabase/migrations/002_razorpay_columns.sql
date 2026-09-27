-- Run this if you already applied supabase/schema.sql before Razorpay was
-- added — it just adds the two new nullable tracking columns to `orders`.
-- (If you're running schema.sql fresh, you don't need this file — it's
-- already included there.)

alter table public.orders
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text;
