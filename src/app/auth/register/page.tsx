'use client';

import { Suspense } from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  ChevronRight,
  UserPlus,
  Crown,
  Gift,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUser, user } = useApp();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    agree: true,
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 4) {
      setErr('All required fields must be filled and password ≥4 chars.');
      return;
    }
    if (form.password !== form.confirm) {
      setErr('Passwords do not match.');
      return;
    }
    if (!form.agree) {
      setErr('Please accept the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    setErr(null);
    await new Promise((r) => setTimeout(r, 700));
    updateUser({
      ...user,
      name: form.name || 'New Gamer',
      email: form.email,
      phone: form.phone || user.phone,
    });
    setLoading(false);
    router.push(redirect);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-zenvo-border bg-zenvo-card shadow-2xl">
        {/* LEFT: form */}
        <div className="p-6 sm:p-10 order-2 lg:order-1">
          <div className="mb-7">
            <h1 className="text-3xl font-black text-zenvo-text tracking-tight mb-1.5">Create Account</h1>
            <p className="text-sm text-zenvo-text-secondary">
              Already registered?{' '}
              <Link href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-bold text-zenvo-primary hover:underline inline-flex items-center gap-0.5">
                Sign in instead <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Phone (optional)</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    placeholder="+880 1XXX..."
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => onChange('password', e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zenvo-text-muted hover:text-zenvo-text" aria-label="Toggle">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">Confirm password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={(e) => onChange('confirm', e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPw2((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zenvo-text-muted hover:text-zenvo-text" aria-label="Toggle">
                    {showPw2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <label className="inline-flex items-start gap-2.5 text-xs cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => onChange('agree', e.target.checked)}
                className="accent-zenvo-primary w-4 h-4 mt-0.5"
              />
              <span className="text-zenvo-text-secondary leading-relaxed">
                I agree to the <a href="#" className="text-zenvo-primary font-semibold hover:underline">Terms of Service</a> and understand my data is stored securely per the <a href="#" className="text-zenvo-primary font-semibold hover:underline">Privacy Policy</a>.
              </span>
            </label>

            {err && (
              <div className="p-3 rounded-xl bg-zenvo-error/10 border border-zenvo-error/30 text-zenvo-error text-xs font-semibold">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenvo-accent via-orange-500 to-zenvo-accent-hover text-zenvo-bg text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Creating <div className="w-4 h-4 border-2 border-zenvo-bg/30 border-t-zenvo-bg rounded-full animate-spin" /></>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: perks */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-zenvo-accent-soft via-orange-950/30 to-zenvo-primary-soft relative overflow-hidden order-1 lg:order-2">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-zenvo-accent/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-zenvo-primary/20 blur-3xl" />

          <div className="relative flex items-center justify-end">
            <div className="px-3 py-1.5 rounded-lg bg-zenvo-bg/40 border border-zenvo-border/50 text-xs font-bold uppercase tracking-wider text-zenvo-text inline-flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-zenvo-accent" /> Welcome Bonus
            </div>
          </div>

          <div className="relative space-y-7">
            <div>
              <h2 className="text-4xl font-black text-zenvo-text leading-[1.05] tracking-tight">
                Join 1M+<br/>Gamers Worldwide.
              </h2>
              <p className="text-zenvo-text-secondary text-sm mt-3 max-w-sm">
                Sign up today and receive a welcome bonus + exclusive first-order promo code instantly in your inbox.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zenvo-bg/40 border border-zenvo-border/50 backdrop-blur inline-flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zenvo-primary to-zenvo-accent text-zenvo-bg flex items-center justify-center shadow-md">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zenvo-accent">Sign-up Gift</p>
                <p className="text-2xl font-black text-zenvo-text font-mono">10% OFF</p>
                <p className="text-[10px] text-zenvo-text-muted font-semibold">Code: WELCOME5 (auto applied)</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { I: Sparkles, t: 'VIP Progression', s: 'Bronze → Silver → Gold → Platinum' },
                { I: ShieldCheck, t: 'Buyer Protection', s: '100% delivery guarantee' },
              ].map(({ I, t, s }) => (
                <div key={t} className="flex items-center gap-3 p-3 rounded-xl bg-zenvo-bg/30 border border-zenvo-border/50 backdrop-blur">
                  <div className="w-9 h-9 rounded-lg bg-zenvo-accent-soft text-zenvo-accent flex items-center justify-center shrink-0">
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
            Join the fastest-growing digital gaming marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-200px)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-zenvo-primary/30 border-t-zenvo-primary rounded-full animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
