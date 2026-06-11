create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null unique check (weekday between 0 and 6),
  is_open boolean not null default false,
  start_time time,
  end_time time,
  break_start time,
  break_end time,
  created_at timestamptz not null default now(),
  constraint opening_hours_time_check check (
    (not is_open and start_time is null and end_time is null)
    or (is_open and start_time is not null and end_time is not null and start_time < end_time)
  ),
  constraint opening_hours_break_check check (
    (break_start is null and break_end is null)
    or (break_start is not null and break_end is not null and break_start < break_end)
  )
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  customer_message text,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint bookings_time_check check (start_time < end_time)
);

create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_service_idx on public.bookings (service_id);

insert into public.opening_hours (weekday, is_open, start_time, end_time, break_start, break_end)
values
  (0, false, null, null, null, null),
  (1, true, '09:00', '18:00', '12:30', '13:15'),
  (2, true, '09:00', '18:00', '12:30', '13:15'),
  (3, true, '09:00', '18:00', '12:30', '13:15'),
  (4, true, '09:00', '18:00', '12:30', '13:15'),
  (5, true, '09:00', '18:00', '12:30', '13:15'),
  (6, true, '10:00', '15:00', null, null)
on conflict (weekday) do nothing;

create or replace function public.requesting_clerk_user_id()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'sub', '');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.role() = 'service_role'
    or exists (
    select 1
    from public.admin_users
    where clerk_user_id = public.requesting_clerk_user_id()
  );
$$;

create or replace function public.get_booking_occupancy(target_date date)
returns table(start_time time, end_time time)
language sql
security definer
set search_path = public
as $$
  select bookings.start_time, bookings.end_time
  from public.bookings
  where bookings.booking_date = target_date
    and bookings.status <> 'cancelled';
$$;

grant execute on function public.get_booking_occupancy(date) to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.services enable row level security;
alter table public.opening_hours enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "admin users can read own row" on public.admin_users;
create policy "admin users can read own row"
on public.admin_users
for select
to authenticated
using (clerk_user_id = public.requesting_clerk_user_id());

drop policy if exists "admins manage services" on public.services;
create policy "admins manage services"
on public.services
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public reads active services" on public.services;
create policy "public reads active services"
on public.services
for select
to anon, authenticated
using (is_active or public.is_admin());

drop policy if exists "admins manage opening hours" on public.opening_hours;
create policy "admins manage opening hours"
on public.opening_hours
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public reads opening hours" on public.opening_hours;
create policy "public reads opening hours"
on public.opening_hours
for select
to anon, authenticated
using (true);

drop policy if exists "admins manage bookings" on public.bookings;
create policy "admins manage bookings"
on public.bookings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public creates bookings" on public.bookings;
create policy "public creates bookings"
on public.bookings
for insert
to anon, authenticated
with check (
  status = 'pending'
  and start_time < end_time
  and exists (
    select 1
    from public.services
    where services.id = service_id
      and services.is_active = true
  )
);