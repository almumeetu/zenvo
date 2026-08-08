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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <Newspaper className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-black font-mono tracking-tight text-white uppercase">
            PROMOTIONS & GAMING POSTS
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="blog-card group bg-[#0a0f15] border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,102,0.15)] flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-500 text-black font-mono font-black text-[10px] uppercase">
                {article.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" /> {article.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {article.readTime}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white font-mono group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 font-sans">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>READ ARTICLE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#090f16] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-56 object-cover rounded-xl border border-emerald-500/30 mb-4"
            />

            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase">
              {selectedArticle.category}
            </span>
            <h2 className="text-2xl font-black font-mono text-white mt-2">{selectedArticle.title}</h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              By {selectedArticle.author} • {selectedArticle.date}
            </p>

            <p className="text-sm text-slate-300 font-sans leading-relaxed mt-4 whitespace-pre-line border-t border-slate-800 pt-4">
              {selectedArticle.content}
            </p>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs uppercase"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
