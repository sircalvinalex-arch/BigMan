-- Migration 2: run this in Supabase's SQL editor AFTER the original
-- supabase-schema.sql. Safe to run once — uses IF NOT EXISTS / additive
-- ALTER statements throughout.

-- Store the generator's full week-by-week plan on the mesocycle itself,
-- so auto-regulation can read and adjust upcoming weeks.
alter table mesocycles add column if not exists plan jsonb;

-- Track which week/day of a mesocycle a workout was logged against, so
-- auto-regulation can compare actual performance to the plan.
alter table workouts add column if not exists week_index int;
alter table workouts add column if not exists day_index int;

-- Body measurements over time.
create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  date timestamptz not null default now(),
  weight numeric,
  body_fat_pct numeric,
  custom jsonb default '{}'  -- e.g. { "waist": 32, "chest": 42, "left_arm": 14 }
);

alter table measurements enable row level security;

create policy "Users manage their own measurements"
  on measurements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Progress photo metadata. The actual image bytes live in Supabase
-- Storage (see SETUP.md for the one-time bucket creation step) — this
-- table just tracks the storage path and a timestamp/note per photo.
create table if not exists progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  date timestamptz not null default now(),
  storage_path text not null,
  note text
);

alter table progress_photos enable row level security;

create policy "Users manage their own progress photos"
  on progress_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
