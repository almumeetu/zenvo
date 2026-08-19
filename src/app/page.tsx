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
      {/* ── VIBRANT CYBER GAMING LIGHTING BACKGROUNDS ── */}
      {/* Spot 1: Neon Cyan & Electric Blue Hero Aura */}
      <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Spot 2: Warm Amber & Gold Trending Aura */}
      <div className="absolute top-[520px] right-[-100px] w-[500px] h-[450px] bg-gradient-to-bl from-amber-500/15 via-orange-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Spot 3: Neon Purple & Cyan Category Aura */}
      <div className="absolute top-[1200px] left-[-80px] w-[550px] h-[500px] bg-gradient-to-tr from-purple-600/15 via-cyan-500/10 to-transparent blur-[150px] pointer-events-none rounded-full" />

      {/* Spot 4: Electric Blue & Emerald Bottom Aura */}
      <div className="absolute bottom-32 right-1/4 w-[600px] h-[400px] bg-gradient-to-tl from-emerald-500/10 via-cyan-600/10 to-transparent blur-[150px] pointer-events-none rounded-full" />

      {/* High-Tech Cyber Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* HERO */}
      <section className="relative z-10">
        <HeroBanner
          banners={heroBanners}
          selectedCurrency={selectedCurrency}
          onSelectGame={onSelectProductForTopUp}
        />
      </section>

      {/* LIVE MARQUEE */}
      <section className="relative z-10 border-y border-zenov-border/70 bg-zenov-surface/40 backdrop-blur-sm">
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

