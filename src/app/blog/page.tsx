'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function BlogPage() {
  const router = useRouter();
  const { blogArticles } = useApp();
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
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
          <Link href="/" className="hover:text-zenov-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zenov-text font-semibold">Gaming Blog &amp; Guides</span>
        </div>

        {/* Page Header (Left Aligned & High-Tech) */}
        <header className="mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10.5px] font-black uppercase tracking-widest mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Official News &amp; Guides
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase mb-2">
            Gaming Blog &amp; Guides
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Tips, redemption guides, event strategies, and VIP secret deals for every gamer in Bangladesh.
          </p>
        </header>

        {/* Featured Hero Article */}
        {featured && (
          <Link
            href={`/blog/${featured.id}`}
            className="group block mb-10 rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950/80 hover:border-cyan-400/80 shadow-xl shadow-cyan-950/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all duration-300"
          >
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-900 min-h-[220px]">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/90 pointer-events-none" />
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" /> Featured
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Top Guide
                  </span>
                </div>
              </div>
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold uppercase text-[10.5px]">
                    {featured.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                    <Calendar className="w-3 h-3 text-cyan-400" /> {featured.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-amber-400" /> {featured.readTime}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-snug group-hover:text-cyan-300 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2.5 text-xs text-slate-400">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      {featured.author.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-300 text-xs">
                      by {featured.author}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    Read Full Guide
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Toolbar (Search & Category Pills) */}
        <div className="space-y-3 mb-8">
          <div className="w-full">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/90 border border-cyan-500/30 rounded-2xl focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guides, games, topics (e.g. YouTube, Steam, Redeem)..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-xs font-bold text-slate-400 hover:text-cyan-400 shrink-0 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                  activeCat === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-xs'
                    : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-12 text-center">
            <Newspaper className="w-12 h-12 mx-auto text-slate-600 mb-4 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">No articles found</h3>
            <p className="text-xs text-slate-400 mb-5">
              Try a different search keyword or category filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setActiveCat('All');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filtered.map((a) => (
              <Link
                key={a.id}
                href={`/blog/${a.id}`}
                className="group bg-slate-950/85 border border-cyan-500/20 hover:border-cyan-400/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm">
                    {a.category}
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2.5 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" /> {a.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> {a.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {a.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors inline-flex items-center gap-1 font-bold">
                      Read Guide <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="text-slate-500 font-medium">by {a.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
