'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { HeroBanner } from '@/components/HeroBanner';
import { NewArrivalMarquee } from '@/components/NewArrivalMarquee';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { PromotionsBlog } from '@/components/PromotionsBlog';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Gamepad2, Gift, Smartphone, Crown, Flame, Zap } from 'lucide-react';
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
  } = useApp();
  const router = useRouter();
  const tilesRef = useRef<HTMLDivElement>(null);
  const blogHeaderRef = useRef<HTMLDivElement>(null);

  const onSelectProductForTopUp = (productId: string) => {
    router.push(`/top-up/${productId}`);
  };

  const onSelectProduct = (product: any) => {
    router.push(`/top-up/${product.id}`);
  };

  // GSAP: Animate category tiles on scroll
  useEffect(() => {
    if (!tilesRef.current) return;
    const tiles = tilesRef.current.querySelectorAll('.category-tile');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 28, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55, stagger: 0.07,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: tilesRef.current,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, tilesRef);
    return () => ctx.revert();
  }, []);

  // GSAP: Blog section header
  useEffect(() => {
    if (!blogHeaderRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        blogHeaderRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: blogHeaderRef.current, start: 'top 88%', once: true },
        }
      );
    }, blogHeaderRef);
    return () => ctx.revert();
  }, []);

  const categories = [
    { label: 'Gaming Top-Ups', cat: 'top-up', icon: <Flame className="w-5 h-5" />, color: 'from-zenvo-accent to-orange-600', desc: 'Free Fire, PUBG & more' },
    { label: 'Gift Cards', cat: 'gift-card', icon: <Gift className="w-5 h-5" />, color: 'from-pink-500 to-zenvo-primary', desc: 'Steam, Google Play & more' },
    { label: 'Game Keys', cat: 'license-key', icon: <Gamepad2 className="w-5 h-5" />, color: 'from-zenvo-primary to-indigo-600', desc: 'PC & Console games' },
    { label: 'Subscriptions', cat: 'subscription', icon: <Smartphone className="w-5 h-5" />, color: 'from-violet-500 to-zenvo-primary', desc: 'Netflix, Spotify & more' },
    { label: 'VIP Bundles', cat: 'software', icon: <Crown className="w-5 h-5" />, color: 'from-amber-500 to-zenvo-accent', desc: 'Premium bundles' },
  ];

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

      {/* QUICK CATEGORY TILES */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zenvo-primary-soft border border-zenvo-primary-border text-zenvo-primary text-[11px] font-black uppercase tracking-widest">
            <Zap className="w-3 h-3" /> Shop by Category
          </span>
        </div>
        <div ref={tilesRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={`/shop?cat=${c.cat}`}
              className="category-tile group relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-zenvo-border hover:border-zenvo-primary-border bg-zenvo-card card-premium"
            >
              {/* Background glow */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${c.color} opacity-10 group-hover:opacity-20 blur-xl transition-all duration-500`} />

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {c.icon}
              </div>
              <h3 className="text-sm font-black text-zenvo-text mb-0.5 group-hover:text-zenvo-primary transition-colors duration-200">{c.label}</h3>
              <p className="text-[10px] text-zenvo-text-muted mb-2">{c.desc}</p>
              <div className="flex items-center gap-1 text-xs text-zenvo-primary font-bold group-hover:gap-2 transition-all duration-200">
                <span>Browse</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section id="shop-products" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(c) => {
            if (c !== selectedCategory) {
              setSelectedCategory(c);
              router.push(c === 'all' ? '/shop' : `/shop?cat=${c}`);
            }
          }}
        />
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

      {/* BLOG / PROMOTIONS */}
      <section id="blog-section" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div ref={blogHeaderRef} className="flex items-end justify-between mb-7">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zenvo-primary-soft border border-zenvo-primary-border text-zenvo-primary text-[11px] font-black uppercase tracking-widest mb-3">
              <Zap className="w-3 h-3" /> Latest Posts
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zenvo-text tracking-tight">
              Promotions & Gaming Insights
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zenvo-border hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft text-sm font-bold text-zenvo-text-secondary hover:text-zenvo-primary transition-all magnetic-btn"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <PromotionsBlog articles={blogArticles.slice(0, 3)} />
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zenvo-primary/15 via-indigo-900/20 to-zenvo-accent/10 border border-zenvo-primary-border p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zenvo-accent-soft border border-zenvo-accent-border text-zenvo-accent text-[11px] font-black uppercase tracking-widest mb-5">
              <Flame className="w-3.5 h-3.5" /> Limited Time Offer
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zenvo-text tracking-tight mb-3">
              Top up your game,{' '}
              <span className="text-gradient-full">instantly</span>
            </h2>
            <p className="text-zenvo-text-secondary text-sm sm:text-base max-w-xl mx-auto mb-7">
              Get the best rates on Free Fire diamonds, PUBG UC, and more. Sub-30 second delivery, 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="magnetic-btn px-7 py-3.5 rounded-xl bg-zenvo-primary hover:bg-zenvo-primary-hover text-white font-black text-sm uppercase tracking-wider shadow-primary hover:shadow-glow-blue transition-all inline-flex items-center gap-2"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/wallet"
                className="magnetic-btn px-7 py-3.5 rounded-xl border border-zenvo-border hover:border-zenvo-accent-border bg-zenvo-surface/60 hover:bg-zenvo-accent-soft/30 text-zenvo-text-secondary hover:text-zenvo-accent font-bold text-sm transition-all inline-flex items-center gap-2"
              >
                Top Up Wallet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
