-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tournaments
create table if not exists tournaments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  team_count int not null check (team_count in (8, 16, 32)),
  status text not null default 'setup' check (status in ('setup', 'groups', 'fixture', 'completed')),
  created_at timestamptz default now()
);

-- Groups
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  name text not null,
  position int not null,
  created_at timestamptz default now()
);

-- Teams
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  group_id uuid references groups(id) on delete set null,
  name text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

-- Matches (group stage + knockout)
create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  group_id uuid references groups(id) on delete set null,
  stage text not null check (stage in ('group', 'quarterfinal', 'semifinal', 'final')),
  round int not null default 1,
  team_a_id uuid references teams(id) on delete set null,
  team_b_id uuid references teams(id) on delete set null,
  winner_id uuid references teams(id) on delete set null,
  score_a int,
  score_b int,
  match_date date,
  match_time time,
  venue text,
  next_match_id uuid references matches(id) on delete set null,
  next_slot text check (next_slot in ('A', 'B')),
  position int not null default 0,
  created_at timestamptz default now()
);

-- Row Level Security
alter table tournaments enable row level security;
alter table groups enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;

-- RLS Policies: Users can only see and modify their own tournaments
create policy "Users manage own tournaments"
  on tournaments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own groups"
  on groups for all
  using (exists (
    select 1 from tournaments t where t.id = groups.tournament_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from tournaments t where t.id = groups.tournament_id and t.user_id = auth.uid()
  ));

create policy "Users manage own teams"
  on teams for all
  using (exists (
    select 1 from tournaments t where t.id = teams.tournament_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from tournaments t where t.id = teams.tournament_id and t.user_id = auth.uid()
  ));

create policy "Users manage own matches"
  on matches for all
  using (exists (
    select 1 from tournaments t where t.id = matches.tournament_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from tournaments t where t.id = matches.tournament_id and t.user_id = auth.uid()
  ));
