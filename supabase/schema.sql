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
-- IMPORTANT: replace 'YOUR_STAFF_EMAIL' below with YOUR staff email address
-- (the one you will sign in with on admin.html). If you leave the placeholder,
-- or use the wrong address, sign-in will succeed but tables will show a
-- permission error.
create policy "applications_auth_select"
  on public.applications for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

create policy "contact_messages_auth_select"
  on public.contact_messages for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

-- ============================================================
-- 3) Student profiles (registration details from student_portal.html)
--
-- Security model:
--   • A student can INSERT / SELECT / UPDATE only their OWN row
--     (auth.uid() must equal the row's user_id).
--   • Staff (the email whitelisted below) can SELECT all students.
--   • Anonymous visitors get NO access at all.
--
-- The whole file is safe to re-run (tables use IF NOT EXISTS and
-- policies are dropped first), so you can simply paste it again.
-- ============================================================
create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  fullname text not null,
  email text not null,
  phone text,
  program text,
  intake text,
  student_id text,
  reg_date text,
  dob text,
  gender text,
  nationality text,
  address text,
  emergency_name text,
  emergency_relation text,
  emergency_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;

-- Student: insert their own profile (user_id must be their auth uid)
drop policy if exists "student_profiles_insert_own" on public.student_profiles;
create policy "student_profiles_insert_own"
  on public.student_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Student: read only their own profile
drop policy if exists "student_profiles_select_own" on public.student_profiles;
create policy "student_profiles_select_own"
  on public.student_profiles for select
  to authenticated
  using (auth.uid() = user_id);

-- Student: update only their own profile
drop policy if exists "student_profiles_update_own" on public.student_profiles;
create policy "student_profiles_update_own"
  on public.student_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Staff (client): view all student registration details
-- (replace 'YOUR_STAFF_EMAIL' with the same address used above)
drop policy if exists "student_profiles_staff_select" on public.student_profiles;
create policy "student_profiles_staff_select"
  on public.student_profiles for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

-- ============================================================
-- 4) News articles (posted by staff, visible to the public)
-- ============================================================
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  image_url text,
  published boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;

-- Anyone can read published news
create policy "news_public_select"
  on public.news for select
  to anon
  using (published = true);

-- Staff can read all news (published and drafts)
drop policy if exists "news_staff_select" on public.news;
create policy "news_staff_select"
  on public.news for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

-- Staff can insert, update, delete news
drop policy if exists "news_staff_insert" on public.news;
create policy "news_staff_insert"
  on public.news for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

drop policy if exists "news_staff_update" on public.news;
create policy "news_staff_update"
  on public.news for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL')
  with check (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

drop policy if exists "news_staff_delete" on public.news;
create policy "news_staff_delete"
  on public.news for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

-- ============================================================
-- 5) Job adverts (posted by staff, visible to the public)
-- ============================================================
create table if not exists public.job_adverts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text,
  type text default 'Full-time',
  description text,
  requirements text,
  deadline text,
  published boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_adverts enable row level security;

-- Anyone can read published job adverts
create policy "jobs_public_select"
  on public.job_adverts for select
  to anon
  using (published = true);

-- Staff can read all job adverts (published and drafts)
drop policy if exists "jobs_staff_select" on public.job_adverts;
create policy "jobs_staff_select"
  on public.job_adverts for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

-- Staff can insert, update, delete job adverts
drop policy if exists "jobs_staff_insert" on public.job_adverts;
create policy "jobs_staff_insert"
  on public.job_adverts for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

drop policy if exists "jobs_staff_update" on public.job_adverts;
create policy "jobs_staff_update"
  on public.job_adverts for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL')
  with check (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');

drop policy if exists "jobs_staff_delete" on public.job_adverts;
create policy "jobs_staff_delete"
  on public.job_adverts for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_STAFF_EMAIL');
