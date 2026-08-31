import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gamepad2, Smartphone, Gift, Crown, Layers, Sparkles } from 'lucide-react';
import { CategoryType } from '../types';
import { useApp } from '@/lib/AppStateContext';

gsap.registerPlugin(ScrollTrigger);

interface CategoryFilterProps {
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (category: CategoryType | 'all') => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { categories: dynamicCategories } = useApp();
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable GSAP animations on mobile for instant crisp tap and scroll response
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    if (!filterRef.current) return;

    const buttons = filterRef.current.querySelectorAll('.category-btn');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: filterRef.current,
            start: 'top 95%',
            once: true,
          },
        }
      );
    }, filterRef);
    return () => ctx.revert();
  }, [dynamicCategories]);

  const activeCategories = dynamicCategories.filter((c) => c.active !== false);

  const displayList: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Categories', icon: <Layers className="w-4 h-4" /> },
    ...activeCategories.map((c) => ({
      id: c.slug,
      label: c.name,
      icon: (c.icon && ICON_MAP[c.icon]) || <Gamepad2 className="w-4 h-4" />,
    })),
  ];

  return (
    <div ref={filterRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3.5">
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        {displayList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as any)}
              className={`category-btn shrink-0 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-200 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-300/50'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-850'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-cyan-400'}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
