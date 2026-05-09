import { Group, Match, Team } from './types';
import { GROUP_LETTERS } from './utils';

// Generate group name letters based on count
export function generateGroupNames(count: number): string[] {
  return GROUP_LETTERS.slice(0, count);
}

// Generate all round-robin matches for teams in a group (each plays every other once)
export function generateRoundRobinPairs(teams: Team[]): [Team, Team][] {
  const pairs: [Team, Team][] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]]);
    }
  }
  return pairs;
}

// Build the standard knockout bracket mapping for a tournament
// Groups → QF matchups: A1 vs B2, B1 vs A2, C1 vs D2, D1 vs C2
// For 2 groups: A1 vs B2, B1 vs A2 → SF only
export function buildKnockoutStructure(groupCount: number): KnockoutMapping[] {
  if (groupCount === 2) {
    // 8 teams: no QF, go straight to semifinals
    return [
      { stage: 'semifinal', position: 0, srcGroupA: 'A', srcRankA: 1, srcGroupB: 'B', srcRankB: 2 },
      { stage: 'semifinal', position: 1, srcGroupA: 'B', srcRankA: 1, srcGroupB: 'A', srcRankB: 2 },
    ];
  }
  // 4 or 8 groups: quarterfinals
  const qfs: KnockoutMapping[] = [];
  const groupLetters = GROUP_LETTERS.slice(0, groupCount);
  for (let i = 0; i < groupCount; i += 2) {
    const gA = groupLetters[i];
    const gB = groupLetters[i + 1];
    qfs.push({
      stage: 'quarterfinal',
      position: qfs.length,
      srcGroupA: gA, srcRankA: 1,
      srcGroupB: gB, srcRankB: 2,
    });
    qfs.push({
      stage: 'quarterfinal',
      position: qfs.length,
      srcGroupA: gB, srcRankA: 1,
      srcGroupB: gA, srcRankB: 2,
    });
  }
  return qfs;
}

export interface KnockoutMapping {
  stage: string;
  position: number;
  srcGroupA: string;
  srcRankA: number;
  srcGroupB: string;
  srcRankB: number;
}

// Calculate group standings (wins based on winner_id)
export function calculateGroupStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  const standing: Record<string, TeamStanding> = {};
  teams.forEach(t => {
    standing[t.id] = { team: t, wins: 0, losses: 0, played: 0 };
  });

  matches.forEach(m => {
    if (!m.winner_id) return;
    const loserId = m.team_a_id === m.winner_id ? m.team_b_id : m.team_a_id;
    if (m.winner_id && standing[m.winner_id]) {
      standing[m.winner_id].wins++;
      standing[m.winner_id].played++;
    }
    if (loserId && standing[loserId]) {
      standing[loserId].losses++;
      standing[loserId].played++;
    }
  });

  return Object.values(standing).sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}

export interface TeamStanding {
  team: Team;
  wins: number;
  losses: number;
  played: number;
}

// Determine if all group matches have been played
export function isGroupStageComplete(groups: Group[]): boolean {
  return groups.every(g =>
    (g.matches || []).every(m => m.winner_id !== null)
  );
}
