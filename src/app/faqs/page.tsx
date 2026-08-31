'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  CreditCard,
  ShieldCheck,
  User,
  Zap,
  Tag,
  Mail,
  MessageCircle,
  Send,
  FileText,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

type FaqCategory = 'All' | 'Payment' | 'Top-Up' | 'Account' | 'Wallet' | 'Delivery';

interface FaqItem {
  q: string;
  a: string;
  cat: Exclude<FaqCategory, 'All'>;
}

const FAQS: FaqItem[] = [
  {
    q: 'How fast will I receive my gift card or game top-up after payment?',
    a: 'All digital gift cards and prepaid game top-ups listed as "Instant Delivery" are fulfilled automatically in 30 seconds to a few minutes once our verification system confirms the transaction. In rare complex order cases, delivery may take up to 24 hours. You can track every order in real-time from our Order Tracking page.',
    cat: 'Delivery',
  },
  {
    q: 'Is buying gift cards and top-ups through ZENOV Games safe?',
    a: 'ZENOV Games is a verified digital reseller of authentic digital products obtained directly from authorized publishers and distributors. We never ask for your private passwords, and all transactions and code deliveries are 100% encrypted and private.',
    cat: 'Top-Up',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept bKash, Nagad, Rocket, Local Bank Transfer, and Crypto/USDT (TRC20) with instant payment confirmation.',
    cat: 'Payment',
  },
  {
    q: 'What should I do if I entered the wrong email address or player ID?',
    a: 'If the order is still in "Processing" status, contact our 24/7 WhatsApp or email support immediately with your Order Number and correct details. However, if the order is already delivered to the ID provided, it cannot be recalled or refunded.',
    cat: 'Top-Up',
  },
  {
    q: 'Do you offer refunds for digital cards and top-ups?',
    a: 'Digital codes that have already been generated or delivered cannot be refunded due to their nature. However, if we fail to deliver your ordered item within our guaranteed timeline, we will issue an immediate 100% full refund to your original payment method.',
    cat: 'Payment',
  },
  {
    q: 'How do discount promo codes and bonus deals work?',
    a: 'We regularly post discount promo codes on our website and Facebook/Telegram channels. Enter the voucher code during checkout for instant discounts on game cards and diamonds.',
    cat: 'Payment',
  },
];

type HelpTab = 'faqs' | 'refund' | 'privacy' | 'terms';

