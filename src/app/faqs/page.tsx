'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  Search,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  User,
  Zap,
  Tag,
  ArrowRight,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react';

type FaqCategory = 'All' | 'Payment' | 'Top-Up' | 'Account' | 'Wallet' | 'Delivery';

interface FaqItem {
  q: string;
  a: string;
  cat: Exclude<FaqCategory, 'All'>;
}

const FAQS: FaqItem[] = [
  {
    q: 'How fast will I receive my diamonds / UC / gift card after payment?',
    a: 'All game top-ups, digital gift cards, and subscriptions listed as "Instant Delivery" are fulfilled automatically in 5 to 30 seconds once the payment gateway confirms the transaction. Pre-order items are delivered manually within the advertised window. You can track every order in real-time from the Orders Tracker page.',
    cat: 'Delivery',
  },
  {
    q: 'Is topping up through ZENVO safe? Will my account get banned?',
    a: 'ZENVO is an authorized official reseller. All top-ups are processed through direct publisher OpenAPI integrations (Garena, Tencent/Krafton, Valve, EA, etc.) using legitimate payment channels. We never ask for your password and never use third-party "grey-market" carders. To date we have completed 1M+ transactions with zero reported account bans.',
    cat: 'Top-Up',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept bKash, Nagad, Rocket (all Bangladeshi mobile financial services), Visa, Mastercard, Amex, Discover, Google Pay, Apple Pay, USDT (TRC20/ERC20), and the native ZENVO Wallet. Additional regional methods (Upay, bKash Nano, Paytm, UPI) are available based on your billing country at checkout.',
    cat: 'Payment',
  },
  {
    q: 'What is the ZENVO Wallet and how does the 2.5% cashback work?',
    a: 'The ZENVO Wallet is your pre-funded stored-balance account. Every completed purchase auto-earns 2.5% cashback credited to wallet balance within 24 hours. VIP tiers (Silver → Cyber Elite) unlock up to 5% cashback plus priority fulfillment and exclusive bonuses. Wallet deposits never expire.',
    cat: 'Wallet',
  },
  {
    q: 'I entered the wrong Player/Character ID. Can I change it?',
    a: 'If the order is still in "Processing" status, open a Support Ticket immediately (mention your ZNG- order number) and we will try to intercept before fulfillment. Once an order status is "Delivered" the credits have been pushed to the original ID and are irreversible. Always double-check IDs — the verifier button will preview the in-game name before you pay.',
    cat: 'Top-Up',
  },
  {
    q: 'Do you offer refunds? What is your return policy?',
    a: 'As ZENVO Games primarily provides digital products, orders are generally non-refundable once a digital code, account, subscription, or product has been delivered or activated. However, we may offer a replacement or full refund if: (1) The digital code is confirmed invalid or unusable due to an issue on our side. (2) The wrong product was delivered by ZENVO Games. (3) A verified technical issue prevented you from receiving the product. Refunds will NOT be provided for: change of mind, wrong region/product purchased by customer mistake, successfully redeemed codes, or problems caused by your account, device, internet, or platform restrictions. To request a refund, contact us at Siddikpers@gmail.com with your order number and proof.',
    cat: 'Payment',
  },
  {
    q: 'How do I change my email, reset my password, or delete my account?',
    a: 'Email & password changes can be done from the Profile dropdown after login → Account Settings. For account deletion or data removal, email Zenovgamesbd@gmail.com from your registered email with subject "Delete Account — [your username]" and we will process your request within 7 business days. Your wallet balance (if any) will be refunded first.',
    cat: 'Account',
  },
  {
    q: 'Why is my order showing "Pending Verification"?',
    a: 'Occasionally our risk & anti-fraud engine flags orders for manual review if the payment pattern looks unusual (new card, large first order, mismatched region, VPN). This is to protect both you and us. Usually takes 5-10 minutes during business hours. Uploading KYC via the ticket that auto-opens for you speeds this up.',
    cat: 'Delivery',
  },
  {
    q: 'Do you have a referral or affiliate program?',
    a: 'Yes! Share your referral link from Profile → Invite Friends. Every friend that signs up and completes their first top-up earns you a 5% commission (in wallet balance) plus your friend gets a one-time +10% bonus on their first purchase. Top affiliates earn up to 10% tiered rates.',
    cat: 'Wallet',
  },
  {
    q: 'How do I use a promo / bonus / coupon code?',
    a: 'On any Top-Up Detail page or on the Cart page, paste the code in the "Promo Code" field and click Apply. Valid codes will instantly update the totals. Codes cannot be stacked (the best single code is applied automatically if multiple exist). VIP members get a monthly exclusive code via email.',
    cat: 'Payment',
  },
  {
    q: 'Why did I receive less bonus than advertised?',
    a: 'The "Up to +30%" headline references the maximum bonus tier on the largest denomination + VIP tier stacking. Each denomination shows its own exact bonus label on the tile (e.g., "+10 Bonus", "BEST VALUE"). Make sure you are logged in with the correct VIP tier — Cyber Elites get an extra +10% layered on top of every offer.',
    cat: 'Top-Up',
  },
  {
    q: 'I still need help — how do I talk to a real human?',
    a: 'Multiple channels: (1) Open a Support Ticket via this page — replies within ~10 minutes 24/7; (2) WhatsApp / Call: 01300529836 (fastest response); (3) Support Email: Siddikpers@gmail.com; (4) Business Email: Zenovgamesbd@gmail.com. We are based in Chattogram, Bangladesh and available 24/7. Always include your order number for fastest service.',
    cat: 'Account',
  },
];

