-- Member 2 customer preferences, payment metadata and feedback.
-- Apply this migration after 20261007_member1_foundation.sql.

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  address_line text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  method_type text not null check (method_type in ('cash', 'card', 'mobile')),
  label text not null,
  last_four text check (last_four is null or last_four ~ '^[0-9]{4}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  message text not null check (length(trim(message)) between 10 and 2000),
  status text not null default 'submitted' check (status in ('submitted', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_idx on public.customer_addresses(user_id);
create index if not exists customer_payment_methods_user_idx on public.customer_payment_methods(user_id);
create index if not exists customer_feedback_user_idx on public.customer_feedback(user_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists customer_addresses_updated_at on public.customer_addresses;
create trigger customer_addresses_updated_at before update on public.customer_addresses for each row execute function public.set_updated_at();

alter table public.customer_addresses enable row level security;
alter table public.customer_payment_methods enable row level security;
alter table public.customer_feedback enable row level security;
revoke all on public.customer_addresses, public.customer_payment_methods, public.customer_feedback from anon, authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;
grant select, insert, delete on public.customer_payment_methods to authenticated;
grant select, insert on public.customer_feedback to authenticated;

drop policy if exists customer_addresses_owner on public.customer_addresses;
create policy customer_addresses_owner on public.customer_addresses for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists customer_payment_methods_owner on public.customer_payment_methods;
create policy customer_payment_methods_owner on public.customer_payment_methods for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists customer_feedback_owner_read on public.customer_feedback;
create policy customer_feedback_owner_read on public.customer_feedback for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists customer_feedback_owner_insert on public.customer_feedback;
create policy customer_feedback_owner_insert on public.customer_feedback for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists customer_feedback_admin_read on public.customer_feedback;
create policy customer_feedback_admin_read on public.customer_feedback for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

