import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, ShieldCheck, Headphones, Globe2, Sparkles, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const WhyChooseUs: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = containerRef.current?.querySelectorAll('.feature-card');

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 45, scale: 0.92, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: 'Sub-30 Sec Instant Delivery',
      description: 'Automated direct OpenAPI integration credits diamonds and top-ups to your UID in seconds.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: '100% Secure & Authorized',
      description: 'Official direct publisher partnership with Garena, Krafton, Moonton, and EA Sports.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-emerald-400" />,
      title: '24/7 Cyber Support',
      description: 'Live chat, WhatsApp line, and AI support assistants active round the clock.',
    },
    {
      icon: <Globe2 className="w-6 h-6 text-emerald-400" />,
      title: 'Global Payment Gateways',
      description: 'Pay seamlessly with bKash, Nagad, Rocket, Visa, Mastercard, or Crypto USDT.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      title: 'Zenvo Wallet Cashback',
      description: 'Earn instant reward coins and bonus discounts on every wallet deposit.',
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-400" />,
      title: '1M+ Verified Gamers',
      description: 'Trusted platform delivering over 5,000 top-ups daily with 99.9% positive rating.',
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 bg-gradient-to-b from-[#060a0e] via-[#080e14] to-[#060a0e] border-y border-emerald-500/10 relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff6605_1px,transparent_1px),linear-gradient(to_bottom,#00ff6605_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
            THE ZENVO COCKPIT ADVANTAGE
          </span>
          <h2 className="text-3xl font-black font-mono text-white mt-3 uppercase tracking-tight">
            WHY TOP UP ON <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ZENVO GAMES</span>?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-2">
            Millions of mobile and PC gamers count on Zenvo Games for a lightning-fast, secure, and automated gaming top-up experience.
          </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="feature-card p-5 rounded-2xl bg-[#0a1017] border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,102,0.15)] group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-emerald-500 group-hover:text-black">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold font-mono text-white group-hover:text-emerald-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1.5">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
