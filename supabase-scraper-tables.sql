-- ImStranded — Scraper Tables
-- Run this in Supabase SQL Editor AFTER supabase-setup.sql
-- These tables receive live data from the Vercel cron scraper

-- ── SITREP TABLE ─────────────────────────────────────────────
-- Single row, always upserted with id='current'
create table if not exists sitrep (
  id                        text primary key default 'current',
  cancelled_flights         integer not null default 1847,
  avg_passengers_per_flight integer not null default 459,
  airports_closed           integer not null default 5,
  airspace_closed_countries integer not null default 4,
  land_routes_open          integer not null default 3,
  headlines                 text,
  last_updated              timestamptz not null default now(),
  scrape_duration_ms        integer
);

-- Seed with baseline data
insert into sitrep (id, cancelled_flights, avg_passengers_per_flight, airports_closed, airspace_closed_countries, land_routes_open, last_updated)
values ('current', 1847, 459, 5, 4, 3, now())
on conflict (id) do nothing;

-- ── ADVISORIES TABLE ─────────────────────────────────────────
create table if not exists advisories (
  id           text primary key,  -- e.g. 'state_AE', 'fcdo_AE'
  country_code text not null,
  source       text not null,
  level        integer,
  level_text   text,
  summary      text,
  url          text,
  updated_at   timestamptz not null default now()
);

-- ── AIRPORTS TABLE ────────────────────────────────────────────
create table if not exists airports (
  id      text primary key,  -- IATA code e.g. 'DXB'
  iata    text not null,
  name    text,
  country text,
  status  text not null default 'unknown',
  updated_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
-- All three tables: public read, no public write
-- Only the service key (used by scraper) can write

alter table sitrep     enable row level security;
alter table advisories enable row level security;
alter table airports   enable row level security;

-- Public read
create policy "Public read sitrep"     on sitrep     for select using (true);
create policy "Public read advisories" on advisories for select using (true);
create policy "Public read airports"   on airports   for select using (true);

-- No public write — scraper uses service key which bypasses RLS
-- This means nobody can tamper with sitrep data from the browser

-- ── REALTIME ─────────────────────────────────────────────────
-- Sitrep updates stream to all open browsers instantly
alter publication supabase_realtime add table sitrep;
alter publication supabase_realtime add table advisories;
alter publication supabase_realtime add table airports;
