-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists mesocycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  weeks int not null default 5,
  focus text[] default '{}',
  start_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  mesocycle_id uuid references mesocycles on delete set null,
  date timestamptz not null default now(),
  exercises jsonb not null default '[]'
);

-- Row Level Security: each user can only see/edit their own rows.
alter table mesocycles enable row level security;
alter table workouts enable row level security;

create policy "Users manage their own mesocycles"
  on mesocycles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own workouts"
  on workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
