'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { Zap, Star, Heart, ArrowRight, ShoppingCart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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

  // ScrollTrigger entrance (not just on mount)
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 28, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 95%',
            once: true,
          },
          delay: Math.min(index * 0.03, 0.24),
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  // Magnetic tilt on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, {
      rotateY: x * 5,
      rotateX: -y * 5,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    setIsHovered(false);
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 1.06, duration: 0.4, ease: 'power2.out' });
    }
  };

  const handleImageMouseLeave = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: 'power2.out' });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="group relative bg-zenvo-card border border-zenvo-border hover:border-zenvo-primary-border rounded-xl overflow-hidden transition-all duration-300 ease-out shadow-sm hover:shadow-lg hover:shadow-zenvo-primary/10 flex flex-col will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Glow edge on hover */}
      <div className={`absolute inset-0 rounded-xl ring-1 ring-zenvo-primary/0 group-hover:ring-zenvo-primary/20 transition-all duration-300 pointer-events-none z-10`} />

      {/* Image Area */}
      <Link
        href={`/top-up/${product.id}`}
        className="relative aspect-square overflow-hidden bg-zenvo-surface block"
        onMouseLeave={handleImageMouseLeave}
      >
        <img
          ref={imageRef}
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center will-change-transform"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zenvo-card/90 via-transparent to-transparent opacity-70 pointer-events-none" />

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-zenvo-bg/70 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="px-3 py-1.5 rounded-lg bg-zenvo-error/20 border border-zenvo-error/40 text-zenvo-error text-xs font-black uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5 z-10">
          <div className="flex flex-col gap-1 items-start">
            {product.deliveryType === 'Instant' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zenvo-success text-zenvo-bg text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Zap className="w-2.5 h-2.5 fill-zenvo-bg" /> Instant
              </span>
            )}
            {product.isHot && (
              <span className="px-2 py-0.5 rounded-md bg-zenvo-accent text-zenvo-bg text-[10px] font-black uppercase tracking-wider shadow-sm">
                🔥 HOT
              </span>
            )}
            {product.isNew && !product.isHot && (
              <span className="px-2 py-0.5 rounded-md bg-zenvo-primary text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                NEW
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 items-end">
            {(product.discountPercent || hasDiscount) && (
              <span className="px-2 py-0.5 rounded-md bg-zenvo-error text-white text-[10px] font-black">
                -{product.discountPercent || Math.round((1 - minPrice / originalMin) * 100)}%
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted((w) => !w);
              }}
              className={`p-1.5 rounded-md backdrop-blur-sm border transition-all duration-200 ${
                isWishlisted
                  ? 'bg-zenvo-error/20 border-zenvo-error/50 text-zenvo-error scale-110'
                  : 'bg-zenvo-bg/50 border-zenvo-border/60 text-zenvo-text-muted hover:text-zenvo-error hover:border-zenvo-error/40 hover:bg-zenvo-error/10'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 transition-all duration-200 ${isWishlisted ? 'fill-zenvo-error scale-110' : ''}`} />
            </button>
          </div>
        </div>

        {/* Rating overlay */}
        <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 bg-zenvo-bg/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-zenvo-border/50">
          <Star className="w-3 h-3 text-zenvo-accent fill-zenvo-accent" />
          <span className="text-[11px] font-bold text-zenvo-text font-mono">{product.rating}</span>
          <span className="text-[10px] text-zenvo-text-muted">({product.reviewCount.toLocaleString()})</span>
        </div>
      </Link>

      {/* Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zenvo-text-muted font-bold truncate">
            {product.publisher || product.category.replace(/-/g, ' ')}
          </p>
          <Link href={`/top-up/${product.id}`} className="block">
            <h3 className="text-sm font-bold text-zenvo-text group-hover:text-zenvo-primary transition-colors duration-200 line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] text-zenvo-text-muted block font-medium">From</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-zenvo-text font-mono tracking-tight">
                {formatCurrency(minPrice, selectedCurrency)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-zenvo-text-muted line-through font-mono">
                  {formatCurrency(originalMin, selectedCurrency)}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/top-up/${product.id}`}
            className="magnetic-btn shrink-0 px-3 py-2 rounded-lg bg-zenvo-primary hover:bg-zenvo-primary-hover text-white text-[11px] font-black uppercase tracking-wide inline-flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-primary"
          >
            <span>Top Up</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
