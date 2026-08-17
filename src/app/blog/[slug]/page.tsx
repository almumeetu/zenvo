'use client';

import React from 'react';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  Tag,
  ChevronLeft,
  Newspaper,
  ArrowRight,
} from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>() ?? { slug: '' };
  const router = useRouter();
  const { blogArticles } = useApp();
  const article = blogArticles.find((a) => a.id === params?.slug);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-zenov-card border border-zenov-border space-y-4 shadow-xl">
          <Newspaper className="w-12 h-12 text-zenov-primary mx-auto opacity-80 animate-pulse" />
          <h2 className="text-xl font-black text-zenov-text uppercase tracking-tight">Article Not Found</h2>
          <p className="text-xs text-zenov-text-secondary leading-relaxed">
            The blog article or review guide you are looking for does not exist or has been archived.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenov-primary text-slate-950 font-black text-xs uppercase tracking-wide hover:bg-zenov-primary-hover transition-all active:scale-95 shadow-md shadow-zenov-primary/20"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6">
        <Link href="/" className="hover:text-zenov-primary transition-colors">
          Home
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link href="/blog" className="hover:text-zenov-primary transition-colors">
          Blog
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-zenov-text-secondary line-clamp-1">{article.title}</span>
      </nav>

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zenov-text-secondary hover:text-zenov-primary transition-colors mb-5 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all articles
      </Link>

      {/* Hero */}
      <header className="mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="px-3 py-1 rounded-md bg-zenov-primary-soft border border-zenov-primary-border text-zenov-primary text-[11px] font-bold uppercase tracking-wide">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zenov-text-muted">
            <Calendar className="w-3.5 h-3.5 text-zenov-primary" /> {article.date}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zenov-text-muted">
            <Clock className="w-3.5 h-3.5 text-zenov-accent" /> {article.readTime}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zenov-text leading-tight mb-5 max-w-4xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zenov-primary to-zenov-accent flex items-center justify-center text-white font-bold text-sm">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-zenov-text">{article.author}</div>
              <div className="text-xs text-zenov-text-muted">Senior Gaming Editor</div>
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
                className="w-9 h-9 rounded-lg bg-zenov-card border border-zenov-border hover:border-zenov-primary-border hover:text-zenov-primary text-zenov-text-secondary transition-all flex items-center justify-center active:scale-95"
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-zenov-card border border-zenov-border mb-8 sm:mb-10">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <article className="lg:col-span-2 max-w-none">
          <p className="text-lg sm:text-xl text-zenov-text leading-relaxed font-medium mb-6">
            {article.excerpt}
          </p>

          <div className="prose prose-invert max-w-none text-sm sm:text-[15px] text-zenov-text-secondary leading-relaxed space-y-5">
            {article.content.split('\n').map((p, i) =>
              p.trim() ? (
                <p key={i} className="first:mt-0">
                  {p.trim()}
                </p>
              ) : null
            )}

            <div className="my-8 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-zenov-primary/10 to-zenov-accent/10 border border-zenov-primary-border/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-zenov-primary-soft border border-zenov-primary-border flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-zenov-primary" />
                </div>
                <div>
                  <h4 className="text-base font-black text-zenov-text mb-1.5">
                    Why Choose ZENOV for Your Top-Ups?
                  </h4>
                  <ul className="space-y-1.5 text-sm text-zenov-text-secondary">
                    <li>✅ 100% authorized official reseller — zero ban risk</li>
                    <li>⚡ Sub-30-second automated delivery 24/7/365</li>
                    <li>💰 Up to +30% in bonus credit on every recharge</li>
                    <li>🔒 Full SSL encryption + PCI-DSS compliant payments</li>
                  </ul>
                </div>
              </div>
            </div>

            <p>
              Thank you for reading! If you found this guide helpful, share it with your squad
              and follow ZENOV on social media for more promo codes and bonus events. See you
              in the game. 🎮
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zenov-surface border border-zenov-border text-xs font-medium text-zenov-text-secondary hover:border-zenov-primary-border hover:text-zenov-primary transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3" /> #{t}
              </span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl p-5 bg-zenov-card border border-zenov-border">
            <h4 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4 pl-2.5 border-l-2 border-zenov-accent">
              Related Articles
            </h4>
            <div className="space-y-3.5">
              {related.length === 0 ? (
                <p className="text-xs text-zenov-text-muted">No related posts yet.</p>
              ) : (
                related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.id}`}
                    className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-zenov-surface transition-colors"
                  >
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase text-zenov-primary tracking-wide">
                        {r.category}
                      </span>
                      <h5 className="text-xs font-semibold text-zenov-text group-hover:text-zenov-primary transition-colors line-clamp-2 leading-snug mt-0.5">
                        {r.title}
                      </h5>
                      <span className="text-[10px] text-zenov-text-muted mt-1 inline-flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> {r.date}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link
            href="/shop?cat=top-up"
            className="block rounded-2xl p-6 bg-gradient-to-br from-zenov-primary via-blue-600 to-zenov-accent text-white shadow-lg shadow-zenov-primary/20 hover:brightness-110 transition-all active:scale-[0.99]"
          >
            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">
              ⚡ Featured Top-Up
            </div>
            <h4 className="text-xl font-black tracking-tight mb-1.5 leading-tight">
              Up to +30% Bonus On Free Fire Diamonds
            </h4>
            <p className="text-sm opacity-90 mb-4">
              Instant UID delivery in under 30 seconds, 24/7 automated.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold">
              Recharge Now <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
