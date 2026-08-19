'use client';

import React from 'react';
import Link from 'next/link';

interface ZenovLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  isLink?: boolean;
  href?: string;
}

export const ZenovLogo: React.FC<ZenovLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  isLink = false,
  href = '/',
}) => {
  // Dimension scales
  const dimensions = {
    sm: {
      box: 'w-7 h-7 sm:w-8 sm:h-8',
      icon: 'w-4 h-4',
      title: 'text-sm sm:text-base',
      subtitle: 'text-[7px] sm:text-[7.5px]',
      spark: 'w-1 h-1',
    },
    md: {
      box: 'w-9 h-9 sm:w-10 sm:h-10',
      icon: 'w-5 h-5',
      title: 'text-[17px] sm:text-lg',
      subtitle: 'text-[8.5px] sm:text-[9px]',
      spark: 'w-1.5 h-1.5',
    },
    lg: {
      box: 'w-11 h-11 sm:w-12 sm:h-12',
      icon: 'w-6 h-6',
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-[10px] sm:text-[11px]',
      spark: 'w-2 h-2',
    },
    xl: {
      box: 'w-14 h-14 sm:w-16 sm:h-16',
      icon: 'w-8 h-8',
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs sm:text-sm',
      spark: 'w-2.5 h-2.5',
    },
  }[size];

  const content = (
    <div className={`group/logo inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* ── HIGH-TECH ANIMATED LOGO ICON EMBLEM ── */}
      <div className={`relative ${dimensions.box} shrink-0 flex items-center justify-center`}>
        {/* Outer Pulsing Ambient Neon Aura */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-400 to-amber-500 opacity-60 blur-md group-hover/logo:opacity-100 group-hover/logo:blur-lg transition-all duration-500 animate-pulse" />

        {/* Rotating Conic Neon Laser Ring */}
        <div className="absolute -inset-[1.5px] rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#3b82f6,#06b6d4,#f59e0b,#8b5cf6,#3b82f6)] animate-spin-slow opacity-85 group-hover/logo:opacity-100 transition-opacity" />
        </div>

        {/* Inner Dark Cyber Core Surface */}
        <div className="relative w-full h-full rounded-[9px] bg-slate-950/95 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover/logo:border-cyan-400/50 transition-colors duration-300">
          {/* Subtle Cyber Hex / Diagonal Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[size:6px_6px] pointer-events-none opacity-70" />

          {/* 3D Cyber 'Z' Monogram SVG with Glowing Lightning Slit */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${dimensions.icon} relative z-10 transition-transform duration-300 group-hover/logo:scale-110 drop-shadow-[0_2px_10px_rgba(6,182,212,0.7)]`}
          >
            {/* Top Bar of Z */}
            <path
              d="M6 7H26L23 12H13L26 21V25H6L9 20H20L6 11V7Z"
              fill="url(#zenovGrad)"
            />
            {/* Energy Core Slash */}
            <path
              d="M14 13.5L18 10L16 16.5L20 13L13 22L15 15.5L11 19L14 13.5Z"
              fill="url(#sparkGrad)"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="zenovGrad" x1="6" y1="7" x2="26" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="0.45" stopColor="#38BDF8" />
                <stop offset="0.8" stopColor="#06B6D4" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="sparkGrad" x1="11" y1="10" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.5" stopColor="#38BDF8" />
                <stop offset="1" stopColor="#FBBF24" />
              </linearGradient>
            </defs>
          </svg>

          {/* Live Online Energy Pip (Top-Right Micro Dot) */}
          <div className="absolute top-1 right-1 flex items-center justify-center">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${dimensions.spark}`} />
            <span className={`relative inline-flex rounded-full bg-emerald-400 ${dimensions.spark}`} />
          </div>
        </div>
      </div>

      {/* ── LOGO TYPOGRAPHY / WORDMARK ── */}
      <div className="flex flex-col items-start leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`${dimensions.title} font-black tracking-tight uppercase font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-200 group-hover/logo:from-cyan-300 group-hover/logo:via-blue-400 group-hover/logo:to-amber-300 transition-all duration-300 drop-shadow-sm`}
          >
            ZEN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400">OV</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`${dimensions.subtitle} font-extrabold tracking-[0.22em] text-slate-400 uppercase font-mono group-hover/logo:text-cyan-400/90 transition-colors duration-200`}>
              GAMING STORE
            </span>
            <span className="hidden min-[400px]:inline-block text-[6.5px] sm:text-[7px] px-1 py-0.2 rounded-full bg-zenov-primary/20 text-cyan-400 font-bold border border-cyan-500/30 tracking-normal scale-90">
              OFFICIAL
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link href={href} className="focus:outline-none inline-block">
        {content}
      </Link>
    );
  }

  return content;
};
