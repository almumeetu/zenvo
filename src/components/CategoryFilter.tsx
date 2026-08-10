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
  }, []);

  const categories: { id: CategoryType | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Layers className="w-4 h-4" /> },
    { id: 'game-topup', label: 'Game Top-Up', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'social-topup', label: 'Social Top-Up', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'gift-card', label: 'Gift Cards', icon: <Gift className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscriptions', icon: <Crown className="w-4 h-4" /> },
  ];

  return (
    <div ref={filterRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`category-btn shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-all duration-200 active:scale-[0.97] will-change-transform ${
                isSelected
                  ? 'bg-zenvo-primary text-white shadow-sm'
                  : 'bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-text hover:border-zenvo-border-hover hover:bg-zenvo-card'
              }`}
            >
              <span className={isSelected ? 'text-white/90' : 'text-zenvo-primary'}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
