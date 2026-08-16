'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronLeft,
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
} from 'lucide-react';

type FaqCategory = 'All' | 'Payment' | 'Top-Up' | 'Account' | 'Wallet' | 'Delivery';

interface FaqItem {
  q: string;
  a: string;
  cat: Exclude<FaqCategory, 'All'>;
}

const FAQS: FaqItem[] = [
  {
    q: 'How fast will I receive my gift card after payment?',
    a: 'All digital gift cards and prepaid wallet codes listed as "Instant Delivery" are fulfilled automatically in 30 minutes to 2 hours once the payment gateway confirms the transaction. In some complex order cases, delivery may take up to 24 hours. You can track every order in real-time from the Orders Tracker page.',
    cat: 'Delivery',
  },
  {
    q: 'Is buying gift cards through JUBALY safe?',
    a: 'JUBALY is a reseller of authentic digital products obtained from authorized international sellers. We buy them in international currency and sell them in local currency. We never ask for your passwords, and all code deliveries are secure and private.',
    cat: 'Top-Up',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept bKash Auto, Nagad Pay, Rocket, and global credit cards (Visa/Mastercard) along with Crypto/USDT through secure third-party payment gateways. JUBALY does not store or have access to your credit card details.',
    cat: 'Payment',
  },
  {
    q: 'What should I do if I entered the wrong email address or player ID?',
    a: 'If the order is still in "Processing" status, contact our support team immediately. However, if the order is already delivered to the shipping address or in-game ID you provided, we cannot retrieve it or issue refunds.',
    cat: 'Top-Up',
  },
  {
    q: 'Do you offer refunds?',
    a: 'There is No Refund possible for Digital Cards or Gift Cards if the card is delivered to you via our delivery system. If we couldn’t send you your desired product within our promised time we will Refund you the full amount you sent us while ordering. In addition, if a customer refuses or does not take delivery after completing the order, a refund is issued minus a 5% handling fee.',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-zenvo-text-muted mb-6">
        <Link href="/" className="hover:text-zenvo-primary transition-colors">
          Home
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-zenvo-text-secondary">Help Center & Policies</span>
      </nav>

      {/* Page header */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-zenvo-primary to-blue-600 flex items-center justify-center shadow-md shadow-zenvo-primary/10">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zenvo-text uppercase mb-2">
          Help Center & Policies
        </h1>
        <p className="text-xs sm:text-sm text-zenvo-text-secondary leading-relaxed">
          Find instant answers to common questions, or review our official terms, privacy guidelines, and refund clauses.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zenvo-border mb-8 max-w-4xl mx-auto overflow-x-auto whitespace-nowrap scrollbar-none bg-zenvo-card/30 p-1">
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
              className={`flex-1 min-w-[140px] py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 text-center flex items-center justify-center gap-2 ${
                isActive
                  ? 'border-zenvo-primary text-zenvo-primary font-black bg-zenvo-primary-soft/10'
                  : 'border-transparent text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface/45'
              }`}
            >
              <Ic className="w-4 h-4" />
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
              {/* Big search */}
              <div className="max-w-2xl mx-auto mb-6">
                <div className="flex items-center gap-3 px-4 py-3 bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border transition-colors">
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
                      className="text-xs font-bold text-zenvo-text-muted hover:text-zenvo-primary shrink-0 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                      activeCat === c
                        ? 'bg-zenvo-primary text-white border-zenvo-primary shadow-sm'
                        : 'bg-zenvo-card border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-text hover:border-zenvo-border-hover'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                {filtered.length === 0 ? (
                  <div className="border border-dashed border-zenvo-border bg-zenvo-card/50 p-12 text-center">
                    <HelpCircle className="w-12 h-12 mx-auto text-zenvo-text-muted mb-4 opacity-60" />
                    <h3 className="text-lg font-bold text-zenvo-text mb-2">No matching FAQ found</h3>
                    <p className="text-xs text-zenvo-text-secondary">
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
                        className={`border transition-all duration-200 overflow-hidden ${
                          open
                            ? 'bg-zenvo-card border-zenvo-primary-border shadow-sm'
                            : 'bg-zenvo-card/70 border-zenvo-border hover:border-zenvo-border-hover'
                        }`}
                      >
                        <button
                          onClick={() => toggle(f.origIdx)}
                          className="w-full flex items-center gap-4 p-4 sm:p-5 text-left active:bg-zenvo-surface/50"
                        >
                          <div
                            className={`w-9 h-9 shrink-0 flex items-center justify-center border transition-colors ${
                              open
                                ? 'bg-zenvo-primary-soft border-zenvo-primary-border text-zenvo-primary'
                                : 'bg-zenvo-surface border border-zenvo-border text-zenvo-text-muted'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-zenvo-primary mb-1">
                              {f.cat}
                            </div>
                            <h3 className="text-sm font-bold leading-snug text-zenvo-text">
                              {f.q}
                            </h3>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 text-zenvo-text-muted transition-transform duration-300 ${
                              open ? 'rotate-180 text-zenvo-primary' : ''
                            }`}
                          />
                        </button>
                        <div
                          className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
                            open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-4 sm:px-5 pb-5 sm:pb-6 pl-[72px] sm:pl-[84px] border-t border-zenvo-border/40 pt-4">
                            <p className="text-xs sm:text-sm text-zenvo-text-secondary leading-relaxed">
                              {f.a}
                            </p>
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
            <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-zenvo-text flex items-center gap-2 border-l-4 border-zenvo-accent pl-3 uppercase tracking-wider">
                Refund Policy
              </h2>
              <div className="text-xs sm:text-sm text-zenvo-text-secondary space-y-4 leading-relaxed">
                <div className="bg-red-500/10 border border-red-500/20 p-4 text-zenvo-text font-bold">
                  ⚠️ There is No Refund possible for Digital Cards or Gift Cards if the card is delivered to you via our delivery system.
                </div>
                <p>
                  If we couldn’t send you your desired product within our promised time we will Refund you full amount you sent us while ordering.
                </p>
                <p>
                  Authorities are not responsible if goods are delivered elsewhere due to incorrect shipping address. If for any reason the customer does not take delivery of the product after completing the order, the rest is refunded leaving 5% Jubaly out of the total amount.
                </p>
                <p>
                  <strong>JUBALY</strong> shall not be liable for any gift cards or other digital goods that have been stolen, misplaced or misused without authorisation. If a Gift Card has been properly obtained, JUBALY is not obliged to enquire into or verify who redeems it at the time of redemption.
                </p>
                <p>
                  If customer have entered the wrong login credentials/player id to top up, once the order is delivered, no refunds can be given.
                </p>
                <p>
                  Bonus top up is given by the game authority, and no refunds can be given if the bonus top up is not credited to your account.
                </p>
                <p>
                  <strong>Delivery Timeline:</strong> Delivery may take 30 minutes to 2 hours after your order has been processed, in some cases up to 24 hours.
                </p>
                <p>
                  However if you couldn’t use your card our 24/7 support team is ready to help you out.
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="bg-zenvo-card border border-zenvo-border p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-zenvo-text flex items-center gap-2 border-l-4 border-zenvo-primary pl-3 uppercase tracking-wider">
                Privacy Policy
              </h2>
              <div className="text-xs sm:text-sm text-zenvo-text-secondary space-y-5 leading-relaxed">
                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Who we are</h3>
                  <p>
                    Our website address is: <a href="https://jubaly.com/" className="text-zenvo-primary hover:underline">www.jubaly.com</a>. We mainly sell Game cards, Gift cards and shopping cards.
                    It’s not easy to get gift cards and international shopping cards from Bangladesh. So we buy them internationally and sell them locally to the users or buyers who want to buy them from Bangladesh in the easiest way possible. We buy them in international currency and sell them in local currency.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">What Information Do We Collect?</h3>
                  <p className="mb-2">We collect information from you when you visit our service, place an order, subscribe to our newsletter, respond to a survey or fill out a form:</p>
                  <ul className="list-disc list-inside pl-3 space-y-1">
                    <li>Name / Username</li>
                    <li>Phone Numbers</li>
                    <li>Email Addresses</li>
                    <li>Billing Addresses</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">How Do We Use The Information We Collect?</h3>
                  <ul className="list-disc list-inside pl-3 space-y-1">
                    <li>To personalize your experience (your information helps us to better respond to your individual needs)</li>
                    <li>To improve our service based on the feedback we receive from you</li>
                    <li>To improve customer service and support needs</li>
                    <li>To process transactions</li>
                    <li>To send periodic emails and updates pertaining to your order</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">How Do We Use Your Email Address?</h3>
                  <p>
                    By submitting your email address on this website, you agree to receive emails from us. You can cancel your participation at any time by clicking the opt-out link at the bottom of each email. Email addresses submitted only through the order processing page will be used for the sole purpose of sending you information and updates pertaining to your order.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Cookies</h3>
                  <p>
                    If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies for convenience so that you do not have to fill in details again. These cookies last for one year. Temporary cookies are set to determine if your browser accepts cookies, containing no personal data. Log in cookies last for two days, and screen option cookies last for a year.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Third-Party Services</h3>
                  <p>
                    We may include or make available third-party links or services on our website. JUBALY is not responsible for the content, privacy settings, accuracy or opinions expressed in such websites. Please check the respective policies of those platforms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS TAB */}
          {activeTab === 'terms' && (
            <div className="bg-zenvo-card border border-zenvo-border p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-zenvo-text flex items-center gap-2 border-l-4 border-zenvo-accent pl-3 uppercase tracking-wider">
                Terms and Conditions
              </h2>
              <div className="text-xs sm:text-sm text-zenvo-text-secondary space-y-5 leading-relaxed">
                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Reseller Disclaimer</h3>
                  <p>
                    <strong>Jubaly</strong> operates as a reseller of digital products obtained from authorized sellers. We are not the creators, manufacturers, or official partners of these products. Our role is to facilitate the purchase and distribution of authorized digital items (software licenses, gaming codes, online subscriptions) to our customers.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Age Requirement</h3>
                  <p>
                    By using Jubaly and making a purchase, you affirm that you are at least 18 years old or the age of majority in your jurisdiction. If you are under the age of 18, you may only use Jubaly.com and make a purchase under the supervision of a parent or legal guardian.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Purchases and Transactions</h3>
                  <p>
                    By making a purchase on Jubaly.com, you agree that you are responsible for reviewing and complying with the terms of service, licensing agreements, and usage policies set forth by the original authorized sellers of the digital products.
                  </p>
                  <p className="mt-2">
                    Jubaly reserves the right to refuse or cancel any order for any reason, including but not limited to inaccuracies in product information or pricing errors. In the event of a cancellation, any payment received will be refunded promptly.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Affiliate Team</h3>
                  <p>
                    We pay our affiliate users once a week. Payouts are available through mobile banking, bank transfer, and Jubaly Wallet. Jubaly Affiliate reserves the right to change, amend, or update its affiliate rules at any time.
                  </p>
                  <p className="mt-2 text-zenvo-text font-semibold">
                    Note: Credits earned from wallet top-up are not considered valid affiliate income. In addition, affiliate commission is not applicable to certain products, including UniPin Gift Card, Razer Gold, and Garena Shells.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zenvo-text uppercase mb-1">Governing Law</h3>
                  <p>
                    The laws of Bangladesh, excluding its conflicts of law rules, shall govern this Agreement and your use of our service. Your use of our service may also be subject to other local, state, national, or international laws.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="p-5 bg-zenvo-card border border-zenvo-border">
            <h4 className="text-xs font-black uppercase tracking-wider text-zenvo-text mb-3 pl-2.5 border-l-2 border-zenvo-accent">
              Need Assistance?
            </h4>
            <p className="text-xs sm:text-sm text-zenvo-text-secondary leading-relaxed">
              Our professional support squad is available via Email and WhatsApp to solve any issues immediately.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-zenvo-primary/5 via-transparent to-zenvo-accent/5 border border-zenvo-primary-border/20 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zenvo-text">
              Quick Contacts
            </h4>
            {[
              { Icon: Mail, label: 'support@jubaly.com', sub: 'Support & billing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
              { Icon: Mail, label: 'Siddikpers@gmail.com', sub: 'Urgent escalations', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
              { Icon: MessageCircle, label: '01300529836', sub: 'WhatsApp / Call (24/7)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
              { Icon: Send, label: 'Chattogram, Bangladesh', sub: 'Office location', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
            ].map(({ Icon, label, sub, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-9 h-9 shrink-0 border flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-zenvo-text leading-tight truncate max-w-[200px]">
                    {label}
                  </div>
                  <div className="text-[10px] text-zenvo-text-muted mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
