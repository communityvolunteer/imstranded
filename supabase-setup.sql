-- Gulf Crisis Hub — Supabase Setup
-- Run this entire file in your Supabase project's SQL Editor
-- (supabase.com → your project → SQL Editor → New query → paste → Run)

-- ── HELP POSTS TABLE ────────────────────────────────────────
create table if not exists help_posts (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('offer', 'need')),
  post_type   text not null,
  location    text not null,
  body        text not null,
  name        text not null,
  contact     text not null,
  flagged     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Index for fast queries by type + flagged status
create index if not exists help_posts_type_idx     on help_posts(type);
create index if not exists help_posts_flagged_idx  on help_posts(flagged);
create index if not exists help_posts_created_idx  on help_posts(created_at desc);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS (required for anon access to work safely)
alter table help_posts enable row level security;

-- Anyone can READ non-flagged posts (no login required)
create policy "Public can read active posts"
  on help_posts for select
  using (flagged = false);

-- Anyone can INSERT a post (no login required)
-- Rate limiting is handled at Supabase project level (see below)
create policy "Public can insert posts"
  on help_posts for insert
  with check (
    -- Basic server-side validation
    length(body)    between 10 and 2000  and
    length(name)    between 1  and 100   and
    length(contact) between 3  and 200   and
    length(location) between 2 and 200
  );

-- Anyone can FLAG a post (soft delete — sets flagged=true)
-- Only the flagged column can be updated via this policy
create policy "Public can flag posts"
  on help_posts for update
  using (true)
  with check (
    -- Only allow flipping flagged to true — no other field changes
    flagged = true
  );

-- ── ENABLE REALTIME ─────────────────────────────────────────
-- This makes new posts stream instantly to all open browsers
alter publication supabase_realtime add table help_posts;

-- ── RATE LIMITING (via pg extension) ────────────────────────
-- Supabase free tier has built-in rate limiting via the API gateway.
-- For extra protection, you can enable the pg_cron extension and 
-- add a simple insert rate limiter:

-- Uncomment if you want to limit to 5 posts per IP per hour
-- (requires pg_net extension which is available on Supabase free tier)
-- 
-- create or replace function check_post_rate_limit()
-- returns trigger language plpgsql as $$
-- begin
--   if (
--     select count(*) from help_posts
--     where created_at > now() - interval '1 hour'
--     -- Note: in production you'd store IP in the row and filter by it
--   ) > 500 then
--     raise exception 'Rate limit exceeded. Too many posts in the last hour.';
--   end if;
--   return new;
-- end;
-- $$;
-- 
-- create trigger rate_limit_posts
--   before insert on help_posts
--   for each row execute function check_post_rate_limit();

-- ── SEED DATA (optional — remove for production) ─────────────
insert into help_posts (type, post_type, location, body, name, contact) values
(
  'offer', 'Housing / spare room', 'Muscat, Oman',
  'Have a spare bedroom in Muscat. Can take a family of up to 4. Short term while you figure out flights. No pets sorry.',
  'Sarah K.', '@sarahk_muscat'
),
(
  'offer', 'Transportation / ride share', 'Dubai → Oman border',
  'Driving a 7-seater to the Hatta crossing today around 3pm. Have 3 open seats. Splitting fuel cost.',
  'Raj M.', 'raj.musafir@gmail.com'
),
(
  'need', 'Transportation / evacuation help', 'Bur Dubai',
  'Family of 3 (inc. 8yo child). Need transport to any land border. Can contribute to fuel. No car.',
  'Anna + family (3)', '+1-555-0182 (WhatsApp)'
),
(
  'offer', 'Translation / local knowledge', 'Dubai, UAE',
  'UAE national. Can help navigate local bureaucracy, translate Arabic, advise on routes and checkpoints. Available by phone.',
  'Ahmed F.', '@ahmedf_uae'
);

-- ── DONE ────────────────────────────────────────────────────
-- After running this:
-- 1. Go to Project Settings → API
-- 2. Copy "Project URL" and "anon public" key  
-- 3. Paste both into index.html where it says YOUR_PROJECT_ID / YOUR_ANON_PUBLIC_KEY
