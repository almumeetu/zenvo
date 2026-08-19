import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlogArticle } from '../types';
import { Newspaper, Calendar, Clock, ArrowRight, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PromotionsBlogProps {
  articles: BlogArticle[];
}

export const PromotionsBlog: React.FC<PromotionsBlogProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.blog-card');
    const header = sectionRef.current.querySelector('.blog-header');
    const ctx = gsap.context(() => {
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 88%',
            },
          }
        );
      }
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="w-full">
      <div className="blog-header flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10.5px] font-black uppercase tracking-widest mb-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Official Guides &amp; News
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
            Gaming Guides &amp; Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tips, tricks, and expert redeem guides for every gamer
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors w-fit group"
        >
          <span>View all guides</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="blog-card group bg-slate-950/85 border border-cyan-500/20 hover:border-cyan-400/70 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-1 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm">
                {article.category}
              </span>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2.5 font-mono">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" /> {article.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> {article.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors inline-flex items-center gap-1 font-bold">
                  Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-slate-500 font-medium">by {article.author}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenov-bg/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-zenov-card border border-zenov-border rounded-2xl shadow-xl overflow-hidden my-8 text-zenov-text max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-zenov-bg/80 backdrop-blur border border-zenov-border text-zenov-text-secondary hover:text-zenov-text hover:border-zenov-border-hover transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/9] overflow-hidden bg-zenov-surface">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zenov-card via-zenov-card/30 to-transparent pointer-events-none" />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-zenov-primary-soft border border-zenov-primary-border text-zenov-primary text-[11px] font-bold uppercase">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-zenov-text-muted">
                  By {selectedArticle.author} • {selectedArticle.date} • {selectedArticle.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zenov-text leading-tight mb-4">
                {selectedArticle.title}
              </h2>

              <div className="space-y-3.5 text-sm text-zenov-text-secondary leading-relaxed border-t border-zenov-border pt-5">
                {selectedArticle.content.split('\n').map((p, i) =>
                  p.trim() ? (
                    <p key={i}>{p.trim()}</p>
                  ) : null
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {selectedArticle.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-secondary text-[11px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 rounded-lg bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
