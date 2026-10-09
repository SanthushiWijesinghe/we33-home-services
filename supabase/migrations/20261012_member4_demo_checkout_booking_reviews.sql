-- Member 4 demo checkout and reviews immediately after a confirmed booking.
-- Apply after 20261011_member2_reviews_profile_photos.sql. No real payment gateway.
create table if not exists public.booking_demo_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id),
  customer_id uuid not null references public.profiles(id),
  amount_lkr integer not null check (amount_lkr >= 0),
  method_type text not null check (method_type in ('cash', 'card', 'mobile')),
  method_label text not null,
  last_four text check (last_four is null or last_four ~ '^[0-9]{4}$'),
  status text not null default 'demo_paid' check (status = 'demo_paid'),
  created_at timestamptz not null default now()
);
alter table public.booking_demo_payments enable row level security;
revoke all on public.booking_demo_payments from anon, authenticated;
grant select on public.booking_demo_payments to authenticated;
drop policy if exists member4_demo_payment_read on public.booking_demo_payments;
create policy member4_demo_payment_read on public.booking_demo_payments for select to authenticated
using (customer_id = (select auth.uid()) or (select public.is_admin()) or exists (
  select 1 from public.bookings b where b.id = booking_id and b.provider_id = (select auth.uid())
));

create or replace function public.member4_record_demo_payment(
  p_booking_id uuid, p_method text, p_label text, p_last_four text default null
) returns public.booking_demo_payments
language plpgsql security definer set search_path = '' as $$
declare b public.bookings; result public.booking_demo_payments;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and role = 'CUSTOMER') then
    raise exception 'Customer access required' using errcode = '42501';
  end if;
  select * into b from public.bookings where id = p_booking_id for update;
  if not found or b.customer_id <> auth.uid() then raise exception 'Booking access required' using errcode = '42501'; end if;
  if b.status = 'cancelled' then raise exception 'A cancelled booking cannot be paid' using errcode = '22023'; end if;
  select * into result from public.booking_demo_payments where booking_id = b.id;
  if found then return result; end if;
  if p_method is null or p_method not in ('cash', 'card', 'mobile') or length(trim(coalesce(p_label, ''))) not between 3 and 120 then
    raise exception 'Choose a valid demo payment method' using errcode = '22023';
  end if;
  if (p_method = 'card' and (p_last_four is null or p_last_four !~ '^[0-9]{4}$')) or
     (p_method <> 'card' and p_last_four is not null) then
    raise exception 'Card metadata must contain only four final digits' using errcode = '22023';
  end if;
  insert into public.booking_demo_payments(booking_id, customer_id, amount_lkr, method_type, method_label, last_four)
  values (b.id, auth.uid(), b.price_lkr, p_method, trim(p_label), p_last_four) returning * into result;
  return result;
end;
$$;
revoke all on function public.member4_record_demo_payment(uuid, text, text, text) from public;
grant execute on function public.member4_record_demo_payment(uuid, text, text, text) to authenticated;

create or replace function public.member4_save_review(p_booking_id uuid, p_rating integer, p_comment text)
returns public.provider_reviews language plpgsql security definer set search_path = '' as $$
declare b public.bookings; result public.provider_reviews;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and role = 'CUSTOMER') then
    raise exception 'Customer access required' using errcode = '42501';
  end if;
  select * into b from public.bookings where id = p_booking_id for update;
  if not found or b.customer_id <> auth.uid() then raise exception 'Booking access required' using errcode = '42501'; end if;
  if b.status not in ('confirmed', 'completed') then raise exception 'Review an active or completed booking' using errcode = '22023'; end if;
  if p_rating is null or p_rating not between 1 and 5 or length(trim(coalesce(p_comment, ''))) not between 10 and 1000 then
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

-- Booking reviews remain published if an appointment is later cancelled.
create or replace function public.member2_list_customer_reviews()
returns table (id uuid, provider_id uuid, provider_name text, reviewer_name text,
  rating integer, comment text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, r.provider_id, pp.display_name,
    coalesce(nullif(split_part(trim(p.full_name), ' ', 1), ''), 'Customer'),
    r.rating, r.comment, r.created_at
  from public.provider_reviews r
  join public.bookings b on b.id = r.booking_id and b.customer_id = r.customer_id and b.provider_id = r.provider_id
  join public.provider_profiles pp on pp.user_id = r.provider_id and pp.verification_status = 'approved'
  join public.profiles p on p.id = r.customer_id
  order by r.created_at desc limit 200;
$$;
revoke all on function public.member2_list_customer_reviews() from public;
grant execute on function public.member2_list_customer_reviews() to authenticated;
notify pgrst, 'reload schema';
