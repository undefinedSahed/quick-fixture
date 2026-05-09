import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tournaments/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (tErr) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch groups with teams and matches
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('tournament_id', id)
    .order('position');

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', id)
    .order('position');

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:team_a_id(*),
      team_b:team_b_id(*),
      winner:winner_id(*)
    `)
    .eq('tournament_id', id)
    .order('position');

  // Attach teams and matches to groups
  const groupsWithData = (groups || []).map(g => ({
    ...g,
    teams: (teams || []).filter(t => t.group_id === g.id),
    matches: (matches || []).filter(m => m.group_id === g.id),
  }));

  // Knockout matches
  const knockout = {
    quarterfinals: (matches || []).filter(m => m.stage === 'quarterfinal').sort((a, b) => a.position - b.position),
    semifinals: (matches || []).filter(m => m.stage === 'semifinal').sort((a, b) => a.position - b.position),
    final: (matches || []).find(m => m.stage === 'final') || null,
  };

  return NextResponse.json({ tournament, groups: groupsWithData, knockout });
}

// PATCH /api/tournaments/[id] — update status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from('tournaments')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/tournaments/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
