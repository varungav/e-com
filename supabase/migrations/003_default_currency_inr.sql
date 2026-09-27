-- Switches the default currency for new products/orders to INR (matches
-- the Razorpay account, which requires international payments approval for
-- other currencies). Existing rows are unaffected by this alone — products
-- were already backfilled to INR separately.

alter table public.products alter column currency set default 'INR';
alter table public.orders alter column currency set default 'INR';
