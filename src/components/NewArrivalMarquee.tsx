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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-zenvo-surface border border-zenvo-border rounded-xl p-2.5 pl-3 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zenvo-accent-soft border border-zenvo-accent-border text-zenvo-accent text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
          <Flame className="w-3.5 h-3.5 text-zenvo-accent" />
          Live Activity
        </div>

        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="inline-flex items-center gap-10 animate-marquee text-xs text-zenvo-text-secondary">
            {[...recentPurchases, ...recentPurchases].map((purchase, idx) => (
              <div key={idx} className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-zenvo-success shrink-0" />
                <span className="text-zenvo-text-muted truncate max-w-[100px]">{purchase.user}</span>
                <span className="font-semibold text-zenvo-text truncate max-w-[180px]">{purchase.item}</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zenvo-success-soft text-zenvo-success text-[10px] font-semibold whitespace-nowrap">
                  <Zap className="w-2.5 h-2.5" />
                  {purchase.speed}
                </span>
                <span className="text-zenvo-text-muted text-[11px]">({purchase.time})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
