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
import { PaymentLogo } from './payment/PaymentLogos';
import { useApp } from '@/lib/AppStateContext';
import {
  FaFacebookF,
  FaYoutube,
  FaTelegram,
  FaDiscord,
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaMapMarkerAlt,
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
  const { siteSettings } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

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

  const socialConfig = [
    {
      name: 'Facebook',
      url: siteSettings?.socialLinks?.facebook,
      icon: <FaFacebookF className="w-4 h-4" />,
      color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400',
    },
    {
      name: 'YouTube',
      url: siteSettings?.socialLinks?.youtube,
      icon: <FaYoutube className="w-4 h-4" />,
      color: 'hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400',
    },
    {
      name: 'Telegram',
      url: siteSettings?.socialLinks?.telegram,
      icon: <FaTelegram className="w-4 h-4" />,
      color: 'hover:bg-sky-400/20 hover:border-sky-400/40 hover:text-sky-400',
    },
    {
      name: 'Discord',
      url: siteSettings?.socialLinks?.discord,
      icon: <FaDiscord className="w-4 h-4" />,
      color: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-400',
    },
    {
      name: 'WhatsApp',
      url: siteSettings?.whatsappLink || (siteSettings?.whatsappNumber ? `https://wa.me/${siteSettings.whatsappNumber.replace(/[^\d]/g, '')}` : undefined),
      icon: <FaWhatsapp className="w-4 h-4" />,
      color: 'hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400',
    },
    {
      name: 'Instagram',
      url: siteSettings?.socialLinks?.instagram,
      icon: <FaInstagram className="w-4 h-4" />,
      color: 'hover:bg-pink-500/20 hover:border-pink-500/40 hover:text-pink-400',
    },
    {
      name: 'Twitter',
      url: siteSettings?.socialLinks?.twitter,
      icon: <FaTwitter className="w-4 h-4" />,
      color: 'hover:bg-sky-500/20 hover:border-sky-500/40 hover:text-sky-400',
    },
  ];

  // Only show social icons that have configured URLs or default fallback
  const activeSocials = socialConfig.filter((s) => Boolean(s.url && s.url.trim()));

  // Payment methods with icons where available
  const paymentMethods = [
    {
      label: 'bKash',
      methodId: 'bKash',
      color: 'text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/40',
    },
    {
      label: 'Nagad',
      methodId: 'Nagad',
      color: 'text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40',
    },
    {
      label: 'Rocket',
      methodId: 'Rocket',
      color: 'text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/40',
    },
    {
      label: 'Bank Card',
      methodId: 'Bank Transfer',
      color: 'text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40',
    },
    {
      label: 'USDT',
      methodId: 'Crypto/USDT',
      color: 'text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40',
    },
  ];

  return (
    <>
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
                {siteSettings?.aboutText ||
                  'Your trusted digital gaming store in Bangladesh. PSN, Steam, Xbox Gift Cards, PS Plus & instant game top-ups — delivered in seconds.'}
              </p>

              {/* Social icons */}
              {activeSocials.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/80 mb-2.5">
                    Follow Us
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeSocials.map(({ name, icon, color, url }) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={name}
                        aria-label={name}
                        className={`w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 text-slate-400 flex items-center justify-center transition-all duration-200 ${color}`}
                      >
                        {icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}

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
                {siteSettings?.supportPhone && (
                  <li>
                    <FooterLink href={`tel:${siteSettings.supportPhone.replace(/\s+/g, '')}`}>
                      <Phone className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="group-hover:text-cyan-300 transition-colors font-mono">
                        {siteSettings.supportPhone}
                      </span>
                    </FooterLink>
                  </li>
                )}

                {siteSettings?.supportEmail && (
                  <li>
                    <FooterLink href={`mailto:${siteSettings.supportEmail}`}>
                      <Mail className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="break-all group-hover:text-cyan-300 transition-colors">
                        {siteSettings.supportEmail}
                      </span>
                    </FooterLink>
                  </li>
                )}

                {(siteSettings?.whatsappNumber || siteSettings?.whatsappLink) && (
                  <li>
                    <FooterLink
                      href={
                        siteSettings.whatsappLink ||
                        `https://wa.me/${siteSettings.whatsappNumber?.replace(/[^\d]/g, '')}`
                      }
                      external
                    >
                      <FaWhatsapp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="group-hover:text-emerald-300 transition-colors font-mono">
                        WhatsApp: {siteSettings.whatsappNumber || 'Chat with us'}
                      </span>
                    </FooterLink>
                  </li>
                )}

                {siteSettings?.address && (
                  <li>
                    <div className="text-slate-400 inline-flex items-start gap-2 group cursor-default">
                      <FaMapMarkerAlt className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300 font-medium">
                        {siteSettings.address}
                      </span>
                    </div>
                  </li>
                )}
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
              {paymentMethods.map(({ label, methodId, color }) => (
                <div
                  key={label}
                  title={label}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-300 cursor-default transition-all duration-200 shadow-xs ${color}`}
                >
                  <PaymentLogo method={methodId} className="w-5 h-5 rounded-md shrink-0 shadow-sm" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── COPYRIGHT ── */}
          <div className="border-t border-slate-800/80 mt-5 pt-5 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
              © {new Date().getFullYear()}{' '}
              <span className="text-slate-300 font-semibold">
                {siteSettings?.siteName || 'ZENOV Games'} — {siteSettings?.address || 'Chattogram, Bangladesh'}
              </span>
              .{' '}
              {siteSettings?.copyrightText ||
                'All Rights Reserved. Game logos & trademarks belong to their respective publishers. ZENOV is an authorized reseller.'}
            </p>
          </div>

        </div>
      </footer>
    </>
  );
};
