'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, Rocket } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
      setIsVisible(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to Top"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 p-2.5 sm:p-3 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-cyan-400/50 text-cyan-400 hover:text-white hover:border-cyan-300 shadow-xl shadow-cyan-950/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 active:scale-90 group cursor-pointer animate-fade-up"
    >
      {/* Animated glowing conic border */}
      <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-400 to-amber-500 opacity-40 group-hover:opacity-100 blur-[2px] transition-opacity duration-300 pointer-events-none" />

      {/* Circular Progress Ring background */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="2"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="url(#btt-gradient)"
          strokeWidth="2.5"
          strokeDasharray="113.097"
          strokeDashoffset={113.097 - (113.097 * scrollProgress) / 100}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
        <defs>
          <linearGradient id="btt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 flex items-center justify-center">
        <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:-translate-y-1 transition-transform duration-200" />
      </div>
    </button>
  );
};
