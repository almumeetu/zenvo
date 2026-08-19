'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
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
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 p-2.5 sm:p-3 rounded-full bg-slate-950/85 backdrop-blur-xl border border-cyan-400/40 text-cyan-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 hover:border-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 active:scale-90 group cursor-pointer animate-fadeIn"
    >
      {/* Outer subtle glow ring */}
      <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-30 group-hover:opacity-75 blur-xs transition-opacity duration-300 pointer-events-none" />

      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:-translate-y-0.5 transition-transform duration-200" />
    </button>
  );
};
