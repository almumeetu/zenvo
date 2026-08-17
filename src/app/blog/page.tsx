'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';

export default function BlogPage() {
  const router = useRouter();
  const { blogArticles, selectedCurrency } = useApp();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogArticles.forEach((a) => set.add(a.category));
    return ['All', ...Array.from(set)];
  }, [blogArticles]);

  const filtered = useMemo(() => {
    return blogArticles.filter((a) => {
      const matchesCat = activeCat === 'All' || a.category === activeCat;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [blogArticles, activeCat, search]);

  const featured = blogArticles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6">
        <Link href="/" className="hover:text-zenov-primary transition-colors">
          Home
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-zenov-text-secondary">Blog & Gaming Guides</span>
      </nav>

      <header className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-zenov-accent-soft border border-zenov-accent-border flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-zenov-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zenov-text uppercase">
              Gaming Blog & Guides
            </h1>
            <p className="text-sm text-zenov-text-secondary mt-1">
              Tips, event breakdowns, bonus strategies, and safety guides for every top-up
            </p>
          </div>
        </div>
      </header>

      {/* Featured hero */}
      {featured && (
        <Link
          href={`/blog/${featured.id}`}
          className="group block mb-10 rounded-2xl overflow-hidden border border-zenov-border bg-zenov-card hover:border-zenov-primary-border transition-all duration-300 active:scale-[0.995]"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-zenov-surface">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zenov-card/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-zenov-primary text-white text-[11px] font-bold uppercase tracking-wide">
                  Featured
                </span>
                <span className="px-3 py-1 rounded-md bg-zenov-accent text-zenov-bg text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Editor&apos;s Pick
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-5">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-zenov-primary-soft border border-zenov-primary-border text-zenov-primary font-bold uppercase">
                  {featured.category}
                </span>
                <span className="inline-flex items-center gap-1 text-zenov-text-muted">
                  <Calendar className="w-3.5 h-3.5 text-zenov-primary" /> {featured.date}
                </span>
                <span className="inline-flex items-center gap-1 text-zenov-text-muted">
                  <Clock className="w-3.5 h-3.5 text-zenov-accent" /> {featured.readTime}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-zenov-text leading-tight group-hover:text-zenov-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm sm:text-base text-zenov-text-secondary leading-relaxed">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2 text-xs text-zenov-text-muted">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zenov-primary to-zenov-accent flex items-center justify-center text-white font-bold text-[11px]">
                    {featured.author.charAt(0)}
                  </div>
                  <span className="font-medium text-zenov-text-secondary">
                    {featured.author}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-zenov-primary group-hover:translate-x-0.5 transition-transform">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-7">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenov-card border border-zenov-border focus-within:border-zenov-primary-border transition-colors">
          <Search className="w-[18px] h-[18px] text-zenov-text-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides, tags, events..."
            className="w-full min-w-0 bg-transparent text-sm text-zenov-text placeholder:text-zenov-text-muted focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all active:scale-95 ${
                activeCat === cat
                  ? 'bg-zenov-primary text-white shadow-lg shadow-zenov-primary/20'
                  : 'bg-zenov-card border border-zenov-border text-zenov-text-secondary hover:text-zenov-text hover:border-zenov-border-hover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zenov-border bg-zenov-card/50 p-12 text-center">
          <Newspaper className="w-12 h-12 mx-auto text-zenov-text-muted mb-4 opacity-60" />
          <h3 className="text-lg font-bold text-zenov-text mb-2">No articles found</h3>
          <p className="text-sm text-zenov-text-secondary mb-5">
            Try a different search or category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveCat('All');
            }}
            className="px-5 py-2.5 rounded-lg bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg text-xs font-bold uppercase tracking-wide transition-colors active:scale-95"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/blog/${a.id}`}
              className="group bg-zenov-card border border-zenov-border hover:border-zenov-border-hover rounded-xl overflow-hidden transition-all duration-250 hover:shadow-md flex flex-col active:scale-[0.99]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zenov-surface">
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zenov-card/85 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zenov-primary text-white text-[10px] font-bold uppercase tracking-wide">
                  {a.category}
                </span>
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-zenov-text-muted mb-2.5">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zenov-primary" /> {a.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zenov-accent" /> {a.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zenov-text group-hover:text-zenov-primary transition-colors line-clamp-2 leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-xs text-zenov-text-secondary line-clamp-2 mt-2 leading-relaxed">
                    {a.excerpt}
                  </p>
                </div>
                <div className="pt-3 border-t border-zenov-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {a.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-zenov-surface text-[10px] font-medium text-zenov-text-muted"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-zenov-primary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Newsletter */}
      <section className="mt-14 rounded-2xl p-6 sm:p-10 bg-gradient-to-br from-zenov-primary/15 via-zenov-accent/10 to-zenov-bg border border-zenov-primary-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl font-black text-zenov-text tracking-tight mb-2">
            Get Drop Alerts & Bonus Codes
          </h3>
          <p className="text-sm text-zenov-text-secondary mb-6">
            Join 50,000+ gamers receiving exclusive giveaways and top-up bonuses weekly.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks for subscribing! Check your inbox for a welcome bonus.');
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-zenov-card border border-zenov-border text-sm text-zenov-text placeholder:text-zenov-text-muted focus:outline-none focus:border-zenov-primary-border"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-zenov-primary to-zenov-accent text-white text-sm font-bold uppercase tracking-wide shadow-lg shadow-zenov-accent/20 hover:brightness-110 transition-all active:scale-95"
            >
              Subscribe Free
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
