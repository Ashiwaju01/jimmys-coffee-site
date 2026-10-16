create extension if not exists pgcrypto;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  location text not null,
  requested_date date not null,
  requested_time text not null,
  party_size text not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  note text,
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled')),
  created_at timestamptz not null default now(),
  constraint reservation_contact_method check (coalesce(nullif(email,''),'') <> '' or coalesce(nullif(phone,''),'') <> '')
);

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consented_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','subscribed','unsubscribed'))
);

alter table public.contact_requests enable row level security;
alter table public.reservation_requests enable row level security;
alter table public.newsletter_signups enable row level security;

revoke all on public.contact_requests from anon, authenticated;
revoke all on public.reservation_requests from anon, authenticated;
revoke all on public.newsletter_signups from anon, authenticated;
