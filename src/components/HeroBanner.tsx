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
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 88%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Parallax mouse effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current || !imageRef.current) return;
    const { left, top, width, height } = bannerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    gsap.to(imageRef.current, { x: x * 20, y: y * 12, duration: 0.8, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!imageRef.current) return;
    gsap.to(imageRef.current, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
  };

  // Auto-slide with progress bar
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 7, ease: 'none', overwrite: true }
      );
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % banners.length);
    }, 7000);
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
      <div
        ref={bannerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[180px] sm:h-auto sm:min-h-[320px] lg:min-h-[400px] rounded-2xl overflow-hidden bg-zenov-surface border border-zenov-border hover:border-zenov-primary/20 transition-all duration-500 group shadow-lg shadow-black/40 hover:shadow-primary/5"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            ref={imageRef}
            src={activeBanner.image}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center will-change-transform"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-zenov-bg via-zenov-bg/95 sm:via-zenov-bg/90 to-zenov-bg/40 sm:to-zenov-bg/25 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zenov-bg via-zenov-bg/30 to-transparent z-10" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:44px_44px] z-10 pointer-events-none" />
          {/* Accent glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-zenov-primary/10 rounded-full blur-3xl z-10 pointer-events-none" />
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="relative z-20 max-w-xl px-4 py-3.5 sm:px-8 sm:py-8 flex flex-col justify-center gap-1.5 sm:gap-3 h-full bg-zenov-bg/35 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none"
        >
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-zenov-primary-soft/85 backdrop-blur-md border border-zenov-primary-border text-zenov-primary text-[8px] sm:text-[10px] font-bold uppercase tracking-widest w-fit shadow-[0_0_12px_rgba(59,130,246,0.15)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-zenov-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zenov-primary" />
            </span>
            <span>{activeBanner.badge}</span>
          </div>

          {/* Title — word-by-word animation */}
          <h1 className="text-sm sm:text-2xl lg:text-3xl font-black tracking-tight text-zenov-text leading-tight sm:leading-snug">
            {titleWords.map((word, wi) => (
              <span
                key={wi}
                className={`hero-word inline-block mr-[0.25em] ${wi === 1 || wi === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-zenov-primary to-zenov-accent' : ''}`}
                style={{ perspective: '800px' }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle hidden sm:block text-xs sm:text-sm text-zenov-text-secondary max-w-md leading-relaxed pl-3 border-l-2 border-cyan-400/80">
            {activeBanner.subtitle}
          </p>

          {/* Perks */}
          <div className="hero-perks hidden sm:flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-zenov-text-secondary">
            <span className="flex items-center gap-1 font-semibold text-zenov-success">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Authorized
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Direct UID Top-Up
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-zenov-accent" /> Instant Delivery
            </span>
          </div>

          {/* CTA */}
          <div className="hero-cta flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-0">
            <button
              onClick={() => onSelectGame(activeBanner.gameId)}
              className="magnetic-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-zenov-accent to-orange-500 hover:from-zenov-accent-hover hover:to-orange-400 text-zenov-bg font-extrabold text-[9.5px] sm:text-xs uppercase tracking-wider shadow-accent hover:shadow-glow-amber transition-all duration-300 flex items-center gap-1.5 group/btn will-change-transform active:scale-[0.97] border border-zenov-accent/40 hover:border-zenov-accent/80"
            >
              <span>{activeBanner.ctaText}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zenov-text-muted">
              <span>Trusted by 1M+ gamers</span>
            </div>
          </div>
        </div>

        {/* Compact Arrow navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-zenov-primary/20 hover:border-cyan-400/50 transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-zenov-primary/20 hover:border-cyan-400/50 transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-8 z-30 flex items-center gap-1 sm:gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-5 sm:w-7 bg-gradient-to-r from-zenov-primary to-zenov-accent shadow-primary'
                  : 'w-1.5 sm:w-2 bg-zenov-text-muted/40 hover:bg-zenov-text-muted/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-3.5 right-5 sm:bottom-5 sm:right-6 z-30 text-[9px] sm:text-[11px] font-mono text-zenov-text-muted">
          <span className="text-zenov-primary font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
          {' / '}
          {String(banners.length).padStart(2, '0')}
        </div>

        {/* Progress timer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zenov-border z-30 overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-zenov-primary to-zenov-accent origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </section>
  );
};
