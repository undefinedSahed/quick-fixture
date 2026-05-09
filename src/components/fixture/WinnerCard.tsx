'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Download, X, Calendar, MapPin, Clock } from 'lucide-react';
import { WinnerCardData } from '@/lib/types';
import { formatMatchDate, formatMatchTime, getStageName } from '@/lib/utils';

interface Props {
  data: WinnerCardData;
  onClose: () => void;
}

export default function WinnerCard({ data, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    const html2canvas = (await import('html2canvas')).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(cardRef.current, {
      background: '#0d1220',
      scale: 2,
      useCORS: true,
    } as any);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.tournament.name}-${getStageName(data.stage)}-result.png`;
    a.click();
    setDownloading(false);
  }

  const stageName = getStageName(data.stage);
  const isFinal = data.stage === 'final';

  return (
    <AnimatePresence>
      <motion.div
        className="wc-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="wc-container"
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="wc-close" onClick={onClose}><X size={18} /></button>

          {/* Download button */}
          <button className="wc-download btn-primary" onClick={handleDownload} disabled={downloading}>
            <Download size={14} />
            {downloading ? 'Saving...' : 'Download Card'}
          </button>

          {/* The actual card that gets captured */}
          <div ref={cardRef} className="wc-card">
            {/* Card header */}
            <div className="wc-card-header">
              <div className="wc-logo">
                <span className="wc-logo-icon">⚽</span>
                <span className="wc-logo-text">Quick Fixture</span>
              </div>
              <div className="wc-tournament-name">{data.tournament.name}</div>
            </div>

            {/* Stage badge */}
            <div className="wc-stage-badge">
              {isFinal && <span className="wc-stage-emoji">🏆</span>}
              {stageName}
            </div>

            {/* Teams showdown */}
            <div className="wc-showdown">
              {/* Winner side */}
              <div className="wc-team winner-side">
                <motion.div
                  className="wc-team-orb winner-orb"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {data.winner.name.slice(0, 2).toUpperCase()}
                </motion.div>
                <div className="wc-team-name winner-name">{data.winner.name}</div>
                <div className="wc-crown">👑 Winner</div>
                {data.scoreA !== null && (
                  <div className="wc-score winner-score">
                    {data.match.team_a_id === data.winner.id ? data.scoreA : data.scoreB}
                  </div>
                )}
              </div>

              {/* VS divider */}
              <div className="wc-vs-divider">
                <div className="wc-vs-line" />
                <div className="wc-vs-circle">VS</div>
                <div className="wc-vs-line" />
              </div>

              {/* Loser side */}
              <div className="wc-team loser-side">
                <div className="wc-team-orb loser-orb">
                  {data.loser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="wc-team-name loser-name">{data.loser.name}</div>
                <div className="wc-runner-up">Runner Up</div>
                {data.scoreB !== null && (
                  <div className="wc-score loser-score">
                    {data.match.team_a_id === data.loser.id ? data.scoreA : data.scoreB}
                  </div>
                )}
              </div>
            </div>

            {/* Match details */}
            {(data.match.match_date || data.match.match_time || data.match.venue) && (
              <div className="wc-details">
                {data.match.match_date && (
                  <span className="wc-detail-item">
                    <Calendar size={11} />{formatMatchDate(data.match.match_date)}
                  </span>
                )}
                {data.match.match_time && (
                  <span className="wc-detail-item">
                    <Clock size={11} />{formatMatchTime(data.match.match_time)}
                  </span>
                )}
                {data.match.venue && (
                  <span className="wc-detail-item">
                    <MapPin size={11} />{data.match.venue}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="wc-footer">
              Generated by Quick Fixture · {new Date().getFullYear()}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .wc-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(6px); }
        .wc-container { position:relative; max-width:500px; width:100%; }
        .wc-close { position:absolute; top:-40px; right:0; background:rgba(255,255,255,0.1); border:none; color:#fff; border-radius:50%; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:1; }
        .wc-close:hover { background:rgba(255,255,255,0.18); }
        .wc-download { position:absolute; bottom:-52px; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:13px; padding:9px 20px; }
        .wc-card {
          background:linear-gradient(145deg, #0d1220 0%, #111827 50%, #0d1220 100%);
          border:1px solid rgba(246,201,14,0.25);
          border-radius:20px;
          padding:28px 24px 24px;
          position:relative;
          overflow:hidden;
          box-shadow:0 0 60px rgba(246,201,14,0.1), 0 20px 60px rgba(0,0,0,0.5);
        }
        .wc-card::before {
          content:'';
          position:absolute;
          top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, #63b3ed, #9f7aea, #f6c90e, #f6ad55, #9f7aea, #63b3ed);
          background-size:200% 100%;
          animation:shimmer 3s linear infinite;
        }
        @keyframes shimmer { to { background-position:-200% 0; } }
        .wc-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .wc-logo { display:flex; align-items:center; gap:6px; }
        .wc-logo-icon { font-size:16px; }
        .wc-logo-text { font-size:11px; font-weight:700; color:var(--text-secondary); letter-spacing:0.06em; text-transform:uppercase; }
        .wc-tournament-name { font-size:13px; font-weight:700; color:var(--text-secondary); font-family:'Space Grotesk',sans-serif; }
        .wc-stage-badge { text-align:center; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold); background:rgba(246,201,14,0.1); border:1px solid rgba(246,201,14,0.2); border-radius:20px; padding:5px 18px; display:inline-block; width:100%; box-sizing:border-box; margin-bottom:24px; display:flex; align-items:center; justify-content:center; gap:8px; }
        .wc-stage-emoji { font-size:16px; }
        .wc-showdown { display:grid; grid-template-columns:1fr auto 1fr; gap:12px; align-items:center; margin-bottom:24px; }
        .wc-team { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .wc-team-orb { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; font-family:'Space Grotesk',sans-serif; }
        .winner-orb { background:linear-gradient(135deg,#f6c90e,#f6ad55); color:#1a1000; box-shadow:0 0 30px rgba(246,201,14,0.4); }
        .loser-orb { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:var(--text-muted); }
        .wc-team-name { font-size:15px; font-weight:800; font-family:'Space Grotesk',sans-serif; text-align:center; line-height:1.2; }
        .winner-name { color:var(--gold); }
        .loser-name { color:var(--text-secondary); }
        .wc-crown { font-size:10px; font-weight:700; color:var(--gold); letter-spacing:0.05em; }
        .wc-runner-up { font-size:10px; color:var(--text-muted); }
        .wc-score { font-size:28px; font-weight:900; font-family:'Space Grotesk',sans-serif; }
        .winner-score { color:var(--gold); }
        .loser-score { color:var(--text-muted); }
        .wc-vs-divider { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .wc-vs-line { width:1px; height:24px; background:rgba(255,255,255,0.1); }
        .wc-vs-circle { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:var(--text-muted); letter-spacing:0.05em; }
        .wc-details { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding:12px 0; border-top:1px solid rgba(255,255,255,0.06); margin-bottom:12px; }
        .wc-detail-item { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-secondary); }
        .wc-footer { text-align:center; font-size:10px; color:var(--text-muted); }
      `}</style>
    </AnimatePresence>
  );
}
