'use client';

import React, { useState, useEffect } from 'react';
import { ZenovLogo } from './ZenovLogo';

export const GamingPreloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(25);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusList = [
    'INITIALIZING SYSTEM...',
    'CONNECTING TO SECURE GATEWAY...',
    'SYNCING VIP INVENTORY...',
    'SYSTEM READY!',
  ];

  useEffect(() => {
    // Only show once per session for maximum browsing speed & performance
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('zenov_intro_shown')) {
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    // Fast, ultra-smooth progress ticker (completes in ~600ms)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          try {
            sessionStorage.setItem('zenov_intro_shown', 'true');
          } catch {}
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        const step = Math.floor(Math.random() * 28) + 22;
        return Math.min(100, prev + step);
      });
    }, 110);

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev < statusList.length - 1 ? prev + 1 : prev));
    }, 180);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070a10] transition-opacity duration-300 ease-out select-none ${
        progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── CRISP HIGH-DPI DEEP CANVASES (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.07)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[radial-gradient(circle,rgba(245,158,11,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />

      {/* Main Preloader HUD Box */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 max-w-xs w-full text-center">
        {/* Animated Cyber Ring & Logo */}
        <div className="relative flex items-center justify-center">
          {/* High-Tech Vector Cyber Spinner (No CSS Blur = No Banding) */}
          <svg className="absolute w-28 h-28 animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(6, 182, 212, 0.12)"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#preloader-grad)"
              strokeWidth="2"
              strokeDasharray="60 140"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="preloader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative p-3 rounded-2xl bg-slate-950/90 border border-cyan-400/30 shadow-lg shadow-cyan-950/40">
            <ZenovLogo size="lg" />
          </div>
        </div>

        {/* Brand Title */}
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-widest text-white uppercase font-sans">
            ZENOV <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">GAMES</span>
          </h2>
          <p className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-slate-400 mt-0.5">
            Digital Game Store &bull; BD
          </p>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="w-full space-y-1.5 mt-1">
          <div className="relative h-1.5 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-amber-400 transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percent & Status Ticker */}
          <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 px-0.5">
            <span className="text-cyan-400 font-bold truncate max-w-[180px]">
              {statusList[statusIndex]}
            </span>
            <span className="font-black text-amber-400 font-mono">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
