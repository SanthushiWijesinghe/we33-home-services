-- Member 3: service catalog, provider availability, atomic booking creation and inbox.
-- Apply after 20261007_member1_foundation.sql. Member 4 may extend bookings later.

create extension if not exists btree_gist;

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  icon_key text not null default 'wrench',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.service_categories (name, slug, icon_key) values
  ('Electrical', 'electrical', 'zap'),
  ('Plumbing', 'plumbing', 'droplets'),
  ('Cleaning', 'cleaning', 'sparkles'),
  ('AC Repair', 'ac-repair', 'snowflake'),
  ('Painting', 'painting', 'paintbrush'),
  ('Carpentry', 'carpentry', 'hammer')
on conflict (slug) do nothing;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  category_id uuid not null references public.service_categories(id),
  title text not null check (length(trim(title)) between 3 and 100),
  description text not null default '' check (length(description) <= 2000),
  price_lkr integer not null check (price_lkr >= 0),
  duration_minutes integer not null default 60 check (duration_minutes between 30 and 480 and duration_minutes % 30 = 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, provider_id)
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null,
  service_id uuid not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'available' check (status in ('available', 'booked')),
  created_at timestamptz not null default now(),
  foreign key (service_id, provider_id) references public.services(id, provider_id) on delete cascade,
  check (end_at > start_at and end_at <= start_at + interval '8 hours'),
  constraint member3_provider_slots_do_not_overlap exclude using gist
    (provider_id with =, tstzrange(start_at, end_at, '[)') with &&)
    where (status in ('available', 'booked'))
);

-- Keep saved appointment times bookable when a provider edits the service.
create or replace function public.member3_guard_service_duration()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.duration_minutes <> old.duration_minutes and exists (
    select 1 from public.availability_slots
    where service_id = old.id and start_at > now()
  ) then
    raise exception 'Remove future availability before changing service duration' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists member3_guard_service_duration on public.services;
create trigger member3_guard_service_duration before update on public.services
for each row execute function public.member3_guard_service_duration();

create or replace function public.member3_validate_slot_duration()
returns trigger language plpgsql set search_path = '' as $$
declare expected_minutes integer;
begin
  select duration_minutes into expected_minutes from public.services where id = new.service_id;
  if expected_minutes is null or extract(epoch from (new.end_at - new.start_at)) <> expected_minutes * 60 then
    raise exception 'Slot must match service duration' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists member3_validate_slot_duration on public.availability_slots;
