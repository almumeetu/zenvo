'use client';

import { Suspense } from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Github,
  Chrome,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUser, user } = useApp();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState(user?.email || 'guest@zenvo.gg');
  const [password, setPassword] = useState('zenvo2026');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 4) {
      setErr('Please enter a valid email and password (min 4 chars).');
      return;
    }
    setLoading(true);
    setErr(null);
    await new Promise((r) => setTimeout(r, 700));
    updateUser({
      ...user,
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    });
    setLoading(false);
    router.push(redirect);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-zenvo-border bg-zenvo-card shadow-2xl">
        {/* LEFT: intro */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-zenvo-primary-soft via-indigo-950/40 to-zenvo-accent-soft relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-zenvo-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-zenvo-accent/20 blur-3xl" />
          <div className="relative flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zenvo-primary to-zenvo-accent p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-[10px] bg-zenvo-bg flex items-center justify-center">
                <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-br from-zenvo-primary to-zenvo-accent font-mono">Z</span>
              </div>
            </div>
            <div className="leading-tight">
              <p className="text-xl font-black text-zenvo-text uppercase tracking-tight">ZENVO</p>
              <p className="text-[10px] font-bold tracking-[0.18em] text-zenvo-text-muted uppercase">Gaming Store</p>
            </div>
          </div>
          <div className="relative space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-zenvo-text leading-tight">
                Welcome Back,<br/>Gamer.
              </h2>
              <p className="text-zenvo-text-secondary text-sm max-w-sm">
                Log in to manage your wallet, track all orders, unlock VIP tiers and enjoy exclusive member-only promo codes.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { I: Zap, t: '24/7 Instant Top-Ups', s: 'Automated sub-30s delivery' },
                { I: ShieldCheck, t: 'Verified by 1M+ Users', s: 'Official licensed reseller' },
                { I: Sparkles, t: 'Tiered VIP Rewards', s: 'Earn cashback & bonuses' },
              ].map(({ I, t, s }) => (
                <div key={t} className="flex items-start gap-3 p-3 rounded-xl bg-zenvo-bg/30 border border-zenvo-border/50 backdrop-blur">
                  <div className="w-9 h-9 rounded-lg bg-zenvo-primary-soft text-zenvo-primary flex items-center justify-center shrink-0">
                    <I className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zenvo-text">{t}</p>
                    <p className="text-xs text-zenvo-text-secondary">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-[11px] text-zenvo-text-muted">
            © {new Date().getFullYear()} ZENVO Gaming. All rights reserved.
          </p>
        </div>

        {/* RIGHT: form */}
        <div className="p-6 sm:p-10">
          <div className="mb-7">
            <h1 className="text-3xl font-black text-zenvo-text tracking-tight mb-1.5">Sign In</h1>
            <p className="text-sm text-zenvo-text-secondary">
              New to Zenvo?{' '}
              <Link href={`/auth/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-bold text-zenvo-primary hover:underline inline-flex items-center gap-0.5">
                Create an account <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="px-4 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border hover:border-zenvo-border-hover text-sm font-semibold text-zenvo-text inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Chrome className="w-4 h-4" /> Google
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border hover:border-zenvo-border-hover text-sm font-semibold text-zenvo-text inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Github className="w-4 h-4" /> Github
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zenvo-border" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted">Or with email</span>
            <div className="flex-1 h-px bg-zenvo-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zenvo-text-muted hover:text-zenvo-text"
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-zenvo-primary w-4 h-4"
                />
                <span className="text-zenvo-text-secondary font-medium">Remember me</span>
              </label>
              <a href="#" className="font-bold text-zenvo-primary hover:underline">Forgot password?</a>
            </div>

            {err && (
              <div className="p-3 rounded-xl bg-zenvo-error/10 border border-zenvo-error/30 text-zenvo-error text-xs font-semibold">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenvo-primary via-blue-600 to-indigo-600 text-white text-sm font-black uppercase tracking-wider shadow-primary hover:shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Signing in <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-zenvo-text-muted font-medium leading-relaxed">
              By signing in you agree to our{' '}
              <a href="#" className="text-zenvo-text-secondary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-zenvo-text-secondary hover:underline">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-200px)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-zenvo-primary/30 border-t-zenvo-primary rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
