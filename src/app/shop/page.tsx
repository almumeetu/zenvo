'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  SortAsc,
  ShoppingBag,
  Zap,
  Package,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { CategoryType, Product } from '@/types';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
type ProductTypeFilter = 'all' | 'digital' | 'physical';

function getProductPrice(p: Product): number {
  if (p.denominations && p.denominations.length > 0) {
    const valid = p.denominations.map((d) => Number(d.amount) || 0).filter((amt) => amt > 0);
    if (valid.length > 0) return Math.min(...valid);
  }
  return Number((p as any).salePrice) || Number((p as any).price) || 0;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const catParam = searchParams.get('cat') || 'all';
  const qParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as ProductTypeFilter;

  const {
    products,
    categories,
    selectedCurrency,
    selectedCategory,
    setSelectedCategory,
    productsLoading,
  } = useApp();

  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState<SortKey>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productType, setProductType] = useState<ProductTypeFilter>(typeParam);
  const [instantOnly, setInstantOnly] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    if (typeParam) {
      setProductType(typeParam);
    }
  }, [typeParam]);

  useEffect(() => {
    if (catParam && catParam !== selectedCategory) {
      setSelectedCategory(catParam as any);
    }
  }, [catParam]);

  // Current active category slug
  const activeCategorySlug = catParam !== 'all' ? catParam : selectedCategory;

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId as any);
    const params = new URLSearchParams(searchParams.toString());
    if (catId === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', catId);
    }
    const newQuery = params.toString();
    router.push(newQuery ? `/shop?${newQuery}` : '/shop');
  };

  const handleClearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const newQuery = params.toString();
    router.push(newQuery ? `/shop?${newQuery}` : '/shop');
  };

  const handleResetAll = () => {
    setQuery('');
    setSelectedCategory('all');
    setProductType('all');
    setInstantOnly(false);
    setSort('featured');
    router.push('/shop');
  };

  // Find matched category title
  const matchedCategory = (categories || []).find(
    (c) => c && (c.slug === activeCategorySlug || c.id === activeCategorySlug)
  );
  const categoryTitle =
    activeCategorySlug === 'all'
      ? 'All Products'
      : matchedCategory?.name || activeCategorySlug.replace(/-/g, ' ');

  // Dynamic filter pipeline
  const filtered = useMemo(() => {
    let list = products || [];

    // 1. Category Filter
    if (activeCategorySlug !== 'all') {
      list = list.filter((p) => {
        if (!p) return false;
        return (
          p.category === activeCategorySlug ||
          p.categoryId === activeCategorySlug ||
          (matchedCategory &&
            (p.category === matchedCategory.slug ||
              p.category === matchedCategory.id ||
              p.categoryId === matchedCategory.id)) ||
          (p as any).categorySlug === activeCategorySlug
        );
      });
    }

    // 2. Product Type Filter (Digital vs Physical)
    if (productType === 'digital') {
      list = list.filter((p) => p && p.productType !== 'physical');
    } else if (productType === 'physical') {
      list = list.filter((p) => p && p.productType === 'physical');
    }

    // 3. Search Filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        if (!p) return false;
        return (
          p.title?.toLowerCase().includes(q) ||
          p.publisher?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      });
    }

    // 4. Delivery filter
    if (instantOnly) {
      list = list.filter((p) => p && p.deliveryType === 'Instant');
    }

    // 5. Sorting
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case 'rating':
        list = [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'newest':
        list = [...list].sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        break;
      case 'featured':
      default:
        list = [...list].sort((a, b) => {
          const scoreA = (a.isHot ? 3 : 0) + (a.isNew ? 2 : 0) + ((a as any).bestseller ? 2 : 0);
          const scoreB = (b.isHot ? 3 : 0) + (b.isNew ? 2 : 0) + ((b as any).bestseller ? 2 : 0);
          return scoreB - scoreA;
        });
        break;
    }

    return list;
  }, [products, activeCategorySlug, matchedCategory, productType, query, instantOnly, sort]);

  const hasActiveFilters =
    query.trim() !== '' ||
    instantOnly ||
    productType !== 'all' ||
    activeCategorySlug !== 'all';

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg min-h-screen">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-4 flex-wrap">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" onClick={handleResetAll} className="hover:text-cyan-400 transition-colors">Shop</Link>
          {activeCategorySlug !== 'all' && (
            <>
              <span>/</span>
              <span className="text-white font-semibold">{categoryTitle}</span>
            </>
          )}
        </div>

        {/* Page Title & Counters */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight capitalize">
            {categoryTitle}
          </h1>
          <p className="text-slate-400 mt-1.5 text-xs sm:text-sm">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} • Instant automated delivery on eligible products
          </p>
        </div>

        {/* Toolbar: Search, Delivery Filter, Sort & View Mode */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products in results..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-xs sm:text-sm text-white placeholder:text-slate-500 shadow-sm"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls Right */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Instant Delivery Toggle */}
            <button
              onClick={() => setInstantOnly(!instantOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                instantOnly
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <SortAsc className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products by"
                className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
              >
                <option value="featured" className="bg-slate-900 text-white">Featured</option>
                <option value="price-asc" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="rating" className="bg-slate-900 text-white">Top Rated</option>
                <option value="newest" className="bg-slate-900 text-white">Newest Arrivals</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-800 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Tabs Single-Line Auto-Play Slider */}
        <div className="mb-6 w-full">
          <CategoryFilter
            selectedCategory={activeCategorySlug}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" /> Filters:
            </span>

            {activeCategorySlug !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
                Category: {categoryTitle}
                <button
                  onClick={() => handleSelectCategory('all')}
                  className="hover:text-white transition-colors"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {productType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold capitalize">
                Type: {productType}
                <button
                  onClick={() => setProductType('all')}
                  className="hover:text-white transition-colors"
                  aria-label="Remove product type filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {query.trim() && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                &ldquo;{query}&rdquo;
                <button
                  onClick={handleClearSearch}
                  className="hover:text-white transition-colors"
                  aria-label="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {instantOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                Instant Delivery Only
                <button
                  onClick={() => setInstantOnly(false)}
                  className="hover:text-white transition-colors"
                  aria-label="Remove instant delivery filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetAll}
              className="text-cyan-400 hover:text-cyan-300 font-bold text-xs underline ml-2 cursor-pointer transition-colors"
            >
              Reset All
            </button>
          </div>
        )}

        {/* RESULTS: Grid or List */}
        {productsLoading ? (
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800/80" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/60 border border-slate-800 p-8 max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">No matching products found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              We couldn&apos;t find anything matching your filters. Try clearing some filters or searching for something else.
            </p>
            <button
              onClick={handleResetAll}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {filtered.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                selectedCurrency={selectedCurrency}
                index={idx}
              />
            ))}
          </div>
        ) : (
          /* List View Mode */
          <div className="flex flex-col gap-3">
            {filtered.map((p) => {
              const price = getProductPrice(p);
              return (
                <Link
                  key={p.id}
                  href={`/top-up/${p.id}`}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-800">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                        {p.publisher || p.category}
                      </span>
                      {p.isHot && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          HOT
                        </span>
                      )}
                      {p.productType === 'physical' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          GEAR
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {p.description}
                    </p>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex sm:flex-col justify-between sm:justify-end items-center sm:items-end gap-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Starting from</span>
                      <span className="text-base font-black font-mono text-white">
                        ${price.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {p.deliveryType || 'Instant Delivery'}
                    </div>
                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold uppercase shadow-sm">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Select
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
