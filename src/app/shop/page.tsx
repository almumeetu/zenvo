'use client';

import { Suspense } from 'react';

import { useMemo } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, LayoutGrid, List, SortAsc, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { CategoryType } from '@/types';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

function ShopContent() {
  const searchParams = useSearchParams();
  const catParam = (searchParams.get('cat') || 'all') as CategoryType | 'all';
  const qParam = searchParams.get('q') || '';

  const { products, selectedCurrency, selectedCategory, setSelectedCategory, productsLoading } = useApp();

  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState<SortKey>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [instantOnly, setInstantOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = products;
    if (catParam !== 'all') list = list.filter((p) => p.category === catParam);
    else if (selectedCategory !== 'all') list = list.filter((p) => p.category === selectedCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.publisher?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    list = list.filter(
      (p) => (p.denominations[0]?.amount || 0) <= maxPrice
    );
    if (instantOnly) list = list.filter((p) => p.deliveryType === 'Instant');
    switch (sort) {
      case 'price-asc':
        list = [...list].sort(
          (a, b) => (a.denominations[0]?.amount || 0) - (b.denominations[0]?.amount || 0)
        );
        break;
      case 'price-desc':
        list = [...list].sort(
          (a, b) => (b.denominations[0]?.amount || 0) - (a.denominations[0]?.amount || 0)
        );
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
    }
    return list;
  }, [products, catParam, selectedCategory, query, sort, maxPrice, instantOnly]);

  const currentCat = catParam !== 'all' ? catParam : selectedCategory;
  const cat = currentCat === 'all' ? 'All Products' : currentCat.charAt(0).toUpperCase() + currentCat.slice(1).replace('-', ' ');

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-5 flex-wrap">
          <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-zenov-primary transition-colors">Shop</Link>
          {catParam !== 'all' && (
            <>
              <span>/</span>
              <span className="text-zenov-text font-semibold">{cat}</span>
            </>
          )}
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-zenov-text tracking-tight">
              {cat}
            </h1>
            <p className="text-zenov-text-secondary mt-2 text-sm">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} • Sub-30s instant delivery on eligible products
            </p>
          </div>
        </div>

        {/* Toolbar: search, sort, view */}
        <div className="mt-6 mb-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative lg:max-w-sm w-full">
            <Search className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products in results..."
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-zenov-card border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-sm text-zenov-text placeholder:text-zenov-text-muted"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zenov-text-muted hover:text-zenov-text"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zenov-card border border-zenov-border text-xs text-zenov-text-secondary">
              <SortAsc className="w-3.5 h-3.5 text-zenov-primary" />
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products by"
                className="bg-transparent text-zenov-text font-semibold outline-none cursor-pointer"
              >
                <option value="featured" className="bg-zenov-card text-zenov-text">Featured</option>
                <option value="price-asc" className="bg-zenov-card text-zenov-text">Price: Low to High</option>
                <option value="price-desc" className="bg-zenov-card text-zenov-text">Price: High to Low</option>
                <option value="rating" className="bg-zenov-card text-zenov-text">Top Rated</option>
                <option value="newest" className="bg-zenov-card text-zenov-text">New Arrivals</option>
              </select>
            </div>

            <div className="flex items-center rounded-lg bg-zenov-card border border-zenov-border p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-zenov-primary text-white shadow-xs'
                    : 'text-zenov-text-muted hover:text-zenov-text'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-zenov-primary text-white shadow-xs'
                    : 'text-zenov-text-muted hover:text-zenov-text'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="mb-6">
          <CategoryFilter
            selectedCategory={currentCat}
            onSelectCategory={(id) => setSelectedCategory(id)}
          />
        </div>

        {/* Active Filters Row */}
        {(query || instantOnly || maxPrice < 200 || currentCat !== 'all') && (
          <div className="mb-6 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-zenov-text-muted font-mono uppercase text-[10px]">Active Filters:</span>
            {currentCat !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zenov-primary-soft text-zenov-primary border border-zenov-primary-border font-bold">
                {cat}
                <button onClick={() => setSelectedCategory('all')} className="hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            )}
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zenov-surface text-zenov-text border border-zenov-border font-mono">
                &ldquo;{query}&rdquo;
                <button onClick={() => setQuery('')} className="hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            )}
            {instantOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zenov-success-soft text-zenov-success border border-zenov-success/30 font-bold">
                Instant Only
                <button onClick={() => setInstantOnly(false)} className="hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            )}
            {maxPrice < 200 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border font-mono">
                &le; ${maxPrice}
                <button onClick={() => setMaxPrice(200)} className="hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setInstantOnly(false);
                setMaxPrice(200);
              }}
              className="text-zenov-accent hover:underline font-bold text-xs ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* RESULTS GRID / LIST */}
        {productsLoading ? (
          <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-zenov-card animate-pulse border border-zenov-border/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-zenov-card border border-zenov-border p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-zenov-surface border border-zenov-border flex items-center justify-center mx-auto mb-4 text-zenov-text-muted">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zenov-text mb-2">No matching products found</h3>
            <p className="text-sm text-zenov-text-secondary mb-6">
              We couldn&apos;t find anything matching your filters. Try adjusting your query or resetting all filters.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setInstantOnly(false);
                setMaxPrice(200);
              }}
              className="px-5 py-2.5 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-primary cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {filtered.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedCurrency={selectedCurrency}
                index={idx}
              />
            ))}
          </div>
        ) : (
          /* List Mode */
          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              (
                <Link
                  key={p.id}
                  href={`/top-up/${p.id}`}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-zenov-card border border-zenov-border hover:border-zenov-primary-border transition-all duration-300 hover:shadow-lg hover:shadow-zenov-primary/5"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-zenov-accent">
                        {p.publisher || p.category}
                      </span>
                      {p.isHot && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-zenov-danger-soft text-zenov-danger border border-zenov-danger/30">
                          HOT
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-zenov-text group-hover:text-zenov-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-zenov-text-secondary line-clamp-2 mt-1">
                      {p.description}
                    </p>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zenov-border/60 flex sm:flex-col justify-between sm:justify-end items-center sm:items-end gap-1">
                    <div>
                      <span className="text-[10px] text-zenov-text-muted block">Starting from</span>
                      <span className="text-base font-black font-mono text-zenov-text">
                        ${p.denominations[0]?.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zenov-success-soft/60 text-zenov-success text-[10px] font-bold border border-zenov-success/20">
                      {p.deliveryType}
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold uppercase shadow-sm">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Top Up Now
                      </span>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-zenov-primary/30 border-t-zenov-primary rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
