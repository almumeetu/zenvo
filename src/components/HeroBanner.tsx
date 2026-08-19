'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroBanner as HeroBannerType, CurrencyCode } from '../types';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroBannerProps {
  banners: HeroBannerType[];
  selectedCurrency: CurrencyCode;
  onSelectGame: (gameId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onSelectGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeBanner = banners[currentIndex] || banners[0];

  // Hero content entrance animation
  useEffect(() => {
    if (!contentRef.current || !imageRef.current || isAnimating) return;

    const badge = contentRef.current.querySelector('.hero-badge');
    const words = contentRef.current.querySelectorAll('.hero-word');
    const subtitle = contentRef.current.querySelector('.hero-subtitle');
    const perks = contentRef.current.querySelector('.hero-perks');
    const cta = contentRef.current.querySelector('.hero-cta');

    const ctx = gsap.context(() => {
      gsap.set([badge, subtitle, perks, cta], { opacity: 0, y: 18 });
      gsap.set(words, { opacity: 0, y: 28, rotateX: -15 });
      gsap.set(imageRef.current, { opacity: 0, scale: 1.08 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onStart: () => setIsAnimating(true),
        onComplete: () => setIsAnimating(false),
      });

      tl.to(imageRef.current, { opacity: 0.4, scale: 1, duration: 1.1, ease: 'power2.out' })
        .to(badge, { opacity: 1, y: 0, duration: 0.45 }, '-=0.75')
        .to(words, { opacity: 1, y: 0, rotateX: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(1.4)' }, '-=0.3')
        .to(subtitle, { opacity: 1, y: 0, duration: 0.45 }, '-=0.3')
        .to(perks, { opacity: 1, y: 0, duration: 0.4 }, '-=0.25')
        .to(cta, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
    }, contentRef);

    return () => ctx.revert();
  }, [currentIndex]);

  // Scroll-triggered entrance for banner container
  useEffect(() => {
    if (!sectionRef.current || !bannerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0.8, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 95%', once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Parallax mouse effect - strictly on fine pointer desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current || !imageRef.current) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const { left, top, width, height } = bannerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    gsap.to(imageRef.current, { x: x * 16, y: y * 10, duration: 0.6, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!imageRef.current) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    gsap.to(imageRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
  };

  // Auto-slide with progress bar (8s duration for relaxed viewing)
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 8, ease: 'none', overwrite: true }
      );
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % banners.length);
    }, 8000);
  }, [banners.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const nextSlide = () => {
    setCurrentIndex((p) => (p + 1) % banners.length);
    startTimer();
  };
  const prevSlide = () => {
    setCurrentIndex((p) => (p - 1 + banners.length) % banners.length);
    startTimer();
  };
  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    startTimer();
  };

  // Split title into words for word-level animation
  const titleWords = activeBanner.title.split(' ');

  return (
    <section ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-2.5 sm:pt-6 sm:pb-10">
      {/* Outer Pulsing Ambient Neon Aura (Matching Logo Spectrum) */}
      <div className="absolute -inset-1 sm:-inset-2 rounded-3xl bg-gradient-to-r from-blue-600/30 via-cyan-400/25 to-amber-500/25 opacity-70 blur-2xl pointer-events-none animate-pulse" />

      <div
        ref={bannerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[200px] sm:h-[340px] lg:h-[410px] rounded-2xl overflow-hidden bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500 group shadow-2xl shadow-cyan-950/30 hover:shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-col justify-center"
      >
        {/* Conic neon laser edge trace */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden opacity-40 group-hover:opacity-80 transition-opacity">
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#3b82f6,#06b6d4,#f59e0b,#8b5cf6,#3b82f6)] animate-spin-slow opacity-20 group-hover:opacity-40" />
        </div>

        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            ref={imageRef}
            src={activeBanner.image}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
            decoding="async"
          />
          {/* Left-to-Right & Bottom-to-Top High-Tech Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 sm:via-slate-950/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 z-10" />
          
          {/* Cyber grid & mesh pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:36px_36px] z-10 pointer-events-none" />
          <div className="absolute inset-0 cyber-grid-mesh opacity-25 z-10 pointer-events-none" />
          
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl z-10 pointer-events-none" />
        </div>

        {/* Content (Positioned in Exact Vertical Middle between Top & Bottom) */}
        <div
          ref={contentRef}
          className="relative z-20 max-w-2xl px-5 sm:px-10 lg:px-12 flex flex-col justify-center items-start text-left gap-1.5 sm:gap-3.5 my-auto"
        >
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[8.5px] sm:text-[10.5px] font-black uppercase tracking-widest w-fit shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>{activeBanner.badge}</span>
          </div>

          {/* Title — word-by-word animation */}
          <h1 className="text-sm sm:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight sm:leading-snug max-w-xl text-left drop-shadow-md">
            {titleWords.map((word, wi) => (
              <span
                key={wi}
                className={`hero-word inline-block mr-[0.25em] ${wi === 1 || wi === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-amber-300' : ''}`}
                style={{ perspective: '800px' }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle hidden sm:block text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed text-left pl-3 border-l-2 border-cyan-400/80">
            {activeBanner.subtitle}
          </p>

          {/* Perks */}
          <div className="hero-perks hidden sm:flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs text-slate-300">
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

          {/* CTA & Trust */}
          <div className="hero-cta flex items-center gap-2.5 sm:gap-3 mt-1 sm:mt-1.5">
            <button
              onClick={() => onSelectGame(activeBanner.gameId)}
              className="magnetic-btn px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group/btn will-change-transform active:scale-95 cursor-pointer border border-amber-300/60"
            >
              <span>{activeBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-cyan-400 font-bold">1M+</span>
              <span>Gamers</span>
            </div>
          </div>
        </div>

        {/* Compact Arrow navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Slide indicators (Bottom-Left) */}
        <div className="absolute bottom-3.5 left-5 sm:bottom-4 sm:left-10 z-30 flex items-center gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-6 sm:w-8 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'w-1.5 sm:w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-3.5 right-5 sm:bottom-4 sm:right-6 z-30 text-[9px] sm:text-[11px] font-mono text-slate-400">
          <span className="text-cyan-400 font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
          {' / '}
          {String(banners.length).padStart(2, '0')}
        </div>

        {/* Progress timer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 z-30 overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </section>
  );
};
