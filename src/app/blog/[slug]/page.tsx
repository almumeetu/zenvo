'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  Tag,
  ChevronRight,
  Newspaper,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>() ?? { slug: '' };
  const { blogArticles } = useApp();
  const article = blogArticles.find(
    (a) => a.slug === params?.slug || a.id === params?.slug
  );

  if (!article) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[60vh] bg-zenov-bg px-4 py-16 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-950/90 border border-white/10 space-y-4 shadow-2xl">
          <Newspaper className="w-12 h-12 text-cyan-400 mx-auto opacity-80 animate-pulse" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Article Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The blog article or review guide you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wide shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog Articles
          </Link>
        </div>
      </div>
    );
  }

  const related = blogArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

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
          <Link href="/blog" className="hover:text-zenov-primary transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zenov-text font-semibold line-clamp-1">{article.title}</span>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-5 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>

        {/* Hero Header */}
        <header className="mb-8 sm:mb-10 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10.5px] font-bold uppercase tracking-wide">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {article.date}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {article.readTime}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-5 max-w-4xl">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{article.author}</div>
                <div className="text-xs text-slate-400">Senior Gaming Editor</div>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              {[
                { Icon: Heart, label: 'Like' },
                { Icon: Bookmark, label: 'Save' },
                { Icon: Share2, label: 'Share' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  title={label}
                  className="w-9 h-9 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 hover:text-cyan-400 text-slate-400 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-[21/9] bg-slate-950 border border-cyan-500/20 mb-8 sm:mb-10 shadow-xl shadow-cyan-950/20">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <article className="lg:col-span-2 max-w-none text-left">
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium mb-6 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
              {article.excerpt}
            </p>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
              {article.content.split('\n').map((p, i) =>
                p.trim() ? (
                  <p key={i} className="first:mt-0">
                    {p.trim()}
                  </p>
                ) : null
              )}

              {/* Trust Box */}
              <div className="my-8 rounded-2xl p-6 sm:p-7 bg-slate-950/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/30">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                      Why Gamers Trust ZENOV Games?
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                      <li>⚡ Sub-30-second automated instant code dispatch</li>
                      <li>🛡️ 100% genuine codes sourced directly from verified publishers</li>
                      <li>💳 Seamless payment via bKash, Nagad, Rocket, Bank &amp; Crypto</li>
                      <li>💬 24/7 dedicated WhatsApp support squad in Bangladesh</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                Thank you for reading! Share this guide with your gaming squad and stay tuned for exclusive drops and bonus codes.
              </p>
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t border-white/5">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-xs font-semibold text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Tag className="w-3 h-3 text-cyan-400" /> #{t}
                </span>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl p-5 bg-slate-950/85 border border-white/10 shadow-md">
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 pl-2.5 border-l-2 border-amber-400">
                Related Articles
              </h4>
              <div className="space-y-3">
                {related.length === 0 ? (
                  <p className="text-xs text-slate-500">No related posts yet.</p>
                ) : (
                  related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/blog/${r.slug || r.id}`}
                      className="group flex gap-3 p-2 rounded-xl hover:bg-slate-900/80 transition-colors"
                    >
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/5"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9.5px] font-bold uppercase text-cyan-400 tracking-wide font-mono">
                          {r.category}
                        </span>
                        <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mt-0.5">
                          {r.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 mt-1 inline-flex items-center gap-1 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-cyan-400" /> {r.date}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quick Recharge CTA Promo Card */}
            <Link
              href="/shop"
              className="block rounded-2xl p-6 bg-gradient-to-br from-blue-900/40 via-cyan-950/40 to-slate-950 border border-cyan-500/40 text-white shadow-xl shadow-cyan-950/40 hover:border-cyan-400 transition-all active:scale-[0.99] group"
            >
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-3">
                <Zap className="w-3 h-3" /> Instant Top-Up
              </div>
              <h4 className="text-base font-black tracking-tight mb-1.5 leading-snug text-white group-hover:text-cyan-300 transition-colors">
                Instant Game Top-Ups &amp; Gift Cards
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Enjoy 100% genuine codes delivered directly in seconds with bKash &amp; Nagad.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                Explore Store <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
