-- Lets an existing admin promote/demote other users by email, entirely
-- through RLS-respecting RPC calls (no service-role key needed in the app).
-- Both functions are SECURITY DEFINER but self-check `is_admin()` first, so
-- only an actual admin can ever use them even though they run with elevated
-- privileges to reach auth.users.

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
