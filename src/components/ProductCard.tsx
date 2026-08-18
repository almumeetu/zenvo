'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { Zap, Star, Heart, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductCardProps {
  product: Product;
  selectedCurrency: CurrencyCode;
  index?: number;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedCurrency,
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const minPrice = product.denominations[0]?.amount || 0;
  const originalMin = product.denominations[0]?.originalAmount || minPrice;
  const hasDiscount = originalMin > minPrice;

  /* ScrollTrigger entrance */
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: { trigger: cardRef.current, start: 'top 95%', once: true },
          delay: Math.min(index * 0.03, 0.24),
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  /* Desktop tilt */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, { rotateY: x * 5, rotateX: -y * 5, transformPerspective: 1000, duration: 0.4, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    setIsHovered(false);
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (imageRef.current) gsap.to(imageRef.current, { scale: 1.06, duration: 0.4, ease: 'power2.out' });
  };

  const handleImageMouseLeave = () => {
    if (imageRef.current) gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: 'power2.out' });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="group relative bg-zenov-card border border-zenov-border hover:border-zenov-primary-border rounded-xl overflow-hidden transition-all duration-300 ease-out shadow-sm hover:shadow-xl hover:shadow-zenov-primary/15 hover:-translate-y-0.5 flex flex-col will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Hover ring */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-zenov-primary/0 group-hover:ring-zenov-primary/20 transition-all duration-300 pointer-events-none z-10" />

      {/* ── IMAGE ── */}
      <Link
        href={`/top-up/${product.id}`}
        className="relative aspect-square overflow-hidden bg-zenov-surface block"
        onMouseLeave={handleImageMouseLeave}
      >
        <img
          ref={imageRef}
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center will-change-transform"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zenov-card/90 via-transparent to-transparent opacity-70 pointer-events-none" />

        {/* Out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-zenov-bg/70 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="px-2 py-1 rounded-md bg-zenov-error/20 border border-zenov-error/40 text-zenov-error text-[9px] sm:text-[10px] font-black uppercase">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between gap-1 z-10">
          <div className="flex flex-col gap-0.5 items-start">
            {product.deliveryType === 'Instant' && (
              <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded bg-zenov-success text-zenov-bg text-[8px] sm:text-[9px] font-black uppercase shadow-sm leading-tight">
                <Zap className="w-2 h-2 fill-zenov-bg shrink-0" />
                <span className="hidden sm:inline">Instant</span>
              </span>
            )}
            {product.isHot && (
              <span className="px-1 sm:px-1.5 py-0.5 rounded bg-zenov-accent text-zenov-bg text-[8px] sm:text-[9px] font-black uppercase shadow-sm leading-tight">
                🔥
              </span>
            )}
            {product.isNew && !product.isHot && (
              <span className="px-1 sm:px-1.5 py-0.5 rounded bg-zenov-primary text-white text-[8px] sm:text-[9px] font-black uppercase leading-tight">
                NEW
              </span>
            )}
          </div>

          <div className="flex flex-col gap-0.5 items-end">
            {(product.discountPercent || hasDiscount) && (
              <span className="px-1 sm:px-1.5 py-0.5 rounded bg-zenov-error text-white text-[8px] sm:text-[9px] font-black leading-tight">
                -{product.discountPercent || Math.round((1 - minPrice / originalMin) * 100)}%
              </span>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted((w) => !w); }}
              className={`p-1 rounded backdrop-blur-sm border transition-all duration-200 ${
                isWishlisted
                  ? 'bg-zenov-error/20 border-zenov-error/50 text-zenov-error'
                  : 'bg-zenov-bg/50 border-zenov-border/60 text-zenov-text-muted hover:text-zenov-error'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-200 ${isWishlisted ? 'fill-zenov-error' : ''}`} />
            </button>
          </div>
        </div>

        {/* Rating — desktop only to save space */}
        <div className="hidden sm:flex absolute bottom-1.5 left-2 z-10 items-center gap-0.5 bg-zenov-bg/70 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zenov-border/50">
          <Star className="w-2.5 h-2.5 text-zenov-accent fill-zenov-accent" />
          <span className="text-[10px] font-bold text-zenov-text font-mono">{product.rating}</span>
        </div>
      </Link>

      {/* ── BODY ── */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2">
        <div className="space-y-0.5">
          <p className="text-[8px] sm:text-[10px] uppercase tracking-wide text-zenov-text-muted font-bold truncate">
            {product.publisher || product.category.replace(/-/g, ' ')}
          </p>
          <Link href={`/top-up/${product.id}`} className="block">
            <h3 className="text-[11px] sm:text-sm font-bold text-zenov-text group-hover:text-zenov-primary transition-colors duration-200 line-clamp-2 sm:line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-1">
          <div className="min-w-0">
            <span className="text-[8px] sm:text-[10px] text-zenov-text-muted block font-medium">From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-black text-zenov-text font-mono tracking-tight leading-tight">
                {formatCurrency(minPrice, selectedCurrency)}
              </span>
              {hasDiscount && (
                <span className="hidden sm:inline text-[9px] text-zenov-text-muted line-through font-mono">
                  {formatCurrency(originalMin, selectedCurrency)}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/top-up/${product.id}`}
            className="magnetic-btn shrink-0 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-zenov-primary hover:bg-zenov-primary-hover active:scale-95 active:brightness-90 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wide inline-flex items-center gap-0.5 sm:gap-1 transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-zenov-primary/30"
          >
            <span className="hidden sm:inline">Top Up</span>
            <span className="sm:hidden">Buy</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