create trigger member3_validate_slot_duration before insert or update on public.availability_slots
for each row execute function public.member3_validate_slot_duration();

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  provider_id uuid not null references public.provider_profiles(user_id),
  service_id uuid not null references public.services(id),
  slot_id uuid not null unique references public.availability_slots(id),
  service_title text not null,
  address_text text not null check (length(trim(address_text)) between 8 and 500),
  price_lkr integer not null check (price_lkr >= 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('booking_created', 'booking_received', 'general')),
  title text not null,
  body text not null,
  booking_id uuid references public.bookings(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists member3_services_provider_idx on public.services(provider_id, is_active);
create index if not exists member3_slots_service_start_idx on public.availability_slots(service_id, start_at);
create index if not exists member3_bookings_customer_idx on public.bookings(customer_id, created_at desc);
create index if not exists member3_bookings_provider_idx on public.bookings(provider_id, created_at desc);
create index if not exists member3_notifications_recipient_idx on public.notifications(recipient_id, created_at desc);

drop trigger if exists member3_services_updated_at on public.services;
create trigger member3_services_updated_at before update on public.services
for each row execute function public.set_updated_at();

-- This helper checks the signed-in account against the trusted provider profile.
create or replace function public.member3_can_manage_service(p_provider_id uuid, p_category_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_provider_id = (select auth.uid()) and exists (
    select 1 from public.provider_profiles pp
    join public.profiles p on p.id = pp.user_id
    join public.service_categories c on c.id = p_category_id
    where pp.user_id = p_provider_id and pp.verification_status = 'approved'
      and p.role = 'SERVICE_PROVIDER' and c.is_active
      and lower(pp.category) = lower(c.name)
  );
$$;
revoke all on function public.member3_can_manage_service(uuid, uuid) from public;
grant execute on function public.member3_can_manage_service(uuid, uuid) to authenticated;

create or replace function public.member3_can_manage_slot(p_provider_id uuid, p_service_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_provider_id = (select auth.uid()) and exists (
    select 1 from public.services s
    where s.id = p_service_id and s.provider_id = p_provider_id and s.is_active
      and public.member3_can_manage_service(s.provider_id, s.category_id)
  );
$$;
revoke all on function public.member3_can_manage_slot(uuid, uuid) from public;
grant execute on function public.member3_can_manage_slot(uuid, uuid) to authenticated;

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.notifications enable row level security;

revoke all on public.service_categories, public.services, public.availability_slots,
  public.bookings, public.notifications from anon, authenticated;
grant select on public.service_categories, public.services, public.availability_slots to anon, authenticated;
grant insert (name, slug, icon_key, is_active) on public.service_categories to authenticated;
grant update (name, slug, icon_key, is_active) on public.service_categories to authenticated;
grant delete on public.service_categories to authenticated;
grant insert (provider_id, category_id, title, description, price_lkr, duration_minutes, is_active)
  on public.services to authenticated;
grant update (title, description, price_lkr, duration_minutes, is_active) on public.services to authenticated;
grant delete on public.services to authenticated;
grant insert (provider_id, service_id, start_at, end_at) on public.availability_slots to authenticated;
grant update (start_at, end_at) on public.availability_slots to authenticated;
grant delete on public.availability_slots to authenticated;
grant select on public.bookings, public.notifications to authenticated;

drop policy if exists member3_categories_read on public.service_categories;
create policy member3_categories_read on public.service_categories for select to anon, authenticated
using (is_active or (select public.is_admin()));
drop policy if exists member3_categories_admin_insert on public.service_categories;
create policy member3_categories_admin_insert on public.service_categories for insert to authenticated
with check ((select public.is_admin()));
drop policy if exists member3_categories_admin_update on public.service_categories;
create policy member3_categories_admin_update on public.service_categories for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists member3_categories_admin_delete on public.service_categories;
create policy member3_categories_admin_delete on public.service_categories for delete to authenticated
using ((select public.is_admin()));

drop policy if exists member3_services_read on public.services;
create policy member3_services_read on public.services for select to anon, authenticated
using (
  (is_active and exists (
    select 1 from public.service_categories c where c.id = category_id and c.is_active
  ) and exists (
    select 1 from public.provider_profiles pp where pp.user_id = provider_id and pp.verification_status = 'approved'
  ))
  or provider_id = (select auth.uid())
  or (select public.is_admin())
);
drop policy if exists member3_services_insert on public.services;
create policy member3_services_insert on public.services for insert to authenticated
with check (public.member3_can_manage_service(provider_id, category_id));
drop policy if exists member3_services_update on public.services;
create policy member3_services_update on public.services for update to authenticated
using (provider_id = (select auth.uid()) or (select public.is_admin()))
with check (public.member3_can_manage_service(provider_id, category_id) or (select public.is_admin()));
drop policy if exists member3_services_delete on public.services;
create policy member3_services_delete on public.services for delete to authenticated
using (provider_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists member3_slots_read on public.availability_slots;
create policy member3_slots_read on public.availability_slots for select to anon, authenticated
using ((status = 'available' and start_at > now() and exists (
  select 1 from public.services s where s.id = service_id and s.is_active
)) or provider_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists member3_slots_insert on public.availability_slots;
create policy member3_slots_insert on public.availability_slots for insert to authenticated
with check (status = 'available' and start_at > now() and public.member3_can_manage_slot(provider_id, service_id));
drop policy if exists member3_slots_update on public.availability_slots;
create policy member3_slots_update on public.availability_slots for update to authenticated
using (provider_id = (select auth.uid()) and status = 'available')
with check (status = 'available' and start_at > now() and public.member3_can_manage_slot(provider_id, service_id));
drop policy if exists member3_slots_delete on public.availability_slots;
create policy member3_slots_delete on public.availability_slots for delete to authenticated
using (provider_id = (select auth.uid()) and status = 'available');

drop policy if exists member3_bookings_participants_read on public.bookings;
create policy member3_bookings_participants_read on public.bookings for select to authenticated
using (customer_id = (select auth.uid()) or provider_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists member3_notifications_owner_read on public.notifications;
create policy member3_notifications_owner_read on public.notifications for select to authenticated
using (recipient_id = (select auth.uid()));

-- One database transaction locks the slot, checks eligibility, reserves it and creates the booking.
-- No direct client INSERT privilege exists on bookings or notifications.
create or replace function public.book_service_slot(
  p_service_id uuid, p_slot_id uuid, p_address text
) returns public.bookings
language plpgsql security definer set search_path = '' as $$
declare
  v_slot public.availability_slots;
  v_service public.services;
  v_booking public.bookings;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'CUSTOMER') then
    raise exception 'Customer access required' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_address, ''))) not between 8 and 500 then
    raise exception 'Enter a service address between 8 and 500 characters' using errcode = '22023';
  end if;

  select * into v_slot from public.availability_slots where id = p_slot_id for update;
  if not found or v_slot.status <> 'available' or v_slot.start_at <= now() then
    raise exception 'This time is no longer available' using errcode = '22023';
  end if;
  select * into v_service from public.services where id = p_service_id;
  if not found or not v_service.is_active or v_service.id <> v_slot.service_id
      or v_service.provider_id <> v_slot.provider_id or not exists (
        select 1 from public.provider_profiles pp
        where pp.user_id = v_service.provider_id and pp.verification_status = 'approved'
      ) or not exists (
        select 1 from public.service_categories c where c.id = v_service.category_id and c.is_active
      ) then
    raise exception 'Service is unavailable' using errcode = '22023';
  end if;
  if extract(epoch from (v_slot.end_at - v_slot.start_at)) <> v_service.duration_minutes * 60 then
    raise exception 'Service duration does not match the available time' using errcode = '22023';
  end if;

  update public.availability_slots set status = 'booked' where id = v_slot.id;
  insert into public.bookings (
    customer_id, provider_id, service_id, slot_id, service_title, address_text, price_lkr
  ) values (
    auth.uid(), v_service.provider_id, v_service.id, v_slot.id, v_service.title, trim(p_address), v_service.price_lkr
  ) returning * into v_booking;

  insert into public.notifications (recipient_id, kind, title, body, booking_id) values
    (v_service.provider_id, 'booking_received', 'New booking',
      'A customer booked ' || v_service.title || '.', v_booking.id),
    (auth.uid(), 'booking_created', 'Booking confirmed',
      'Your ' || v_service.title || ' booking is confirmed.', v_booking.id);
  return v_booking;
end;
$$;
revoke all on function public.book_service_slot(uuid, uuid, text) from public;
grant execute on function public.book_service_slot(uuid, uuid, text) to authenticated;

create or replace function public.mark_member3_notification_read(p_notification_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.notifications set read_at = coalesce(read_at, now())
  where id = p_notification_id and recipient_id = auth.uid();
  if not found then raise exception 'Notification not found' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.mark_member3_notification_read(uuid) from public;
grant execute on function public.mark_member3_notification_read(uuid) to authenticated;

notify pgrst, 'reload schema';
