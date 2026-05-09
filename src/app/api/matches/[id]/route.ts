import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/matches/[id] — update match details OR set winner
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Update the match
  const { data: match, error } = await supabase
    .from('matches')
    .update(body)
    .eq('id', id)
    .select(`*, team_a:team_a_id(*), team_b:team_b_id(*), winner:winner_id(*)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If winner was set → auto-progress to next match
  if (body.winner_id && match.next_match_id && match.next_slot) {
    const updateField = match.next_slot === 'A' ? 'team_a_id' : 'team_b_id';
    await supabase
      .from('matches')
      .update({ [updateField]: body.winner_id })
      .eq('id', match.next_match_id);
  }

  return NextResponse.json(match);
}
