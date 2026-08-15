'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { HeroBanner } from '@/components/HeroBanner';
import { NewArrivalMarquee } from '@/components/NewArrivalMarquee';
import { ProductGrid } from '@/components/ProductGrid';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { PromotionsBlog } from '@/components/PromotionsBlog';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gift } from 'lucide-react';
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
    selectedCurrency,
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
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative">
        <HeroBanner
          banners={heroBanners}
          selectedCurrency={selectedCurrency}
          onSelectGame={onSelectProductForTopUp}
        />
      </section>

      {/* LIVE MARQUEE */}
      <section className="border-y border-zenvo-border bg-zenvo-surface/30">
        <NewArrivalMarquee />
      </section>

      {/* SHOP SECTION HEADER */}
      <section id="shop-products" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zenvo-primary-soft border border-zenvo-primary-border text-zenvo-primary text-[10px] font-black uppercase tracking-widest">
            <Gift className="w-3.5 h-3.5" /> OFFICIAL DIGITAL GIFT CARDS
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zenvo-text tracking-tight uppercase">
          PREPAID GIFT CARDS CATALOG
        </h2>
        <p className="text-xs text-zenvo-text-secondary mt-1 max-w-xl leading-relaxed">
          Purchase and receive genuine gaming gift codes instantly via automated email dispatch. Multiple secure local payment gateways supported.
        </p>
      </section>

      {/* PRODUCT GRID */}
      <ProductGrid
        products={products}
        selectedCategory={selectedCategory}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
      />

      {/* WHY CHOOSE US */}
      <section id="why-choose-us" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <WhyChooseUs />
      </section>

      {/* PROMOTIONS BLOG */}
      <section id="promotions-blog" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div ref={blogHeaderRef} className="flex flex-col mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-zenvo-text tracking-tight uppercase">
            Gaming Guides & Reviews
          </h2>
          <p className="text-sm text-zenvo-text-secondary mt-2">
            Read expert redeem guides, game reviews, and wallet balance tips
          </p>
        </div>
        <PromotionsBlog articles={blogArticles.slice(0, 3)} />
      </section>
    </div>
  );
}
