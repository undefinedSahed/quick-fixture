// Core domain types for the Quick Fixture Generator

export type TournamentStatus = 'setup' | 'groups' | 'fixture' | 'completed';
export type MatchStage = 'group' | 'quarterfinal' | 'semifinal' | 'final';
export type NextSlot = 'A' | 'B';

export interface Tournament {
  id: string;
  user_id: string;
  name: string;
  team_count: number;
  status: TournamentStatus;
  created_at: string;
}

export interface Group {
  id: string;
  tournament_id: string;
  name: string;
  position: number;
  created_at: string;
  teams?: Team[];
  matches?: Match[];
}

export interface Team {
  id: string;
  tournament_id: string;
  group_id: string | null;
  name: string;
  position: number;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  group_id: string | null;
  stage: MatchStage;
  round: number;
  team_a_id: string | null;
  team_b_id: string | null;
  winner_id: string | null;
  score_a: number | null;
  score_b: number | null;
  match_date: string | null;
  match_time: string | null;
  venue: string | null;
  next_match_id: string | null;
  next_slot: NextSlot | null;
  position: number;
  created_at: string;
  // Joined data
  team_a?: Team | null;
  team_b?: Team | null;
  winner?: Team | null;
}

export interface KnockoutBracket {
  quarterfinals: Match[];
  semifinals: Match[];
  final: Match | null;
}

export interface FixtureData {
  tournament: Tournament;
  groups: Group[];
  knockout: KnockoutBracket;
}

export interface WinnerCardData {
  tournament: Tournament;
  match: Match;
  winner: Team;
  loser: Team;
  stage: MatchStage;
  scoreA: number | null;
  scoreB: number | null;
}
