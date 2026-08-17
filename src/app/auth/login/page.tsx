'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signInWithEmail } = useApp();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 4) {
      setErr('Please enter a valid email and password (minimum 4 characters).');
      return;
    }
    setLoading(true);
    setErr(null);

    const res = await signInWithEmail(email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setErr(res.message || 'Login failed. Please check your credentials.');
      return;
    }

    router.push(redirect);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-zenov-border bg-zenov-card shadow-2xl">
        {/* LEFT: intro */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-zenov-primary-soft via-indigo-950/40 to-zenov-accent-soft relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-zenov-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-zenov-accent/20 blur-3xl" />
          <div className="relative flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zenov-primary to-zenov-accent p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-[10px] bg-zenov-bg flex items-center justify-center">
                <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-br from-zenov-primary to-zenov-accent font-mono">Z</span>
              </div>
            </div>
            <div className="leading-tight">
              <p className="text-xl font-black text-zenov-text uppercase tracking-tight">ZENOV</p>
              <p className="text-[10px] font-bold tracking-[0.18em] text-zenov-text-muted uppercase">Gaming Store</p>
            </div>
          </div>
          <div className="relative space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-zenov-text leading-tight">
                Welcome Back,<br/>Gamer.
              </h2>
              <p className="text-zenov-text-secondary text-sm max-w-sm">
                Log in to manage your wallet, track all orders, unlock VIP tiers and enjoy exclusive member-only promo codes.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { I: Zap, t: '24/7 Instant Top-Ups', s: 'Automated sub-30s delivery' },
                { I: ShieldCheck, t: 'Verified by 1M+ Users', s: 'Official licensed reseller' },
                { I: Sparkles, t: 'Tiered VIP Rewards', s: 'Earn cashback & bonuses' },
              ].map(({ I, t, s }) => (
                <div key={t} className="flex items-start gap-3 p-3 rounded-xl bg-zenov-bg/30 border border-zenov-border/50 backdrop-blur">
                  <div className="w-9 h-9 rounded-lg bg-zenov-primary-soft text-zenov-primary flex items-center justify-center shrink-0">
                    <I className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zenov-text">{t}</p>
                    <p className="text-xs text-zenov-text-secondary">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-[11px] text-zenov-text-muted">
            © {new Date().getFullYear()} ZENOV Gaming. All rights reserved.
          </p>
        </div>

        {/* RIGHT: form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-7">
            <h1 className="text-3xl font-black text-zenov-text tracking-tight mb-1.5">Sign In</h1>
            <p className="text-sm text-zenov-text-secondary">
              New to Zenvo?{' '}
              <Link href={`/auth/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-bold text-zenov-primary hover:underline inline-flex items-center gap-0.5">
                Create an account <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zenov-text-muted hover:text-zenov-text"
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
                  className="accent-zenov-primary w-4 h-4 rounded"
                />
                <span className="text-zenov-text-secondary font-medium">Remember me</span>
              </label>
              <a href="#" className="font-bold text-zenov-primary hover:underline">Forgot password?</a>
            </div>

            {err && (
              <div className="p-3 rounded-xl bg-zenov-error/10 border border-zenov-error/30 text-zenov-error text-xs font-semibold">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenov-primary via-blue-600 to-indigo-600 text-white text-sm font-black uppercase tracking-wider shadow-primary hover:shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Signing In <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* OR WITH GOOGLE (AT BOTTOM) */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zenov-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zenov-text-muted">Or Continue With</span>
            <div className="flex-1 h-px bg-zenov-border" />
          </div>

          <GoogleSignInButton
            label="Sign in with Google"
            redirectTo={redirect}
            onError={(msg) => setErr(msg)}
          />

          <p className="text-[10px] text-center text-zenov-text-muted font-medium leading-relaxed mt-6">
            By signing in you agree to our{' '}
            <a href="#" className="text-zenov-text-secondary hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-zenov-text-secondary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-200px)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-zenov-primary/30 border-t-zenov-primary rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

