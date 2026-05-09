'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, LogOut, Calendar, Users, ChevronRight, Trash2, Loader2, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Tournament } from '@/lib/types';
import { formatMatchDate } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const res = await fetch('/api/tournaments');
      if (res.ok) setTournaments(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tournament?')) return;
    setDeletingId(id);
    await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
    setTournaments(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
  }

  const statusConfig: Record<string, { label: string; class: string }> = {
    setup: { label: 'Setup', class: 'badge-blue' },
    groups: { label: 'Groups', class: 'badge-purple' },
    fixture: { label: 'Active', class: 'badge-green' },
    completed: { label: 'Completed', class: 'badge-gold' },
  };

  return (
    <div className="page-wrap">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" className="logo-link">
            <div className="logo-icon"><Trophy size={20} /></div>
            <span className="logo-text">Quick Fixture</span>
          </Link>
          <div className="header-right">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Hero */}
        <motion.div
          className="home-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-badge">
            <Zap size={12} />
            Tournament Fixture Builder
          </div>
          <h1 className="hero-title">
            Build <span className="gradient-text">Professional</span><br />
            Tournament Fixtures
          </h1>
          <p className="hero-sub">
            Auto-generate groups, create matches, track winners & visualize brackets in real-time.
          </p>
          <Link href="/tournaments/new" className="btn-primary hero-cta">
            <Plus size={18} /> Create Tournament
          </Link>
        </motion.div>

        {/* Tournaments List */}
        <div className="tournaments-section">
          <div className="section-header">
            <h2 className="section-title">My Tournaments</h2>
            <Link href="/tournaments/new" className="btn-secondary">
              <Plus size={15} /> New
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 size={24} className="spin" />
              <span>Loading tournaments...</span>
            </div>
          ) : tournaments.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="empty-icon"><Trophy size={32} /></div>
              <h3>No tournaments yet</h3>
              <p>Create your first tournament to get started</p>
              <Link href="/tournaments/new" className="btn-primary">
                <Plus size={15} /> Create Tournament
              </Link>
            </motion.div>
          ) : (
            <div className="tournaments-grid">
              <AnimatePresence>
                {tournaments.map((t, i) => (
                  <motion.div
                    key={t.id}
                    className="tournament-card glass-card"
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
                      <div className="tc-meta-item">
                        <Users size={13} />
                        {t.team_count} Teams
                      </div>
                      <div className="tc-meta-item">
                        <Calendar size={13} />
                        {formatMatchDate(t.created_at.split('T')[0])}
                      </div>
                    </div>
                    <div className="tc-actions">
                      <Link
                        href={t.status === 'fixture' || t.status === 'completed'
                          ? `/tournaments/${t.id}/fixture`
                          : `/tournaments/${t.id}/groups`}
                        className="btn-primary tc-open"
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
      </main>

      <style jsx>{`
        .page-wrap { min-height: 100vh; }
        .home-header { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--border); background: rgba(8,12,20,0.8); backdrop-filter: blur(12px); }
        .home-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; }
        .logo-icon { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%); display: flex; align-items: center; justify-content: center; color: white; }
        .header-right { display: flex; align-items: center; gap: 12px; }
        .user-email { font-size: 13px; color: var(--text-secondary); }
        .home-main { max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; }
        .home-hero { text-align: center; padding: 60px 0 56px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; background: rgba(99,179,237,0.1); border: 1px solid rgba(99,179,237,0.2); border-radius: 20px; color: var(--accent); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
        .hero-title { font-size: clamp(32px, 6vw, 56px); font-weight: 900; font-family: 'Space Grotesk', sans-serif; line-height: 1.1; margin-bottom: 16px; }
        .hero-sub { color: var(--text-secondary); font-size: 16px; max-width: 480px; margin: 0 auto 32px; line-height: 1.6; }
        .hero-cta { font-size: 15px; padding: 13px 28px; }
        .tournaments-section { margin-top: 20px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .section-title { font-size: 20px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .loading-state { display: flex; align-items: center; gap: 12px; color: var(--text-secondary); padding: 60px 0; justify-content: center; }
        .empty-state { text-align: center; padding: 80px 24px; }
        .empty-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(99,179,237,0.08); display: flex; align-items: center; justify-content: center; color: var(--accent); margin: 0 auto 20px; }
        .empty-state h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .empty-state p { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
        .tournaments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .tournament-card { padding: 20px; transition: all 0.2s ease; }
        .tc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .tc-name { font-size: 16px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .tc-meta { display: flex; gap: 16px; margin-bottom: 18px; }
        .tc-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-secondary); }
        .tc-actions { display: flex; gap: 8px; align-items: center; }
        .tc-open { flex: 1; font-size: 13px; padding: 8px 14px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
