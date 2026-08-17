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
        'Automated OpenAPI integration credits diamonds and top-ups directly to your UID within seconds.',
      iconBg: 'bg-zenov-accent-soft text-zenov-accent group-hover:bg-zenov-accent group-hover:text-zenov-bg border-zenov-accent-border',
      stat: '<30s',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: '100% Secure & Authorized',
      description:
        'Official direct publisher partnership with Garena, Krafton, Moonton, and EA Sports.',
      iconBg: 'bg-zenov-success/15 text-zenov-success group-hover:bg-zenov-success group-hover:text-zenov-bg border-zenov-success/25',
      stat: '100%',
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: '24/7 Dedicated Support',
      description:
        'Live chat, WhatsApp, and AI support assistants active round the clock to assist you.',
      iconBg: 'bg-zenov-primary-soft text-zenov-primary group-hover:bg-zenov-primary group-hover:text-white border-zenov-primary-border',
      stat: '24/7',
    },
    {
      icon: <Globe2 className="w-5 h-5" />,
      title: 'Global Payment Gateways',
      description:
        'Pay with bKash, Nagad, Rocket, Bank Transfer, USDT, and ZENOV Wallet — all secured.',
      iconBg: 'bg-zenov-primary-soft text-zenov-primary group-hover:bg-zenov-primary group-hover:text-white border-zenov-primary-border',
      stat: '10+',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Wallet Cashback Rewards',
      description:
        'Earn instant reward coins and bonus discounts on every ZENOV Wallet deposit and order.',
      iconBg: 'bg-zenov-accent-soft text-zenov-accent group-hover:bg-zenov-accent group-hover:text-zenov-bg border-zenov-accent-border',
      stat: 'VIP',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: '1M+ Verified Gamers',
      description:
        'Trusted platform delivering over 5,000 top-ups daily with a 99.9% positive rating.',
      iconBg: 'bg-zenov-success/15 text-zenov-success group-hover:bg-zenov-success group-hover:text-zenov-bg border-zenov-success/25',
      stat: '1M+',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 bg-zenov-surface/40 border-y border-zenov-border/70 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.07),transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05),transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:56px_56px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zenov-primary-soft border border-zenov-primary-border text-zenov-primary text-[11px] font-black uppercase tracking-[0.18em] mb-4">
            <Zap className="w-3 h-3 fill-zenov-primary/50" />
            Why Choose ZENOV
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zenov-text leading-tight">
            Built for gamers who demand the{' '}
            <span className="text-gradient-full">fastest & safest</span>{' '}
            experience
          </h2>
          <p className="text-sm sm:text-base text-zenov-text-secondary mt-4 leading-relaxed max-w-xl mx-auto">
            Millions of mobile and PC gamers trust ZENOV for lightning-fast, secure, and automated
            gaming top-ups with official publisher-backed guarantees.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="feature-card group card-premium p-5 sm:p-6 rounded-xl bg-zenov-card border border-zenov-border hover:border-zenov-border-hover relative overflow-hidden"
            >
              {/* Corner glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-zenov-primary/5 group-hover:bg-zenov-primary/10 blur-2xl transition-all duration-500 pointer-events-none" />

              {/* Icon + stat */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 ${feat.iconBg}`}>
                  {feat.icon}
                </div>
                <span className="text-xl font-black text-zenov-text-muted/40 font-mono group-hover:text-zenov-primary/30 transition-colors duration-300 leading-none">
                  {feat.stat}
                </span>
              </div>

              <h3 className="text-base font-black text-zenov-text group-hover:text-zenov-primary transition-colors duration-200 mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-zenov-text-secondary leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
