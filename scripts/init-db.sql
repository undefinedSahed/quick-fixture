-- Database initialization script for Quick Fixture Generator
-- Run this script to create all necessary tables and set up RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  team_count INTEGER NOT NULL CHECK (team_count IN (8, 16, 32)),
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'groups', 'fixture', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  stage TEXT NOT NULL CHECK (stage IN ('group', 'quarterfinal', 'semifinal', 'final')),
  round INTEGER NOT NULL DEFAULT 1,
  team_a_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  score_a INTEGER,
  score_b INTEGER,
  match_date DATE,
  match_time TIME,
  venue TEXT,
  next_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  next_slot TEXT CHECK (next_slot IN ('A', 'B')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own tournaments" ON tournaments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own groups" ON groups
  FOR ALL USING (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = groups.tournament_id AND t.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = groups.tournament_id AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users manage own teams" ON teams
  FOR ALL USING (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = teams.tournament_id AND t.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = teams.tournament_id AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users manage own matches" ON matches
  FOR ALL USING (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = matches.tournament_id AND t.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = matches.tournament_id AND t.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_user_id ON tournaments(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_tournament_id ON groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_group_id ON teams(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_group_id ON matches(group_id);
