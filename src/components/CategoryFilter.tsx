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
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: filterRef.current,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
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
    <div ref={filterRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {displayList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as any)}
              className={`category-btn shrink-0 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-200 active:scale-[0.97] will-change-transform ${
                isSelected
                  ? 'bg-zenov-primary text-white shadow-sm'
                  : 'bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-text hover:border-zenov-border-hover hover:bg-zenov-card'
              }`}
            >
              <span className={isSelected ? 'text-white/90' : 'text-zenov-primary'}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
