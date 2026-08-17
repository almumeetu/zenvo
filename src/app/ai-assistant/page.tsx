'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/AppStateContext';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  ChevronRight,
  X,
  ArrowLeft,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Gift,
  ShieldCheck,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'How do I top up Free Fire diamonds?',
  'Tell me about VIP tiers & benefits',
  'My order is delayed, what now?',
  'Show me today\'s best deals',
];

interface ChatMsg {
  role: 'user' | 'ai';
  content: string;
  time: string;
  thinking?: boolean;
}

export default function AiAssistantPage() {
  const { user, products, blogArticles } = useApp();
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content:
        `Hey ${user.name.split(' ')[0]} 👋 I'm **Zenvo AI**, your 24/7 gaming concierge. I can help with product info, order status, promo codes, VIP rewards and troubleshooting. What do you need today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const generateReply = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.includes('hi') || p.includes('hello') || p.includes('hey')) {
      return `Hey there ✨ Ask me anything about top-ups, payment methods, promotions, refunds or VIP tiers. Click any prompt below for a fast answer!`;
    }
    if (p.includes('free fire') || p.includes('diamond')) {
      return `💎 **Free Fire Top-up Guide**
1. Navigate to **Top-up → Free Fire** (or visit /shop?cat=top-up)
2. Pick a diamond package
3. Enter your **Player ID** (found in top-right of in-game profile)
4. Pay via bKash/Nagad/Rocket/Bank Transfer/USDT — delivery is **instant** ≤30s

🔥 Best deal right now: 1060 Diamonds = $19.99 with 100 bonus diamonds. Apply code **ZENOV2026** for extra 20% off!`;
    }
    if (p.includes('vip') || p.includes('tier') || p.includes('reward')) {
      return `👑 **ZENOV VIP Tiers**

• **Bronze** — default, 1% cashback
• **Silver** — ≥$100 spent, 2% cashback
• **Gold** — ≥$500 spent, 3% cashback + priority support
• **Platinum** — ≥$2,000 spent, **5% cashback**, exclusive bundles, 24/7 hotline

Your current tier: **${user.vipTier}** ${user.vipTier === 'Bronze' ? '— spend $100 to unlock Silver rewards 🚀' : ''}`;
    }
    if (p.includes('delay') || p.includes('not receive') || p.includes('stuck') || p.includes('order')) {
      return `⚠️ **Delayed order troubleshooting**
1. First, go to **/orders/track** and paste your order number
2. If status says *Delivered* but items missing → restart your game & re-login
3. If status is *Processing* → allow up to 5 minutes (rare manual review)
4. Still no luck? Open a **support ticket** at **/support** and include your order number — we reply within 2 hours 24/7.

Want me to open support with a pre-filled message?`;
    }
    if (p.includes('deal') || p.includes('promo') || p.includes('discount') || p.includes('coupon')) {
      const hotDeals = products.filter(p => p.discountPercent || p.isHot).slice(0, 3);
      return `🎁 **Today\'s Hot Deals**

${hotDeals.map((d, i) => `${i + 1}. **${d.title}** — ${d.discountPercent ? `-${d.discountPercent}%` : 'Bestseller'} from $${d.denominations[0]?.amount}`).join('\n')}

**Active promo codes:**
- \`ZENOV2026\` → 20% OFF any order ✅
- \`BONUS10\` → 10% sitewide
- \`VIP30\` → 30% OFF (Platinum tier only)

Redeem on product detail page before checkout! 💸`;
    }
    if (p.includes('pay') || p.includes('bkash') || p.includes('nagad') || p.includes('payment method')) {
      return `💳 **Accepted Payment Methods**

• 📱 **bKash / Nagad / Rocket** — instant, zero-fee, auto-verified
• 🏦 **Bank Transfer** — local bank transfers, verified instantly
• ₿ **Crypto (USDT / BTC / ETH)** — Web3 checkout, confirmations in ~2 min
• 👛 **Zenvo Wallet** — 1-click + VIP cashback stacker → /wallet

All transactions are **SSL encrypted** & PCI-DSS compliant. 🔒`;
    }
    // Default contextual answer
    const pickArticle = blogArticles[0];
    return `That's a great question about **"${prompt}"**!

Since I didn't find a canned answer, here's a recommended article:
📖 **[${pickArticle?.title || 'Gaming Guide'}](/blog/${pickArticle?.slug || '1'})**

If that doesn't help, try:
• Asking about a specific product (e.g. *"top up PUBG UC"*)
• Heading to **/support** for human help 24/7
• Using quick prompts below ⬇️`;
  };

  const onSend = async () => {
    if (!input.trim() || typing) return;
    const userMsg: ChatMsg = {
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMsgs((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    // Simulate latency
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 900));
    const reply: ChatMsg = {
      role: 'ai',
      content: generateReply(userMsg.content),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMsgs((m) => [...m, reply]);
    setTyping(false);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zenov-text font-semibold">AI Assistant</span>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-zenov-accent-soft border border-zenov-accent-border relative">
            <Bot className="w-6 h-6 text-zenov-accent" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-zenov-success border-2 border-zenov-card animate-live-pulse" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zenov-text tracking-tight inline-flex items-center gap-2">
              Zenvo AI <Sparkles className="w-5 h-5 text-zenov-accent" />
            </h1>
            <p className="text-sm text-zenov-text-secondary">
              24/7 gaming concierge • Answers about top-ups, orders, promos & refunds
            </p>
          </div>
        </div>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-zenov-text-secondary hover:text-zenov-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Chat panel */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl bg-zenov-card border border-zenov-border overflow-hidden flex flex-col h-[65vh] sm:h-[70vh]">
            {/* Head */}
            <div className="px-5 sm:px-6 py-4 border-b border-zenov-border flex items-center justify-between bg-zenov-surface/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zenov-accent via-orange-500 to-zenov-primary flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-zenov-text inline-flex items-center gap-1.5">
                    Zenvo AI Assistant
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zenov-success-soft text-zenov-success text-[9px] font-bold uppercase tracking-wider border border-zenov-success/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-zenov-success animate-live-pulse" /> Online
                    </span>
                  </p>
                  <p className="text-xs text-zenov-text-muted">Avg. response: ≤3 seconds • Powered by ZenvoGPT 4.5</p>
                </div>
              </div>
            </div>

            {/* Scrollable messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-gradient-to-b from-zenov-bg/30 to-transparent">
              {msgs.map((m, i) => {
                const mine = m.role === 'user';
                return (
                  <div key={i} className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      mine ? 'bg-zenov-primary text-white' : 'bg-gradient-to-br from-zenov-accent to-zenov-primary text-white shadow-sm'
                    }`}>
                      {mine ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-zenov-text-muted">
                        <span>{mine ? user.name : 'Zenvo AI'}</span>
                        <span>• {m.time}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          mine
                            ? 'bg-zenov-primary text-white rounded-br-sm shadow-md'
                            : 'bg-zenov-surface/70 text-zenov-text rounded-bl-sm border border-zenov-border'
                        }`}
                      >
                        {m.content.split('**').map((segment, idx) =>
                          idx % 2 === 0 ? (
                            <span key={idx}>{segment}</span>
                          ) : (
                            <strong key={idx} className="font-black">{segment}</strong>
                          )
                        )}
                      </div>
                      {!mine && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-zenov-text-muted font-semibold opacity-70">
                          <button className="p-1 hover:text-zenov-success transition-colors" title="Helpful">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:text-zenov-error transition-colors" title="Not helpful">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:text-zenov-primary transition-colors" title="Copy response">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zenov-accent to-zenov-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-zenov-surface/70 border border-zenov-border rounded-2xl rounded-bl-sm p-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zenov-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-zenov-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-zenov-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="p-4 sm:p-5 border-t border-zenov-border bg-zenov-card">
              <div className="flex gap-2 items-end">
                <div className="relative flex-1">
                  <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                    placeholder="Ask Zenvo AI anything... (Enter to send, Shift+Enter for newline)"
                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-sm resize-none"
                  />
                </div>
                <button
                  onClick={onSend}
                  disabled={typing || !input.trim()}
                  className="self-end px-5 py-3 rounded-2xl bg-gradient-to-r from-zenov-accent via-orange-500 to-zenov-accent-hover text-zenov-bg disabled:opacity-50 text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Quick prompts */}
          <div className="rounded-2xl bg-zenov-card border border-zenov-border p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zenov-accent" /> Quick Prompts
            </h3>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="w-full text-left p-3 rounded-xl bg-zenov-surface/60 hover:bg-zenov-primary-soft/40 border border-zenov-border hover:border-zenov-primary-border text-xs font-semibold text-zenov-text-secondary hover:text-zenov-primary transition-all flex items-center justify-between gap-2 active:scale-[0.99]"
                >
                  <span>{p}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl bg-zenov-card border border-zenov-border p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4">What I Can Do</h3>
            <div className="space-y-3 text-xs">
              {[
                { I: Zap, t: 'Instant Product Info', s: 'Packages, prices, publisher specs' },
                { I: Gift, t: 'Promo Code Finder', s: 'Best active coupons + stack tricks' },
                { I: ShieldCheck, t: 'Order Troubleshoot', s: 'Step-by-step delivery diagnosis' },
                { I: Bot, t: 'VIP Progression', s: 'Tier math, cashback estimates' },
              ].map(({ I, t, s }) => (
                <div key={t} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zenov-primary-soft text-zenov-primary flex items-center justify-center shrink-0">
                    <I className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zenov-text mb-0.5">{t}</p>
                    <p className="text-zenov-text-secondary">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/support"
            className="block p-5 rounded-2xl bg-gradient-to-br from-zenov-primary-soft/60 via-blue-950/20 to-zenov-accent-soft/60 border border-zenov-primary-border relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-zenov-primary/20 blur-2xl group-hover:bg-zenov-primary/30 transition-all" />
            <p className="text-[11px] uppercase font-black tracking-[0.18em] text-zenov-primary mb-1 relative">Need a human?</p>
            <h3 className="text-lg font-black text-zenov-text mb-1 relative">Open Support Ticket →</h3>
            <p className="text-xs text-zenov-text-secondary relative">24/7 response under 2 hours with full order history</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
