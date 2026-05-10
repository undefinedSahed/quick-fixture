import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGroupNames, generateRoundRobinPairs } from '@/lib/tournament-logic';
import { getGroupCount } from '@/lib/utils';

// GET /api/tournaments — list user's tournaments
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Tournaments fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tournaments — create tournament + auto-generate groups
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, team_count } = body;

    if (!name || !team_count) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (![8, 16, 32].includes(team_count)) {
      return NextResponse.json({ error: 'team_count must be 8, 16, or 32' }, { status: 400 });
    }

    // Create tournament
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .insert({ 
        name: name.trim(), 
        team_count, 
        user_id: user.id, 
        status: 'groups' 
      })
      .select()
      .single();

    if (tErr) {
      console.error('Tournament creation error:', tErr);
      return NextResponse.json({ 
        error: `Failed to create tournament: ${tErr.message}` 
      }, { status: 500 });
    }

    // Create groups
    const groupCount = getGroupCount(team_count);
    const groupNames = generateGroupNames(groupCount);
    const groupRows = groupNames.map((name, i) => ({
      tournament_id: tournament.id,
      name,
      position: i,
    }));

    const { data: groups, error: gErr } = await supabase
      .from('groups')
      .insert(groupRows)
      .select();

    if (gErr) {
      console.error('Groups creation error:', gErr);
      return NextResponse.json({ 
        error: `Failed to create groups: ${gErr.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ tournament, groups }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
