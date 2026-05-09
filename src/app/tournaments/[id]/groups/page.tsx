'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Plus, X, Loader2, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { Group, Team, Tournament } from '@/lib/types';
import { GROUP_LETTERS } from '@/lib/utils';

const GROUP_COLORS = [
  { bg: 'rgba(99,179,237,0.12)', border: 'rgba(99,179,237,0.3)', text: '#63b3ed' },
  { bg: 'rgba(159,122,234,0.12)', border: 'rgba(159,122,234,0.3)', text: '#9f7aea' },
  { bg: 'rgba(246,173,85,0.12)', border: 'rgba(246,173,85,0.3)', text: '#f6ad55' },
  { bg: 'rgba(72,187,120,0.12)', border: 'rgba(72,187,120,0.3)', text: '#48bb78' },
  { bg: 'rgba(252,129,129,0.12)', border: 'rgba(252,129,129,0.3)', text: '#fc8181' },
  { bg: 'rgba(246,201,14,0.12)', border: 'rgba(246,201,14,0.3)', text: '#f6c90e' },
  { bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', text: '#38bdf8' },
  { bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)', text: '#f472b6' },
];

export default function GroupsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [newTeamNames, setNewTeamNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/tournaments/${id}`);
      if (!res.ok) { router.push('/'); return; }
      const data = await res.json();
      setTournament(data.tournament);
      setGroups(data.groups);
      setAllTeams(data.groups.flatMap((g: Group) => g.teams || []));
      setLoading(false);
    }
    load();
  }, [id]);

  function getGroupTeams(groupId: string) {
    return allTeams.filter(t => t.group_id === groupId);
  }

  async function addTeam(groupId: string) {
    const name = newTeamNames[groupId]?.trim();
    if (!name) return;

    const groupTeams = getGroupTeams(groupId);
    if (groupTeams.length >= 4) {
      setError('Each group can have maximum 4 teams');
      return;
    }

    // Check duplicate name
    if (allTeams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setError(`Team "${name}" already exists`);
      return;
    }

    setSaving(true);
    setError('');
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        tournament_id: id,
        group_id: groupId,
        position: groupTeams.length,
      }),
    });

    if (res.ok) {
      const team = await res.json();
      setAllTeams(prev => [...prev, team]);
      setNewTeamNames(prev => ({ ...prev, [groupId]: '' }));
    }
    setSaving(false);
  }

  async function removeTeam(teamId: string) {
    await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
    setAllTeams(prev => prev.filter(t => t.id !== teamId));
  }

  async function generateMatches() {
    // Validate all groups have 4 teams
    for (const g of groups) {
      if (getGroupTeams(g.id).length !== 4) {
        setError(`Group ${g.name} needs exactly 4 teams`);
        return;
      }
    }
    setGenerating(true);
    setError('');
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament_id: id }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to generate matches');
      setGenerating(false);
      return;
    }
    router.push(`/tournaments/${id}/fixture`);
  }

  const totalTeams = allTeams.length;
  const requiredTeams = tournament?.team_count || 0;
  const allGroupsFull = groups.length > 0 && groups.every(g => getGroupTeams(g.id).length === 4);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12, color: 'var(--text-secondary)' }}>
        <Loader2 size={24} className="spin" />
        Loading tournament...
      </div>
    );
  }

  return (
    <div className="groups-wrap">
      {/* Header */}
      <header className="setup-header">
        <Link href="/" className="btn-ghost"><ArrowLeft size={16} /> Back</Link>
        <div className="setup-logo">
          <div className="logo-icon"><Trophy size={18} /></div>
          {tournament?.name}
        </div>
        <div style={{ width: 80 }} />
      </header>

      {/* Progress */}
      <div className="step-bar">
        <div className="step done"><span className="step-num">✓</span> Setup</div>
        <div className="step-line active" />
        <div className="step active"><span className="step-num">2</span> Groups</div>
        <div className="step-line" />
        <div className="step"><span className="step-num">3</span> Fixture</div>
      </div>

      <main className="groups-main">
        {/* Info bar */}
        <div className="groups-info-bar">
          <div className="groups-progress">
            <div className="gp-label">Teams Assigned</div>
            <div className="gp-bar">
              <motion.div
                className="gp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(totalTeams / requiredTeams) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="gp-count">{totalTeams} / {requiredTeams}</div>
          </div>

          {error && (
            <motion.div className="error-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={14} />{error}
            </motion.div>
          )}

          <button
            className="btn-primary"
            onClick={generateMatches}
            disabled={!allGroupsFull || generating}
          >
            {generating ? <Loader2 size={15} className="spin" /> : <ChevronRight size={15} />}
            {generating ? 'Generating Fixture...' : 'Generate Fixture'}
          </button>
        </div>

        {/* Groups Grid */}
        <div className="groups-grid">
          {groups.map((group, gi) => {
            const color = GROUP_COLORS[gi % GROUP_COLORS.length];
            const groupTeams = getGroupTeams(group.id);
            const isFull = groupTeams.length >= 4;

            return (
              <motion.div
                key={group.id}
                className="group-card glass-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                style={{ '--group-color': color.text } as React.CSSProperties}
              >
                {/* Group Header */}
                <div className="group-header" style={{ borderColor: color.border }}>
                  <div className="group-letter" style={{ background: color.bg, color: color.text, border: `1.5px solid ${color.border}` }}>
                    {group.name}
                  </div>
                  <div className="group-header-info">
                    <div className="group-title">Group {group.name}</div>
                    <div className="group-count">{groupTeams.length}/4 teams</div>
                  </div>
                  {isFull && <div className="group-full-badge">✓ Full</div>}
                </div>

                {/* Teams list */}
                <div className="team-slots">
                  <AnimatePresence>
                    {groupTeams.map((team, ti) => (
                      <motion.div
                        key={team.id}
                        className="team-slot filled"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: ti * 0.03 }}
                      >
                        <div className="team-position" style={{ color: color.text }}>
                          {ti + 1}
                        </div>
                        <div className="team-name">{team.name}</div>
                        <button className="team-remove" onClick={() => removeTeam(team.id)}>
                          <X size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty slots */}
                  {Array.from({ length: 4 - groupTeams.length }).map((_, i) => (
                    <div key={i} className="team-slot empty">
                      <div className="team-position empty-pos">{groupTeams.length + i + 1}</div>
                      <div className="empty-label">Empty slot</div>
                    </div>
                  ))}
                </div>

                {/* Add team input */}
                {!isFull && (
                  <div className="add-team-row">
                    <input
                      className="input"
                      style={{ fontSize: 13 }}
                      placeholder="Team name..."
                      value={newTeamNames[group.id] || ''}
                      onChange={e => setNewTeamNames(prev => ({ ...prev, [group.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTeam(group.id); } }}
                    />
                    <button
                      className="btn-primary"
                      style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}
                      onClick={() => addTeam(group.id)}
                      disabled={saving || !newTeamNames[group.id]?.trim()}
                    >
                      {saving ? <Loader2 size={13} className="spin" /> : <Plus size={13} />}
                      Add
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {allGroupsFull && (
          <motion.div
            className="bottom-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="cta-text">
              <Users size={18} color="var(--success)" />
              All {requiredTeams} teams assigned! Ready to generate fixtures.
            </div>
            <button
              className="btn-primary"
              onClick={generateMatches}
              disabled={generating}
              style={{ fontSize: 15, padding: '13px 32px' }}
            >
              {generating ? <Loader2 size={16} className="spin" /> : <ChevronRight size={16} />}
              {generating ? 'Generating...' : 'Generate Fixture →'}
            </button>
          </motion.div>
        )}
      </main>

      <style jsx>{`
        .groups-wrap { min-height: 100vh; }
        .setup-header { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border); }
        .setup-logo { display:flex; align-items:center; gap:8px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; }
        .logo-icon { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,var(--accent) 0%,var(--accent-2) 100%); display:flex; align-items:center; justify-content:center; color:white; }
        .step-bar { display:flex; align-items:center; justify-content:center; gap:0; padding:20px 24px; }
        .step { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--text-muted); }
        .step.active { color:var(--accent); }
        .step.done { color:var(--success); }
        .step-num { width:24px; height:24px; border-radius:50%; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; }
        .step.active .step-num { background:var(--accent); border-color:var(--accent); color:#fff; }
        .step.done .step-num { background:var(--success); border-color:var(--success); color:#fff; }
        .step-line { width:48px; height:1px; background:var(--border); margin:0 12px; }
        .step-line.active { background:var(--accent); }
        .groups-main { max-width:1100px; margin:0 auto; padding:24px 24px 80px; }
        .groups-info-bar { display:flex; align-items:center; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
        .groups-progress { display:flex; align-items:center; gap:10px; flex:1; min-width:200px; }
        .gp-label { font-size:12px; color:var(--text-secondary); white-space:nowrap; }
        .gp-bar { flex:1; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
        .gp-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--accent-2)); border-radius:3px; }
        .gp-count { font-size:13px; font-weight:600; white-space:nowrap; }
        .error-bar { display:flex; align-items:center; gap:8px; padding:8px 14px; background:rgba(252,129,129,0.1); border:1px solid rgba(252,129,129,0.2); border-radius:8px; color:var(--danger); font-size:13px; }
        .groups-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
        .group-card { padding:0; overflow:hidden; }
        .group-header { display:flex; align-items:center; gap:12px; padding:16px 16px 14px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .group-letter { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; font-family:'Space Grotesk',sans-serif; flex-shrink:0; }
        .group-title { font-size:14px; font-weight:700; }
        .group-count { font-size:11px; color:var(--text-muted); margin-top:1px; }
        .group-full-badge { margin-left:auto; font-size:11px; font-weight:600; color:var(--success); background:rgba(72,187,120,0.1); border:1px solid rgba(72,187,120,0.2); border-radius:6px; padding:3px 8px; }
        .team-slots { padding:10px 12px; display:flex; flex-direction:column; gap:6px; }
        .team-slot { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; }
        .team-slot.filled { background:rgba(255,255,255,0.04); }
        .team-slot.empty { background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.08); }
        .team-position { font-size:11px; font-weight:700; width:18px; text-align:center; flex-shrink:0; }
        .empty-pos { color:var(--text-muted); }
        .team-name { font-size:13px; font-weight:500; flex:1; }
        .empty-label { font-size:12px; color:var(--text-muted); flex:1; font-style:italic; }
        .team-remove { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:2px; border-radius:4px; display:flex; align-items:center; transition:color 0.15s; }
        .team-remove:hover { color:var(--danger); }
        .add-team-row { display:flex; gap:8px; padding:10px 12px 14px; }
        .bottom-cta { margin-top:32px; display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:rgba(72,187,120,0.07); border:1px solid rgba(72,187,120,0.2); border-radius:14px; flex-wrap:wrap; gap:16px; }
        .cta-text { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:500; }
        .spin { animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:600px) { .groups-info-bar { flex-direction:column; align-items:stretch; } }
      `}</style>
    </div>
  );
}
