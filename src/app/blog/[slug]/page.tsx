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
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { blogArticles } = useApp();
  const article = blogArticles.find((a) => a.id === params.slug);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-zenvo-card border border-zenvo-border space-y-4 shadow-xl">
          <Newspaper className="w-12 h-12 text-zenvo-primary mx-auto opacity-80 animate-pulse" />
          <h2 className="text-xl font-black text-zenvo-text uppercase tracking-tight">Article Not Found</h2>
          <p className="text-xs text-zenvo-text-secondary leading-relaxed">
            The blog article or review guide you are looking for does not exist or has been archived.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenvo-primary text-slate-950 font-black text-xs uppercase tracking-wide hover:bg-zenvo-primary-hover transition-all active:scale-95 shadow-md shadow-zenvo-primary/20"
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
      <nav className="flex items-center gap-2 text-xs text-zenvo-text-muted mb-6">
        <Link href="/" className="hover:text-zenvo-primary transition-colors">
          Home
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link href="/blog" className="hover:text-zenvo-primary transition-colors">
          Blog
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-zenvo-text-secondary line-clamp-1">{article.title}</span>
      </nav>

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zenvo-text-secondary hover:text-zenvo-primary transition-colors mb-5 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all articles
      </Link>

      {/* Hero */}
      <header className="mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="px-3 py-1 rounded-md bg-zenvo-primary-soft border border-zenvo-primary-border text-zenvo-primary text-[11px] font-bold uppercase tracking-wide">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zenvo-text-muted">
            <Calendar className="w-3.5 h-3.5 text-zenvo-primary" /> {article.date}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zenvo-text-muted">
            <Clock className="w-3.5 h-3.5 text-zenvo-accent" /> {article.readTime}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zenvo-text leading-tight mb-5 max-w-4xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zenvo-primary to-zenvo-accent flex items-center justify-center text-white font-bold text-sm">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-zenvo-text">{article.author}</div>
              <div className="text-xs text-zenvo-text-muted">Senior Gaming Editor</div>
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
                className="w-9 h-9 rounded-lg bg-zenvo-card border border-zenvo-border hover:border-zenvo-primary-border hover:text-zenvo-primary text-zenvo-text-secondary transition-all flex items-center justify-center active:scale-95"
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-zenvo-card border border-zenvo-border mb-8 sm:mb-10">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <article className="lg:col-span-2 max-w-none">
          <p className="text-lg sm:text-xl text-zenvo-text leading-relaxed font-medium mb-6">
            {article.excerpt}
          </p>

          <div className="prose prose-invert max-w-none text-sm sm:text-[15px] text-zenvo-text-secondary leading-relaxed space-y-5">
            {article.content.split('\n').map((p, i) =>
              p.trim() ? (
                <p key={i} className="first:mt-0">
                  {p.trim()}
                </p>
              ) : null
            )}

            <div className="my-8 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-zenvo-primary/10 to-zenvo-accent/10 border border-zenvo-primary-border/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-zenvo-primary-soft border border-zenvo-primary-border flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-zenvo-primary" />
                </div>
                <div>
                  <h4 className="text-base font-black text-zenvo-text mb-1.5">
                    Why Choose ZENVO for Your Top-Ups?
                  </h4>
                  <ul className="space-y-1.5 text-sm text-zenvo-text-secondary">
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
              and follow ZENVO on social media for more promo codes and bonus events. See you
              in the game. 🎮
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zenvo-surface border border-zenvo-border text-xs font-medium text-zenvo-text-secondary hover:border-zenvo-primary-border hover:text-zenvo-primary transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3" /> #{t}
              </span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl p-5 bg-zenvo-card border border-zenvo-border">
            <h4 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4 pl-2.5 border-l-2 border-zenvo-accent">
              Related Articles
            </h4>
            <div className="space-y-3.5">
              {related.length === 0 ? (
                <p className="text-xs text-zenvo-text-muted">No related posts yet.</p>
              ) : (
                related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.id}`}
                    className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-zenvo-surface transition-colors"
                  >
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase text-zenvo-primary tracking-wide">
                        {r.category}
                      </span>
                      <h5 className="text-xs font-semibold text-zenvo-text group-hover:text-zenvo-primary transition-colors line-clamp-2 leading-snug mt-0.5">
                        {r.title}
                      </h5>
                      <span className="text-[10px] text-zenvo-text-muted mt-1 inline-flex items-center gap-1">
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
            className="block rounded-2xl p-6 bg-gradient-to-br from-zenvo-primary via-blue-600 to-zenvo-accent text-white shadow-lg shadow-zenvo-primary/20 hover:brightness-110 transition-all active:scale-[0.99]"
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
