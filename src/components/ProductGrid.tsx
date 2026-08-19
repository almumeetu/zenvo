'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CategoryType, CurrencyCode } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, Gamepad2, Smartphone, Gift, Crown, ChevronDown, ChevronUp } from 'lucide-react';

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
  <div className="rounded-xl overflow-hidden bg-zenov-card border border-zenov-border animate-pulse">
    <div className="aspect-square bg-zenov-surface/60" />
    <div className="p-2 sm:p-3 space-y-2">
      <div className="h-3 bg-zenov-surface rounded-md w-3/4" />
      <div className="h-2.5 bg-zenov-surface/60 rounded-md w-1/2" />
      <div className="h-7 bg-zenov-surface/40 rounded-lg mt-1" />
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
  const visibleItems = isExpanded ? items : items.slice(0, 6);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 90%',
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
      className={`py-4 sm:py-9 first:pt-1 sm:first:pt-4 border-b border-zenov-border/60 last:border-0 ${
        highlight ? 'relative' : ''
      }`}
    >
      {/* Section Header */}
      <div ref={headerRef} className="flex items-center justify-between gap-3 mb-3.5 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              highlight
                ? 'bg-zenov-accent-soft/80 border-zenov-accent-border text-zenov-accent shadow-sm'
                : 'bg-zenov-primary-soft border-zenov-primary-border text-zenov-primary'
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black tracking-tight text-zenov-text uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="truncate">{title}</span>
                <span className="text-[11px] sm:text-xs font-medium text-zenov-text-muted normal-case tracking-normal">
                  ({items.length})
                </span>
              </h2>
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border">
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {items.length > 6 && (
          <button
            onClick={() => onToggle(sectionKey)}
            className="shrink-0 text-[11px] sm:text-xs font-semibold text-zenov-text-secondary hover:text-zenov-primary inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/40 transition-all active:scale-95"
          >
            <span>{isExpanded ? 'Show Less' : 'View More'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-5">
        {visibleItems.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            selectedCurrency={selectedCurrency}
            onSelectProduct={onSelectProduct}
            index={idx}
          />
        ))}
      </div>

      {items.length > 6 && !isExpanded && (
        <div className="mt-5 sm:mt-7 text-center">
          <button
            onClick={() => onToggle(sectionKey)}
            className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-zenov-card hover:bg-zenov-card-hover border border-zenov-border hover:border-zenov-primary-border text-zenov-text-secondary hover:text-zenov-primary text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span>Load More {title.split(' ')[0].toUpperCase()}</span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

  const hotProducts = products.filter((p) => p.isHot);
  const displayHot = hotProducts.length > 0 ? hotProducts : products.slice(0, 6);
  const gameTopupProducts = products.filter((p) => p.category === 'game-topup');
  const socialTopupProducts = products.filter((p) => p.category === 'social-topup');
  const giftCardProducts = products.filter((p) => p.category === 'gift-card');
  const subscriptionProducts = products.filter((p) => p.category === 'subscription');

  if (selectedCategory !== 'all') {
    const filtered = products.filter((p) => p.category === selectedCategory);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center gap-3 mb-5 sm:mb-8">
          <span className="w-1 h-7 sm:h-9 bg-zenov-primary rounded-full shadow-sm" />
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-zenov-text-muted font-semibold mb-0.5">
              Category
            </p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zenov-text uppercase">
              {selectedCategory.replace('-', ' ')}
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-medium text-zenov-text-muted ml-2">
            ({filtered.length} items)
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-5">
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-5">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-zenov-primary-soft border border-zenov-primary-border flex items-center justify-center mb-4">
          <Gift className="w-8 h-8 text-zenov-primary" />
        </div>
        <h3 className="text-xl font-black text-zenov-text uppercase tracking-tight mb-2">
          No Products Yet
        </h3>
        <p className="text-sm text-zenov-text-muted max-w-xs">
          Products will appear here once they are added from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2">
      <ProductSection
        title="Highlights & Trending"
        badge="🔥 Hot Picks"
        icon={<Flame className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zenov-accent" />}
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
        icon={<Gamepad2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zenov-primary" />}
        items={gameTopupProducts}
        sectionKey="gameTopup"
        isExpanded={expandedSections.gameTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Social Top Up"
        icon={<Smartphone className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zenov-primary" />}
        items={socialTopupProducts}
        sectionKey="socialTopup"
        isExpanded={expandedSections.socialTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Gift Cards"
        icon={<Gift className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zenov-accent" />}
        items={giftCardProducts}
        sectionKey="giftCard"
        isExpanded={expandedSections.giftCard}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Subscriptions & Accounts"
        icon={<Crown className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-zenov-accent" />}
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
