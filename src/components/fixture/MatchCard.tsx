'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronDown, Trophy, Edit2, Check, X } from 'lucide-react';
import { Match } from '@/lib/types';
import { formatMatchDate, formatMatchTime } from '@/lib/utils';

interface Props {
  match: Match;
  onSetWinner: (matchId: string, winnerId: string, scoreA: number | null, scoreB: number | null) => Promise<void>;
  onUpdateDetails: (matchId: string, details: { match_date?: string; match_time?: string; venue?: string }) => Promise<void>;
  compact?: boolean;
}

export default function MatchCard({ match, onSetWinner, onUpdateDetails, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [winnerSaving, setWinnerSaving] = useState(false);
  const [scoreA, setScoreA] = useState<string>(match.score_a?.toString() || '');
  const [scoreB, setScoreB] = useState<string>(match.score_b?.toString() || '');
  const [date, setDate] = useState(match.match_date || '');
  const [time, setTime] = useState(match.match_time || '');
  const [venue, setVenue] = useState(match.venue || '');

  const teamA = match.team_a;
  const teamB = match.team_b;
  const winner = match.winner;
  const hasWinner = !!winner;

  async function handleWinner(teamId: string) {
    if (hasWinner || winnerSaving) return;
    if (!teamA || !teamB) return;
    setWinnerSaving(true);
    await onSetWinner(match.id, teamId, scoreA ? parseInt(scoreA) : null, scoreB ? parseInt(scoreB) : null);
    setWinnerSaving(false);
  }

  async function handleSaveDetails() {
    setSaving(true);
    await onUpdateDetails(match.id, {
      match_date: date || undefined,
      match_time: time || undefined,
      venue: venue || undefined,
    });
    setSaving(false);
    setEditing(false);
  }

  const isPlaceholder = !teamA || !teamB;

  return (
    <motion.div
      className={`match-card ${hasWinner ? 'has-winner' : ''} ${isPlaceholder ? 'placeholder' : ''} ${compact ? 'compact' : ''}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Teams row */}
      <div className="teams-row">
        {/* Team A */}
        <button
          className={`team-btn ${winner?.id === teamA?.id ? 'is-winner' : ''} ${hasWinner && winner?.id !== teamA?.id ? 'is-loser' : ''}`}
          onClick={() => teamA && handleWinner(teamA.id)}
          disabled={hasWinner || isPlaceholder || winnerSaving}
          title={!isPlaceholder && !hasWinner ? `Set ${teamA?.name} as winner` : undefined}
        >
          <span className="team-name-text">{teamA?.name || 'TBD'}</span>
          {winner?.id === teamA?.id && <Trophy size={12} className="winner-icon" />}
          {scoreA !== '' && hasWinner && <span className="score-display">{scoreA}</span>}
        </button>

        <div className="vs-divider">
          {winnerSaving ? (
            <div className="vs-loader" />
          ) : hasWinner ? (
            <span className="vs-done">✓</span>
          ) : (
            <span className="vs-text">VS</span>
          )}
        </div>

        {/* Team B */}
        <button
          className={`team-btn right ${winner?.id === teamB?.id ? 'is-winner' : ''} ${hasWinner && winner?.id !== teamB?.id ? 'is-loser' : ''}`}
          onClick={() => teamB && handleWinner(teamB.id)}
          disabled={hasWinner || isPlaceholder || winnerSaving}
          title={!isPlaceholder && !hasWinner ? `Set ${teamB?.name} as winner` : undefined}
        >
          <span className="team-name-text">{teamB?.name || 'TBD'}</span>
          {winner?.id === teamB?.id && <Trophy size={12} className="winner-icon" />}
          {scoreB !== '' && hasWinner && <span className="score-display">{scoreB}</span>}
        </button>
      </div>

      {/* Score entry (before winner selected) */}
      {!hasWinner && !isPlaceholder && !compact && (
        <div className="score-entry">
          <input
            className="score-input"
            type="number"
            min="0"
            placeholder="0"
            value={scoreA}
            onChange={e => setScoreA(e.target.value)}
          />
          <span className="score-colon">:</span>
          <input
            className="score-input"
            type="number"
            min="0"
            placeholder="0"
            value={scoreB}
            onChange={e => setScoreB(e.target.value)}
          />
        </div>
      )}

      {/* Match meta */}
      {!compact && (match.match_date || match.match_time || match.venue) && !editing && (
        <div className="match-meta">
          {match.match_date && <span className="meta-item"><Calendar size={11} />{formatMatchDate(match.match_date)}</span>}
          {match.match_time && <span className="meta-item"><Clock size={11} />{formatMatchTime(match.match_time)}</span>}
          {match.venue && <span className="meta-item"><MapPin size={11} />{match.venue}</span>}
        </div>
      )}

      {/* Expand / Edit toggle */}
      {!compact && (
        <div className="card-footer">
          {!editing ? (
            <button className="btn-ghost edit-btn" onClick={() => setEditing(true)}>
              <Edit2 size={11} /> {match.match_date ? 'Edit' : 'Add'} Details
            </button>
          ) : (
            <div className="edit-form">
              <div className="edit-row">
                <div className="edit-field">
                  <label className="mini-label"><Calendar size={10} /> Date</label>
                  <input type="date" className="input mini-input" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="edit-field">
                  <label className="mini-label"><Clock size={10} /> Time</label>
                  <input type="time" className="input mini-input" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="edit-field">
                <label className="mini-label"><MapPin size={10} /> Venue</label>
                <input type="text" className="input mini-input" placeholder="Venue name..." value={venue} onChange={e => setVenue(e.target.value)} />
              </div>
              <div className="edit-actions">
                <button className="btn-ghost" onClick={() => setEditing(false)} style={{ fontSize: 12 }}><X size={12} /> Cancel</button>
                <button className="btn-primary" onClick={handleSaveDetails} disabled={saving} style={{ fontSize: 12, padding: '6px 12px' }}>
                  <Check size={12} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .match-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 12px;
          transition: border-color 0.2s;
        }
        .match-card.has-winner {
          border-color: rgba(246,201,14,0.2);
          background: rgba(246,201,14,0.03);
        }
        .match-card.placeholder {
          opacity: 0.5;
        }
        .match-card.compact { padding: 8px 10px; }
        .teams-row { display:flex; align-items:center; gap:6px; }
        .team-btn {
          flex:1; display:flex; align-items:center; gap:6px; padding:8px 10px;
          background:rgba(255,255,255,0.04); border:1px solid transparent;
          border-radius:7px; cursor:pointer; transition:all 0.2s; color:var(--text-primary);
          font-size:13px; font-weight:500; text-align:left;
        }
        .team-btn.right { justify-content:flex-end; text-align:right; flex-direction:row-reverse; }
        .team-btn:not(:disabled):hover { border-color:var(--accent); background:rgba(99,179,237,0.08); }
        .team-btn.is-winner {
          background:rgba(246,201,14,0.12) !important;
          border-color:rgba(246,201,14,0.4) !important;
          color:var(--gold) !important;
          font-weight:700 !important;
        }
        .team-btn.is-loser { opacity:0.4; }
        .team-btn:disabled { cursor:default; }
        .team-name-text { flex:1; font-size:12px; line-height:1.3; }
        .compact .team-name-text { font-size:11px; }
        .winner-icon { color:var(--gold); flex-shrink:0; }
        .score-display { font-size:14px; font-weight:800; color:var(--gold); font-family:'Space Grotesk',sans-serif; }
        .vs-divider { display:flex; align-items:center; justify-content:center; width:28px; flex-shrink:0; }
        .vs-text { font-size:9px; font-weight:700; color:var(--text-muted); letter-spacing:0.05em; }
        .vs-done { font-size:12px; color:var(--success); }
        .vs-loader { width:12px; height:12px; border:1.5px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite; }
        .score-entry { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; }
        .score-input { width:48px; padding:4px; text-align:center; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:6px; color:var(--text-primary); font-size:14px; font-weight:700; outline:none; }
        .score-input:focus { border-color:var(--accent); }
        .score-input::-webkit-inner-spin-button { -webkit-appearance:none; }
        .score-colon { font-size:16px; font-weight:700; color:var(--text-muted); }
        .match-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
        .meta-item { display:flex; align-items:center; gap:4px; font-size:10px; color:var(--text-secondary); }
        .card-footer { margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px; }
        .edit-btn { font-size:11px; padding:4px 8px; color:var(--text-muted); }
        .edit-form { display:flex; flex-direction:column; gap:8px; }
        .edit-row { display:flex; gap:8px; }
        .edit-field { display:flex; flex-direction:column; gap:3px; flex:1; }
        .mini-label { display:flex; align-items:center; gap:3px; font-size:9px; font-weight:600; color:var(--text-muted); letter-spacing:0.06em; text-transform:uppercase; }
        .mini-input { padding:6px 8px; font-size:12px; }
        .edit-actions { display:flex; justify-content:flex-end; gap:6px; margin-top:4px; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
