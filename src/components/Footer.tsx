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
import { ZenovLogo } from './ZenovLogo';
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

      <footer className="relative bg-gradient-to-b from-slate-950 via-slate-950 to-[#04060a] border-t border-cyan-500/30 text-slate-400 font-sans overflow-hidden">
        {/* Top Multi-Color Neon Glowing Laser Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-cyan-400 to-amber-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
        
        {/* Background Ambient Gaming Glows (Logo Spectrum) */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[250px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-6">

          {/* ── MAIN GRID (CLEAN MOBILE RESPONSIVE SPACING) ── */}
          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 mb-10">

            {/* Brand */}
            <div className="min-[520px]:col-span-2 lg:col-span-1 space-y-4">
              {/* Logo */}
              <ZenovLogo size="lg" isLink href="/" />

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Your trusted digital gaming store in Bangladesh. PSN, Steam, Xbox Gift Cards, PS Plus & instant game top-ups — delivered in seconds.
              </p>

              {/* Social icons */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/80 mb-2.5">
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
                      className={`w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 text-slate-400 flex items-center justify-center transition-all duration-200 ${color}`}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Rating badge */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xs max-w-sm">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs leading-snug">
                  <span className="font-bold text-white">4.9/5</span>{' '}
                  <span className="text-slate-400">Trusted by 1M+ gamers</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider pl-3 border-l-2 border-cyan-400">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href}>
                      {link.icon}
                      <span className="group-hover:translate-x-1 group-hover:text-cyan-300 transition-all duration-200 inline-block font-medium">
                        {link.label}
                      </span>
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider pl-3 border-l-2 border-cyan-400">
                Information
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <FooterLink href="/faqs?tab=refund">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="group-hover:text-cyan-300 transition-colors">Refund & Return Policy</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs?tab=privacy">
                    <Lock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="group-hover:text-cyan-300 transition-colors">Privacy Policy</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs?tab=terms">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="group-hover:text-cyan-300 transition-colors">Terms & Conditions</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faqs?tab=faqs">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span className="group-hover:text-amber-300 transition-colors">FAQ & Help Center</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="tel:+8801300529836">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="group-hover:text-cyan-300 transition-colors font-mono">+880 1300-529836</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="mailto:Siddikpers@gmail.com">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="break-all group-hover:text-cyan-300 transition-colors">Siddikpers@gmail.com</span>
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="https://wa.me/8801300529836" external>
                    <FaWhatsapp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="group-hover:text-emerald-300 transition-colors font-mono">WhatsApp: 01300529836</span>
                  </FooterLink>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="min-[520px]:col-span-2 lg:col-span-1 space-y-3.5">
              <h4 className="text-xs font-black text-white uppercase tracking-wider pl-3 border-l-2 border-amber-400">
                Gamer Newsletter
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscribe for instant drop alerts, free diamond giveaways & exclusive bonus codes.
              </p>

              {subscribed ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                  🎉 You&apos;re in! Check your inbox.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-stretch gap-2 bg-slate-900/90 border border-white/10 rounded-xl p-1.5 focus-within:border-cyan-400/60 transition-all duration-200"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full min-w-0 bg-transparent px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none rounded-md"
                  />
                  <button
                    type="submit"
                    className="magnetic-btn px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all inline-flex items-center justify-center gap-1.5 text-xs font-black shrink-0 shadow-md shadow-amber-500/20"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3 h-3" />
                    <span>Subscribe</span>
                  </button>
                </form>
              )}
              <p className="text-[10px] text-slate-500">No spam. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* ── PAYMENT METHODS ── */}
          <div className="border-t border-slate-800/80 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 text-center mb-3">
              Official Payment Methods
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {paymentMethods.map(({ label, icon, color }) => (
                <div
                  key={label}
                  title={label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 cursor-default transition-all duration-200 ${color}`}
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── COPYRIGHT ── */}
          <div className="border-t border-slate-800/80 mt-5 pt-5 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
              © {new Date().getFullYear()}{' '}
              <span className="text-slate-300 font-semibold">ZENOV Games — Chattogram, Bangladesh</span>.
              {' '}All Rights Reserved.{' '}
              Game logos & trademarks belong to their respective publishers. ZENOV is an authorized reseller.
            </p>
          </div>

        </div>
      </footer>
    </>
  );
};
