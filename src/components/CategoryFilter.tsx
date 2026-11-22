'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Gamepad2,
  Smartphone,
  Gift,
  Crown,
  Layers,
  Sparkles,
  Package,
  Shield,
  Zap,
  Laptop,
  Monitor,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CategoryType } from '../types';
import { useApp } from '@/lib/AppStateContext';

interface CategoryFilterProps {
  selectedCategory: CategoryType | 'all' | string;
  onSelectCategory: (category: any) => void;
  scrollToGrid?: boolean;
  className?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />,
  Smartphone: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
  Gift: <Gift className="w-5 h-5 sm:w-6 sm:h-6" />,
  Crown: <Crown className="w-5 h-5 sm:w-6 sm:h-6" />,
  Layers: <Layers className="w-5 h-5 sm:w-6 sm:h-6" />,
  Sparkles: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
  Package: <Package className="w-5 h-5 sm:w-6 sm:h-6" />,
  Shield: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
  Zap: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
  Laptop: <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />,
  Monitor: <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />,
  Headphones: <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />,
};

const SUBTITLE_MAP: Record<string, string> = {
  'game-topup': 'Top up your games',
  'gift-card': 'Steam, PlayStation & More',
  'social-topup': 'Discord, YouTube & More',
  'subscription': 'PS Plus, Xbox Game Pass',
  'game-account': 'Premium Accounts',
  'gaming-gear': 'Gaming Gear & Accessories',
};

const DEFAULT_CATEGORIES = [
  { id: 'game-topup', label: 'Game Top-Up', sub: 'Top up your games', icon: <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { id: 'gift-card', label: 'Gift Cards', sub: 'Steam, PlayStation & More', icon: <Gift className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { id: 'social-topup', label: 'Social Top-Up', sub: 'Discord, YouTube & More', icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { id: 'subscription', label: 'Subscriptions', sub: 'PS Plus, Xbox Game Pass', icon: <Crown className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { id: 'game-account', label: 'Game Accounts', sub: 'Premium Accounts', icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { id: 'gaming-gear', label: 'Gaming Gear', sub: 'Gaming Gear & Accessories', icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" /> },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  scrollToGrid = false,
  className = '',
}) => {
  const { categories: dynamicCategories } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Active dynamic categories
  const activeCategories = (dynamicCategories || []).filter((c) => c && c.active !== false);

  // Construct display list with All Products first, followed by default or dynamic categories
  const displayList = React.useMemo(() => {
    const list: { id: string; label: string; sub: string; icon: React.ReactNode }[] = [
      {
        id: 'all',
        label: 'All Products',
        sub: 'Digital & Physical Catalog',
        icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6" />,
      },
    ];

    if (activeCategories.length > 0) {
      activeCategories.forEach((c) => {
        const slug = c?.slug || c?.id || '';
        list.push({
          id: slug,
          label: c?.name || c?.slug || 'Category',
          sub: SUBTITLE_MAP[slug] || c?.description?.slice(0, 26) || 'Explore products',
          icon: (c?.icon && ICON_MAP[c.icon]) || <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />,
        });
      });
    } else {
      list.push(...DEFAULT_CATEGORIES);
    }

    return list;
  }, [activeCategories]);

  // Check scroll position to update scroll buttons visibility
  const updateScrollButtons = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtons, displayList]);

  // Auto-play timer for single line horizontal slider
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 10) return; // All items fit, no need to auto-scroll

      // If reached or near the end, loop back smoothly to start
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Slide smoothly by ~1 card step width
        el.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const step = 220;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const handleClick = (catId: string) => {
    onSelectCategory(catId);
    if (scrollToGrid && typeof document !== 'undefined') {
      const target =
        document.getElementById('product-grid-section') ||
        document.getElementById('shop-categories');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      className={`relative w-full group/slider select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      {/* Left Edge Gradient Fade */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zenov-bg via-zenov-bg/80 to-transparent z-10 transition-opacity duration-300" />
      )}

      {/* Left Navigation Chevron Button */}
      {canScrollLeft && (
        <button
          onClick={() => slide('left')}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Previous categories"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
        </button>
      )}

      {/* Right Edge Gradient Fade */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-zenov-bg/80 to-zenov-bg z-10 transition-opacity duration-300" />
      )}

      {/* Right Navigation Chevron Button */}
      {canScrollRight && (
        <button
          onClick={() => slide('right')}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Next categories"
        >
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>
      )}

      {/* Single Line Auto-play Slider Track */}
      <div
        ref={sliderRef}
        onScroll={updateScrollButtons}
        className="flex flex-nowrap items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth py-1 px-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {displayList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`shrink-0 w-[160px] sm:w-[180px] lg:w-[195px] p-3 sm:p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-900/60 via-slate-900/90 to-purple-950/60 border-cyan-400/80 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                  : 'bg-slate-900/85 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700 text-slate-300 hover:text-white hover:shadow-md'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800/90 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105'
                }`}
              >
                {cat.icon}
              </div>

              {/* Text Info */}
              <div className="min-w-0 w-full px-1">
                <p className="text-xs sm:text-[13px] font-bold text-white truncate leading-tight">
                  {cat.label}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-1 font-normal">
                  {cat.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
