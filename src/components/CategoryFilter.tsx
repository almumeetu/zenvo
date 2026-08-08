import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gamepad2, Smartphone, Gift, Crown, Layers } from 'lucide-react';
import { CategoryType } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface CategoryFilterProps {
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (category: CategoryType | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterRef.current) return;
    const buttons = filterRef.current.querySelectorAll('.category-btn');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 20, scale: 0.9, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          stagger: 0.08,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: filterRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, filterRef);

    return () => ctx.revert();
  }, []);

  const categories: { id: CategoryType | 'all'; label: string; icon: React.ReactNode; count: string }[] = [
    { id: 'all', label: 'All Items', icon: <Layers className="w-4 h-4" />, count: '24+' },
    { id: 'game-topup', label: 'Game Top-Up', icon: <Gamepad2 className="w-4 h-4" />, count: '12' },
    { id: 'social-topup', label: 'Social Top-Up', icon: <Smartphone className="w-4 h-4" />, count: '8' },
    { id: 'gift-card', label: 'Gift Cards', icon: <Gift className="w-4 h-4" />, count: '6' },
    { id: 'subscription', label: 'Subscriptions', icon: <Crown className="w-4 h-4" />, count: '4' },
  ];

  return (
    <div ref={filterRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`category-btn px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-[0_0_20px_rgba(0,255,102,0.4)] scale-105 border border-emerald-300'
                  : 'bg-[#0a0f15] border border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400'
              }`}
            >
              <span className={isSelected ? 'text-black' : 'text-emerald-400'}>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isSelected
                    ? 'bg-black/20 text-black'
                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
