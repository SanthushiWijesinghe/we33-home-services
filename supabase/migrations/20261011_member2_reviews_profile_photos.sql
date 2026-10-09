-- Member 2: customer profile photos and customer review browsing.
-- Apply after Member 1 and 20261010_member4_booking_followthrough.sql.
alter table public.profiles add column if not exists avatar_path text;
grant update (avatar_path) on public.profiles to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('customer-profile-photos', 'customer-profile-photos', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists member2_profile_photo_read on storage.objects;
create policy member2_profile_photo_read on storage.objects for select to authenticated
using (bucket_id = 'customer-profile-photos' and split_part(name, '/', 1) = (select auth.uid())::text);
drop policy if exists member2_profile_photo_insert on storage.objects;
create policy member2_profile_photo_insert on storage.objects for insert to authenticated
with check (bucket_id = 'customer-profile-photos' and split_part(name, '/', 1) = (select auth.uid())::text);
drop policy if exists member2_profile_photo_delete on storage.objects;
create policy member2_profile_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'customer-profile-photos' and split_part(name, '/', 1) = (select auth.uid())::text);

-- Expose review card fields without customer IDs, booking IDs or contact details.
create or replace function public.member2_list_customer_reviews()
returns table (id uuid, provider_id uuid, provider_name text, reviewer_name text,
  rating integer, comment text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, r.provider_id, pp.display_name,
    coalesce(nullif(split_part(trim(p.full_name), ' ', 1), ''), 'Customer'),
    r.rating, r.comment, r.created_at
  from public.provider_reviews r
  join public.bookings b on b.id = r.booking_id and b.status = 'completed'
    and b.customer_id = r.customer_id and b.provider_id = r.provider_id
  join public.provider_profiles pp on pp.user_id = r.provider_id and pp.verification_status = 'approved'
  join public.profiles p on p.id = r.customer_id
  order by r.created_at desc limit 200;
$$;
revoke all on function public.member2_list_customer_reviews() from public;
grant execute on function public.member2_list_customer_reviews() to authenticated;
notify pgrst, 'reload schema';
