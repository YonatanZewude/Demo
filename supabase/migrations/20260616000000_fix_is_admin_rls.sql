create or replace function public.requesting_clerk_user_id()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb := auth.jwt();
begin
  return coalesce(claims ->> 'sub', '');
end;
$$;

drop policy if exists "storage upload admin" on storage.objects;
drop policy if exists "storage delete admin" on storage.objects;
drop function if exists public.is_admin(text);

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return true;
  end if;

  return exists (
    select 1
    from public.admin_users
    where clerk_user_id = public.requesting_clerk_user_id()
  );
end;
$$;

grant execute on function public.requesting_clerk_user_id() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
