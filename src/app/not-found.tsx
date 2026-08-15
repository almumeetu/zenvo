'use client';

import Link from 'next/link';
import { Gamepad2, ArrowLeft, Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zenvo-card border border-zenvo-border flex items-center justify-center shadow-2xl shadow-zenvo-primary/10">
          <Gamepad2 className="w-12 h-12 sm:w-14 sm:h-14 text-zenvo-primary animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-zenvo-accent text-slate-950 font-black text-xs uppercase tracking-widest border border-black/20">
          404
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-zenvo-text tracking-tight uppercase mb-3">
        GAME LEVEL NOT FOUND
      </h1>
      <p className="text-sm sm:text-base text-zenvo-text-secondary max-w-md mb-8 leading-relaxed">
        The item, article, or page you are looking for does not exist or has been moved to another arena.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenvo-primary text-slate-950 font-black text-sm uppercase tracking-wide hover:bg-zenvo-primary-hover transition-all shadow-lg shadow-zenvo-primary/20 active:scale-95"
        >
          <Home className="w-4 h-4" /> Back To Home
        </Link>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border text-zenvo-text font-bold text-sm hover:border-zenvo-primary-border hover:text-zenvo-primary transition-all active:scale-95"
        >
          <Search className="w-4 h-4" /> Explore Catalog
        </Link>
      </div>
    </div>
  );
}
