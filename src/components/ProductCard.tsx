'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, CurrencyCode, CartItem } from '../types';
import { formatCurrency } from '../lib/currency';
import { useApp } from '../lib/AppStateContext';
import { Zap, Star, Heart, ShoppingCart, Check, ArrowUpRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductCardProps {
  product: Product;
  selectedCurrency: CurrencyCode;
  index?: number;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (item: CartItem) => void;
  isHotSection?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedCurrency,
  index = 0,
  onAddToCart,
  isHotSection = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // App context for global cart
  let appContext: ReturnType<typeof useApp> | null = null;
  try {
    appContext = useApp();
  } catch {
    // Fallback if rendered outside context
  }

  const minPrice = product.denominations[0]?.amount || 0;
  const originalMin = product.denominations[0]?.originalAmount || minPrice;
  const hasDiscount = originalMin > minPrice;

  /* ScrollTrigger entrance */
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: { trigger: cardRef.current, start: 'top 96%', once: true },
          delay: Math.min(index * 0.025, 0.2),
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  /* 3D Tilt on Desktop */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, {
      rotateY: x * 4,
      rotateX: -y * 4,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.4, ease: 'power2.out' });
    if (imageRef.current) gsap.to(imageRef.current, { scale: 1, duration: 0.35 });
  };

  const handleMouseEnter = () => {
    if (imageRef.current) gsap.to(imageRef.current, { scale: 1.06, duration: 0.35, ease: 'power2.out' });
  };

  /* Add to Cart Handler */
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultDenom = product.denominations[0] || {
      id: 'default',
      name: 'Standard Package',
      amount: 1.0,
    };

    const cartItem: CartItem = {
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      denomination: defaultDenom,
      quantity: 1,
      playerId: 'INSTANT_TOPUP',
      serverId: '',
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else if (appContext?.addToCart) {
      appContext.addToCart(cartItem);
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`group relative bg-gradient-to-b from-zenov-card/95 via-zenov-card/90 to-zenov-surface/95 border rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-md hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between will-change-transform ${
        isHotSection || product.isHot
          ? 'border-amber-500/30 hover:border-amber-400/80 hover:shadow-glow-amber'
          : 'border-zenov-border hover:border-zenov-primary/60 hover:shadow-glow-blue'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Ambient Top Glow on Hover */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-14 bg-zenov-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* ── PRODUCT POSTER / IMAGE ── */}
      <Link
        href={`/top-up/${product.id}`}
        className="relative aspect-square overflow-hidden bg-zenov-surface/90 block shrink-0 rounded-t-2xl"
      >
        <img
          ref={imageRef}
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 will-change-transform"
          loading="lazy"
        />

        {/* Bottom image gradient shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-zenov-card via-transparent to-transparent opacity-70 pointer-events-none" />

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-zenov-bg/85 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="px-2 py-1 rounded-full bg-zenov-error/25 border border-zenov-error/50 text-zenov-error text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Minimal Clean Top Badges */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
          {(product.discountPercent || hasDiscount) ? (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9px] font-black leading-none shadow-xs">
              -{product.discountPercent || Math.round((1 - minPrice / originalMin) * 100)}%
            </span>
          ) : product.deliveryType === 'Instant' ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-zenov-bg text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9px] font-black uppercase shadow-xs leading-none">
              <Zap className="w-2 h-2 fill-zenov-bg shrink-0" />
              <span className="hidden sm:inline">Instant</span>
            </span>
          ) : product.isHot ? (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9px] font-black uppercase shadow-xs leading-none">
              🔥 Hot
            </span>
          ) : null}
        </div>

        {/* Rating Pill (Bottom Left) */}
        <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-0.5 bg-black/65 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10">
          <Star className="w-2 h-2 min-[380px]:w-2.5 min-[380px]:h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9px] font-bold text-slate-200 font-mono">
            {product.rating}
          </span>
        </div>

        {/* Wishlist Button (Top Right) */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((w) => !w);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all duration-200 ${
              isWishlisted
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-500'
                : 'bg-black/50 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-400/50'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-200 ${
                isWishlisted ? 'fill-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </Link>

      {/* ── CARD BODY (Sleek Gaming Design) ── */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[7.5px] sm:text-[8.5px] uppercase tracking-wider text-zenov-text-muted font-bold truncate">
            {product.publisher || product.category.replace(/-/g, ' ')}
          </p>
          <Link href={`/top-up/${product.id}`} className="block group/title mt-0.5">
            <h3 className="text-[11px] min-[380px]:text-[12px] sm:text-[13.5px] font-black text-zenov-text group-hover/title:text-zenov-primary transition-colors line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price & Gaming CTA Button */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs min-[380px]:text-[13px] sm:text-sm font-black text-zenov-text font-mono tracking-tight leading-tight">
              {formatCurrency(minPrice, selectedCurrency)}
            </span>
            {hasDiscount && (
              <span className="text-[8px] sm:text-[9.5px] text-zenov-text-muted line-through font-mono">
                {formatCurrency(originalMin, selectedCurrency)}
              </span>
            )}
          </div>

          {/* Ultra-Compact Gaming Micro Action Button */}
          <button
            onClick={handleAddToCartClick}
            disabled={!product.inStock}
            className={`w-full py-1 min-[380px]:py-1 sm:py-1.5 px-1.5 rounded-lg text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider inline-flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs ${
              isAdded
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-blue-600 via-zenov-primary to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-950 stroke-[3]" />
                <span>Added ✓</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                <span>+ Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

