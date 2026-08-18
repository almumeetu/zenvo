'use client';

import { Suspense } from 'react';

import { useMemo } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, LayoutGrid, List, SortAsc } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zenov-surface border border-zenov-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-zenov-primary-soft text-zenov-primary' : 'text-zenov-text-secondary hover:text-zenov-text'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-zenov-primary-soft text-zenov-primary' : 'text-zenov-text-secondary hover:text-zenov-text'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zenov-surface border border-zenov-border">
            <SortAsc className="w-4 h-4 text-zenov-text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent text-sm text-zenov-text outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl bg-zenov-surface/50 border border-zenov-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-zenov-text">
          <SlidersHorizontal className="w-4 h-4 text-zenov-primary" />
          <span>Filters</span>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zenov-text-muted mb-1.5 block">
              Max Price: ${maxPrice}
            </label>
            <input
              type="range"
              min={1}
              max={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-zenov-primary"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-zenov-text-secondary cursor-pointer select-none sm:ml-4">
            <input
              type="checkbox"
              checked={instantOnly}
              onChange={(e) => setInstantOnly(e.target.checked)}
              className="accent-zenov-primary w-4 h-4"
            />
            <span>Instant Delivery Only</span>
          </label>
          {(query || catParam !== 'all' || maxPrice !== 200 || instantOnly) && (
            <button
              onClick={() => {
                setQuery('');
                setMaxPrice(200);
                setInstantOnly(false);
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-zenov-card border border-zenov-border text-zenov-text-secondary hover:text-zenov-error hover:border-zenov-error/40 transition-colors"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-zenov-card border border-zenov-border animate-pulse">
              <div className="aspect-square bg-zenov-surface/60" />
              <div className="p-2 sm:p-3 space-y-2">
                <div className="h-3 bg-zenov-surface rounded-md w-3/4" />
                <div className="h-2.5 bg-zenov-surface/60 rounded-md w-1/2" />
                <div className="h-7 bg-zenov-surface/40 rounded-lg mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zenov-surface border border-zenov-border flex items-center justify-center mx-auto mb-5">
            <Search className="w-8 h-8 text-zenov-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-zenov-text mb-2">No products found</h3>
          <p className="text-zenov-text-secondary mb-6 text-sm max-w-md mx-auto">
            Try adjusting your filters or search for a different product category.
          </p>
          <Link
            href="/shop"
            onClick={() => {
              setQuery('');
              setMaxPrice(200);
              setInstantOnly(false);
              setSelectedCategory('all');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zenov-primary hover:bg-zenov-primary-hover text-white font-semibold text-sm transition-colors shadow-primary"
          >
            Reset & Browse All
          </Link>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filtered.map((p, i) => (
            viewMode === 'grid' ? (
              <ProductCard
                key={p.id}
                product={p}
                selectedCurrency={selectedCurrency}
                index={i}
              />
            ) : (
              <Link
                key={p.id}
                href={`/top-up/${p.id}`}
                className="group p-3 sm:p-4 rounded-2xl bg-zenov-card border border-zenov-border hover:border-zenov-primary-border flex flex-col sm:flex-row gap-4 transition-all active:scale-[0.995]"
              >
                <div className="relative w-full sm:w-32 h-40 sm:h-32 aspect-square sm:aspect-auto rounded-xl overflow-hidden bg-zenov-surface shrink-0">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-zenov-text-muted font-semibold">
                      {p.publisher || p.category.replace('-', ' ')}
                    </p>
                    <h3 className="text-base font-bold text-zenov-text group-hover:text-zenov-primary transition-colors line-clamp-1 mt-0.5">
                      {p.title}
                    </h3>
                    <p className="text-sm text-zenov-text-secondary line-clamp-2 mt-1.5">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags.slice(0, 4).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-zenov-surface text-[10px] font-semibold text-zenov-text-secondary border border-zenov-border">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right sm:min-w-[160px]">
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-xl font-black font-mono text-zenov-text">
                        ${p.denominations[0]?.amount || 0}
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zenov-success-soft/60 text-zenov-success text-[10px] font-bold border border-zenov-success/20">
                      {p.deliveryType}
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs font-bold uppercase shadow-sm">
                        Top Up Now
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      )}
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
