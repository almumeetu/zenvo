import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CategoryType, CurrencyCode } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, Gamepad2, Smartphone, Gift, Crown, ChevronDown, ChevronUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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

const ProductSectionComponent: React.FC<ProductSectionProps> = ({
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
  const visibleItems = isExpanded ? items : items.slice(0, 6);

  useEffect(() => {
    if (!sectionRef.current) return;
    const header = sectionRef.current.querySelector('.section-header');
    const cards = sectionRef.current.querySelectorAll('.product-card-wrapper');

    const ctx = gsap.context(() => {
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 35, scale: 0.94, filter: 'blur(3px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [items.length, isExpanded]);

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-6 border-b border-slate-800/60 last:border-0">
      <div className="section-header flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            {icon}
          </div>
          <h2 className="text-xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-slate-500 font-sans">({items.length} Available)</span>
          </h2>
        </div>

        {items.length > 6 && (
          <button
            onClick={() => onToggle(sectionKey)}
            className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-all hover:bg-emerald-900/40"
          >
            <span>{isExpanded ? 'SHOW LESS' : 'VIEW MORE ITEMS'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {visibleItems.map((product) => (
          <div key={product.id} className="product-card-wrapper">
            <ProductCard
              product={product}
              selectedCurrency={selectedCurrency}
              onSelectProduct={onSelectProduct}
            />
          </div>
        ))}
      </div>

      {items.length > 6 && !isExpanded && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onToggle(sectionKey)}
            className="px-6 py-2 rounded-xl bg-[#0a1017] hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,255,102,0.1)] inline-flex items-center gap-2"
          >
            <span>VIEW MORE {title.toUpperCase()}</span>
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

  const categoryGridRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter products by category or display grouped layout
  const hotProducts = products.filter((p) => p.isHot);
  const gameTopupProducts = products.filter((p) => p.category === 'game-topup');
  const socialTopupProducts = products.filter((p) => p.category === 'social-topup');
  const giftCardProducts = products.filter((p) => p.category === 'gift-card');
  const subscriptionProducts = products.filter((p) => p.category === 'subscription');

  // GSAP animation for single-category mode
  useEffect(() => {
    if (selectedCategory !== 'all' && categoryGridRef.current) {
      const cards = categoryGridRef.current.querySelectorAll('.product-card-wrapper');
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: categoryGridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }, categoryGridRef);
      return () => ctx.revert();
    }
  }, [selectedCategory, products]);

  if (selectedCategory !== 'all') {
    const filtered = products.filter((p) => p.category === selectedCategory);
    return (
      <div ref={categoryGridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-black font-mono text-white mb-6 uppercase flex items-center gap-3">
          <span className="w-3 h-8 bg-emerald-400 rounded-sm shadow-[0_0_12px_#00ff66]"></span>
          <span>Category: {selectedCategory.replace('-', ' ')}</span>
          <span className="text-sm font-normal text-slate-400 font-sans">({filtered.length} Items)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="product-card-wrapper">
              <ProductCard
                product={product}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <ProductSectionComponent
        title="Hot Items 🔥"
        icon={<Flame className="w-4 h-4 text-amber-400" />}
        items={hotProducts}
        sectionKey="hot"
        isExpanded={expandedSections.hot}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSectionComponent
        title="Game Top Up"
        icon={<Gamepad2 className="w-4 h-4 text-emerald-400" />}
        items={gameTopupProducts}
        sectionKey="gameTopup"
        isExpanded={expandedSections.gameTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSectionComponent
        title="Social Top Up"
        icon={<Smartphone className="w-4 h-4 text-cyan-400" />}
        items={socialTopupProducts}
        sectionKey="socialTopup"
        isExpanded={expandedSections.socialTopup}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSectionComponent
        title="Gift Cards"
        icon={<Gift className="w-4 h-4 text-purple-400" />}
        items={giftCardProducts}
        sectionKey="giftCard"
        isExpanded={expandedSections.giftCard}
        onToggle={toggleSection}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />
      <ProductSectionComponent
        title="Subscriptions & Accounts"
        icon={<Crown className="w-4 h-4 text-amber-400" />}
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