export default function FaqsPage() {
  const [openIdxs, setOpenIdxs] = useState<Set<number>>(new Set([0]));
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<FaqCategory>('All');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-zenvo-text-muted mb-6">
        <Link href="/" className="hover:text-zenvo-primary transition-colors">
          Home
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-zenvo-text-secondary">Help Center & FAQs</span>
      </nav>

      {/* Page header */}
      <header className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-zenvo-primary to-zenvo-accent flex items-center justify-center shadow-lg shadow-zenvo-primary/20">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zenvo-text uppercase mb-3">
          Help Center & FAQs
        </h1>
        <p className="text-sm sm:text-base text-zenvo-text-secondary leading-relaxed">
          Find instant answers to the most common questions about payments, top-ups, delivery,
          wallet cashback, and account security.
        </p>
      </header>

      {/* Big search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border transition-colors shadow-sm">
          <Search className="w-5 h-5 text-zenvo-text-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for any question..."
            className="w-full min-w-0 bg-transparent text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[11px] font-bold text-zenvo-text-muted hover:text-zenvo-primary shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide transition-all active:scale-95 ${
              activeCat === c
                ? 'bg-gradient-to-r from-zenvo-primary to-blue-600 text-white shadow-lg shadow-zenvo-primary/20'
                : 'bg-zenvo-card border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-text hover:border-zenvo-border-hover'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
        {/* FAQ list */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zenvo-border bg-zenvo-card/50 p-12 text-center">
              <HelpCircle className="w-12 h-12 mx-auto text-zenvo-text-muted mb-4 opacity-60" />
              <h3 className="text-lg font-bold text-zenvo-text mb-2">No matching FAQ</h3>
              <p className="text-sm text-zenvo-text-secondary mb-5">
                Try a different keyword or category, or open a ticket for personalized help.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveCat('All');
                  }}
                  className="px-5 py-2.5 rounded-lg bg-zenvo-card border border-zenvo-border hover:border-zenvo-border-hover text-xs font-bold uppercase tracking-wide text-zenvo-text-secondary transition-colors active:scale-95"
                >
                  Reset
                </button>
                <Link
                  href="/support/new"
                  className="px-5 py-2.5 rounded-lg bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg text-xs font-bold uppercase tracking-wide transition-colors active:scale-95 inline-flex items-center gap-1.5"
                >
                  Open Ticket <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
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
                      ? 'bg-zenvo-card border-zenvo-primary-border shadow-md shadow-zenvo-primary/5'
                      : 'bg-zenvo-card/70 border-zenvo-border hover:border-zenvo-border-hover'
                  }`}
                >
                  <button
                    onClick={() => toggle(f.origIdx)}
                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left active:bg-zenvo-surface/50"
                  >
                    <div
                      className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                        open
                          ? 'bg-zenvo-primary-soft border border-zenvo-primary-border'
                          : 'bg-zenvo-surface border border-zenvo-border'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          open ? 'text-zenvo-primary' : 'text-zenvo-text-muted'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zenvo-primary mb-1">
                        {f.cat}
                      </div>
                      <h3
                        className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
                          open ? 'text-zenvo-text' : 'text-zenvo-text'
                        }`}
                      >
                        {f.q}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-zenvo-text-muted transition-transform duration-300 ${
                        open ? 'rotate-180 text-zenvo-primary' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
                      open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 sm:px-5 pb-5 sm:pb-6 pl-[72px] sm:pl-[88px]">
                      <p className="text-sm text-zenvo-text-secondary leading-relaxed">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl p-5 bg-zenvo-card border border-zenvo-border">
            <h4 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4 pl-2.5 border-l-2 border-zenvo-accent">
              Can&apos;t find an answer?
            </h4>
            <p className="text-sm text-zenvo-text-secondary mb-4 leading-relaxed">
              Our support squad is online 24/7 with a typical first-response under 10 minutes.
            </p>
            <Link
              href="/support/new"
              className="block w-full px-5 py-3 rounded-xl bg-gradient-to-r from-zenvo-accent to-amber-500 text-zenvo-bg text-sm font-bold uppercase tracking-wide shadow-lg shadow-zenvo-accent/20 hover:brightness-110 transition-all active:scale-95 text-center mb-2.5"
            >
              🎫 Open Support Ticket
            </Link>
            <Link
              href="/ai-assistant"
              className="block w-full px-5 py-3 rounded-xl bg-zenvo-primary-soft border border-zenvo-primary-border text-zenvo-primary text-sm font-bold uppercase tracking-wide hover:bg-zenvo-primary hover:text-white transition-colors active:scale-95 text-center mb-2.5"
            >
              🤖 Ask AI Assistant
            </Link>
          </div>

          <div className="rounded-2xl p-5 bg-gradient-to-br from-zenvo-primary/15 via-transparent to-zenvo-accent/15 border border-zenvo-primary-border/40 space-y-3.5">
            <h4 className="text-sm font-black uppercase tracking-wider text-zenvo-text">
              Quick Contacts
            </h4>
            {[
              { Icon: Mail, label: 'Siddikpers@gmail.com', sub: 'Support & billing' },
              { Icon: Mail, label: 'Zenovgamesbd@gmail.com', sub: 'Business inquiries' },
              { Icon: MessageCircle, label: 'WhatsApp / Call', sub: '01300529836 (24/7)' },
              { Icon: Send, label: 'Chattogram, Bangladesh', sub: 'Our location' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-zenvo-card border border-zenvo-border flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-zenvo-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zenvo-text leading-tight">
                    {label}
                  </div>
                  <div className="text-xs text-zenvo-text-muted mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
