'use client';

import React from 'react';
import { Flame, CheckCircle2, Zap } from 'lucide-react';

export const NewArrivalMarquee: React.FC = () => {
  const recentPurchases = [
    { user: 'Gamer_789*', item: '520 Free Fire Diamonds', time: '5s ago', speed: '3s' },
    { user: 'PUBG_King*', item: '660 UC Unknown Cash', time: '12s ago', speed: '5s' },
    { user: 'FCMobile_Pro*', item: 'Star Pass Bundle', time: '18s ago', speed: '2s' },
    { user: 'MLBB_Star*', item: 'Weekly Diamond Pass', time: '24s ago', speed: '4s' },
    { user: 'AnimeGamer*', item: 'Welkin Moon Blessing', time: '30s ago', speed: '6s' },
    { user: 'SteamBuyer*', item: '$50 Steam Code', time: '42s ago', speed: 'Instant' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
      <div className="relative bg-slate-950/80 border border-cyan-500/30 rounded-xl p-2 sm:p-2.5 pl-2.5 sm:pl-3 flex items-center gap-2 sm:gap-3 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        {/* Subtle glowing laser background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-blue-600/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Live Activity</span>
        </div>

        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="inline-flex items-center gap-10 animate-marquee text-xs text-slate-300">
            {[...recentPurchases, ...recentPurchases].map((purchase, idx) => (
              <div key={idx} className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[100px]">{purchase.user}</span>
                <span className="font-bold text-white truncate max-w-[180px] drop-shadow-xs">{purchase.item}</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold whitespace-nowrap shadow-xs">
                  <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                  {purchase.speed}
                </span>
                <span className="text-slate-500 text-[10.5px] font-mono">({purchase.time})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
