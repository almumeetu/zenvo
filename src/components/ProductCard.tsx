'use client';

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Product, CurrencyCode, CartItem } from '../types';
import { formatCurrency } from '../lib/currency';
import { useApp } from '../lib/AppStateContext';
import { Zap, Star, Heart, ShoppingCart, Check, Package } from 'lucide-react';

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
  onAddToCart,
  isHotSection = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  let appContext: ReturnType<typeof useApp> | null = null;
  try { appContext = useApp(); } catch { /* outside context */ }

  const isPhysical = product.productType === 'physical';
  const minPrice =
    product.denominations && product.denominations.length > 0
      ? Math.min(...product.denominations.map((d) => Number(d.amount) || 0))
      : Number((product as any).salePrice) || Number((product as any).price) || 0;
  const originalMin =
    product.denominations && product.denominations.length > 0
      ? product.denominations[0]?.originalAmount || minPrice
      : Number((product as any).price) || minPrice;
  const hasDiscount = originalMin > minPrice;

  /* Desktop fine pointer 3D Tilt */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
    cardRef.current.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-2px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = '';
  }, []);

  /* Add to Cart */
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultDenom = product.denominations[0] || { id: 'default', name: 'Standard Package', amount: 1.0 };
    const cartItem: CartItem = {
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      denomination: defaultDenom,
      quantity: 1,
      playerId: 'INSTANT_TOPUP',
      serverId: '',
      productType: product.productType || 'virtual',
    };
    if (onAddToCart) onAddToCart(cartItem);
    else if (appContext?.addToCart) appContext.addToCart(cartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-gradient-to-b from-[#0e1628]/95 via-[#0a101d]/98 to-[#060a12] border rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between ${
        isPhysical
          ? 'border-purple-500/25 hover:border-purple-400/70 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
          : isHotSection || product.isHot
          ? 'border-amber-500/30 hover:border-amber-400/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
          : 'border-blue-500/25 hover:border-cyan-400/70 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]'
      }`}
    >
      {/* ── POSTER IMAGE ── */}
      <Link
        href={`/top-up/${product.id}`}
        className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-slate-950/90 block shrink-0 rounded-t-2xl"
      >
        <img
          ref={imageRef}
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {/* Bottom subtle shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-zenov-bg/85 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-[8px] font-black uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
          {product.isHot ? (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[7.5px] min-[380px]:text-[8.5px] font-black uppercase leading-none shadow-xs">
              🔥 Hot
            </span>
          ) : isPhysical ? (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[7.5px] min-[380px]:text-[8.5px] font-black uppercase leading-none shadow-xs">
              In Stock
            </span>
          ) : (product.discountPercent || hasDiscount) ? (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[7.5px] min-[380px]:text-[8.5px] font-black leading-none shadow-xs">
              -{product.discountPercent || Math.round((1 - minPrice / originalMin) * 100)}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#7c3aed] text-white text-[7.5px] min-[380px]:text-[8.5px] font-black uppercase leading-none shadow-xs">
              <Zap className="w-2 h-2 fill-white shrink-0" />
              <span>Instant</span>
            </span>
          )}
        </div>

        {/* Wishlist Button (Top-Right) */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted((w) => !w); }}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-500'
                : 'bg-black/50 border-white/10 text-slate-300 hover:text-rose-400'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Rating Pill (Bottom-Left) */}
        <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-0.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10">
          <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-slate-200 font-mono">
            {product.rating}
          </span>
        </div>
      </Link>

      {/* ── CARD BODY ── */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1.5 min-w-0">
        <div className="min-w-0">
          <p className="text-[7px] sm:text-[8px] uppercase tracking-wider text-slate-400 font-bold truncate">
            {product.publisher || product.category.replace(/-/g, ' ')}
          </p>
          <Link href={`/top-up/${product.id}`} className="block group/title mt-0.5">
            <h3 className="text-[11px] min-[380px]:text-[11.5px] sm:text-xs font-bold text-white group-hover/title:text-cyan-300 transition-colors line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-1.5 pt-0.5 flex-wrap">
          <span className="text-[11.5px] min-[380px]:text-xs sm:text-sm font-black text-white font-mono tracking-tight leading-none">
            {formatCurrency(minPrice, selectedCurrency)}
          </span>
          {hasDiscount && (
            <span className="text-[8px] sm:text-[9.5px] text-slate-500 line-through font-mono leading-none">
              {formatCurrency(originalMin, selectedCurrency)}
            </span>
          )}
        </div>

        {/* Full-width Add to Cart Button (Image 2 style) */}
        <button
          onClick={handleAddToCartClick}
          disabled={!product.inStock}
          aria-label={isAdded ? 'Added' : 'Add to Cart'}
          className={`w-full py-1.5 sm:py-2 rounded-xl text-[9px] min-[380px]:text-[10px] sm:text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs whitespace-nowrap ${
            isAdded
              ? 'bg-emerald-500 text-slate-950 font-black'
              : isPhysical
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/25'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-indigo-600/25'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
