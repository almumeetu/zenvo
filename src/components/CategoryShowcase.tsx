'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Package, ArrowRight, Gift, Gamepad2, Crown, Truck } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CategoryShowcaseProps {
  onNavigate: (type: 'digital' | 'physical') => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.showcase-card');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Section Label */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <span className="w-1 h-5 sm:h-6 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zenov-text-muted font-bold">
          Shop by Type
        </p>
      </div>

      {/* Two Category Cards Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* ── DIGITAL PRODUCTS CARD ── */}
        <div
          className="showcase-card group relative overflow-hidden rounded-2xl border border-cyan-500/30 hover:border-cyan-400/70 bg-gradient-to-br from-blue-950/60 via-slate-900/80 to-cyan-950/40 shadow-lg shadow-cyan-950/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] transition-all duration-400 cursor-pointer"
          onClick={() => onNavigate('digital')}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -left-10 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/22 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Cyber grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-70" />

          {/* Top badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-widest">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
              Instant / Digital
            </span>
          </div>

          {/* Floating Icon */}
          <div className="relative z-10 flex justify-center pt-10 pb-2 sm:pt-14 sm:pb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-400">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-5 pt-2">
            <h3 className="text-base sm:text-xl font-black text-white mb-1 leading-tight">
              Digital Products
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed mb-3 sm:mb-4">
              Digital codes, gaming currencies, accounts and subscriptions.
            </p>

            {/* Sub-category tags */}
            <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5">
              {['Gift Cards', 'Game Accounts', 'Subscriptions', 'Game Keys'].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[8.5px] sm:text-[9.5px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('digital'); }}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-600/15 to-cyan-500/15 hover:from-cyan-500/25 hover:via-blue-600/25 hover:to-cyan-500/25 border border-cyan-400/40 hover:border-cyan-400/70 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore Digital Products</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── PHYSICAL PRODUCTS CARD ── */}
        <div
          className="showcase-card group relative overflow-hidden rounded-2xl border border-emerald-500/30 hover:border-emerald-400/70 bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-teal-950/40 shadow-lg shadow-emerald-950/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)] transition-all duration-400 cursor-pointer"
          onClick={() => onNavigate('physical')}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-10 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/22 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Cyber grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-70" />

          {/* Top badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-widest">
              <Truck className="w-2.5 h-2.5" />
              Delivery to Your Door
            </span>
          </div>

          {/* Floating Icon */}
          <div className="relative z-10 flex justify-center pt-10 pb-2 sm:pt-14 sm:pb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-400">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-5 pt-2">
            <h3 className="text-base sm:text-xl font-black text-white mb-1 leading-tight">
              Physical Products
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed mb-3 sm:mb-4">
              Gaming accessories, desk essentials and gear for your setup.
            </p>

            {/* Sub-category tags */}
            <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5">
              {['Mouse & Keyboard', 'Mousepads', 'Headsets', 'Controllers'].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[8.5px] sm:text-[9.5px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('physical'); }}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-600/15 to-emerald-500/15 hover:from-emerald-500/25 hover:via-teal-600/25 hover:to-emerald-500/25 border border-emerald-400/40 hover:border-emerald-400/70 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Physical Products</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Info Strip */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
        <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] sm:text-[10.5px] font-black text-white truncate">Digital Delivery</p>
            <p className="text-[8px] sm:text-[9px] text-slate-400 truncate">Clear delivery details</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-400/40 transition-all">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] sm:text-[10.5px] font-black text-white truncate">Physical Shipping</p>
            <p className="text-[8px] sm:text-[9px] text-slate-400 truncate">Order tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};
