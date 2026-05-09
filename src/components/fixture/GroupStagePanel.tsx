'use client';

import { motion } from 'framer-motion';
import { Group } from '@/lib/types';
import MatchCard from './MatchCard';

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

interface Props {
  groups: Group[];
  onSetWinner: (matchId: string, winnerId: string, scoreA: number | null, scoreB: number | null) => Promise<void>;
  onUpdateDetails: (matchId: string, details: { match_date?: string; match_time?: string; venue?: string }) => Promise<void>;
}

export default function GroupStagePanel({ groups, onSetWinner, onUpdateDetails }: Props) {
  return (
    <div className="gs-panel">
      <div className="gs-header">
        <h2 className="gs-title">Group Stage</h2>
        <span className="gs-sub">{groups.length} groups · Round robin</span>
      </div>

      <div className="gs-scroll">
        {groups.map((group, gi) => {
          const color = GROUP_COLORS[gi % GROUP_COLORS.length];
          const matches = group.matches || [];
          const completedMatches = matches.filter(m => m.winner_id);
          const isComplete = completedMatches.length === matches.length && matches.length > 0;

          return (
            <motion.div
              key={group.id}
              className="group-section"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.07 }}
            >
              {/* Group header */}
              <div className="group-sec-header">
                <div className="group-badge" style={{ background: color.bg, color: color.text, border: `1.5px solid ${color.border}` }}>
                  {group.name}
                </div>
                <div className="group-sec-info">
                  <span className="group-sec-name">Group {group.name}</span>
                  <span className="group-sec-teams">
                    {(group.teams || []).map(t => t.name).join(' · ')}
                  </span>
                </div>
                {isComplete && <span className="group-done">✓ Complete</span>}
                <span className="group-progress">{completedMatches.length}/{matches.length}</span>
              </div>

              {/* Matches */}
              <div className="group-matches">
                {matches.length === 0 ? (
                  <div className="no-matches">No matches generated</div>
                ) : (
                  matches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onSetWinner={onSetWinner}
                      onUpdateDetails={onUpdateDetails}
                    />
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .gs-panel { display:flex; flex-direction:column; height:100%; }
        .gs-header { padding:16px 20px 12px; border-bottom:1px solid var(--border); flex-shrink:0; }
        .gs-title { font-size:15px; font-weight:700; font-family:'Space Grotesk',sans-serif; }
        .gs-sub { font-size:11px; color:var(--text-secondary); margin-top:2px; display:block; }
        .gs-scroll { flex:1; overflow-y:auto; padding:12px 16px 24px; display:flex; flex-direction:column; gap:16px; }
        .group-section { display:flex; flex-direction:column; gap:8px; }
        .group-sec-header { display:flex; align-items:center; gap:10px; padding:0 4px; }
        .group-badge { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; font-family:'Space Grotesk',sans-serif; flex-shrink:0; }
        .group-sec-info { flex:1; min-width:0; }
        .group-sec-name { font-size:13px; font-weight:600; display:block; }
        .group-sec-teams { font-size:10px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; }
        .group-done { font-size:10px; font-weight:600; color:var(--success); background:rgba(72,187,120,0.1); border:1px solid rgba(72,187,120,0.2); border-radius:5px; padding:2px 7px; }
        .group-progress { font-size:11px; color:var(--text-muted); }
        .group-matches { display:flex; flex-direction:column; gap:6px; padding-left:4px; }
        .no-matches { font-size:12px; color:var(--text-muted); padding:12px; text-align:center; }
      `}</style>
    </div>
  );
}
