'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, ShieldCheck, Headphones, Globe2, Sparkles, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const WhyChooseUs: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable all GSAP animations and ScrollTrigger on mobile for 100% native smooth scrolling
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    if (!sectionRef.current) return;

    const cards = cardsRef.current?.querySelectorAll('.feature-card');
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
          }
        );
      }
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.6, stagger: 0.09,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 86%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Sub-30 Sec Delivery',
      description:
        'Automated order processing delivers gift cards, in-game credits, and voucher pins directly within seconds.',
      iconBg: 'bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 border-cyan-500/30',
      stat: '<30s',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: '100% Genuine & Authorized',
      description:
        'Direct sourced codes & official top-up vouchers for Free Fire, PUBG, Steam, PlayStation, Xbox, and Google Play.',
      iconBg: 'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 border-emerald-500/30',
      stat: '100%',
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: '24/7 Human Support',
      description:
        'Live chat, WhatsApp (+880 1300-529836), and instant ticket resolution active 24/7 for all orders.',
      iconBg: 'bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white border-blue-500/30',
      stat: '24/7',
    },
    {
      icon: <Globe2 className="w-5 h-5" />,
      title: 'Trusted Local & Global Payments',
      description:
        'Seamlessly pay with bKash, Nagad, Rocket, Local Bank Transfer, or USDT (TRC20) with instant verification.',
      iconBg: 'bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-white border-purple-500/30',
      stat: '5+',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Best Competitive Rates',
      description:
        'Guaranteed lowest market pricing in BDT with real-time currency conversion and transparent checkout.',
      iconBg: 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 border-amber-500/30',
      stat: 'BEST',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Verified Gamers Community',
      description:
        'Over 50,000+ happy mobile & PC gamers in Bangladesh trust ZENOV for fast and reliable digital gaming top-ups.',
      iconBg: 'bg-rose-500/15 text-rose-400 group-hover:bg-rose-500 group-hover:text-white border-rose-500/30',
      stat: '50K+',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 rounded-3xl bg-slate-950/90 border border-cyan-500/30 relative overflow-hidden shadow-2xl shadow-cyan-950/20"
    >
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header (Clean Left-Aligned Design) */}
        <div ref={headerRef} className="text-left max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10.5px] font-black uppercase tracking-widest mb-3 shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 animate-pulse" />
            Why Choose ZENOV
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-tight">
            Built for gamers who demand the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400">fastest &amp; safest</span>{' '}
            experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed max-w-2xl">
            Join thousands of mobile and PC gamers across Bangladesh who rely on ZENOV for lightning-fast, secure, and authentic digital game codes and instant top-ups.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="feature-card group card-premium p-5 sm:p-6 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/70 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:-translate-y-1"
            >
              {/* Icon + stat */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 ${feat.iconBg}`}>
                  {feat.icon}
                </div>
                <span className="text-xl font-black text-slate-600 font-mono group-hover:text-cyan-400 transition-colors duration-300 leading-none">
                  {feat.stat}
                </span>
              </div>

              <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors duration-200 mb-2">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
