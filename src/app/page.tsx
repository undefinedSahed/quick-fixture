'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, LogOut, Calendar, Users, ChevronRight, Trash2, Loader2, Zap, Bot } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Tournament } from '@/lib/types';
import { formatMatchDate } from '@/lib/utils';

// Floating icon positions matching the scattered layout in the reference
const floatingIcons = [
  { Icon: Trophy,   top: '18%',  left: '6%',   delay: 0,    size: 22, color: '#3b82f6' },
  { Icon: Users,    top: '38%',  left: '4%',   delay: 0.4,  size: 22, color: '#8b5cf6' },
  { Icon: Calendar, top: '62%',  left: '7%',   delay: 0.8,  size: 22, color: '#3b82f6' },
  { Icon: Zap,      top: '78%',  left: '16%',  delay: 1.2,  size: 22, color: '#06b6d4' },
  { Icon: ChevronRight, top: '88%', left: '32%', delay: 1.6, size: 22, color: '#8b5cf6' },
  { Icon: Trophy,   top: '14%',  right: '8%',  delay: 0.2,  size: 22, color: '#3b82f6' },
  { Icon: Users,    top: '24%',  right: '5%',  delay: 0.6,  size: 22, color: '#8b5cf6' },
  { Icon: Calendar, top: '48%',  right: '4%',  delay: 1.0,  size: 22, color: '#06b6d4' },
  { Icon: Zap,      top: '68%',  right: '8%',  delay: 1.4,  size: 22, color: '#3b82f6' },
  { Icon: ChevronRight, top: '84%', right: '20%', delay: 1.8, size: 22, color: '#8b5cf6' },
];

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const res = await fetch('/api/tournaments');
        if (res.ok) setTournaments(await res.json());
        setShowDashboard(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setShowDashboard(false);
    setTournaments([]);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tournament?')) return;
    setDeletingId(id);
    await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
    setTournaments(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
  }

  const statusConfig: Record<string, { label: string; class: string }> = {
    setup:     { label: 'Setup',     class: 'badge-blue'   },
    groups:    { label: 'Groups',    class: 'badge-purple' },
    fixture:   { label: 'Active',    class: 'badge-green'  },
    completed: { label: 'Completed', class: 'badge-gold'   },
  };

  return (
    <div className="page-wrap">

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav className="main-nav">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon"><Trophy size={18} /></div>
            <span className="nav-logo-text">Quick Fixture</span>
          </Link>

          {/* Centre links */}
          <div className="nav-links">
            <a href="#features"    className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing"     className="nav-link">Pricing</a>
            <a href="#faq"         className="nav-link">FAQ</a>
          </div>

          {/* Auth actions */}
          <div className="nav-actions">
            {user ? (
              <>
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="btn-ghost">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login"    className="btn-ghost">Sign In</Link>
                <Link href="/auth/register" className="btn-primary-nav">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="home-main">

        {/* ─── Landing Hero ──────────────────────────────────────── */}
        {!showDashboard ? (
          <section className="landing-hero">

            {/* Radial glow backdrop */}
            <div className="hero-glow" />

            {/* Scattered floating icons */}
            {floatingIcons.map(({ Icon, top, left, right, delay, size, color }, i) => (
              <motion.div
                key={i}
                className="floating-icon"
                style={{ top, left, right, borderColor: color + '40', background: color + '12' }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5 + (i % 3) * 0.4, repeat: Infinity, delay, ease: 'easeInOut' }}
              >
                <Icon size={size} color={color} />
              </motion.div>
            ))}

            {/* Hero content */}
            <div className="hero-content">
              {/* Badge pill */}
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <Bot size={13} />
                AI-Powered Tournament Management
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.55 }}
              >
                Create Once,<br />
                <span className="gradient-text">Play Everywhere</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                className="hero-sub"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.55 }}
              >
                Auto-generate tournament brackets, manage teams, track winners, and visualize
                professional fixtures across all sports. From group stages to knockout finals —
                everything you need in one powerful platform.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.55 }}
              >
                <Link href="/auth/register" className="btn-hero-primary">
                  Start Free Trial →
                </Link>
                <button className="btn-hero-secondary">
                  Join Waitlist
                </button>
              </motion.div>
            </div>

            {/* Stats strip */}
            <div className="stats-strip">
              {[
                { n: '10K+', l: 'Active Tournaments' },
                { n: '1M+',  l: 'Matches Generated'  },
                { n: '12+',  l: 'Sports Supported'   },
                { n: '99.9%',l: 'Uptime'             },
              ].map(({ n, l }, i) => (
                <motion.div
                  key={l}
                  className="stat-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <span className="stat-num">{n}</span>
                  <span className="stat-lbl">{l}</span>
                </motion.div>
              ))}
            </div>
          </section>

        ) : (
          /* ─── Dashboard Hero ─────────────────────────────────── */
          <motion.div
            className="dashboard-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <motion.h1
              className="dashboard-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              My <span className="gradient-text">Tournaments</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.5 }}
            >
              <Link href="/tournaments/new" className="btn-hero-primary">
                <Plus size={17} /> Create Tournament
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Tournaments grid (logged-in only) ─────────────────── */}
        {showDashboard && (
          <div className="tournaments-section">
            {loading ? (
              <div className="loading-state">
                <Loader2 size={22} className="spin" />
                <span>Loading tournaments…</span>
              </div>
            ) : tournaments.length === 0 ? (
              <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="empty-icon"><Trophy size={30} /></div>
                <h3>No tournaments yet</h3>
                <p>Create your first tournament to get started</p>
                <Link href="/tournaments/new" className="btn-hero-primary">
                  <Plus size={15} /> Create Tournament
                </Link>
              </motion.div>
            ) : (
              <div className="tournaments-grid">
                <AnimatePresence>
                  {tournaments.map((t, i) => (
                    <motion.div
                      key={t.id}
                      className="tournament-card"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="tc-header">
                        <div className="tc-name">{t.name}</div>
                        <span className={`badge ${statusConfig[t.status]?.class}`}>
                          {statusConfig[t.status]?.label}
                        </span>
                      </div>
                      <div className="tc-meta">
                        <div className="tc-meta-item"><Users size={13} />{t.team_count} Teams</div>
                        <div className="tc-meta-item"><Calendar size={13} />{formatMatchDate(t.created_at.split('T')[0])}</div>
                      </div>
                      <div className="tc-actions">
                        <Link
                          href={t.status === 'fixture' || t.status === 'completed'
                            ? `/tournaments/${t.id}/fixture`
                            : `/tournaments/${t.id}/groups`}
                          className="btn-hero-primary tc-open"
                        >
                          Open <ChevronRight size={14} />
                        </Link>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                        >
                          {deletingId === t.id ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────── STYLES ─────────────────────── */}
      <style jsx>{`
        /* ---------- Reset & tokens ---------- */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap {
          min-height: 100vh;
          background: #040b18;
          color: #e8edf5;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        /* ---------- Nav ---------- */
        .main-nav {
          position: sticky; top: 0; z-index: 60;
          background: rgba(4,11,24,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 28px;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; color: #e8edf5;
          font-weight: 700; font-size: 18px; letter-spacing: -0.3px;
        }
        .nav-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 4px 16px rgba(59,130,246,0.45);
        }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link {
          color: rgba(232,237,245,0.62); text-decoration: none;
          font-size: 14px; font-weight: 500; transition: color 0.2s;
        }
        .nav-link:hover { color: #e8edf5; }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .user-email { font-size: 13px; color: rgba(232,237,245,0.5); }
        .btn-ghost {
          background: none; border: none; cursor: pointer;
          color: rgba(232,237,245,0.7); font-size: 14px; font-weight: 500;
          padding: 8px 14px; border-radius: 8px; transition: color 0.2s, background 0.2s;
        }
        .btn-ghost:hover { color: #e8edf5; background: rgba(255,255,255,0.06); }
        .btn-primary-nav {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: #fff; border: none; cursor: pointer;
          font-size: 14px; font-weight: 600; padding: 9px 20px;
          border-radius: 9px; text-decoration: none; display: inline-block;
          box-shadow: 0 4px 18px rgba(59,130,246,0.4);
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn-primary-nav:hover { opacity: 0.9; transform: translateY(-1px); }

        /* ---------- Hero ---------- */
        .landing-hero {
          position: relative; overflow: hidden;
          min-height: calc(100vh - 68px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 24px 0;
        }
        .hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 55% at 50% 38%, rgba(37,99,235,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 35% at 20% 60%, rgba(139,92,246,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 40% 35% at 80% 60%, rgba(6,182,212,0.10) 0%, transparent 70%);
        }
        .floating-icon {
          position: absolute; width: 50px; height: 50px;
          border-radius: 50%; border: 1px solid;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .hero-content {
          position: relative; z-index: 2;
          text-align: center; max-width: 820px;
          display: flex; flex-direction: column; align-items: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 16px;
          background: rgba(59,130,246,0.10);
          border: 1px solid rgba(59,130,246,0.28);
          border-radius: 999px; color: #93c5fd;
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 30px;
        }
        .hero-title {
          font-size: clamp(48px, 8vw, 82px);
          font-weight: 900; line-height: 1.06;
          letter-spacing: -2px; margin-bottom: 22px;
          font-family: 'DM Sans', sans-serif;
        }
        .gradient-text {
          background: linear-gradient(100deg, #3b82f6 0%, #06b6d4 60%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          color: rgba(232,237,245,0.58); font-size: 17px;
          max-width: 580px; line-height: 1.65;
          margin-bottom: 40px; font-weight: 400;
        }
        .hero-actions {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center;
        }
        .btn-hero-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          padding: 14px 28px; border-radius: 10px;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 6px 28px rgba(59,130,246,0.45);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: -0.2px;
        }
        .btn-hero-primary:hover {
          opacity: 0.92; transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(59,130,246,0.55);
        }
        .btn-hero-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(232,237,245,0.85); font-size: 15px; font-weight: 600;
          padding: 14px 28px; border-radius: 10px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-hero-secondary:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.25);
        }

        /* ---------- Stats strip ---------- */
        .stats-strip {
          position: relative; z-index: 2; margin-top: 72px;
          width: 100%; max-width: 900px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 40px; padding-bottom: 64px;
        }
        .stat-item {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 0 16px;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .stat-item:last-child { border-right: none; }
        .stat-num {
          font-size: 38px; font-weight: 900; letter-spacing: -1.5px;
          font-family: 'DM Sans', sans-serif; color: #e8edf5;
        }
        .stat-lbl { font-size: 13px; color: rgba(232,237,245,0.46); font-weight: 500; }

        /* ---------- Dashboard ---------- */
        .dashboard-hero {
          text-align: center; padding: 80px 24px 40px;
          display: flex; flex-direction: column; align-items: center; gap: 28px;
        }
        .dashboard-title {
          font-size: clamp(36px, 6vw, 60px); font-weight: 900;
          font-family: 'DM Sans', sans-serif; letter-spacing: -1.5px;
        }

        /* ---------- Tournaments ---------- */
        .tournaments-section {
          max-width: 1200px; margin: 0 auto; padding: 0 24px 80px;
        }
        .loading-state {
          display: flex; align-items: center; gap: 12px;
          color: rgba(232,237,245,0.45); padding: 80px 0; justify-content: center;
        }
        .empty-state { text-align: center; padding: 100px 24px; }
        .empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #3b82f6; margin: 0 auto 28px;
        }
        .empty-state h3 { font-size: 22px; font-weight: 700; margin-bottom: 10px; }
        .empty-state p { color: rgba(232,237,245,0.5); font-size: 15px; margin-bottom: 28px; }
        .tournaments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .tournament-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 24px;
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
        }
        .tournament-card:hover {
          border-color: rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.05);
          transform: translateY(-2px);
        }
        .tc-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px; margin-bottom: 14px;
        }
        .tc-name { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
        .tc-meta { display: flex; gap: 14px; margin-bottom: 18px; }
        .tc-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; color: rgba(232,237,245,0.48);
        }
        .tc-actions { display: flex; gap: 8px; }
        .tc-open { flex: 1; font-size: 14px; padding: 10px 14px; }
        .btn-danger {
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444; border-radius: 8px; padding: 10px 12px;
          cursor: pointer; display: flex; align-items: center; transition: background 0.2s;
        }
        .btn-danger:hover { background: rgba(239,68,68,0.22); }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ---------- Badges ---------- */
        .badge {
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 999px; white-space: nowrap; text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-blue   { background: rgba(59,130,246,0.15); color: #93c5fd; }
        .badge-purple { background: rgba(139,92,246,0.15); color: #c4b5fd; }
        .badge-green  { background: rgba(16,185,129,0.15); color: #6ee7b7; }
        .badge-gold   { background: rgba(245,158,11,0.15); color: #fcd34d; }

        /* ---------- Util ---------- */
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---------- Responsive ---------- */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero-title { letter-spacing: -1px; }
          .hero-actions { flex-direction: column; width: 100%; max-width: 320px; }
          .btn-hero-primary, .btn-hero-secondary { width: 100%; justify-content: center; }
          .stats-strip { grid-template-columns: repeat(2, 1fr); gap: 28px 0; }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 20px; }
          .stat-item:nth-child(3), .stat-item:nth-child(4) { border-bottom: none; }
          .tournaments-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}