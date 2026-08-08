import React from 'react';
import { Flame, CheckCircle2, ShieldAlert } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="bg-[#090e14] border border-emerald-500/20 rounded-xl p-2.5 flex items-center gap-3 overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap border border-emerald-500/30">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>LIVE TOP-UP FEED</span>
        </div>

        {/* Marquee ticker */}
        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="inline-flex items-center gap-8 animate-[marquee_25s_linear_infinite] text-xs font-mono text-slate-300">
            {recentPurchases.concat(recentPurchases).map((purchase, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">{purchase.user}</span>
                <span className="text-white font-bold">{purchase.item}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px]">
                  ⚡ Delivered in {purchase.speed}
                </span>
                <span className="text-slate-600">({purchase.time})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
