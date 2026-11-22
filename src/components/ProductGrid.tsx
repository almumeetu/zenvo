'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CategoryType, CurrencyCode } from '../types';
import { ProductCard } from './ProductCard';
import { useApp } from '@/lib/AppStateContext';
import {
  Gamepad2,
  Package,
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
  Gift,
  ShoppingBag,
} from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedCategory: CategoryType | 'all' | string;
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
  loading?: boolean;
}

// ── Perfect Skeleton Card ──
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800/80 flex flex-col animate-pulse">
    <div className="aspect-square sm:aspect-[4/3] bg-slate-800/60 relative overflow-hidden rounded-t-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
    <div className="p-2 sm:p-2.5 space-y-2 flex-1 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="h-2 bg-slate-700/50 rounded w-1/3" />
        <div className="h-3 bg-slate-700/70 rounded w-4/5" />
        <div className="h-3 bg-slate-700/50 rounded w-1/2" />
      </div>
      <div className="h-7 bg-slate-700/80 rounded-xl w-full" />
    </div>
  </div>
);

// ── Trending Slider ──
const TrendingSlider: React.FC<{
  items: Product[];
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
}> = ({ items, selectedCurrency, onSelectProduct }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 240, behavior: 'smooth' });

  return (
    <section className="relative p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950 border border-amber-500/25 my-4 sm:my-6 overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-black uppercase text-amber-300 tracking-tight flex items-center gap-1.5">
              <span>Hot & Trending Deals</span>
              <span className="text-[9px] sm:text-xs text-slate-400 font-semibold lowercase">
                ({items.length})
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={scrollLeft}
            aria-label="Previous"
            className="p-1 sm:p-1.5 rounded-full bg-slate-900/90 border border-white/10 hover:border-amber-400 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Next"
            className="p-1 sm:p-1.5 rounded-full bg-slate-900/90 border border-white/10 hover:border-amber-400 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((product, idx) => (
          <div
            key={product.id || idx}
            className="w-[115px] min-[380px]:w-[130px] sm:w-[155px] md:w-[170px] shrink-0"
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
  const router = useRouter();
  const { categories, setSelectedCategory } = useApp();
  const activeCategories = (categories ?? []).filter((c) => c && c.active !== false);

  // ── Single Category Selected ──
  if (selectedCategory !== 'all') {
    const matchedCategory = activeCategories.find(
      (c) => c && (c.slug === selectedCategory || c.id === selectedCategory)
    );
    const categoryTitle = matchedCategory?.name || selectedCategory.replace(/-/g, ' ');
    const filtered = (products || []).filter((p) => {
      if (!p) return false;
      return (
        p.category === selectedCategory ||
        p.categoryId === selectedCategory ||
        (matchedCategory &&
          (p.category === matchedCategory.slug ||
            p.category === matchedCategory.id ||
            p.categoryId === matchedCategory.id)) ||
        (p as any).categorySlug === selectedCategory
      );
    });

    return (
      <div id="product-grid-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-7 bg-cyan-400 rounded-full" />
            <div>
              <p className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold">Category</p>
              <h2 className="text-base sm:text-2xl font-black text-white tracking-tight">
                {categoryTitle}
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold ml-1">
              ({filtered.length} {filtered.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer font-bold"
          >
            Show All Products
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center rounded-3xl bg-slate-900/60 border border-slate-800 p-6 max-w-md mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No products in this category yet</h3>
            <p className="text-xs text-slate-400 mb-5">Products added to &quot;{categoryTitle}&quot; will appear here automatically.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {filtered.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty State ──
  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
          <Gift className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
          No Products Yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs">
          Products will appear here once added in the admin panel.
        </p>
      </div>
    );
  }

  const allProducts = products || [];
  const digitalProducts = allProducts.filter((p) => p && p.productType !== 'physical');
  const physicalProducts = allProducts.filter((p) => p && p.productType === 'physical');
  const hotProducts = allProducts.filter((p) => p && (p.isHot || (p as any).trending));

  return (
    <div id="product-grid-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
      {/* ═════════════════════════════════════════════════════
          HOT & TRENDING DEALS SLIDER
      ═════════════════════════════════════════════════════ */}
      {hotProducts.length > 0 && (
        <TrendingSlider
          items={hotProducts}
          selectedCurrency={selectedCurrency}
          onSelectProduct={onSelectProduct}
        />
      )}

      {/* ═════════════════════════════════════════════════════
          SECTION 1: DIGITAL PRODUCTS
      ═════════════════════════════════════════════════════ */}
      {digitalProducts.length > 0 && (
        <section className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight">
                  Digital Products
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5 font-normal">
                  In-game top-ups, game keys, gift cards & instant subscriptions
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/shop?type=digital')}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 text-slate-200 hover:text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {digitalProducts.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════
          SECTION 2: PHYSICAL & GAMING GEAR PRODUCTS
      ═════════════════════════════════════════════════════ */}
      {physicalProducts.length > 0 && (
        <section className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight">
                  Gaming Gear & Hardware
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5 font-normal">
                  Authentic esports mice, keyboards, GPUs & PC components
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/shop?type=physical')}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 hover:text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {physicalProducts.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════
          FALLBACK IF ALL ARE UNCATEGORIZED OR CUSTOM
      ═════════════════════════════════════════════════════ */}
      {digitalProducts.length === 0 && physicalProducts.length === 0 && allProducts.length > 0 && (
        <section className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm sm:text-xl font-black text-white">All Store Products ({allProducts.length})</h2>
          </div>
          <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {allProducts.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
