-- ============================================================
-- Horizon Education Institute — Supabase schema
-- Run this ONCE in the Supabase dashboard:
--   Project Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- 1) Applications (submitted from apply-now.html)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  fullname text,
  email text,
  phone text,
  dob text,
  gender text,
  education text,
  program text,
  intake text,
  created_at timestamptz not null default now()
);

-- 2) Contact messages (submitted from contact.html)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on both tables
alter table public.applications enable row level security;
alter table public.contact_messages enable row level security;

-- Anyone may SUBMIT (anonymous visitors filling the forms) — insert only
create policy "applications_anon_insert"
  on public.applications for insert
  to anon
  with check (true);

create policy "contact_messages_anon_insert"
  on public.contact_messages for insert
  to anon
  with check (true);

-- Only signed-in users (the client / staff) may READ submissions.
-- IMPORTANT: replace the email below with YOUR staff email address, so no
-- other signed-up user can read applicants' personal data.
create policy "applications_auth_select"
  on public.applications for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'horizon.solot@gmail.com');

create policy "contact_messages_auth_select"
  on public.contact_messages for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'horizon.solot@gmail.com');
