'use client';

import React from 'react';
import { ArrowRight, Gift, ShoppingBag, Zap, ShieldCheck } from 'lucide-react';

interface FeaturedCategoryBannersProps {
  onSelectType: (type: 'digital' | 'physical') => void;
}

export const FeaturedCategoryBanners: React.FC<FeaturedCategoryBannersProps> = ({
  onSelectType,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* ── DIGITAL PRODUCTS FEATURED CARD ── */}
        <div
          onClick={() => onSelectType('digital')}
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer
            bg-gradient-to-br from-[#0b162c] via-[#07101f] to-[#040810]
            border border-cyan-500/30 hover:border-cyan-400/70
            p-4 sm:p-6 lg:p-7
            transition-all duration-300 shadow-xl shadow-cyan-950/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] flex items-center justify-between min-h-[120px] sm:min-h-[145px]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all" />
          <div className="absolute bottom-0 right-0 w-44 h-44 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

          {/* Left Content */}
          <div className="relative z-10 flex items-center gap-3 sm:gap-4 lg:gap-5 min-w-0 pr-2">
            {/* 3D Glowing Box Icon */}
            <div className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/25 to-blue-900/30 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-cyan-400/10 rounded-2xl blur-xs" />
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
              {/* Floating micro-badge */}
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                ⚡
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-cyan-200 transition-colors">
                Digital Products
              </h3>
              <p className="text-[11px] sm:text-xs lg:text-sm text-cyan-300/80 font-medium mt-0.5 truncate flex items-center gap-1.5">
                <span>Instant Delivery</span>
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                <span>No Waiting</span>
              </p>
              {/* Action Button */}
              <div className="mt-2.5 sm:mt-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl
                    bg-[#6366f1] hover:bg-[#4f46e5] text-white
                    text-[10px] sm:text-xs font-black uppercase tracking-wider
                    shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50
                    active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Digital</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Decoration (PlayStation / Console glow) */}
          <div className="hidden sm:flex flex-col items-end justify-center shrink-0 opacity-40 group-hover:opacity-80 transition-opacity pr-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400/70 uppercase">
              <Zap className="w-3 h-3 text-cyan-400" /> Instant Codes
            </div>
          </div>
        </div>

        {/* ── PHYSICAL PRODUCTS FEATURED CARD ── */}
        <div
          onClick={() => onSelectType('physical')}
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer
            bg-gradient-to-br from-[#1c0827] via-[#12051a] to-[#08020b]
            border border-purple-500/30 hover:border-purple-400/70
            p-4 sm:p-6 lg:p-7
            transition-all duration-300 shadow-xl shadow-purple-950/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] flex items-center justify-between min-h-[120px] sm:min-h-[145px]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all" />
          <div className="absolute bottom-0 right-0 w-44 h-44 bg-pink-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

          {/* Left Content */}
          <div className="relative z-10 flex items-center gap-3 sm:gap-4 lg:gap-5 min-w-0 pr-2">
            {/* 3D Glowing Bag/Gear Icon */}
            <div className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 via-fuchsia-600/25 to-pink-900/30 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-purple-400/10 rounded-2xl blur-xs" />
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
              {/* Floating micro-badge */}
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                ★
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors">
                Physical Products
              </h3>
              <p className="text-[11px] sm:text-xs lg:text-sm text-purple-300/80 font-medium mt-0.5 truncate">
                Gaming Gear & Accessories
              </p>
              {/* Action Button */}
              <div className="mt-2.5 sm:mt-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl
                    bg-[#6366f1] hover:bg-[#4f46e5] text-white
                    text-[10px] sm:text-xs font-black uppercase tracking-wider
                    shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50
                    active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Gear</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Decoration */}
          <div className="hidden sm:flex flex-col items-end justify-center shrink-0 opacity-40 group-hover:opacity-80 transition-opacity pr-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400/70 uppercase">
              <ShieldCheck className="w-3 h-3 text-purple-400" /> Official Warranty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
