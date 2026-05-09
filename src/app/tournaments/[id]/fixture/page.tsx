'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { FixtureData, Match, WinnerCardData } from '@/lib/types';
import ConfettiEffect from '@/components/fixture/ConfettiEffect';
import WinnerCard from '@/components/fixture/WinnerCard';
import GroupStagePanel from '@/components/fixture/GroupStagePanel';
import KnockoutBracket from '@/components/fixture/KnockoutBracket';


export default function FixturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<FixtureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [winnerCard, setWinnerCard] = useState<WinnerCardData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'bracket'>('groups');

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}`);
    if (!res.ok) { router.push('/'); return; }
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSetWinner(matchId: string, winnerId: string, scoreA: number | null, scoreB: number | null) {
    const res = await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_id: winnerId, score_a: scoreA, score_b: scoreB }),
    });
    if (!res.ok) return;
    const updatedMatch: Match = await res.json();

    // Find teams for winner card
    const allMatches = [
      ...(data?.groups.flatMap(g => g.matches || []) || []),
      ...(data?.knockout.quarterfinals || []),
      ...(data?.knockout.semifinals || []),
      ...(data?.knockout.final ? [data.knockout.final] : []),
    ];
    const originalMatch = allMatches.find(m => m.id === matchId);
    const winner = originalMatch?.team_a_id === winnerId ? originalMatch?.team_a : originalMatch?.team_b;
    const loser = originalMatch?.team_a_id === winnerId ? originalMatch?.team_b : originalMatch?.team_a;

    if (winner && loser && data) {
      const card: WinnerCardData = {
        tournament: data.tournament,
        match: updatedMatch,
        winner,
        loser,
        stage: updatedMatch.stage,
        scoreA,
        scoreB,
      };
      setWinnerCard(card);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    // Refresh data
    await fetchData();
  }

  async function handleUpdateMatchDetails(matchId: string, details: { match_date?: string; match_time?: string; venue?: string }) {
    await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    await fetchData();
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12, color: 'var(--text-secondary)' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        Loading fixture...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixture-wrap">
      {showConfetti && <ConfettiEffect />}

      {/* Winner Card Modal */}
      {winnerCard && (
        <WinnerCard
          data={winnerCard}
          onClose={() => setWinnerCard(null)}
        />
      )}

      {/* Header */}
      <header className="fixture-header">
        <div className="fixture-header-inner">
          <Link href="/" className="btn-ghost"><ArrowLeft size={15} /> Home</Link>
          <div className="fixture-title-wrap">
            <div className="logo-icon"><Trophy size={16} /></div>
            <span className="fixture-tournament-name">{data.tournament.name}</span>
            <span className="badge badge-blue">{data.tournament.team_count} Teams</span>
          </div>
          <button className="btn-ghost" onClick={fetchData}>
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </header>

      {/* Step bar */}
      <div className="step-bar">
        <div className="step done"><span className="step-num">✓</span> Setup</div>
        <div className="step-line active" />
        <div className="step done"><span className="step-num">✓</span> Groups</div>
        <div className="step-line active" />
        <div className="step active"><span className="step-num">3</span> Fixture</div>
      </div>

      {/* Mobile tab switcher */}
      <div className="mobile-tabs">
        <button className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
          Group Stage
        </button>
        <button className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
          Knockout Bracket
        </button>
      </div>

      {/* Main 2-panel layout */}
      <main className="fixture-main">
        {/* LEFT: Group Stage */}
        <div className={`panel-groups ${activeTab === 'bracket' ? 'mobile-hidden' : ''}`}>
          <GroupStagePanel
            groups={data.groups}
            onSetWinner={handleSetWinner}
            onUpdateDetails={handleUpdateMatchDetails}
          />
        </div>

        {/* RIGHT: Knockout Bracket */}
        <div className={`panel-bracket ${activeTab === 'groups' ? 'mobile-hidden' : ''}`}>
          <KnockoutBracket
            knockout={data.knockout}
            teamCount={data.tournament.team_count}
            onSetWinner={handleSetWinner}
            onUpdateDetails={handleUpdateMatchDetails}
          />
        </div>
      </main>

      <style jsx>{`
        .fixture-wrap { min-height:100vh; display:flex; flex-direction:column; }
        .fixture-header { position:sticky; top:0; z-index:40; border-bottom:1px solid var(--border); background:rgba(8,12,20,0.9); backdrop-filter:blur(12px); }
        .fixture-header-inner { max-width:1600px; margin:0 auto; padding:0 20px; height:56px; display:flex; align-items:center; justify-content:space-between; }
        .fixture-title-wrap { display:flex; align-items:center; gap:10px; }
        .logo-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--accent) 0%,var(--accent-2) 100%); display:flex; align-items:center; justify-content:center; color:white; }
        .fixture-tournament-name { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; }
        .step-bar { display:flex; align-items:center; justify-content:center; gap:0; padding:14px 24px; border-bottom:1px solid var(--border); }
        .step { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:500; color:var(--text-muted); }
        .step.active { color:var(--accent); }
        .step.done { color:var(--success); }
        .step-num { width:20px; height:20px; border-radius:50%; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; }
        .step.active .step-num { background:var(--accent); border-color:var(--accent); color:#fff; }
        .step.done .step-num { background:var(--success); border-color:var(--success); color:#fff; }
        .step-line { width:40px; height:1px; background:var(--border); margin:0 10px; }
        .step-line.active { background:var(--success); }
        .mobile-tabs { display:none; padding:12px 16px; gap:8px; border-bottom:1px solid var(--border); }
        .tab-btn { flex:1; padding:8px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
        .tab-btn.active { background:rgba(99,179,237,0.1); border-color:var(--accent); color:var(--accent); }
        .fixture-main { flex:1; display:grid; grid-template-columns:1fr 1fr; min-height:0; max-width:1600px; margin:0 auto; width:100%; }
        .panel-groups { border-right:1px solid var(--border); overflow-y:auto; max-height:calc(100vh - 120px); }
        .panel-bracket { overflow-y:auto; max-height:calc(100vh - 120px); }
        @media (max-width:900px) {
          .mobile-tabs { display:flex; }
          .fixture-main { grid-template-columns:1fr; }
          .panel-groups { border-right:none; max-height:none; }
          .panel-bracket { max-height:none; }
          .mobile-hidden { display:none; }
        }
      `}</style>
    </div>
  );
}
