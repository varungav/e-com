-- Adds a 'delivered' status so admins can mark orders fully delivered —
-- the account order-detail stepper already had a "Delivered" step that
-- could never actually be reached because the check constraint didn't
-- allow it.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled'));
