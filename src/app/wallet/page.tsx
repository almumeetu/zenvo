'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import {
  Wallet,
  ArrowLeft,
  Plus,
  Banknote,
  CreditCard,
  Phone,
  Bitcoin,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Gift,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { PaymentLogo } from '@/components/payment/PaymentLogos';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function WalletPage() {
  const { selectedCurrency, user, walletTransactions, depositWallet } = useApp();
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState<string>('bKash');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<'deposit' | 'history'>('deposit');

  const totalDeposit = useMemo(
    () => walletTransactions.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
    [walletTransactions]
  );
  const totalSpent = useMemo(
    () => walletTransactions.filter((t) => t.type === 'purchase').reduce((s, t) => s + t.amount, 0),
    [walletTransactions]
  );

  const onDeposit = async () => {
    const amt = Number(custom) || amount;
    if (!amt || amt <= 0) return;
    setLoading(true);
    const r = await depositWallet(amt, method, ref || `MANUAL-${Date.now().toString().slice(-6)}`);
    setLoading(false);
    if (r.success) {
      setSuccessMsg(r.message || `Successfully added $${amt} to wallet`);
      setRef('');
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const PAYMENT_METHODS = [
    { id: 'bKash', I: Phone, c: 'from-pink-500 to-rose-500', tag: 'Popular' },
    { id: 'Nagad', I: Phone, c: 'from-orange-500 to-red-500', tag: '' },
    { id: 'Rocket', I: Phone, c: 'from-purple-500 to-violet-500', tag: '' },
    { id: 'Bank Transfer', I: CreditCard, c: 'from-blue-600 to-sky-500', tag: 'Bank' },
    { id: 'USDT', I: Bitcoin, c: 'from-amber-500 to-yellow-500', tag: 'Crypto' },
  ];

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zenov-text font-semibold">My Wallet</span>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-zenov-primary-soft border border-zenov-primary-border">
            <Wallet className="w-6 h-6 text-zenov-primary" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zenov-text tracking-tight">Zenvo Wallet</h1>
            <p className="text-sm text-zenov-text-secondary">Pay faster with wallet balance • 0% internal fees</p>
          </div>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-zenov-text-secondary hover:text-zenov-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      {/* Balance + stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <div className="md:col-span-2 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-zenov-primary via-indigo-800 to-violet-900 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-zenov-accent/20 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70 mb-2">Available Balance</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                  {formatCurrency(user.walletBalanceUSD, selectedCurrency)}
                </p>
                {user.vipTier && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {user.vipTier} VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mt-3">
                Wallet ID: <span className="font-mono font-semibold text-white/90 inline-flex items-center gap-1">
                  {user.id} <Copy className="w-3 h-3 cursor-pointer" />
                </span>
              </p>
            </div>
            <div className="flex gap-2 sm:flex-col">
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold inline-flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                Cashback: 2.5%
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-zenov-success" />
                Verified Account
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          <div className="p-5 rounded-2xl bg-zenov-card border border-zenov-border">
            <p className="text-[11px] uppercase font-bold tracking-widest text-zenov-text-muted mb-1.5">Total Deposited</p>
            <p className="text-2xl font-black font-mono text-zenov-success">
              +{formatCurrency(totalDeposit, selectedCurrency)}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-zenov-card border border-zenov-border">
            <p className="text-[11px] uppercase font-bold tracking-widest text-zenov-text-muted mb-1.5">Total Spent</p>
            <p className="text-2xl font-black font-mono text-zenov-text">
              −{formatCurrency(totalSpent, selectedCurrency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* LEFT: Tabs + deposit form OR history */}
        <div className="lg:col-span-3 space-y-5">
          <div className="p-1 rounded-2xl bg-zenov-surface border border-zenov-border inline-flex gap-1">
            {[
              { id: 'deposit', I: Plus, l: 'Deposit Funds' },
              { id: 'history', I: Receipt, l: `History (${walletTransactions.length})` },
            ].map(({ id, I, l }) => (
              <button
                key={id}
                onClick={() => setTab(id as any)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1.5 flex-1 sm:flex-none ${
                  tab === id
                    ? 'bg-zenov-card text-zenov-primary shadow-sm border border-zenov-border'
                    : 'text-zenov-text-secondary hover:text-zenov-text'
                }`}
              >
                <I className="w-4 h-4" /> {l}
              </button>
            ))}
          </div>

          {tab === 'deposit' && (
            <div className="rounded-2xl bg-zenov-card border border-zenov-border p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-3">Quick Amounts</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      onClick={() => { setAmount(v); setCustom(''); }}
                      className={`py-3 rounded-xl border transition-all text-sm font-black font-mono active:scale-[0.98] ${
                        !custom && amount === v
                          ? 'bg-zenov-primary-soft border-zenov-primary-border text-zenov-primary ring-2 ring-zenov-primary-border/40'
                          : 'bg-zenov-surface/60 border-zenov-border hover:border-zenov-border-hover text-zenov-text'
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-zenov-text-muted block mb-1.5">Or enter custom amount (USD)</label>
                  <div className="relative">
                    <Banknote className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="e.g. 75"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                   {[
                     { id: 'bKash', label: 'bKash Merchant', tag: 'Popular' },
                     { id: 'Nagad', label: 'Nagad Pay', tag: 'Instant' },
                     { id: 'Rocket', label: 'Rocket DBBL', tag: 'Bank' },
                     { id: 'Bank Transfer', label: 'Bank Transfer', tag: 'Local Bank' },
                     { id: 'USDT', label: 'Crypto USDT', tag: 'TRC20' },
                   ].map(({ id, label, tag }) => {
                    const active = method === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setMethod(id)}
                        className={`relative p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                          active
                            ? 'bg-zenov-primary-soft/40 border-zenov-primary-border ring-2 ring-zenov-primary-border/30 shadow-sm'
                            : 'bg-zenov-surface/60 border-zenov-border hover:border-zenov-border-hover'
                        }`}
                      >
                        <PaymentLogo method={id} className="w-8 h-8 rounded-lg shadow-sm shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${active ? 'text-white' : 'text-zenov-text'}`}>{label}</p>
                          {tag && <p className="text-[9px] font-mono text-zenov-text-muted mt-0.5">{tag}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-zenov-text-muted block mb-1.5">
                  Transaction Reference (optional)
                </label>
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="Payment TX ID or bKash/Nagad reference"
                  className="w-full px-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-sm font-mono"
                />
              </div>

              {successMsg && (
                <div className="p-4 rounded-xl bg-zenov-success-soft/60 border border-zenov-success/30 text-zenov-success text-sm font-semibold inline-flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {successMsg}
                </div>
              )}

              <button
                onClick={onDeposit}
                disabled={loading || (!custom && amount <= 0)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenov-primary via-blue-600 to-indigo-600 text-white text-sm font-black uppercase tracking-wider shadow-primary hover:shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>Processing <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Deposit {formatCurrency(Number(custom) || amount, selectedCurrency)}
                  </>
                )}
              </button>
            </div>
          )}

          {tab === 'history' && (
            <div className="rounded-2xl bg-zenov-card border border-zenov-border overflow-hidden">
              {walletTransactions.length === 0 ? (
                <div className="p-10 text-center text-zenov-text-secondary text-sm">
                  No wallet activity yet. Deposit funds or make a purchase to see history here.
                </div>
              ) : (
                <div className="divide-y divide-zenov-border">
                  {walletTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 sm:p-5 flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'deposit'
                            ? 'bg-zenov-success-soft/60 text-zenov-success'
                            : 'bg-zenov-error/10 text-zenov-error'
                        }`}
                      >
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zenov-text truncate">
                          {tx.type === 'deposit' ? `Wallet Deposit via ${tx.paymentMethod}` : tx.reference || 'Purchase'}
                        </p>
                        <p className="text-xs text-zenov-text-secondary mt-0.5 inline-flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleString()}
                          {tx.status && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-zenov-border" />
                              <span className={`font-semibold ${
                                tx.status === 'Completed' ? 'text-zenov-success' :
                                tx.status === 'Pending' ? 'text-zenov-accent' : 'text-zenov-error'
                              }`}>
                                {tx.status}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <p className={`text-base font-black font-mono ${
                        tx.type === 'deposit' ? 'text-zenov-success' : 'text-zenov-text'
                      }`}>
                        {tx.type === 'deposit' ? '+' : '−'}{formatCurrency(tx.amount, selectedCurrency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: perks */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-zenov-card border border-zenov-border p-5 sm:p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4">How Wallet Works</h3>
            <div className="space-y-4 text-sm">
              {[
                { n: 1, t: 'Top Up Wallet', s: 'Use any local or global payment method to fund your wallet instantly.' },
                { n: 2, t: 'Shop in 1-Click', s: 'Skip payment gateways — pay directly with your Zenvo balance at checkout.' },
                { n: 3, t: 'Earn Cashback', s: 'Every wallet purchase returns 1-5% bonus based on your VIP tier.' },
                { n: 4, t: 'Track Everything', s: 'Full audit trail of deposits, purchases and refunds with statuses.' },
              ].map((r) => (
                <div key={r.n} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-zenov-primary-soft text-zenov-primary font-black text-sm flex items-center justify-center">
                    {r.n}
                  </div>
                  <div>
                    <p className="font-bold text-zenov-text mb-0.5">{r.t}</p>
                    <p className="text-zenov-text-secondary">{r.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-950/50 via-zenov-accent-soft/50 to-orange-950/50 border border-zenov-accent-border p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-zenov-accent/20 blur-2xl" />
            <p className="text-[11px] uppercase font-black tracking-[0.2em] text-zenov-accent mb-2">PRO TIP</p>
            <h3 className="text-xl font-black text-zenov-text mb-2 leading-tight">Unlock up to 5% cashback</h3>
            <p className="text-sm text-zenov-text-secondary mb-4">
              Use Zenvo Wallet for every purchase and accumulate VIP XP faster — Platinum tier receives 5% back on every order.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg text-xs font-black uppercase tracking-wider transition-all"
            >
              Start Shopping <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
