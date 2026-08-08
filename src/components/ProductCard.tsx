import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Product, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { Zap, Star, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  selectedCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedCurrency,
  onSelectProduct,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const minPrice = product.denominations[0]?.amount || 0;

  // 3D Tilt Hover GSAP Animation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    gsap.to(cardRef.current, {
      rotationY: x * 15,
      rotationX: -y * 15,
      transformPerspective: 1000,
      scale: 1.03,
      duration: 0.3,
      ease: 'power1.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: e.clientX - left - width / 2,
        y: e.clientY - top - height / 2,
        opacity: 0.6,
        duration: 0.2,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectProduct(product)}
      className="group relative bg-[#0a0f15] border border-slate-800 hover:border-emerald-400/80 rounded-2xl overflow-hidden cursor-pointer transition-colors duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(0,255,102,0.25)] flex flex-col justify-between"
    >
      {/* Background Radial Glow Effect */}
      <div
        ref={glowRef}
        className="absolute w-40 h-40 bg-emerald-500/30 rounded-full blur-2xl pointer-events-none opacity-0 transition-opacity duration-300 z-0"
      />

      {/* Top Banner / Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 z-10">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f15] via-transparent to-black/40" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-20">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.deliveryType === 'Instant' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_#00ff66]">
                <Zap className="w-3 h-3 fill-black" /> INSTANT
              </span>
            )}
            {product.isHot && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-mono font-black text-[10px] uppercase tracking-wider shadow-[0_0_10px_#f59e0b]">
                🔥 HOT
              </span>
            )}
          </div>

          {product.discountPercent && (
            <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-[10px]">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Rating overlay */}
        <div className="absolute bottom-2 left-2.5 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-700/50">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-mono text-slate-200 font-bold">{product.rating}</span>
          <span className="text-[10px] text-slate-400">({product.reviewCount})</span>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-4 z-10 flex-1 flex flex-col justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 font-bold">
            {product.publisher || product.category.replace('-', ' ')}
          </p>
          <h3 className="text-base font-extrabold text-white font-mono tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-1">
            {product.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Starting at</span>
            <span className="text-base font-black text-emerald-400 font-mono tracking-tight">
              {formatCurrency(minPrice, selectedCurrency)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 group/btn shadow-[0_0_10px_rgba(0,255,102,0.1)] hover:shadow-[0_0_20px_rgba(0,255,102,0.6)]"
          >
            <span>Top Up</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
