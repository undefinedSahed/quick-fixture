'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { KnockoutBracket as KnockoutBracketType, Match } from '@/lib/types';
import MatchCard from './MatchCard';

interface Props {
  knockout: KnockoutBracketType;
  teamCount: number;
  onSetWinner: (matchId: string, winnerId: string, scoreA: number | null, scoreB: number | null) => Promise<void>;
  onUpdateDetails: (matchId: string, details: { match_date?: string; match_time?: string; venue?: string }) => Promise<void>;
}

interface StageColumnProps {
  title: string;
  subtitle?: string;
  matches: Match[];
  color: string;
  onSetWinner: Props['onSetWinner'];
  onUpdateDetails: Props['onUpdateDetails'];
  isFinal?: boolean;
}

function StageColumn({ title, subtitle, matches, color, onSetWinner, onUpdateDetails, isFinal }: StageColumnProps) {
  return (
    <div className={`stage-col ${isFinal ? 'final-col' : ''}`} style={{ '--stage-clr': color } as React.CSSProperties}>
      <div className="stage-col-header">
        {isFinal && <Trophy size={14} className="final-trophy" />}
        <span className="stage-col-title">{title}</span>
        {subtitle && <span className="stage-col-sub">{subtitle}</span>}
      </div>
      <div className="stage-col-matches">
        {matches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            onSetWinner={onSetWinner}
            onUpdateDetails={onUpdateDetails}
            compact={!isFinal}
          />
        ))}
      </div>

      <style jsx>{`
        .stage-col { display:flex; flex-direction:column; gap:10px; min-width:0; }
        .final-col { }
        .stage-col-header { display:flex; align-items:center; gap:6px; padding:4px 0 8px; border-bottom:1px solid rgba(var(--stage-clr-raw,255,255,255),0.1); margin-bottom:4px; }
        .final-trophy { color:var(--gold); }
        .stage-col-title { font-size:12px; font-weight:700; color:var(--stage-clr,var(--text-secondary)); font-family:'Space Grotesk',sans-serif; letter-spacing:0.04em; text-transform:uppercase; }
        .stage-col-sub { font-size:10px; color:var(--text-muted); }
        .stage-col-matches { display:flex; flex-direction:column; gap:8px; }
      `}</style>
    </div>
  );
}

export default function KnockoutBracket({ knockout, teamCount, onSetWinner, onUpdateDetails }: Props) {
  const { quarterfinals, semifinals, final } = knockout;
  const hasQF = teamCount >= 16;
  const champion = final?.winner;

  return (
    <div className="bracket-panel">
      <div className="bracket-header">
        <h2 className="bracket-title">Knockout Bracket</h2>
        <span className="bracket-sub">
          {hasQF ? 'QF → SF → Final' : 'SF → Final'}
        </span>
      </div>

      <div className="bracket-scroll">
        {/* Champion banner */}
        {champion && (
          <motion.div
            className="champion-banner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="champion-trophy">🏆</div>
            <div>
              <div className="champion-label">Tournament Champion</div>
              <div className="champion-name">{champion.name}</div>
            </div>
          </motion.div>
        )}

        <div className={`bracket-grid ${!hasQF ? 'no-qf' : ''}`}>
          {/* Quarterfinals */}
          {hasQF && quarterfinals.length > 0 && (
            <StageColumn
              title="Quarter Finals"
              subtitle={`${quarterfinals.length} matches`}
              matches={quarterfinals}
              color="#f6ad55"
              onSetWinner={onSetWinner}
              onUpdateDetails={onUpdateDetails}
            />
          )}

          {/* Semifinals */}
          {semifinals.length > 0 && (
            <StageColumn
              title="Semi Finals"
              subtitle="2 matches"
              matches={semifinals}
              color="#9f7aea"
              onSetWinner={onSetWinner}
              onUpdateDetails={onUpdateDetails}
            />
          )}

          {/* Final */}
          {final && (
            <StageColumn
              title="Final"
              subtitle="Championship"
              matches={[final]}
              color="#f6c90e"
              onSetWinner={onSetWinner}
              onUpdateDetails={onUpdateDetails}
              isFinal
            />
          )}
        </div>

        {!final && semifinals.length === 0 && (
          <div className="bracket-empty">
            <Trophy size={28} />
            <p>Knockout bracket will appear after groups are set up</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .bracket-panel { display:flex; flex-direction:column; height:100%; }
        .bracket-header { padding:16px 20px 12px; border-bottom:1px solid var(--border); flex-shrink:0; }
        .bracket-title { font-size:15px; font-weight:700; font-family:'Space Grotesk',sans-serif; }
        .bracket-sub { font-size:11px; color:var(--text-secondary); margin-top:2px; display:block; }
        .bracket-scroll { flex:1; overflow-y:auto; padding:16px 16px 24px; }
        .champion-banner { display:flex; align-items:center; gap:14px; padding:14px 18px; background:rgba(246,201,14,0.08); border:1px solid rgba(246,201,14,0.25); border-radius:12px; margin-bottom:20px; }
        .champion-trophy { font-size:32px; }
        .champion-label { font-size:10px; font-weight:600; color:var(--gold); letter-spacing:0.07em; text-transform:uppercase; margin-bottom:2px; }
        .champion-name { font-size:20px; font-weight:800; color:var(--gold); font-family:'Space Grotesk',sans-serif; }
        .bracket-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .bracket-grid.no-qf { grid-template-columns:repeat(2,1fr); }
        .bracket-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:60px 0; color:var(--text-muted); text-align:center; }
        .bracket-empty p { font-size:13px; max-width:200px; line-height:1.5; }
        @media (max-width:700px) {
          .bracket-grid { grid-template-columns:1fr; }
          .bracket-grid.no-qf { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
