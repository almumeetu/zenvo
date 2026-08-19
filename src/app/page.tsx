'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { HeroBanner } from '@/components/HeroBanner';
import { NewArrivalMarquee } from '@/components/NewArrivalMarquee';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { PromotionsBlog } from '@/components/PromotionsBlog';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const {
    products,
    heroBanners,
    blogArticles,
    selectedCategory,
    setSelectedCategory,
    selectedCurrency,
    productsLoading,
  } = useApp();
  const router = useRouter();
  const blogHeaderRef = useRef<HTMLDivElement>(null);

  const onSelectProductForTopUp = (productId: string) => {
    router.push(`/top-up/${productId}`);
  };

  const onSelectProduct = (product: any) => {
    router.push(`/top-up/${product.id}`);
  };

  // GSAP: Blog section header
  useEffect(() => {
    if (!blogHeaderRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        blogHeaderRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: blogHeaderRef.current,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, blogHeaderRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── VIBRANT MULTI-COLOR GAMING LIGHTING BACKGROUND SYSTEM (LOGO-STYLE SPECTRUM) ── */}
      {/* Aurora 1: Electric Cyan & Sky Blue (Hero Top-Left Aura) */}
      <div className="absolute -top-10 left-1/4 -translate-x-1/2 w-[700px] h-[480px] bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-transparent blur-[120px] pointer-events-none rounded-full animate-aurora-slow" />

      {/* Aurora 2: Warm Amber & Gold Neon Glow (Highlights & Trending Mid-Right) */}
      <div className="absolute top-[480px] -right-20 w-[600px] h-[520px] bg-gradient-to-bl from-amber-500/20 via-orange-500/15 to-transparent blur-[130px] pointer-events-none rounded-full animate-pulse" />

      {/* Aurora 3: Cyber Violet & Magenta Pulse (Middle Sections Mid-Left) */}
      <div className="absolute top-[1100px] -left-28 w-[650px] h-[550px] bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Aurora 4: Electric Cyan & Emerald Radiance (Why Choose Us & Blog Bottom Area) */}
      <div className="absolute top-[1800px] right-1/4 w-[700px] h-[500px] bg-gradient-to-tl from-cyan-400/20 via-emerald-500/15 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Aurora 5: Deep Electric Blue Gaming Floor */}
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-blue-600/15 via-indigo-600/10 to-transparent blur-[130px] pointer-events-none rounded-full" />

      {/* High-Tech Cyber Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />
      {/* Subtle Micro Hex Mesh */}
      <div className="absolute inset-0 cyber-grid-mesh opacity-40 pointer-events-none" />

      {/* HERO */}
      <section className="relative z-10">
        <HeroBanner
          banners={heroBanners}
          selectedCurrency={selectedCurrency}
          onSelectGame={onSelectProductForTopUp}
        />
      </section>

      {/* LIVE MARQUEE WITH NEON GRADIENT ACCENT */}
      <section className="relative z-10 border-y border-cyan-500/20 bg-gradient-to-r from-blue-950/40 via-zenov-surface/70 to-amber-950/30 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.08)]">
        <NewArrivalMarquee />
      </section>

      {/* CATEGORY FILTER */}
      <section id="shop-categories" className="relative z-10">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* PRODUCT GRID (HIGHLIGHTS FIRST) */}
      <div className="relative z-10">
        <ProductGrid
          products={products}
          selectedCategory={selectedCategory}
          selectedCurrency={selectedCurrency}
          onSelectProduct={onSelectProduct}
          loading={productsLoading}
        />
      </div>

      {/* WHY CHOOSE US */}
      <section id="why-choose-us" className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <WhyChooseUs />
      </section>

      {/* PROMOTIONS BLOG */}
      <section id="promotions-blog" className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div ref={blogHeaderRef} className="flex flex-col mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-black uppercase tracking-[0.18em] w-fit mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Official Guides
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zenov-text tracking-tight uppercase">
            Gaming Guides & Reviews
          </h2>
          <p className="text-sm text-zenov-text-secondary mt-2">
            Read expert redeem guides, game reviews, and wallet balance tips
          </p>
        </div>
        <PromotionsBlog articles={blogArticles.slice(0, 3)} />
      </section>
    </div>
  );
}

