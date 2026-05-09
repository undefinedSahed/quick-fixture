'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');

    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => router.push('/auth/login'), 3000); }
  }

  if (success) {
    return (
      <div className="auth-bg">
        <motion.div className="auth-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(72,187,120,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:10, fontFamily:'Space Grotesk,sans-serif' }}>Account Created!</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Check your email to confirm your account. Redirecting to login...</p>
          </div>
        </motion.div>
        <style jsx>{`.auth-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.auth-card{width:100%;max-width:420px;background:rgba(13,18,32,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px;backdrop-filter:blur(20px)}`}</style>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><Trophy size={22} /></div>
          <span>Quick Fixture</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start building your tournaments today</p>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={14} />{error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label className="input-label">Email</label>
            <div className="input-icon-wrap">
              <Mail size={15} className="input-icon" />
              <input type="email" className="input input-with-icon" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="auth-field">
            <label className="input-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} className="input input-with-icon input-with-icon-right"
                placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="input-icon-right-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="auth-field">
            <label className="input-label">Confirm Password</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input type="password" className="input input-with-icon" placeholder="Repeat password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary"
            style={{ width:'100%', marginTop:8, padding:'12px' }} disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> : <User size={16} />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account?{' '}<Link href="/auth/login" className="auth-link">Sign in</Link></p>
      </motion.div>

      <style jsx>{`
        .auth-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background-image:radial-gradient(ellipse at 30% 20%,rgba(99,179,237,0.08) 0%,transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(159,122,234,0.08) 0%,transparent 50%)}
        .auth-card{width:100%;max-width:420px;background:rgba(13,18,32,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px;backdrop-filter:blur(20px)}
        .auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px}
        .auth-logo-icon{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--accent) 0%,var(--accent-2) 100%);display:flex;align-items:center;justify-content:center;color:white}
        .auth-title{font-size:26px;font-weight:800;margin-bottom:6px;font-family:'Space Grotesk',sans-serif}
        .auth-subtitle{color:var(--text-secondary);font-size:14px;margin-bottom:28px}
        .auth-error{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(252,129,129,0.1);border:1px solid rgba(252,129,129,0.2);border-radius:8px;color:var(--danger);font-size:13px;margin-bottom:20px}
        .auth-form{display:flex;flex-direction:column;gap:16px}
        .auth-field{display:flex;flex-direction:column}
        .input-icon-wrap{position:relative}
        .input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none}
        .input-with-icon{padding-left:38px}
        .input-with-icon-right{padding-right:38px}
        .input-icon-right-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;padding:0}
        .auth-footer{margin-top:24px;text-align:center;font-size:14px;color:var(--text-secondary)}
        .auth-link{color:var(--accent);font-weight:500;text-decoration:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
