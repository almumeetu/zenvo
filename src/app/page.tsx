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
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[700px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      {/* HERO */}
      <section className="relative z-10">
        <HeroBanner
          banners={heroBanners}
          selectedCurrency={selectedCurrency}
          onSelectGame={onSelectProductForTopUp}
        />
      </section>

      {/* LIVE MARQUEE WITH NEON ACCENT */}
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

      {/* PROMOTIONS & GUIDES */}
      <section id="promotions-blog" className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <PromotionsBlog articles={blogArticles.slice(0, 3)} />
      </section>
    </div>
  );
}

