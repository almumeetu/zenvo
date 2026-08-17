'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import {
  FaFacebookF,
  FaYoutube,
  FaTelegram,
  FaDiscord,
  FaWhatsapp,
  FaCcVisa,
  FaCcMastercard,
  FaMobileAlt,
  FaBitcoin,
  FaWallet,
} from 'react-icons/fa';

const FooterLink: React.FC<{ href: string; children: React.ReactNode; external?: boolean }> = ({
  href,
  children,
  external,
}) => {
  if (href.startsWith('/')) {
    return (
      <Link
        href={href}
        className="hover:text-zenov-primary transition-colors duration-200 inline-flex items-start gap-2 group"
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={(e) => !external && e.preventDefault()}
      className="hover:text-zenov-primary transition-colors duration-200 inline-flex items-start gap-2 group"
    >
      {children}
    </a>
  );
};

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const quickLinks = [
    { label: 'Gift Cards Catalog', href: '/shop', icon: <Gift className="w-3.5 h-3.5 text-zenov-accent" /> },
    { label: 'Order Tracker', href: '/orders/track', icon: <Zap className="w-3.5 h-3.5 text-zenov-primary" /> },
    { label: 'Blog & Deals', href: '/blog', icon: <Star className="w-3.5 h-3.5 text-zenov-accent" /> },
  ];

  const socials = [
    {
      name: 'Facebook',
      icon: <FaFacebookF className="w-4 h-4" />,
      color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400',
    },
    {
      name: 'YouTube',
      icon: <FaYoutube className="w-4 h-4" />,
      color: 'hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400',
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="w-4 h-4" />,
      color: 'hover:bg-sky-400/20 hover:border-sky-400/40 hover:text-sky-400',
    },
    {
      name: 'Discord',
      icon: <FaDiscord className="w-4 h-4" />,
      color: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-400',
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="w-4 h-4" />,
      color: 'hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400',
    },
  ];

  // Payment methods with icons where available
  const paymentMethods = [
    {
      label: 'bKash',
      icon: <FaMobileAlt className="w-4 h-4" />,
      color: 'text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/40',
    },
    {
      label: 'Nagad',
      icon: <FaMobileAlt className="w-4 h-4" />,
      color: 'text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/40',
    },
    {
      label: 'Rocket',
      icon: <FaMobileAlt className="w-4 h-4" />,
      color: 'text-violet-500 hover:bg-violet-500/10 hover:border-violet-500/40',
    },
    {
      label: 'Bank Transfer',
      icon: <FaCcVisa className="w-6 h-4" />,
      color: 'text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40',
    },
    {
      label: 'USDT',
      icon: <FaBitcoin className="w-4 h-4" />,
      color: 'text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40',
    },
    {
      label: 'ZENOV Wallet',
      icon: <FaWallet className="w-4 h-4" />,
      color: 'text-zenov-primary hover:bg-zenov-primary-soft hover:border-zenov-primary-border',
    },
  ];

  return (
    <>
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? '' : 'hidden'}`}
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <footer className="relative bg-zenov-surface border-t border-zenov-border text-zenov-text-secondary font-sans overflow-hidden">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zenov-primary/50 to-transparent" />
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zenov-primary/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-6">

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-4">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zenov-primary to-blue-700 p-[1.5px] shadow-primary shrink-0">
                  <div className="w-full h-full rounded-[9px] bg-zenov-bg flex items-center justify-center">
                    <span className="font-black text-base text-transparent bg-clip-text bg-gradient-to-br from-zenov-primary to-zenov-accent font-mono">
                      Z
                    </span>
                  </div>
                </div>
                <div className="leading-tight">
                  <div className="text-base font-black tracking-tight text-zenov-text uppercase">
                    ZENOV <span className="text-zenov-primary">GAMES</span>
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.16em] text-zenov-text-muted uppercase">
                    Gaming Store · BD
                  </div>
                </div>
              </div>

              <p className="text-xs text-zenov-text-secondary leading-relaxed">
                Your trusted digital gaming store in Bangladesh. PSN, Steam, Xbox Gift Cards, PS Plus & instant game top-ups — delivered in seconds.
              </p>

              {/* Social icons */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zenov-text-muted mb-2.5">
                  Follow Us
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {socials.map(({ name, icon, color }) => (
                    <a
                      key={name}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      title={name}
                      aria-label={name}
                      className={`w-9 h-9 rounded-xl bg-zenov-card border border-zenov-border text-zenov-text-muted flex items-center justify-center transition-all duration-200 ${color}`}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Rating badge */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zenov-card border border-zenov-border">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-zenov-accent fill-zenov-accent" />
                  ))}
                </div>
                <div className="text-xs leading-snug">
                  <span className="font-bold text-zenov-text">4.9/5</span>{' '}
                  <span className="text-zenov-text-secondary">Trusted by 1M+ gamers</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black text-zenov-text uppercase tracking-wider mb-4 pl-3 border-l-2 border-zenov-primary">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs">
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

            {/* Information */}
            <div>
              <h4 className="text-xs font-black text-zenov-text uppercase tracking-wider mb-4 pl-3 border-l-2 border-zenov-primary">
                Information
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <FooterLink href="/faqs?tab=refund">
                    <ShieldCheck className="w-3.5 h-3.5 text-zenov-success mt-0.5 shrink-0" />
                    <span>Refund & Return Policy</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs?tab=privacy">
                    <Lock className="w-3.5 h-3.5 text-zenov-primary mt-0.5 shrink-0" />
                    <span>Privacy Policy</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs?tab=terms">
                    <FileText className="w-3.5 h-3.5 text-zenov-primary mt-0.5 shrink-0" />
                    <span>Terms & Conditions</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs?tab=faqs">
                    <HelpCircle className="w-3.5 h-3.5 text-zenov-accent mt-0.5 shrink-0" />
                    <span>FAQ & Help Center</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="tel:+8801300529836">
                    <Phone className="w-3.5 h-3.5 text-zenov-primary mt-0.5 shrink-0" />
                    <span>+880 1300-529836</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="mailto:Siddikpers@gmail.com">
                    <Mail className="w-3.5 h-3.5 text-zenov-primary mt-0.5 shrink-0" />
                    <span className="break-all">Siddikpers@gmail.com</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="https://wa.me/8801300529836" external>
                    <FaWhatsapp className="w-3.5 h-3.5 text-zenov-success mt-0.5 shrink-0" />
                    <span>WhatsApp: 01300529836</span>
                  </FooterLink>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <h4 className="text-xs font-black text-zenov-text uppercase tracking-wider mb-4 pl-3 border-l-2 border-zenov-accent">
                Gamer Newsletter
              </h4>
              <p className="text-xs text-zenov-text-secondary mb-3 leading-relaxed">
                Subscribe for instant drop alerts, free diamond giveaways & exclusive bonus codes.
              </p>

              {subscribed ? (
                <div className="p-3.5 rounded-xl bg-zenov-success-soft border border-zenov-success/30 text-zenov-success text-xs font-bold text-center">
                  🎉 You&apos;re in! Check your inbox.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-stretch gap-2 bg-zenov-card border border-zenov-border rounded-xl p-1.5 focus-within:border-zenov-primary-border transition-all duration-200"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full min-w-0 bg-transparent px-3 py-2 text-xs text-zenov-text placeholder:text-zenov-text-muted focus:outline-none rounded-md"
                  />
                  <button
                    type="submit"
                    className="magnetic-btn px-3 py-2 rounded-lg bg-gradient-to-r from-zenov-accent to-orange-500 hover:from-zenov-accent-hover hover:to-orange-400 text-zenov-bg transition-all inline-flex items-center justify-center gap-1.5 text-xs font-black shrink-0"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3 h-3" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </button>
                </form>
              )}
              <p className="text-[10px] text-zenov-text-muted mt-2">No spam. Unsubscribe anytime.</p>

              {/* Stats grid */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { value: '1M+', label: 'Gamers' },
                  { value: '5K+', label: 'Orders/day' },
                  { value: '<30s', label: 'Delivery' },
                  { value: '99.9%', label: 'Uptime' },
                ].map(({ value, label }) => (
                  <div key={label} className="p-2 rounded-xl bg-zenov-card border border-zenov-border text-center">
                    <p className="text-sm font-black text-zenov-primary font-mono leading-tight">{value}</p>
                    <p className="text-[9px] text-zenov-text-muted uppercase tracking-wide font-semibold leading-tight mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PAYMENT METHODS ── */}
          <div className="border-t border-zenov-border pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zenov-text-muted text-center mb-3">
              Official Payment Methods
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {paymentMethods.map(({ label, icon, color }) => (
                <div
                  key={label}
                  title={label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zenov-card border border-zenov-border text-xs font-semibold text-zenov-text-secondary cursor-default transition-all duration-200 ${color}`}
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── COPYRIGHT ── */}
          <div className="border-t border-zenov-border mt-5 pt-5 text-center">
            <p className="text-[11px] text-zenov-text-muted leading-relaxed max-w-3xl mx-auto">
              © {new Date().getFullYear()}{' '}
              <span className="text-zenov-text font-semibold">ZENOV Games — Chattogram, Bangladesh</span>.
              {' '}All Rights Reserved.{' '}
              Game logos & trademarks belong to their respective publishers. ZENOV is an authorized reseller.
            </p>
          </div>

        </div>
      </footer>
    </>
  );
};
