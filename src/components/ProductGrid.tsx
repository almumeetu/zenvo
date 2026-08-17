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
}

interface ProductSectionProps {
  title: string;
  icon: React.ReactNode;
  items: Product[];
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  icon,
  items,
  sectionKey,
  isExpanded,
  onToggle,
  selectedCurrency,
  onSelectProduct,
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
    <section ref={sectionRef} className="py-10 first:pt-6 border-b border-zenov-border/60 last:border-0">
      {/* Section Header */}
      <div ref={headerRef} className="flex items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zenov-primary-soft border border-zenov-primary-border flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-zenov-text uppercase flex items-baseline gap-2.5">
              {title}
              <span className="text-xs font-medium text-zenov-text-muted normal-case tracking-normal">
                ({items.length} items)
              </span>
            </h2>
          </div>
        </div>

        {items.length > 6 && (
          <button
            onClick={() => onToggle(sectionKey)}
            className="shrink-0 text-xs font-semibold text-zenov-text-secondary hover:text-zenov-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/40 transition-all"
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
        <div className="mt-7 text-center">
          <button
            onClick={() => onToggle(sectionKey)}
            className="px-6 py-2.5 rounded-lg bg-zenov-card hover:bg-zenov-card-hover border border-zenov-border hover:border-zenov-primary-border text-zenov-text-secondary hover:text-zenov-primary text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2"
          >
            <span>Load More {title.split(' ')[0].toUpperCase()}</span>
            <ChevronDown className="w-4 h-4" />
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
  const gameTopupProducts = products.filter((p) => p.category === 'game-topup');
  const socialTopupProducts = products.filter((p) => p.category === 'social-topup');
  const giftCardProducts = products.filter((p) => p.category === 'gift-card');
  const subscriptionProducts = products.filter((p) => p.category === 'subscription');

  if (selectedCategory !== 'all') {
    const filtered = products.filter((p) => p.category === selectedCategory);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1 h-9 bg-zenov-primary rounded-full shadow-sm" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zenov-text-muted font-semibold mb-0.5">
              Category
            </p>
            <h2 className="text-2xl font-black tracking-tight text-zenov-text uppercase">
              {selectedCategory.replace('-', ' ')}
            </h2>
          </div>
          <span className="text-sm font-medium text-zenov-text-muted ml-2">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <ProductSection
        title="Trending Now"
        icon={<Flame className="w-[18px] h-[18px] text-zenov-accent" />}
        items={hotProducts}
        sectionKey="hot"
        isExpanded={expandedSections.hot}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Game Top Up"
        icon={<Gamepad2 className="w-[18px] h-[18px] text-zenov-primary" />}
        items={gameTopupProducts}
        sectionKey="gameTopup"
        isExpanded={expandedSections.gameTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Social Top Up"
        icon={<Smartphone className="w-[18px] h-[18px] text-zenov-primary" />}
        items={socialTopupProducts}
        sectionKey="socialTopup"
        isExpanded={expandedSections.socialTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Gift Cards"
        icon={<Gift className="w-[18px] h-[18px] text-zenov-accent" />}
        items={giftCardProducts}
        sectionKey="giftCard"
        isExpanded={expandedSections.giftCard}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSection
        title="Subscriptions & Accounts"
        icon={<Crown className="w-[18px] h-[18px] text-zenov-accent" />}
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
