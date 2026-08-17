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
    <section ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
      <div
        ref={bannerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-[400px] rounded-2xl overflow-hidden bg-zenov-surface border border-zenov-border group"
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
          <div className="absolute inset-0 bg-gradient-to-r from-zenov-bg via-zenov-bg/90 to-zenov-bg/25 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zenov-bg via-zenov-bg/30 to-transparent z-10" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:44px_44px] z-10 pointer-events-none" />
          {/* Accent glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-zenov-primary/10 rounded-full blur-3xl z-10 pointer-events-none" />
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="relative z-20 max-w-2xl px-5 sm:px-10 lg:px-14 py-8 sm:py-10 flex flex-col justify-center gap-4"
        >
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zenov-primary-soft border border-zenov-primary-border text-zenov-primary text-[11px] font-bold uppercase tracking-widest w-fit">
            <Zap className="w-3.5 h-3.5 fill-zenov-primary/50" />
            <span>{activeBanner.badge}</span>
          </div>

          {/* Title — word-by-word animation */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black tracking-tight text-zenov-text leading-[1.1]">
            {titleWords.map((word, wi) => (
              <span
                key={wi}
                className={`hero-word inline-block mr-[0.25em] ${wi === 1 || wi === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-zenov-primary to-zenov-accent' : ''}`}
                style={{ perspective: '800px' }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-sm sm:text-base text-zenov-text-secondary max-w-lg leading-relaxed pl-4 border-l-[3px] border-zenov-primary/70">
            {activeBanner.subtitle}
          </p>

          {/* Perks */}
          <div className="hero-perks flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zenov-text-secondary">
            <span className="flex items-center gap-1.5 font-semibold text-zenov-success">
              <ShieldCheck className="w-4 h-4" /> 100% Authorized
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Zap className="w-4 h-4 text-zenov-primary" /> Direct UID Top-Up
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-zenov-accent" /> Instant Delivery
            </span>
          </div>

          {/* CTA */}
          <div className="hero-cta flex items-center gap-4">
            <button
              onClick={() => onSelectGame(activeBanner.gameId)}
              className="magnetic-btn px-5 py-2.5 rounded-lg bg-gradient-to-r from-zenov-accent to-orange-500 hover:from-zenov-accent-hover hover:to-orange-400 text-zenov-bg font-bold text-xs uppercase tracking-wider shadow-accent hover:shadow-glow-amber transition-all duration-300 flex items-center gap-2 group/btn will-change-transform active:scale-[0.97] border border-zenov-accent/40 hover:border-zenov-accent/80"
            >
              <span>{activeBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zenov-text-muted">
              <div className="flex -space-x-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-zenov-surface bg-gradient-to-br from-zenov-primary to-zenov-accent opacity-80"
                  />
                ))}
              </div>
              <span>Trusted by 1M+ gamers</span>
            </div>
          </div>
        </div>

        {/* Arrow navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-zenov-bg/70 backdrop-blur-md border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary hover:bg-zenov-card hover:border-zenov-primary-border transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-zenov-bg/70 backdrop-blur-md border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary hover:bg-zenov-card hover:border-zenov-primary-border transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-5 left-6 sm:left-10 z-30 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                currentIndex === idx
                  ? 'w-10 bg-zenov-primary shadow-primary'
                  : 'w-2 bg-zenov-text-muted/40 hover:bg-zenov-text-muted/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-5 right-6 z-30 text-[11px] font-mono text-zenov-text-muted">
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
