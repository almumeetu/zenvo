'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CategoryType, CurrencyCode } from '../types';
import { ProductCard } from './ProductCard';
import { useApp } from '@/lib/AppStateContext';
import {
  Flame,
  Gamepad2,
  Smartphone,
  Gift,
  Crown,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductGridProps {
  products: Product[];
  selectedCategory: CategoryType | 'all';
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
  loading?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />,
  Smartphone: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />,
  Gift: <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />,
  Crown: <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />,
  Layers: <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />,
  Sparkles: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />,
};

const COLOR_CYCLE: ('blue' | 'purple' | 'amber' | 'emerald')[] = ['blue', 'purple', 'amber', 'emerald'];

// Perfect 3-Column Skeleton card matching the exact ProductCard layout
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-zenov-card/90 via-zenov-card/95 to-zenov-surface border border-zenov-border/60 shadow-xs flex flex-col justify-between animate-pulse">
    {/* Poster Skeleton */}
    <div className="aspect-square bg-slate-800/60 relative overflow-hidden rounded-t-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      <div className="absolute top-1.5 left-1.5 w-10 h-3 bg-slate-700/60 rounded-full" />
      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-slate-700/60 rounded-full" />
    </div>
    {/* Body Skeleton */}
    <div className="p-1.5 min-[380px]:p-2 sm:p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="h-2 bg-slate-700/50 rounded w-1/3" />
        <div className="h-3 bg-slate-700/70 rounded w-4/5" />
      </div>
      {/* Inline price & button skeleton */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-zenov-border/30">
        <div className="h-3 bg-slate-700/70 rounded w-10" />
        <div className="h-5 w-5 sm:w-12 bg-slate-700/80 rounded-lg shrink-0" />
      </div>
    </div>
  </div>
);

// Infinite Auto-Playing Marquee Slider for Highlights & Trending
const TrendingMarqueeSlider: React.FC<{
  title: string;
  badge?: string;
  icon: React.ReactNode;
  items: Product[];
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
}> = ({ title, badge, icon, items, selectedCurrency, onSelectProduct }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  // Duplicate items for infinite marquee loop (2x is optimal for smooth loop without memory bloat)
  const marqueeItems = items.length > 0 ? [...items, ...items] : [];

  return (
    <section className="relative p-2.5 min-[380px]:p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-500/15 via-zenov-card/80 to-zenov-surface border border-amber-500/30 shadow-2xl shadow-amber-500/10 my-3 sm:my-5 overflow-hidden group/marquee">
      {/* Radiant Glowing Ambient Cyber Lighting */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3 sm:mb-4 px-1">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 animate-pulse">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-xs min-[380px]:text-sm sm:text-lg font-black tracking-tight uppercase text-amber-300 drop-shadow-xs flex items-center gap-1">
                <span>{title}</span>
                <span className="text-[9.5px] min-[380px]:text-[11px] sm:text-xs font-semibold text-zenov-text-muted normal-case tracking-normal">
                  ({items.length})
                </span>
              </h2>
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs">
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Manual Interactive Navigation Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="p-1 sm:p-1.5 rounded-full bg-slate-950/70 border border-white/10 hover:border-amber-400/60 text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all active:scale-90 shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="p-1 sm:p-1.5 rounded-full bg-slate-950/70 border border-white/10 hover:border-amber-400/60 text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all active:scale-90 shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Infinite Continuous Auto-Play Marquee Stream */}
      <div
        ref={sliderRef}
        className="relative overflow-x-auto scrollbar-none py-1 flex gap-2 sm:gap-3"
      >
        <div className="animate-marquee-smooth flex gap-2 sm:gap-3 hover:[animation-play-state:paused]">
          {marqueeItems.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="w-[110px] min-[380px]:w-[124px] sm:w-[155px] md:w-[175px] shrink-0"
            >
              <ProductCard
                product={product}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
                index={idx}
                isHotSection={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface ProductSectionProps {
  title: string;
  badge?: string;
  icon: React.ReactNode;
  items: Product[];
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
  highlight?: boolean;
  themeColor?: 'blue' | 'purple' | 'amber' | 'emerald' | 'default';
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  badge,
  icon,
  items,
  sectionKey,
  isExpanded,
  onToggle,
  selectedCurrency,
  onSelectProduct,
  highlight = false,
  themeColor = 'default',
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const defaultCount = 6;
  const visibleItems = isExpanded ? items : items.slice(0, defaultCount);

  useEffect(() => {
    // Disable all GSAP animations on mobile for zero-latency instant rendering
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 95%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (items.length === 0) return null;

  // Section theme lighting styles matching logo spectrum
  const themeStyles = {
    blue: {
      bg: 'bg-gradient-to-r from-blue-950/30 via-slate-950/40 to-cyan-950/20',
      border: 'border-cyan-500/25 hover:border-cyan-400/50',
      glow: 'bg-cyan-500/10',
      iconBg: 'bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      titleGrad: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200',
    },
    purple: {
      bg: 'bg-gradient-to-r from-purple-950/30 via-slate-950/40 to-pink-950/20',
      border: 'border-purple-500/25 hover:border-purple-400/50',
      glow: 'bg-purple-500/10',
      iconBg: 'bg-gradient-to-br from-purple-600/20 to-pink-500/20 border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
      titleGrad: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200',
    },
    amber: {
      bg: 'bg-gradient-to-r from-amber-950/30 via-slate-950/40 to-orange-950/20',
      border: 'border-amber-500/25 hover:border-amber-400/50',
      glow: 'bg-amber-500/10',
      iconBg: 'bg-gradient-to-br from-amber-600/20 to-orange-500/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      titleGrad: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-orange-200',
    },
    emerald: {
      bg: 'bg-gradient-to-r from-emerald-950/30 via-slate-950/40 to-teal-950/20',
      border: 'border-emerald-500/25 hover:border-emerald-400/50',
      glow: 'bg-emerald-500/10',
      iconBg: 'bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      titleGrad: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200',
    },
    default: {
      bg: 'bg-gradient-to-r from-slate-950/40 via-zenov-surface/30 to-slate-950/40',
      border: 'border-slate-800/80 hover:border-cyan-500/30',
      glow: 'bg-blue-500/10',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      titleGrad: 'text-zenov-text',
    },
  }[themeColor];

  return (
    <section
      ref={sectionRef}
      className={`relative p-2.5 min-[380px]:p-3 sm:p-5 rounded-3xl ${themeStyles.bg} border ${themeStyles.border} shadow-lg shadow-black/20 my-3 sm:my-5 transition-all duration-300 overflow-hidden`}
    >
      {/* Ambient Lighting Orb */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${themeStyles.glow} rounded-full blur-3xl pointer-events-none`} />

      {/* Section Header */}
      <div ref={headerRef} className="relative z-10 flex items-center justify-between gap-2 mb-3 sm:mb-4 px-1">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${themeStyles.iconBg}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className={`text-xs min-[380px]:text-sm sm:text-lg font-black tracking-tight uppercase ${themeStyles.titleGrad} flex items-center gap-1 sm:gap-2`}>
                <span className="truncate">{title}</span>
                <span className="text-[9.5px] min-[380px]:text-[11px] sm:text-xs font-semibold text-zenov-text-muted normal-case tracking-normal">
                  ({items.length})
                </span>
              </h2>
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs">
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {items.length > defaultCount && (
          <button
            onClick={() => onToggle(sectionKey)}
            className="shrink-0 text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs font-black text-slate-300 hover:text-white inline-flex items-center gap-0.5 sm:gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>{isExpanded ? 'Show Less' : `View All (${items.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* 3-Card Responsive Grid Layout */}
      <div className="relative z-10 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 min-[380px]:gap-2 sm:gap-3 lg:gap-4">
        {visibleItems.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            selectedCurrency={selectedCurrency}
            onSelectProduct={onSelectProduct}
            index={idx}
            isHotSection={highlight}
          />
        ))}
      </div>

      {items.length > defaultCount && !isExpanded && (
        <div className="relative z-10 mt-3.5 sm:mt-5 text-center">
          <button
            onClick={() => onToggle(sectionKey)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-white/10 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
          >
            <span>Show All {title} ({items.length - defaultCount} more)</span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  selectedCurrency,
  onSelectProduct,
  loading = false,
}) => {
  const { categories } = useApp();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) =>
    setExpandedSections((p) => ({ ...p, [section]: !p[section] }));

  // Filter active categories
  const activeCategories = (categories ?? []).filter((c) => c.active !== false);

  // Highlight and trending shows all products (hot products prioritized first)
  const displayHot = [...products].sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));

  if (selectedCategory !== 'all') {
    const matchedCategory = activeCategories.find((c) => c.slug === selectedCategory);
    const categoryTitle = matchedCategory ? matchedCategory.name : selectedCategory.replace('-', ' ');
    const filtered = products.filter((p) => p.category === selectedCategory);

    return (
      <div className="max-w-7xl mx-auto px-2 min-[380px]:px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center gap-2.5 mb-3.5 sm:mb-6">
          <span className="w-1 h-6 sm:h-8 bg-zenov-primary rounded-full shadow-sm" />
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zenov-text-muted font-bold mb-0.5">
              Category
            </p>
            <h2 className="text-base sm:text-2xl font-black tracking-tight text-zenov-text uppercase">
              {categoryTitle}
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-zenov-text-muted ml-1.5">
            ({filtered.length} items)
          </span>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 min-[380px]:gap-2 sm:gap-3 lg:gap-4">
          {filtered.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedCurrency={selectedCurrency}
              onSelectProduct={onSelectProduct}
              index={idx}
            />
          ))}
        </div>
      </div>
    );
  }

  // Loading skeleton in 3-column layout
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-2 min-[380px]:px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 min-[380px]:gap-2 sm:gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state — products loaded but DB returned nothing
  if (!loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-zenov-primary-soft border border-zenov-primary-border flex items-center justify-center mb-3">
          <Gift className="w-7 h-7 text-zenov-primary" />
        </div>
        <h3 className="text-lg font-black text-zenov-text uppercase tracking-tight mb-1">
          No Products Yet
        </h3>
        <p className="text-xs sm:text-sm text-zenov-text-muted max-w-xs">
          Products will appear here once they are added from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 min-[380px]:px-3 sm:px-6 lg:px-8 py-1 sm:py-2">
      <TrendingMarqueeSlider
        title="Highlights & Trending"
        badge="🔥 Live Hot Stream"
        icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
        items={displayHot}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />

      {/* Dynamically render a ProductSection for every active Category */}
      {activeCategories.map((categoryItem, index) => {
        const categoryProducts = products.filter((p) => p.category === categoryItem.slug);
        const iconNode =
          (categoryItem.icon && ICON_MAP[categoryItem.icon]) || (
            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          );
        const themeColor = COLOR_CYCLE[index % COLOR_CYCLE.length];

        return (
          <ProductSection
            key={categoryItem.id || categoryItem.slug}
            title={categoryItem.name}
            badge={categoryItem.badge}
            icon={iconNode}
            items={categoryProducts}
            sectionKey={categoryItem.slug}
            isExpanded={Boolean(expandedSections[categoryItem.slug])}
            onToggle={toggleSection}
            selectedCurrency={selectedCurrency}
            onSelectProduct={onSelectProduct}
            themeColor={themeColor}
          />
        );
      })}
    </div>
  );
};