export default function FaqsPage() {
  const [activeTab, setActiveTab] = useState<HelpTab>('faqs');
  const [openIdxs, setOpenIdxs] = useState<Set<number>>(new Set([0]));
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<FaqCategory>('All');

  // Sync state from query parameters on mount to support footer deep-links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as HelpTab;
      if (tabParam === 'faqs' || tabParam === 'refund' || tabParam === 'privacy' || tabParam === 'terms') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: HelpTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const categories: FaqCategory[] = ['All', 'Payment', 'Top-Up', 'Account', 'Wallet', 'Delivery'];

  const catIcons: Record<Exclude<FaqCategory, 'All'>, React.ComponentType<any>> = {
    Payment: CreditCard,
    'Top-Up': Zap,
    Account: User,
    Wallet: Tag,
    Delivery: ShieldCheck,
  };

  const filtered = useMemo(() => {
    return FAQS.map((f, i) => ({ ...f, origIdx: i })).filter((f) => {
      const matchCat = activeCat === 'All' || f.cat === activeCat;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCat, search]);

  const toggle = (origIdx: number) => {
    setOpenIdxs((prev) => {
      const next = new Set(prev);
      if (next.has(origIdx)) next.delete(origIdx);
      else next.add(origIdx);
      return next;
    });
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
          <Link href="/" className="hover:text-zenov-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zenov-text font-semibold">Help Center & Policies</span>
        </div>

        {/* Page Header (Clean Left-Aligned Design) */}
        <header className="mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10.5px] font-black uppercase tracking-widest mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Help &amp; Official Policies
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase mb-2">
            Help Center &amp; Policies
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Find instant answers to frequently asked questions, or review our official refund clauses, privacy guidelines, and terms of service.
          </p>
        </header>

        {/* Navigation Tabs (Left Aligned) */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-2 pb-1">
          {[
            { id: 'faqs', label: 'FAQ Center', Icon: HelpCircle },
            { id: 'refund', label: 'Refund Policy', Icon: RotateCcw },
            { id: 'privacy', label: 'Privacy Policy', Icon: Lock },
            { id: 'terms', label: 'Terms & Conditions', Icon: FileText },
          ].map((t) => {
            const isActive = activeTab === t.id;
            const Ic = t.Icon;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id as HelpTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Ic className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            {/* FAQ CENTER TAB */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                {/* Search Bar (Left Aligned & High-Tech) */}
                <div className="w-full">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/90 border border-cyan-500/30 rounded-2xl focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search question, keyword, or topic (e.g. delivery, bKash, refund)..."
                      className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="text-xs font-bold text-slate-400 hover:text-cyan-400 shrink-0 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Category pills (Left Aligned) */}
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCat(c)}
                      className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        activeCat === c
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-xs'
                          : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* FAQ Accordion List (Left Aligned) */}
                <div className="space-y-3 pt-1">
                  {filtered.length === 0 ? (
                    <div className="border border-dashed border-white/15 bg-slate-950/50 rounded-2xl p-10 text-center">
                      <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                      <h3 className="text-base font-bold text-white mb-1">No matching FAQ found</h3>
                      <p className="text-xs text-slate-400">
                        Try searching with other keywords or choose a different category.
                      </p>
                    </div>
                  ) : (
                    filtered.map((f) => {
                      const open = openIdxs.has(f.origIdx);
                      const Icon = catIcons[f.cat];
                      return (
                        <div
                          key={f.origIdx}
                          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                            open
                              ? 'bg-slate-950/90 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                              : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <button
                            onClick={() => toggle(f.origIdx)}
                            className="w-full flex items-center gap-3.5 p-4 sm:p-5 text-left active:bg-slate-900/50 cursor-pointer"
                          >
                            <div
                              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border transition-colors ${
                                open
                                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                                  : 'bg-slate-900 border-white/10 text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                                {f.cat}
                              </span>
                              <h3 className="text-xs sm:text-sm font-bold leading-snug text-white">
                                {f.q}
                              </h3>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                open ? 'rotate-180 text-cyan-400' : ''
                              }`}
                            />
                          </button>
                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                              open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-[52px] sm:pl-[60px] border-t border-white/5 pt-3">
                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                  {f.a}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* REFUND POLICY TAB */}
            {activeTab === 'refund' && (
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 space-y-5">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-l-4 border-amber-400 pl-3 uppercase tracking-wider">
                  Refund &amp; Cancellation Policy
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 font-bold">
                    ⚠️ Digital Codes &amp; Top-Ups Policy: Once a digital voucher, game code, or direct player top-up is processed and delivered, it cannot be refunded or exchanged.
                  </div>
                  <p>
                    If ZENOV Games fails to deliver your requested digital order within our guaranteed fulfillment window, you will receive an automatic 100% full refund directly to your original payment channel (bKash, Nagad, Rocket, Bank, or USDT).
                  </p>
                  <p>
                    Customers are responsible for entering the correct Player ID / UID and account region. If credentials or player numbers are mistyped by the buyer and successfully delivered, ZENOV Games cannot reverse the transaction.
                  </p>
                  <p>
                    <strong>Delivery Timeline:</strong> Most digital deliveries are fulfilled in 30 seconds to a few minutes. Complex verification orders may require up to 24 hours.
                  </p>
                  <p>
                    If you encounter any issues redeeming your code, our 24/7 VIP support team is always available via WhatsApp and live ticket system.
                  </p>
                </div>
              </div>
            )}

            {/* PRIVACY POLICY TAB */}
            {activeTab === 'privacy' && (
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 space-y-5">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-l-4 border-cyan-400 pl-3 uppercase tracking-wider">
                  Privacy Policy
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 space-y-5 leading-relaxed">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase mb-1">About ZENOV Games</h3>
                    <p>
                      ZENOV Games is a trusted digital game store based in Chattogram, Bangladesh. We provide authentic digital gaming cards, vouchers, and direct top-up recharges with instant delivery and secure local payment methods.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white uppercase mb-1">Information We Collect</h3>
                    <p className="mb-2">We collect only necessary information to fulfill and track your orders:</p>
                    <ul className="list-disc list-inside pl-3 space-y-1 text-slate-400">
                      <li>Name and Contact Information</li>
                      <li>Email Address (for instant code delivery)</li>
                      <li>Phone / WhatsApp Number (for urgent delivery updates)</li>
                      <li>Game Player ID / UID (for direct top-ups)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white uppercase mb-1">Data Security &amp; Encryption</h3>
                    <p>
                      We never store credit card numbers, passwords, or personal banking credentials. All manual transactions are verified through official transaction IDs (TrxID) and encrypted connections.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TERMS & CONDITIONS TAB */}
            {activeTab === 'terms' && (
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 space-y-5">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-l-4 border-amber-400 pl-3 uppercase tracking-wider">
                  Terms and Conditions
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 space-y-5 leading-relaxed">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase mb-1">Authorized Reseller Notice</h3>
                    <p>
                      ZENOV Games operates as an authorized reseller of digital products. All game logos, titles, and trademarks are copyright of their respective publishers (Google, Apple, Sony, Valve, Microsoft, EA, Garena, Riot Games, etc.).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white uppercase mb-1">Orders &amp; Fulfillment</h3>
                    <p>
                      By placing an order on ZENOV Games, you agree to provide valid transaction IDs and authorized payment accounts. Any fraudulent transaction attempts will result in immediate account suspension and blacklisting.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white uppercase mb-1">Governing Law</h3>
                    <p>
                      These terms are governed by the laws and regulations of the People&apos;s Republic of Bangladesh.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Left-Aligned Contacts & Support) */}
          <aside className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2 pl-2.5 border-l-2 border-amber-400">
                Need Assistance?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support team is active 24/7 on WhatsApp and Email to resolve any delivery or top-up questions immediately.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/20 space-y-3.5 shadow-md">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quick Contacts
              </h4>
              {[
                { Icon: MessageCircle, label: '01300529836', sub: 'WhatsApp (24/7 Instant)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                { Icon: Mail, label: 'support@zenovgames.com', sub: 'Customer Support', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                { Icon: Send, label: 'Chattogram, Bangladesh', sub: 'Store Location', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
              ].map(({ Icon, label, sub, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl shrink-0 border flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight truncate">
                      {label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
