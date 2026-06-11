-- Create gallery_images table
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for ordering
create index if not exists gallery_images_order_idx on public.gallery_images (display_order, created_at);

-- Enable RLS
alter table public.gallery_images enable row level security;

-- Policy: Admins can manage gallery images
drop policy if exists "admins manage gallery images" on public.gallery_images;
create policy "admins manage gallery images"
on public.gallery_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Policy: Public can read active gallery images
drop policy if exists "public reads active gallery images" on public.gallery_images;
create policy "public reads active gallery images"
on public.gallery_images
for select
to anon, authenticated
using (is_active or public.is_admin());

-- Create storage bucket for gallery images
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Storage policies for gallery bucket
drop policy if exists "admins can upload gallery images" on storage.objects;
create policy "admins can upload gallery images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gallery'
  and public.is_admin()
);

drop policy if exists "admins can update gallery images" on storage.objects;
create policy "admins can update gallery images"
on storage.objects
for update
to authenticated
using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "admins can delete gallery images" on storage.objects;
create policy "admins can delete gallery images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "public can view gallery images" on storage.objects;
create policy "public can view gallery images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery');
