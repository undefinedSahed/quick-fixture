import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRoundRobinPairs, buildKnockoutStructure } from '@/lib/tournament-logic';
import { getGroupCount } from '@/lib/utils';
import { Team } from '@/lib/types';

// POST /api/matches — generate all matches (group stage + knockout skeleton)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { tournament_id } = body;

  // Fetch tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournament_id)
    .single();

  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

  // Fetch groups + teams
  const { data: groups } = await supabase
    .from('groups')
    .select('*, teams(*)')
    .eq('tournament_id', tournament_id)
    .order('position');

  if (!groups) return NextResponse.json({ error: 'No groups found' }, { status: 400 });

  // Validate all groups are fully assigned
  for (const g of groups) {
    if ((g.teams || []).length !== 4) {
      return NextResponse.json({ error: `Group ${g.name} needs exactly 4 teams` }, { status: 400 });
    }
  }

  // Delete existing matches to regenerate
  await supabase.from('matches').delete().eq('tournament_id', tournament_id);

  // ── Generate group stage matches ──
  const groupMatchRows: Record<string, unknown>[] = [];
  for (const group of groups) {
    const pairs = generateRoundRobinPairs(group.teams as Team[]);
    pairs.forEach((pair, i) => {
      groupMatchRows.push({
        tournament_id,
        group_id: group.id,
        stage: 'group',
        round: 1,
        team_a_id: pair[0].id,
        team_b_id: pair[1].id,
        position: i,
      });
    });
  }

  const { data: groupMatches, error: gmErr } = await supabase
    .from('matches')
    .insert(groupMatchRows)
    .select();

  if (gmErr) return NextResponse.json({ error: gmErr.message }, { status: 500 });

  // ── Generate knockout skeleton ──
  const groupCount = getGroupCount(tournament.team_count);
  const knockoutMappings = buildKnockoutStructure(groupCount);

  // For 8 teams: SFs only. For 16+: QFs + SFs + Final
  const hasQF = groupCount >= 4;
  let qfMatches: Array<{ id: string; position: number }> = [];
  let sfMatches: Array<{ id: string; position: number }> = [];
  let finalMatch: { id: string } | null = null;

  if (hasQF) {
    // Create QF matches
    const qfRows = knockoutMappings.map(m => ({
      tournament_id,
      stage: 'quarterfinal',
      round: 1,
      position: m.position,
    }));
    const { data: qfs } = await supabase.from('matches').insert(qfRows).select();
    qfMatches = (qfs || []).sort((a, b) => a.position - b.position);

    // Create SF matches
    const sfRows = [
      { tournament_id, stage: 'semifinal', round: 1, position: 0 },
      { tournament_id, stage: 'semifinal', round: 1, position: 1 },
    ];
    const { data: sfs } = await supabase.from('matches').insert(sfRows).select();
    sfMatches = (sfs || []).sort((a, b) => a.position - b.position);

    // Create Final
    const { data: fin } = await supabase
      .from('matches')
      .insert({ tournament_id, stage: 'final', round: 1, position: 0 })
      .select()
      .single();
    finalMatch = fin;

    // Link QF → SF
    if (sfMatches.length >= 2 && finalMatch) {
      await supabase.from('matches').update({ next_match_id: sfMatches[0].id, next_slot: 'A' }).eq('id', qfMatches[0]?.id);
      await supabase.from('matches').update({ next_match_id: sfMatches[0].id, next_slot: 'B' }).eq('id', qfMatches[1]?.id);
      await supabase.from('matches').update({ next_match_id: sfMatches[1].id, next_slot: 'A' }).eq('id', qfMatches[2]?.id);
      await supabase.from('matches').update({ next_match_id: sfMatches[1].id, next_slot: 'B' }).eq('id', qfMatches[3]?.id);
      // Link SF → Final
      await supabase.from('matches').update({ next_match_id: finalMatch.id, next_slot: 'A' }).eq('id', sfMatches[0].id);
      await supabase.from('matches').update({ next_match_id: finalMatch.id, next_slot: 'B' }).eq('id', sfMatches[1].id);
    }
  } else {
    // 8 teams: SF only
    const sfRows = [
      { tournament_id, stage: 'semifinal', round: 1, position: 0 },
      { tournament_id, stage: 'semifinal', round: 1, position: 1 },
    ];
    const { data: sfs } = await supabase.from('matches').insert(sfRows).select();
    sfMatches = (sfs || []).sort((a, b) => a.position - b.position);
    const { data: fin } = await supabase
      .from('matches')
      .insert({ tournament_id, stage: 'final', round: 1, position: 0 })
      .select()
      .single();
    finalMatch = fin;
    if (finalMatch && sfMatches.length >= 2) {
      await supabase.from('matches').update({ next_match_id: finalMatch.id, next_slot: 'A' }).eq('id', sfMatches[0].id);
      await supabase.from('matches').update({ next_match_id: finalMatch.id, next_slot: 'B' }).eq('id', sfMatches[1].id);
    }
  }

  // Update tournament status
  await supabase.from('tournaments').update({ status: 'fixture' }).eq('id', tournament_id);

  return NextResponse.json({ success: true, groupMatches: groupMatches?.length });
}
