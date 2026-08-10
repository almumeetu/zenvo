'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  FileText,
  Lock,
  HelpCircle,
  Star,
  ChevronUp,
  Gamepad2,
  Gift,
  Crown,
  Zap,
} from 'lucide-react';

const FooterLink: React.FC<{ href: string; children: React.ReactNode; external?: boolean }> = ({
  href,
  children,
  external,
}) => {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className="hover:text-zenvo-primary transition-colors duration-200 inline-flex items-start gap-2 group">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      onClick={(e) => !external && e.preventDefault()}
      className="hover:text-zenvo-primary transition-colors duration-200 inline-flex items-start gap-2 group"
    >
      {children}
    </a>
  );
};

export const Footer: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const quickLinks = [
    { label: 'Gaming Top-Ups', href: '/shop?cat=game-topup', icon: <Gamepad2 className="w-3.5 h-3.5 text-zenvo-primary" /> },
    { label: 'Gift Cards', href: '/shop?cat=gift-card', icon: <Gift className="w-3.5 h-3.5 text-zenvo-accent" /> },
    { label: 'Subscriptions', href: '/shop?cat=subscription', icon: <Crown className="w-3.5 h-3.5 text-zenvo-accent" /> },
    { label: 'Order Tracker', href: '/orders/track', icon: <Zap className="w-3.5 h-3.5 text-zenvo-primary" /> },
    { label: 'AI Assistant', href: '/ai-assistant', icon: <Zap className="w-3.5 h-3.5 text-zenvo-success" /> },
    { label: 'Blog & Deals', href: '/blog', icon: <Star className="w-3.5 h-3.5 text-zenvo-accent" /> },
  ];

  const paymentMethods = ['bKash', 'Nagad', 'Rocket', 'VISA', 'Mastercard', 'USDT', 'Zenvo Wallet'];

  const socials = [
    { name: 'Discord', label: 'D', color: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-400' },
    { name: 'YouTube', label: 'Y', color: 'hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400' },
    { name: 'Telegram', label: 'T', color: 'hover:bg-sky-500/20 hover:border-sky-500/40 hover:text-sky-400' },
    { name: 'Facebook', label: 'F', color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400' },
  ];

  return (
    <>
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? '' : 'hidden'}`}
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <footer className="relative bg-zenvo-surface border-t border-zenvo-border text-zenvo-text-secondary pt-14 pb-8 font-sans overflow-hidden">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zenvo-primary/50 to-transparent" />
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zenvo-primary/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand Column */}
            <div className="space-y-5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zenvo-primary to-blue-700 p-[1.5px] shadow-primary">
                  <div className="w-full h-full rounded-[9px] bg-zenvo-bg flex items-center justify-center">
                    <span className="font-black text-base text-transparent bg-clip-text bg-gradient-to-br from-zenvo-primary to-zenvo-accent font-mono">
                      Z
                    </span>
                  </div>
                </div>
                <div className="leading-tight">
                  <div className="text-base font-black tracking-tight text-zenvo-text uppercase">
                    ZENVO <span className="text-zenvo-primary">GAMES</span>
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.16em] text-zenvo-text-muted uppercase">
                    Gaming Store
                  </div>
                </div>
              </div>

              <p className="text-sm text-zenvo-text-secondary leading-relaxed max-w-sm">
                Your trusted digital gaming store in Bangladesh. We provide PSN Gift Cards, Steam Gift Cards & Game Keys, Xbox Gift Cards, PS Plus Subscriptions, and gaming top-up services — all delivered digitally with fast support.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2">
                {socials.map(({ name, label, color }) => (
                  <a
                    key={name}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    title={name}
                    className={`w-9 h-9 rounded-xl bg-zenvo-card border border-zenvo-border text-zenvo-text-muted flex items-center justify-center transition-all duration-200 text-sm font-black ${color}`}
                  >
                    {label}
                  </a>
                ))}
              </div>

              {/* Rating badge */}
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zenvo-card border border-zenvo-border">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-zenvo-accent fill-zenvo-accent" />
                  ))}
                </div>
                <div className="text-xs leading-snug">
                  <span className="font-bold text-zenvo-text">4.9/5</span>{' '}
                  <span className="text-zenvo-text-secondary">— Trusted by 1M+ gamers</span>
                </div>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-sm font-black text-zenvo-text uppercase tracking-wider mb-5 pl-3 border-l-2 border-zenvo-primary">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href}>
                      {link.icon}
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">
                        {link.label}
                      </span>
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information Column */}
            <div>
              <h4 className="text-sm font-black text-zenvo-text uppercase tracking-wider mb-5 pl-3 border-l-2 border-zenvo-primary">
                Information
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <FooterLink href="#">
                    <ShieldCheck className="w-3.5 h-3.5 text-zenvo-success mt-0.5 shrink-0" />
                    <span>Refund & Return Policy</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="#">
                    <Lock className="w-3.5 h-3.5 text-zenvo-primary mt-0.5 shrink-0" />
                    <span>Privacy Policy</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="#">
                    <FileText className="w-3.5 h-3.5 text-zenvo-primary mt-0.5 shrink-0" />
                    <span>Terms & Conditions</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs">
                    <HelpCircle className="w-3.5 h-3.5 text-zenvo-accent mt-0.5 shrink-0" />
                    <span>FAQ & Help Center</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="tel:+8801300529836">
                  <Phone className="w-3.5 h-3.5 text-zenvo-primary mt-0.5 shrink-0" />
                  <span>+880 1300-529836</span>
                </FooterLink>
              </li>
              <li>
                <FooterLink href="mailto:Siddikpers@gmail.com">
                  <Mail className="w-3.5 h-3.5 text-zenvo-primary mt-0.5 shrink-0" />
                  <span>Siddikpers@gmail.com</span>
                </FooterLink>
                </li>
              <li>
                <FooterLink href="https://wa.me/8801300529836" external>
                  <MessageSquare className="w-3.5 h-3.5 text-zenvo-success mt-0.5 shrink-0" />
                  <span>WhatsApp: 01300529836</span>
                  </FooterLink>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="text-sm font-black text-zenvo-text uppercase tracking-wider mb-5 pl-3 border-l-2 border-zenvo-accent">
                Gamer Newsletter
              </h4>
              <p className="text-sm text-zenvo-text-secondary mb-4 leading-relaxed">
                Subscribe for instant drop alerts, free diamond giveaways, and exclusive bonus codes.
              </p>

              {subscribed ? (
                <div className="p-4 rounded-xl bg-zenvo-success-soft border border-zenvo-success/30 text-zenvo-success text-sm font-bold text-center">
                  🎉 You're in! Check your inbox.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-stretch gap-2 bg-zenvo-card border border-zenvo-border rounded-xl p-1.5 focus-within:border-zenvo-primary-border transition-all duration-200"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full min-w-0 bg-transparent px-3 py-2 text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none rounded-md"
                  />
                  <button
                    type="submit"
                    className="magnetic-btn px-3.5 py-2 rounded-lg bg-gradient-to-r from-zenvo-accent to-orange-500 hover:from-zenvo-accent-hover hover:to-orange-400 text-zenvo-bg transition-all inline-flex items-center justify-center gap-1.5 text-xs font-black shrink-0"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </button>
                </form>
              )}

              <p className="text-[11px] text-zenvo-text-muted mt-3 leading-relaxed">
                No spam. Unsubscribe anytime.
              </p>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { value: '1M+', label: 'Gamers' },
                  { value: '5K+', label: 'Daily Orders' },
                  { value: '<30s', label: 'Delivery' },
                  { value: '99.9%', label: 'Uptime' },
                ].map(({ value, label }) => (
                  <div key={label} className="p-3 rounded-xl bg-zenvo-card border border-zenvo-border text-center">
                    <p className="text-base font-black text-zenvo-primary font-mono">{value}</p>
                    <p className="text-[10px] text-zenvo-text-muted uppercase tracking-wider font-semibold">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-zenvo-border pt-7 space-y-5">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zenvo-text-muted mb-4">
                Official Payment Methods
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {paymentMethods.map((pm) => (
                  <span
                    key={pm}
                    className="px-3.5 py-1.5 rounded-lg bg-zenvo-card border border-zenvo-border text-xs font-semibold text-zenvo-text-secondary hover:border-zenvo-primary-border hover:text-zenvo-primary hover:bg-zenvo-primary-soft/30 transition-all duration-200 cursor-default"
                  >
                    {pm}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-zenvo-border pt-5 text-center">
              <p className="text-xs text-zenvo-text-muted leading-relaxed max-w-4xl mx-auto">
                © {new Date().getFullYear()}{' '}
              <span className="text-zenvo-text font-semibold">ZENVO Games — Chattogram, Bangladesh</span>. All Rights Reserved.
                All game logos and trademarks are the property of their respective publishers. ZENVO is
                an authorized reseller and does not claim ownership of any third-party trademarks.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
