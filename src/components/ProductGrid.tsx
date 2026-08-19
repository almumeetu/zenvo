'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CategoryType, CurrencyCode } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, Gamepad2, Smartphone, Gift, Crown, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

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

// Skeleton card shown while products are loading from the database
const SkeletonCard = () => (
  <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-zenov-card border border-zenov-border/60 animate-pulse">
    <div className="aspect-square bg-zenov-surface/70" />
    <div className="p-1.5 min-[380px]:p-2 sm:p-3 space-y-1.5">
      <div className="h-2.5 bg-zenov-surface rounded w-2/3" />
      <div className="h-3 bg-zenov-surface rounded w-4/5" />
      <div className="h-6 sm:h-7 bg-zenov-surface/60 rounded-lg mt-2" />
    </div>
  </div>
);

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
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const defaultCount = highlight ? 9 : 6;
  const visibleItems = isExpanded ? items : items.slice(0, defaultCount);

  useEffect(() => {
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
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`py-3 sm:py-7 first:pt-1 sm:first:pt-2 border-b border-zenov-border/50 last:border-0 ${
        highlight
          ? 'relative p-2 min-[380px]:p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-zenov-card/50 to-transparent border border-amber-500/25 shadow-xl shadow-amber-500/5 my-2 sm:my-4'
          : ''
      }`}
    >
      {/* Ambient background glow for Highlight section */}
      {highlight && (
        <div className="absolute top-0 right-10 w-48 h-24 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
      )}

      {/* Section Header */}
      <div ref={headerRef} className="flex items-center justify-between gap-2 mb-2.5 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className={`w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${
              highlight
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-zenov-primary-soft border-zenov-primary-border text-zenov-primary'
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2
                className={`text-xs min-[380px]:text-sm sm:text-lg font-black tracking-tight uppercase flex items-center gap-1 sm:gap-2 ${
                  highlight ? 'text-amber-300 drop-shadow-xs' : 'text-zenov-text'
                }`}
              >
                <span className="truncate">{title}</span>
                <span className="text-[9.5px] min-[380px]:text-[11px] sm:text-xs font-semibold text-zenov-text-muted normal-case tracking-normal">
                  ({items.length})
                </span>
              </h2>
              {badge && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider ${
                    highlight
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border'
                  }`}
                >
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {items.length > defaultCount && (
          <button
            onClick={() => onToggle(sectionKey)}
            className="shrink-0 text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs font-bold text-zenov-text-secondary hover:text-zenov-primary inline-flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/40 transition-all active:scale-95 cursor-pointer"
          >
            <span>{isExpanded ? 'Show Less' : `View All (${items.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* 3-Card Responsive Grid Layout */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 min-[380px]:gap-2 sm:gap-3 lg:gap-4">
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
        <div className="mt-3.5 sm:mt-6 text-center">
          <button
            onClick={() => onToggle(sectionKey)}
            className="px-3.5 py-1.5 sm:px-6 sm:py-2 rounded-lg bg-zenov-card hover:bg-zenov-card-hover border border-zenov-border hover:border-zenov-primary-border text-zenov-text-secondary hover:text-zenov-primary text-[9px] min-[380px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1 active:scale-95 shadow-xs cursor-pointer"
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hot: false,
    gameTopup: false,
    socialTopup: false,
    giftCard: false,
    subscription: false,
  });

  const toggleSection = (section: string) =>
    setExpandedSections((p) => ({ ...p, [section]: !p[section] }));

  // Highlight and trending shows all products (hot products prioritized first)
  const displayHot = [...products].sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
  const gameTopupProducts = products.filter((p) => p.category === 'game-topup');
  const socialTopupProducts = products.filter((p) => p.category === 'social-topup');
  const giftCardProducts = products.filter((p) => p.category === 'gift-card');
  const subscriptionProducts = products.filter((p) => p.category === 'subscription');

  if (selectedCategory !== 'all') {
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
              {selectedCategory.replace('-', ' ')}
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
      <ProductSection
        title="Highlights & Trending"
        badge="🔥 Hot Picks"
        icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
        items={displayHot}
        sectionKey="hot"
        isExpanded={expandedSections.hot}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
        highlight
      />
      <ProductSection
        title="Game Top Up"
        icon={<Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-zenov-primary" />}
        items={gameTopupProducts}
        sectionKey="gameTopup"
        isExpanded={expandedSections.gameTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Social Top Up"
        icon={<Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-zenov-primary" />}
        items={socialTopupProducts}
        sectionKey="socialTopup"
        isExpanded={expandedSections.socialTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Gift Cards"
        icon={<Gift className="w-4 h-4 sm:w-5 sm:h-5 text-zenov-accent" />}
        items={giftCardProducts}
        sectionKey="giftCard"
        isExpanded={expandedSections.giftCard}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Subscriptions & Accounts"
        icon={<Crown className="w-4 h-4 sm:w-5 sm:h-5 text-zenov-accent" />}
        items={subscriptionProducts}
        sectionKey="subscription"
        isExpanded={expandedSections.subscription}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
    </div>
  );
};

