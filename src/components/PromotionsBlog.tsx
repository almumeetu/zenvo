import React, { useState, useEffect, useRef } from 'react';
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
    <section ref={sectionRef} className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="blog-header flex items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zenov-accent-soft border border-zenov-accent-border flex items-center justify-center">
            <Newspaper className="w-[18px] h-[18px] text-zenov-accent" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-zenov-text uppercase">
              Promotions & Gaming Guides
            </h2>
            <p className="text-xs sm:text-sm text-zenov-text-secondary mt-1">
              Tips, tricks, and exclusive bonus offers for every gamer
            </p>
          </div>
        </div>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zenov-text-secondary hover:text-zenov-primary transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {articles.map((article) => (
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="blog-card group bg-zenov-card border border-zenov-border hover:border-zenov-border-hover rounded-xl overflow-hidden cursor-pointer transition-all duration-250 shadow-sm hover:shadow-md flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-zenov-surface">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zenov-card/85 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zenov-primary text-white text-[10px] font-bold uppercase tracking-wide">
                {article.category}
              </span>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 text-[11px] text-zenov-text-muted mb-2.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zenov-primary" /> {article.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zenov-accent" /> {article.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zenov-text group-hover:text-zenov-primary transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-zenov-text-secondary line-clamp-2 mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-zenov-border flex items-center justify-between text-xs font-semibold">
                <span className="text-zenov-primary group-hover:text-zenov-primary-hover transition-colors inline-flex items-center gap-1">
                  Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-zenov-text-muted font-medium">by {article.author}</span>
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
    </section>
  );
};
