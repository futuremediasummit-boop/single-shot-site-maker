-- Future Media Summit: Supabase setup
-- Run this in Supabase → SQL Editor → New query → Run.
-- Everything here is safe to run twice.
--
-- SECURITY MODEL: the website talks to Supabase ONLY from its server, using the
-- service-role key. Row-level security is switched on for every table with NO public
-- policies, so the public (anon) key can read and write nothing. Staff are checked on
-- the server against the fms_staff table.

-- ── PART A: admin, publishing, forms ────────────────────────────────────────

create table if not exists fms_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- One row 'draft' (the admin's working copy) and one row 'main' (what the public site shows).
create table if not exists fms_content (
  id text primary key check (id in ('draft', 'main')),
  content jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists fms_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'partner', 'accreditation', 'newsletter')),
  name text not null default '',
  email text not null default '',
  payload jsonb not null default '{}'::jsonb,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists fms_submissions_created_idx on fms_submissions (created_at desc);
create index if not exists fms_submissions_kind_email_idx on fms_submissions (kind, email);

alter table fms_staff enable row level security;
alter table fms_content enable row level security;
alter table fms_submissions enable row level security;
revoke all on fms_staff, fms_content, fms_submissions from anon, authenticated;

-- ── PART B: ticketing ───────────────────────────────────────────────────────
-- SKIP THIS WHOLE PART if you already have the fms_events / fms_ticket_types / fms_tickets
-- tables (check Table Editor). The app's ticketing code expects exactly these.

create table if not exists fms_events (
  id text primary key,
  name text not null,
  date_label text not null default 'Date to be confirmed',
  starts_at timestamptz,
  venue text not null default 'Venue to be confirmed',
  city text not null default 'City to be confirmed',
  open boolean not null default false,
  draft boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists fms_ticket_types (
  event_id text not null references fms_events(id) on delete cascade,
  slug text not null,
  name text not null,
  blurb text not null default '',
  perks text[] not null default '{}',
  price_kes integer,
  capacity integer,
  accreditation_only boolean not null default false,
  sort integer not null default 0,
  primary key (event_id, slug)
);

create table if not exists fms_tickets (
  token text primary key,
  code text not null unique,
  event_id text not null references fms_events(id),
  type_slug text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  status text not null default 'issued' check (status in ('issued', 'pending_payment', 'cancelled')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists fms_tickets_event_idx on fms_tickets (event_id, created_at desc);

create or replace view fms_ticket_counts as
  select event_id, type_slug, count(*)::int as sold
  from fms_tickets where status <> 'cancelled'
  group by event_id, type_slug;

alter table fms_events enable row level security;
alter table fms_ticket_types enable row level security;
alter table fms_tickets enable row level security;
revoke all on fms_events, fms_ticket_types, fms_tickets from anon, authenticated;
revoke all on fms_ticket_counts from anon, authenticated;

-- Door check-in used by the /verify page. Returns the JSON shape the app expects.
create or replace function fms_check_in(p_event text, p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t fms_tickets%rowtype; tname text;
begin
  select * into t from fms_tickets where token = p_token or upper(code) = upper(p_token) limit 1;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  select name into tname from fms_ticket_types where event_id = t.event_id and slug = t.type_slug;
  if t.event_id <> p_event then
    return jsonb_build_object('result', 'wrong_event', 'name', t.name, 'typeName', tname, 'code', t.code);
  end if;
  if t.status = 'cancelled' then return jsonb_build_object('result', 'cancelled', 'name', t.name, 'code', t.code); end if;
  if t.status = 'pending_payment' then return jsonb_build_object('result', 'not_paid', 'name', t.name, 'code', t.code); end if;
  if t.checked_in_at is not null then
    return jsonb_build_object('result', 'already_used', 'name', t.name, 'typeName', tname, 'code', t.code, 'at', t.checked_in_at);
  end if;
  update fms_tickets set checked_in_at = now() where token = t.token;
  return jsonb_build_object('result', 'valid', 'name', t.name, 'typeName', tname, 'code', t.code);
end $$;
revoke all on function fms_check_in(text, text) from public, anon, authenticated;

-- ── PART C: your first admin ────────────────────────────────────────────────
-- 1) Supabase → Authentication → Users → Add user → "Create new user".
--    Enter your email and a strong password and tick "Auto Confirm User".
-- 2) Replace the email below with yours and run just this statement:
--
-- insert into fms_staff (user_id, email, role)
-- select id, email, 'admin' from auth.users where email = 'YOUR-EMAIL@EXAMPLE.COM'
-- on conflict (user_id) do update set role = 'admin';
--
-- 3) Supabase → Authentication → Sign In / Providers → Email → turn OFF "Allow new users to sign up".
