'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Users, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

const TEAM_OPTIONS = [
  { value: 8, groups: 2, label: '8 Teams', sublabel: '2 Groups (A–B)' },
  { value: 16, groups: 4, label: '16 Teams', sublabel: '4 Groups (A–D)' },
  { value: 32, groups: 8, label: '32 Teams', sublabel: '8 Groups (A–H)' },
];

export default function NewTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Tournament name is required'); return; }
    if (!teamCount) { setError('Please select team count'); return; }

    setLoading(true);
    setError('');

    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), team_count: teamCount }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to create tournament');
      setLoading(false);
      return;
    }

    const { tournament } = await res.json();
    router.push(`/tournaments/${tournament.id}/groups`);
  }

  return (
    <div className="setup-wrap">
      {/* Header */}
      <header className="setup-header">
        <Link href="/" className="btn-ghost">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="setup-logo">
          <div className="logo-icon"><Trophy size={18} /></div>
          Quick Fixture
        </div>
        <div style={{ width: 80 }} />
      </header>

      {/* Progress */}
      <div className="step-bar">
        <div className="step active"><span className="step-num">1</span> Setup</div>
        <div className="step-line" />
        <div className="step"><span className="step-num">2</span> Groups</div>
        <div className="step-line" />
        <div className="step"><span className="step-num">3</span> Fixture</div>
      </div>

      <main className="setup-main">
        <motion.div
          className="setup-card glass-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="setup-card-header">
            <h1 className="setup-title">Create Tournament</h1>
            <p className="setup-sub">Set up your tournament name and team structure</p>
          </div>

          {error && (
            <div className="error-bar">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            {/* Name */}
            <div className="form-field">
              <label className="input-label">Tournament Name</label>
              <input
                className="input"
                placeholder="e.g. Premier League 2025"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Team count selector */}
            <div className="form-field">
              <label className="input-label">Number of Teams</label>
              <div className="team-options">
                {TEAM_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.value}
                    type="button"
                    className={`team-option ${teamCount === opt.value ? 'selected' : ''}`}
                    onClick={() => setTeamCount(opt.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {teamCount === opt.value && (
                      <div className="team-option-check"><CheckCircle size={14} /></div>
                    )}
                    <div className="team-option-icon"><Users size={22} /></div>
                    <div className="team-option-label">{opt.label}</div>
                    <div className="team-option-sub">{opt.sublabel}</div>
                    <div className="team-option-detail">
                      <span>{opt.groups} Groups</span>
                      <span>4 Teams/Group</span>
                      <span>Round Robin</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {teamCount && (
              <motion.div
                className="setup-preview"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="preview-title">Tournament Structure Preview</div>
                <div className="preview-stats">
                  {(() => {
                    const opt = TEAM_OPTIONS.find(o => o.value === teamCount)!;
                    const matchesPerGroup = 6; // 4 teams round-robin = 6 matches
                    const knockout = teamCount === 8 ? 'SF + Final' : teamCount === 16 ? 'QF + SF + Final' : 'QF + SF + Final';
                    return (
                      <>
                        <div className="ps"><span>{opt.groups}</span>Groups</div>
                        <div className="ps"><span>{opt.value}</span>Teams</div>
                        <div className="ps"><span>{opt.groups * matchesPerGroup}</span>Group Matches</div>
                        <div className="ps"><span>{knockout}</span>Knockout</div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: 8, fontSize: 15 }}
              disabled={loading || !name || !teamCount}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <ChevronRight size={16} />}
              {loading ? 'Creating...' : 'Create & Assign Teams'}
            </button>
          </form>
        </motion.div>
      </main>

      <style jsx>{`
        .setup-wrap { min-height: 100vh; }
        .setup-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border); }
        .setup-logo { display: flex; align-items: center; gap: 8px; font-family: 'Space Grotesk',sans-serif; font-weight: 700; font-size: 16px; }
        .logo-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,var(--accent) 0%,var(--accent-2) 100%); display: flex; align-items: center; justify-content: center; color: white; }
        .step-bar { display: flex; align-items: center; justify-content: center; gap: 0; padding: 20px 24px; }
        .step { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .step.active { color: var(--accent); }
        .step-num { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
        .step.active .step-num { background: var(--accent); border-color: var(--accent); color: #fff; }
        .step-line { width: 48px; height: 1px; background: var(--border); margin: 0 12px; }
        .setup-main { max-width: 640px; margin: 0 auto; padding: 32px 24px 80px; }
        .setup-card { padding: 36px; }
        .setup-card-header { margin-bottom: 28px; }
        .setup-title { font-size: 24px; font-weight: 800; font-family: 'Space Grotesk',sans-serif; margin-bottom: 6px; }
        .setup-sub { color: var(--text-secondary); font-size: 14px; }
        .error-bar { padding: 10px 14px; background: rgba(252,129,129,0.1); border: 1px solid rgba(252,129,129,0.2); border-radius: 8px; color: var(--danger); font-size: 13px; margin-bottom: 20px; }
        .form-field { margin-bottom: 24px; }
        .team-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .team-option { position: relative; padding: 20px 14px; background: rgba(255,255,255,0.03); border: 1.5px solid var(--border); border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s; }
        .team-option.selected { border-color: var(--accent); background: rgba(99,179,237,0.07); }
        .team-option-check { position: absolute; top: 10px; right: 10px; color: var(--accent); }
        .team-option-icon { color: var(--text-secondary); margin-bottom: 8px; display: flex; justify-content: center; }
        .team-option.selected .team-option-icon { color: var(--accent); }
        .team-option-label { font-size: 16px; font-weight: 700; font-family: 'Space Grotesk',sans-serif; margin-bottom: 4px; }
        .team-option-sub { font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; }
        .team-option-detail { display: flex; flex-direction: column; gap: 3px; }
        .team-option-detail span { font-size: 10px; color: var(--text-muted); background: rgba(255,255,255,0.04); border-radius: 4px; padding: 2px 6px; }
        .setup-preview { background: rgba(99,179,237,0.05); border: 1px solid rgba(99,179,237,0.15); border-radius: 10px; padding: 16px; margin-bottom: 24px; }
        .preview-title { font-size: 11px; font-weight: 600; color: var(--accent); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px; }
        .preview-stats { display: flex; gap: 0; }
        .ps { flex: 1; text-align: center; font-size: 11px; color: var(--text-secondary); }
        .ps span { display: block; font-size: 17px; font-weight: 700; color: var(--text-primary); font-family: 'Space Grotesk',sans-serif; margin-bottom: 2px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 500px) { .team-options { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
