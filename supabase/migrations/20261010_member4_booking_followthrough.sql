-- Member 4: booking status/history, verified reviews and support requests.
-- Apply after 20261009_member3_service_booking.sql in the same Supabase project.

alter table public.bookings add column if not exists updated_at timestamptz not null default now();
alter table public.bookings add column if not exists cancelled_at timestamptz;
alter table public.bookings add column if not exists completed_at timestamptz;
alter table public.bookings add column if not exists cancelled_by uuid references public.profiles(id);
alter table public.bookings add column if not exists cancellation_reason text;

-- Cancelled bookings remain in history while their future slot may be booked again.
alter table public.bookings drop constraint if exists bookings_slot_id_key;
create unique index if not exists member4_active_booking_slot_idx
  on public.bookings(slot_id) where status <> 'cancelled';

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  from_status text,
  to_status text not null check (to_status in ('confirmed', 'cancelled', 'completed')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists member4_booking_events_booking_idx on public.booking_events(booking_id, created_at);

create table if not exists public.provider_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (length(trim(comment)) between 10 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists member4_reviews_provider_idx on public.provider_reviews(provider_id, created_at desc);
create index if not exists member4_reviews_customer_idx on public.provider_reviews(customer_id, created_at desc);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (length(trim(subject)) between 5 and 120),
  message text not null check (length(trim(message)) between 15 and 2000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists member4_support_user_idx on public.support_requests(user_id, created_at desc);
create index if not exists member4_support_status_idx on public.support_requests(status, created_at desc);

drop trigger if exists member4_reviews_updated_at on public.provider_reviews;
create trigger member4_reviews_updated_at before update on public.provider_reviews
for each row execute function public.set_updated_at();
drop trigger if exists member4_support_updated_at on public.support_requests;
create trigger member4_support_updated_at before update on public.support_requests
for each row execute function public.set_updated_at();

create or replace function public.member4_refresh_provider_rating()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_provider uuid;
begin
  if tg_op = 'DELETE' then target_provider := old.provider_id;
  else target_provider := new.provider_id; end if;
  update public.provider_profiles
  set rating_avg = coalesce((select round(avg(rating)::numeric, 1) from public.provider_reviews
                             where provider_id = target_provider), 0),
      rating_count = (select count(*) from public.provider_reviews where provider_id = target_provider)
  where user_id = target_provider;
  return coalesce(new, old);
end;
$$;
drop trigger if exists member4_reviews_rating on public.provider_reviews;
create trigger member4_reviews_rating after insert or update or delete on public.provider_reviews
for each row execute function public.member4_refresh_provider_rating();

alter table public.booking_events enable row level security;
alter table public.provider_reviews enable row level security;
alter table public.support_requests enable row level security;
revoke all on public.booking_events, public.provider_reviews, public.support_requests from anon, authenticated;
grant select on public.booking_events, public.support_requests to authenticated;
grant select on public.provider_reviews to anon, authenticated;
grant insert (user_id, subject, message) on public.support_requests to authenticated;

drop policy if exists member4_events_participants_read on public.booking_events;
create policy member4_events_participants_read on public.booking_events for select to authenticated
using (exists (select 1 from public.bookings b where b.id = booking_id
  and (b.customer_id = (select auth.uid()) or b.provider_id = (select auth.uid()) or (select public.is_admin()))));
drop policy if exists member4_reviews_public_read on public.provider_reviews;
create policy member4_reviews_public_read on public.provider_reviews for select to anon, authenticated using (true);
drop policy if exists member4_support_owner_read on public.support_requests;
create policy member4_support_owner_read on public.support_requests for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists member4_support_owner_insert on public.support_requests;
create policy member4_support_owner_insert on public.support_requests for insert to authenticated
with check (user_id = (select auth.uid()));

-- Includes the booked slot and participant names that client RLS intentionally hides.
create or replace function public.member4_list_bookings()
returns table (
  id uuid, customer_id uuid, provider_id uuid, service_id uuid, slot_id uuid,
  service_title text, address_text text, price_lkr integer, status text,
  created_at timestamptz, updated_at timestamptz, cancelled_at timestamptz,
  completed_at timestamptz, cancellation_reason text,
  start_at timestamptz, end_at timestamptz, provider_name text, customer_name text
)
language sql stable security definer set search_path = '' as $$
  select b.id, b.customer_id, b.provider_id, b.service_id, b.slot_id,
    b.service_title, b.address_text, b.price_lkr, b.status,
    b.created_at, b.updated_at, b.cancelled_at, b.completed_at, b.cancellation_reason,
    s.start_at, s.end_at, pp.display_name, p.full_name
  from public.bookings b
  join public.availability_slots s on s.id = b.slot_id
  join public.provider_profiles pp on pp.user_id = b.provider_id
  join public.profiles p on p.id = b.customer_id
  where b.customer_id = (select auth.uid()) or b.provider_id = (select auth.uid()) or (select public.is_admin())
  order by s.start_at desc;
$$;
revoke all on function public.member4_list_bookings() from public;
grant execute on function public.member4_list_bookings() to authenticated;

-- Row locks and the partial unique index make cancellation and rebooking safe.
create or replace function public.member4_change_booking_status(
  p_booking_id uuid, p_status text, p_reason text default null
) returns public.bookings
language plpgsql security definer set search_path = '' as $$
declare b public.bookings; slot_row public.availability_slots; actor uuid := auth.uid();
begin
  select * into b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'Booking not found' using errcode = 'P0002'; end if;
  if b.status <> 'confirmed' then raise exception 'Only confirmed bookings can change status' using errcode = '22023'; end if;
  select * into slot_row from public.availability_slots where id = b.slot_id for update;
  if p_status = 'cancelled' then
    if actor not in (b.customer_id, b.provider_id) and not public.is_admin() then
      raise exception 'Booking access required' using errcode = '42501';
    end if;
    if slot_row.start_at <= now() then
      raise exception 'A booking cannot be cancelled after it starts' using errcode = '22023';
    end if;
    update public.bookings set status = 'cancelled', cancelled_at = now(), cancelled_by = actor,
      cancellation_reason = nullif(trim(coalesce(p_reason, '')), ''), updated_at = now()
    where id = b.id returning * into b;
    update public.availability_slots set status = 'available' where id = b.slot_id;
  elsif p_status = 'completed' then
    if actor <> b.provider_id and not public.is_admin() then
      raise exception 'Provider access required' using errcode = '42501';
    end if;
    if slot_row.end_at > now() then
      raise exception 'Complete the booking after the appointment ends' using errcode = '22023';
    end if;
    update public.bookings set status = 'completed', completed_at = now(), updated_at = now()
    where id = b.id returning * into b;
  else
    raise exception 'Invalid booking status' using errcode = '22023';
  end if;
  insert into public.booking_events(booking_id, actor_id, from_status, to_status, note)
  values (b.id, actor, 'confirmed', p_status, nullif(trim(coalesce(p_reason, '')), ''));
  insert into public.notifications(recipient_id, kind, title, body, booking_id) values
    (b.customer_id, 'general', 'Booking ' || p_status, 'Your ' || b.service_title || ' booking is ' || p_status || '.', b.id),
    (b.provider_id, 'general', 'Booking ' || p_status, b.service_title || ' booking is ' || p_status || '.', b.id);
  return b;
end;
$$;
revoke all on function public.member4_change_booking_status(uuid, text, text) from public;
grant execute on function public.member4_change_booking_status(uuid, text, text) to authenticated;

create or replace function public.member4_save_review(p_booking_id uuid, p_rating integer, p_comment text)
returns public.provider_reviews language plpgsql security definer set search_path = '' as $$
declare b public.bookings; result public.provider_reviews;
begin
  select * into b from public.bookings where id = p_booking_id;
  if not found or b.customer_id <> auth.uid() then
    raise exception 'Booking access required' using errcode = '42501';
  end if;
  if b.status <> 'completed' then raise exception 'Review a completed booking' using errcode = '22023'; end if;
  if p_rating not between 1 and 5 or length(trim(coalesce(p_comment, ''))) not between 10 and 1000 then
    raise exception 'Choose 1–5 stars and write 10–1000 characters' using errcode = '22023';
  end if;
  insert into public.provider_reviews(booking_id, customer_id, provider_id, rating, comment)
  values (b.id, b.customer_id, b.provider_id, p_rating, trim(p_comment))
  on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment
  returning * into result;
  return result;
end;
$$;
revoke all on function public.member4_save_review(uuid, integer, text) from public;
grant execute on function public.member4_save_review(uuid, integer, text) to authenticated;

create or replace function public.member4_delete_review(p_review_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.provider_reviews where id = p_review_id and customer_id = auth.uid();
  if not found then raise exception 'Review not found' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.member4_delete_review(uuid) from public;
grant execute on function public.member4_delete_review(uuid) to authenticated;

create or replace function public.member4_update_support(
  p_request_id uuid, p_status text, p_admin_note text default null
) returns public.support_requests language plpgsql security definer set search_path = '' as $$
declare result public.support_requests;
begin
  if not public.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'Invalid support status' using errcode = '22023';
  end if;
  update public.support_requests set status = p_status,
    admin_note = nullif(trim(coalesce(p_admin_note, '')), ''), updated_at = now()
  where id = p_request_id returning * into result;
  if not found then raise exception 'Support request not found' using errcode = 'P0002'; end if;
  return result;
end;
$$;
revoke all on function public.member4_update_support(uuid, text, text) from public;
grant execute on function public.member4_update_support(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
