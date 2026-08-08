import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroBanner as HeroBannerType, CurrencyCode } from '../types';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroBannerProps {
  banners: HeroBannerType[];
  selectedCurrency: CurrencyCode;
  onSelectGame: (gameId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onSelectGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeBanner = banners[currentIndex] || banners[0];

  // GSAP ScrollTrigger Section Reveal
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 40, scale: 0.96, boxShadow: '0 0 0px rgba(0,255,102,0)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          boxShadow: '0 10px 35px rgba(0,0,0,0.9), 0 0 25px rgba(0,255,102,0.2)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP Slide Animation
  useEffect(() => {
    if (contentRef.current && imageRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.15, filter: 'blur(10px)' },
        { opacity: 1, scale: 1.05, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }
      );
    }
  }, [currentIndex]);

  // Mouse Parallax Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current || !imageRef.current || !contentRef.current) return;
    const { left, top, width, height } = bannerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    gsap.to(imageRef.current, {
      x: x * 30,
      y: y * 20,
      rotationY: x * 8,
      rotationX: -y * 8,
      duration: 0.5,
      ease: 'power1.out',
    });

    gsap.to(contentRef.current, {
      x: x * -15,
      y: y * -10,
      duration: 0.5,
      ease: 'power1.out',
    });
  };

  const handleMouseLeave = () => {
    if (!imageRef.current || !contentRef.current) return;
    gsap.to([imageRef.current, contentRef.current], {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
      <div
        ref={bannerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden bg-[#080d12] border border-emerald-500/30 flex items-center transition-all duration-300 group"
      >
        {/* Background Image with Parallax & Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            ref={imageRef}
            src={activeBanner.image}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity transform transition-transform duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060a0e] via-[#060a0e]/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a0e] via-transparent to-transparent z-10" />
          
          {/* Cyber Grid Texture Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff6608_1px,transparent_1px),linear-gradient(to_bottom,#00ff6608_1px,transparent_1px)] bg-[size:32px_32px] z-10 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div
          ref={contentRef}
          className="relative z-20 max-w-2xl px-6 sm:px-12 py-8 flex flex-col justify-center gap-4"
        >
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold tracking-wider shadow-[0_0_12px_rgba(0,255,102,0.3)] w-fit">
            <Zap className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>{activeBanner.badge}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            {activeBanner.title.split(' ').map((word, idx) => (
              <span key={idx} className={idx === 1 || idx === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,102,0.5)]' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-sans leading-relaxed border-l-2 border-emerald-500 pl-3">
            {activeBanner.subtitle}
          </p>

          {/* Live Perks Bar */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 py-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Authorized
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> Direct Player UID TopUp
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Instant Delivery
            </span>
          </div>

          {/* CTA Action Button */}
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={() => onSelectGame(activeBanner.gameId)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.5)] hover:shadow-[0_0_35px_rgba(0,255,102,0.8)] hover:scale-105 transition-all duration-300 flex items-center gap-2 group/btn"
            >
              <span>{activeBanner.ctaText}</span>
              <ChevronRight className="w-4 h-4 text-black group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-lg opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-lg opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-8 bg-emerald-400 shadow-[0_0_10px_#00ff66]'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
