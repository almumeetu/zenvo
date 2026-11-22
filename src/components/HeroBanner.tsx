'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroBanner as HeroBannerType, CurrencyCode } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface HeroBannerProps {
  banners: HeroBannerType[];
  selectedCurrency: CurrencyCode;
  onSelectGame: (gameId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onSelectGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const safeBanners = banners && banners.length > 0 ? banners : [];
  const total = safeBanners.length;
  const activeBanner = safeBanners[currentIndex] || safeBanners[0];

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play timer with pause-on-hover support
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsPaused(false);
    if (!touchStartRef.current || total <= 1) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (total === 0) return null;

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-3 sm:pt-6 sm:pb-8">
      {/* Outer Ambient Glow Aura */}
      <div className="absolute -inset-1 sm:-inset-2 rounded-3xl bg-gradient-to-r from-blue-600/25 via-cyan-400/20 to-amber-500/20 opacity-60 blur-2xl pointer-events-none animate-pulse" />

      {/* Main Banner Container */}
      <div
        ref={bannerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartRef.current = null;
          setIsPaused(false);
        }}
        className="relative h-[230px] sm:h-[350px] lg:h-[420px] rounded-2xl overflow-hidden bg-slate-950/95 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500 group shadow-2xl shadow-cyan-950/30 select-none touch-pan-y"
      >
        {/* Subtle Conic edge glow highlight */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity">
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#3b82f6,#06b6d4,#f59e0b,#8b5cf6,#3b82f6)] animate-spin-slow opacity-15 group-hover:opacity-30" />
        </div>

        {/* Stacked Banner Layers (Eliminates image reload flickering & guarantees 60fps transitions) */}
        {safeBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          const words = banner.title.split(' ');

          return (
            <div
              key={banner.id || index}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-out flex flex-col justify-center ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Artwork */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out will-change-transform ${
                    isActive ? 'scale-100' : 'scale-105'
                  }`}
                />

                {/* Left-to-Right & Bottom-to-Top High-Tech Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 sm:via-slate-950/75 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30 z-10" />

                {/* Cyber Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:32px_32px] z-10 pointer-events-none" />

                {/* Glowing Ambient Color Spheres */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl z-10 pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl z-10 pointer-events-none" />
              </div>

              {/* Banner Text Content */}
              <div className="relative z-20 max-w-2xl px-5 sm:px-10 lg:px-12 flex flex-col justify-center items-start text-left gap-1.5 sm:gap-3.5 my-auto">
                {/* Glowing Gaming Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-gradient-to-r from-blue-600/25 via-cyan-500/25 to-blue-600/25 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[8.5px] sm:text-[10.5px] font-black uppercase tracking-widest w-fit shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                  <span>{banner.badge}</span>
                </div>

                {/* Title */}
                <h1 className="text-base sm:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight sm:leading-snug max-w-xl text-left drop-shadow-md">
                  {words.map((word, wi) => (
                    <span
                      key={wi}
                      className={`inline-block mr-[0.25em] ${
                        wi === 1 || wi === 2
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-amber-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : ''
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </h1>

                {/* Subtitle */}
                <p className="hidden sm:block text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed text-left pl-3 border-l-2 border-cyan-400/80">
                  {banner.subtitle}
                </p>

                {/* Authentic Gamer Perks */}
                <div className="hidden sm:flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Authorized
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> Direct UID Top-Up
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Instant Delivery
                  </span>
                </div>

                {/* CTA Action & Trust Badge */}
                <div className="flex items-center gap-2.5 sm:gap-3 mt-1 sm:mt-1.5">
                  <button
                    onClick={() => onSelectGame(banner.gameId)}
                    className="magnetic-btn px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group/btn will-change-transform active:scale-95 cursor-pointer border border-amber-300/60"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </button>

                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/25 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant Digital Code</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Compact Cyber Arrow Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-slate-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-lg opacity-0 group-hover:opacity-100 duration-200 hidden sm:flex items-center justify-center cursor-pointer active:scale-90"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-slate-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-lg opacity-0 group-hover:opacity-100 duration-200 hidden sm:flex items-center justify-center cursor-pointer active:scale-90"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Bottom Bar: Gaming Tabs on Desktop + Dynamic Dots on Mobile */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-4 right-4 sm:left-8 sm:right-8 z-30 flex items-center justify-between gap-3">
          {/* Desktop: Steam / Epic Games Style Quick Game Switcher Tabs */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {safeBanners.map((b, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={b.id || idx}
                  onClick={() => goToSlide(idx)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? 'bg-slate-900/90 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white'
                      : 'bg-slate-950/60 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label={`Switch to ${b.title}`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold whitespace-nowrap max-w-[130px] lg:max-w-[170px] truncate">
                    {b.title}
                  </span>
                  {isActive && (
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile: Compact Gaming Dots */}
          <div className="flex sm:hidden items-center gap-1.5">
            {safeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-6 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : 'w-2 bg-slate-600/80 hover:bg-slate-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter HUD */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <span className="text-cyan-400 font-bold">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-slate-600">/</span>
            <span>{String(total).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Top-Edge High-Tech Laser Edge Accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Bottom Smooth Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 z-30 overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 origin-left animate-hero-progress"
            style={{
              animationDuration: '7s',
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      </div>
    </section>
  );
};
