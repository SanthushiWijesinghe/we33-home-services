-- Member 1 foundation. Apply through the Supabase SQL editor or CLI before using live screens.
-- Public signup may create CUSTOMER or SERVICE_PROVIDER accounts. ADMIN is assigned only by a trusted operator.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  category text not null,
  location text not null default 'Colombo',
  bio text not null default '',
  years_experience integer not null default 0 check (years_experience between 0 and 70),
  base_price_lkr integer not null default 0 check (base_price_lkr >= 0),
  avatar_url text,
  rating_avg numeric(2,1) not null default 0 check (rating_avg between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  verification_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  kind text not null check (kind in ('identity_front', 'identity_back', 'certificate')),
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists provider_profiles_status_category_idx
  on public.provider_profiles(verification_status, category);
create index if not exists provider_documents_provider_idx on public.provider_documents(provider_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists provider_profiles_updated_at on public.provider_profiles;
create trigger provider_profiles_updated_at before update on public.provider_profiles
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare requested_role text;
begin
  requested_role := upper(coalesce(new.raw_user_meta_data ->> 'role', 'CUSTOMER'));
  if requested_role not in ('CUSTOMER', 'SERVICE_PROVIDER') then requested_role := 'CUSTOMER'; end if;
  insert into public.profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), requested_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists auth_user_created_profile on auth.users;
create trigger auth_user_created_profile after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'ADMIN');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_documents enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.provider_profiles from anon, authenticated;
revoke all on public.provider_documents from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant select on public.provider_profiles to anon, authenticated;
grant insert (user_id, display_name, category, location, bio, years_experience, base_price_lkr, avatar_url)
  on public.provider_profiles to authenticated;
grant update (display_name, category, location, bio, years_experience, base_price_lkr, avatar_url)
  on public.provider_profiles to authenticated;
grant select, insert on public.provider_documents to authenticated;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists provider_profiles_read on public.provider_profiles;
create policy provider_profiles_read on public.provider_profiles for select to anon, authenticated
using (verification_status = 'approved' or user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists provider_profiles_insert_self on public.provider_profiles;
create policy provider_profiles_insert_self on public.provider_profiles for insert to authenticated
with check (user_id = (select auth.uid()) and verification_status = 'pending' and exists
  (select 1 from public.profiles where id = (select auth.uid()) and role = 'SERVICE_PROVIDER'));
drop policy if exists provider_profiles_update_self on public.provider_profiles;
create policy provider_profiles_update_self on public.provider_profiles for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists provider_documents_read on public.provider_documents;
create policy provider_documents_read on public.provider_documents for select to authenticated
using (provider_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists provider_documents_insert_self on public.provider_documents;
create policy provider_documents_insert_self on public.provider_documents for insert to authenticated
with check (provider_id = (select auth.uid()) and split_part(storage_path, '/', 1) = (select auth.uid())::text);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('provider-documents', 'provider-documents', false, 5242880,
  array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

drop policy if exists provider_documents_storage_insert on storage.objects;
create policy provider_documents_storage_insert on storage.objects for insert to authenticated
with check (bucket_id = 'provider-documents' and split_part(name, '/', 1) = (select auth.uid())::text);
drop policy if exists provider_documents_storage_read on storage.objects;
create policy provider_documents_storage_read on storage.objects for select to authenticated
using (bucket_id = 'provider-documents' and
  (split_part(name, '/', 1) = (select auth.uid())::text or (select public.is_admin())));

create or replace function public.review_provider(
  p_provider_id uuid, p_status text, p_note text default null
) returns public.provider_profiles
language plpgsql security definer set search_path = '' as $$
declare result public.provider_profiles;
begin
  if not public.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid verification status' using errcode = '22023';
  end if;
  if p_status = 'rejected' and length(trim(coalesce(p_note, ''))) = 0 then
    raise exception 'A rejection reason is required' using errcode = '22023';
  end if;
  if p_status = 'approved' and
    (select count(distinct d.kind) from public.provider_documents d
     join storage.objects o on o.bucket_id = 'provider-documents' and o.name = d.storage_path
     where d.provider_id = p_provider_id and d.kind in ('identity_front', 'identity_back')) < 2 then
    raise exception 'Front and back identity documents are required before approval' using errcode = '22023';
  end if;
  update public.provider_profiles
  set verification_status = p_status, verification_note = nullif(trim(coalesce(p_note, '')), ''),
      reviewed_by = auth.uid(), reviewed_at = now()
  where user_id = p_provider_id returning * into result;
  if not found then raise exception 'Provider not found' using errcode = 'P0002'; end if;
  return result;
end;
$$;
revoke all on function public.review_provider(uuid, text, text) from public;
grant execute on function public.review_provider(uuid, text, text) to authenticated;
