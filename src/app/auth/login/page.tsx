'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="auth-bg">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon"><Trophy size={22} /></div>
          <span>Quick Fixture</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your tournaments</p>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={14} />{error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label className="input-label">Email</label>
            <div className="input-icon-wrap">
              <Mail size={15} className="input-icon" />
              <input type="email" className="input input-with-icon" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>
          <div className="auth-field">
            <label className="input-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} className="input input-with-icon input-with-icon-right"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password" />
              <button type="button" className="input-icon-right-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary"
            style={{ width: '100%', marginTop: 8, padding: '12px' }} disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="auth-link">Create one</Link>
        </p>
      </motion.div>

      <style jsx>{`
        .auth-bg { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background-image:radial-gradient(ellipse at 30% 20%,rgba(99,179,237,0.08) 0%,transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(159,122,234,0.08) 0%,transparent 50%); }
        .auth-card { width:100%; max-width:420px; background:rgba(13,18,32,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:40px; backdrop-filter:blur(20px); }
        .auth-logo { display:flex; align-items:center; gap:10px; margin-bottom:32px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px; }
        .auth-logo-icon { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,var(--accent) 0%,var(--accent-2) 100%); display:flex; align-items:center; justify-content:center; color:white; }
        .auth-title { font-size:26px; font-weight:800; margin-bottom:6px; font-family:'Space Grotesk',sans-serif; }
        .auth-subtitle { color:var(--text-secondary); font-size:14px; margin-bottom:28px; }
        .auth-error { display:flex; align-items:center; gap:8px; padding:10px 14px; background:rgba(252,129,129,0.1); border:1px solid rgba(252,129,129,0.2); border-radius:8px; color:var(--danger); font-size:13px; margin-bottom:20px; }
        .auth-form { display:flex; flex-direction:column; gap:16px; }
        .auth-field { display:flex; flex-direction:column; }
        .input-icon-wrap { position:relative; }
        .input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
        .input-with-icon { padding-left:38px; }
        .input-with-icon-right { padding-right:38px; }
        .input-icon-right-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; padding:0; }
        .auth-footer { margin-top:24px; text-align:center; font-size:14px; color:var(--text-secondary); }
        .auth-link { color:var(--accent); font-weight:500; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
