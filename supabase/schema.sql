create extension if not exists pgcrypto;

create table if not exists public.ledger_events (
  id text primary key,
  event_type text not null,
  title_vi text not null,
  title_en text not null,
  detail_vi text not null,
  detail_en text not null,
  timestamp_label text not null,
  hash text not null,
  block_number integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  title_vi text not null,
  title_en text not null,
  body_vi text not null,
  body_en text not null,
  tone text not null,
  timestamp_label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.demo_state (
  id text primary key,
  language text,
  role text not null,
  selected_plot_id text not null,
  selected_scan_id text not null,
  irrigation_on boolean not null default false,
  pump_cycles integer not null default 0,
  market_sold boolean not null default false,
  logged_scan_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.deployment_heartbeats (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  created_at timestamptz not null default now()
);

alter table public.ledger_events enable row level security;
alter table public.notifications enable row level security;
alter table public.demo_state enable row level security;
alter table public.deployment_heartbeats enable row level security;

drop policy if exists "public read ledger events" on public.ledger_events;
drop policy if exists "public write ledger events" on public.ledger_events;
drop policy if exists "public upsert ledger events" on public.ledger_events;
drop policy if exists "public read notifications" on public.notifications;
drop policy if exists "public write notifications" on public.notifications;
drop policy if exists "public upsert notifications" on public.notifications;
drop policy if exists "public read demo state" on public.demo_state;
drop policy if exists "public write demo state" on public.demo_state;
drop policy if exists "public upsert demo state" on public.demo_state;
drop policy if exists "public write deployment heartbeats" on public.deployment_heartbeats;

create policy "public read ledger events"
on public.ledger_events
for select
to anon
using (true);

create policy "public write ledger events"
on public.ledger_events
for insert
to anon
with check (true);

create policy "public upsert ledger events"
on public.ledger_events
for update
to anon
using (true)
with check (true);

create policy "public read notifications"
on public.notifications
for select
to anon
using (true);

create policy "public write notifications"
on public.notifications
for insert
to anon
with check (true);

create policy "public upsert notifications"
on public.notifications
for update
to anon
using (true)
with check (true);

create policy "public read demo state"
on public.demo_state
for select
to anon
using (true);

create policy "public write demo state"
on public.demo_state
for insert
to anon
with check (true);

create policy "public upsert demo state"
on public.demo_state
for update
to anon
using (true)
with check (true);

create policy "public write deployment heartbeats"
on public.deployment_heartbeats
for insert
to anon
with check (true);
