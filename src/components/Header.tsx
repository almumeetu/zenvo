'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  Search,
  Wallet,
  ShoppingBag,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  X,
  Menu,
  Clock,
  Sparkles,
  Zap,
  ChevronRight,
  Home,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Product, CurrencyCode, UserProfile, CartItem } from '../types';
import { CURRENCIES } from '../data/initialData';
import { formatCurrency } from '../lib/currency';
import { ZenovLogo } from './ZenovLogo';

interface HeaderProps {
  products: Product[];
  selectedCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  user: UserProfile;
  cartItems: CartItem[];
  onOpenCart?: () => void;
  onOpenWallet?: () => void;
  onOpenOrderTracker?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  onSelectProduct?: (product: Product) => void;
  logout?: () => Promise<void>;
}

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQs', href: '/faqs' },
];

const navIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Home': Home,
  'Shop': ShoppingBag,
  'Blog': BookOpen,
  'FAQs': HelpCircle,
};

export const Header: React.FC<HeaderProps> = ({
  products,
  selectedCurrency,
  onSelectCurrency,
  user,
  cartItems,
  logout,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsCurrencyMenuOpen(false);
  }, [pathname]);

  // Scroll: update header style + progress bar with requestAnimationFrame & state diffing
  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const scrolled = scrollY > 12;
          if (lastScrolled !== scrolled) {
            lastScrolled = scrolled;
            setIsScrolled(scrolled);
          }
          if (progressBarRef.current) {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docH > 0 ? scrollY / docH : 0;
            progressBarRef.current.style.transform = `scaleX(${pct})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP entrance animation (once on mount - desktop only)
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    if (!logoRef.current || !navRef.current) return;
    const navItems = navRef.current.querySelectorAll('a');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        navItems,
        { opacity: 0, y: -8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.2,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // Close dropdowns on outside click
  const currencyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  };

  const handleSearchSubmit = useCallback(
    (e?: React.KeyboardEvent) => {
      if (!e || e.key === 'Enter') {
        if (searchQuery.trim()) {
          router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
          setSearchQuery('');
          setIsSearchFocused(false);
          setIsMobileMenuOpen(false);
        }
      }
    },
    [searchQuery, router]
  );

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left"
        style={{
          background: 'linear-gradient(90deg, #3b82f6, #f59e0b)',
          transform: 'scaleX(0)',
          transition: 'transform 0.1s linear',
        }}
      />

      <header
        ref={headerRef}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-zenov-bg/92 backdrop-blur-2xl border-b border-zenov-border shadow-lg shadow-black/20'
            : 'bg-zenov-bg/50 backdrop-blur-md border-b border-transparent'
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-zenov-surface/70 border-b border-zenov-border/60 text-[11px] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
            <div className="flex items-center gap-3 text-zenov-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-zenov-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zenov-success" />
                </span>
                <span className="font-semibold text-zenov-text">24/7 Instant Delivery</span>
              </div>
              <span className="text-zenov-border">•</span>
              <span>Sub-30 Second Automated Fulfillment</span>
              <span className="text-zenov-border">•</span>
              <span>1M+ Trusted Gamers Worldwide</span>
            </div>
            <div className="flex items-center gap-1 text-zenov-text-muted">
              <Zap className="w-3 h-3 text-zenov-accent" />
              <span className="font-medium">5,000+ orders delivered today</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            ref={logoRef}
            href="/"
            className="focus:outline-none shrink-0"
            aria-label="ZENOV Gaming Store Home"
          >
            <ZenovLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-zenov-primary bg-zenov-primary-soft'
                      : 'text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-surface'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-zenov-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar — Desktop */}
          <div className="flex-1 max-w-sm relative hidden md:block">
            <div
              className={`relative rounded-xl transition-all duration-200 ${
                isSearchFocused
                  ? 'bg-zenov-surface ring-2 ring-zenov-primary/30 shadow-primary border border-zenov-primary-border'
                  : 'bg-zenov-surface/60 border border-zenov-border hover:border-zenov-border-hover'
              }`}
            >
              <Search className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search games, diamonds, gift cards..."
                className="w-full pl-10 pr-9 py-2.5 bg-transparent text-sm text-zenov-text placeholder:text-zenov-text-muted focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zenov-text-muted hover:text-zenov-text transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zenov-card border border-zenov-border rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zenov-primary bg-zenov-primary-soft/40 flex justify-between items-center border-b border-zenov-border">
                  <span>Quick Results</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="divide-y divide-zenov-border/50">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/top-up/${product.id}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zenov-surface transition-colors group"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover border border-zenov-border group-hover:border-zenov-primary-border transition-colors shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zenov-text group-hover:text-zenov-primary transition-colors truncate">
                          {product.title}
                        </h4>
                        <p className="text-xs text-zenov-text-secondary flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
                          <span className="text-zenov-border">•</span>
                          <span className="text-zenov-primary font-semibold font-mono">
                            From {formatCurrency(product.denominations[0]?.amount || 0, selectedCurrency)}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zenov-text-muted group-hover:text-zenov-primary transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
                <button
                  onMouseDown={() => handleSearchSubmit()}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-zenov-text-secondary hover:text-zenov-primary hover:bg-zenov-primary-soft/30 transition-colors border-t border-zenov-border text-center"
                >
                  View all results for "{searchQuery}" →
                </button>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Currency Switcher */}
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setIsCurrencyMenuOpen((v) => !v)}
                className="px-2.5 py-2 rounded-lg bg-zenov-surface/60 border border-zenov-border hover:border-zenov-border-hover text-xs font-bold text-zenov-primary flex items-center gap-1.5 transition-all"
                aria-label="Select currency"
              >
                {selectedCurrency}
                <ChevronDown className={`w-3 h-3 text-zenov-text-muted transition-transform duration-200 ${isCurrencyMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCurrencyMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-zenov-card border border-zenov-border rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onSelectCurrency(c.code);
                        setIsCurrencyMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between hover:bg-zenov-surface transition-colors ${
                        selectedCurrency === c.code
                          ? 'text-zenov-primary font-bold bg-zenov-primary-soft'
                          : 'text-zenov-text-secondary'
                      }`}
                    >
                      <span>{c.code}</span>
                      <span className="text-zenov-text-muted">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>



            {/* Cart */}
            <Link
              href="/cart"
              className="p-2.5 rounded-xl bg-zenov-surface/60 border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/50 text-zenov-text-secondary hover:text-zenov-primary transition-all duration-200 relative"
              aria-label="View cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-zenov-accent text-zenov-bg font-mono font-black text-[10px] flex items-center justify-center shadow-md animate-bounce-subtle">
                  {totalCartCount > 99 ? '99+' : totalCartCount}
                </span>
              )}
            </Link>

            {/* Profile / Login */}
            {user.email ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 pl-1.5 pr-2.5 rounded-xl bg-zenov-surface/60 border border-zenov-border hover:border-zenov-border-hover transition-all"
                  aria-label="Open profile menu"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id || 'guest'}`}
                      alt={user.name || 'User'}
                      className="w-7 h-7 rounded-lg object-cover border border-zenov-border"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-zenov-success rounded-full border-2 border-zenov-bg" />
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zenov-text-muted hidden sm:block transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-zenov-card border border-zenov-border rounded-2xl shadow-2xl overflow-hidden z-50">
                    {/* Profile header */}
                    <div className="p-4 bg-gradient-to-br from-zenov-primary-soft to-zenov-surface border-b border-zenov-border">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id || 'guest'}`} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-xl object-cover border-2 border-zenov-primary-border" 
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zenov-text truncate">{user.name}</p>
                          <p className="text-xs text-zenov-text-secondary truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border uppercase tracking-wider">
                        ⭐ VIP {user.vipTier}
                      </span>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/orders/track"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3 py-2.5 text-xs text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-surface rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-zenov-primary shrink-0" />
                        <span>Order History & Tracking</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 text-xs font-semibold text-zenov-primary hover:bg-zenov-primary-soft rounded-xl flex items-center gap-2.5 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <div className="h-px bg-zenov-border mx-2 my-1" />
                      
                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          if (logout) {
                            await logout();
                          }
                          router.push('/');
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs text-zenov-error hover:bg-zenov-error-soft/10 rounded-xl flex items-center gap-2.5 transition-colors font-semibold"
                      >
                        <svg className="w-4 h-4 shrink-0 text-zenov-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-xl border border-zenov-border hover:border-zenov-primary-border/60 hover:bg-zenov-surface text-xs font-bold text-zenov-text-secondary transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-1.5 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-xs font-bold text-white transition-all shadow-sm hidden sm:block"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl bg-zenov-surface/60 border border-zenov-border text-zenov-text-secondary hover:text-zenov-text hover:border-zenov-border-hover transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative rounded-xl bg-zenov-surface/60 border border-zenov-border focus-within:border-zenov-primary-border focus-within:ring-2 focus-within:ring-zenov-primary/20 focus-within:bg-zenov-surface transition-all shadow-md">
            <Search className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery('');
                  setIsMobileMenuOpen(false);
                }
              }}
              placeholder="Search games, diamonds..."
              className="w-full pl-10 pr-8 py-2.5 bg-transparent text-sm text-zenov-text placeholder:text-zenov-text-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`lg:hidden border-t border-zenov-border bg-zenov-bg/95 backdrop-blur-2xl overflow-hidden transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 pt-3.5 pb-5 flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = navIcons[item.label] || Sparkles;
              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between border ${
                    active
                      ? 'text-zenov-primary bg-zenov-primary-soft/80 border-zenov-primary-border/30'
                      : 'text-zenov-text-secondary border-transparent hover:text-zenov-text hover:bg-zenov-surface/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-[18px] h-[18px] ${active ? 'text-zenov-primary' : 'text-zenov-text-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-zenov-primary shadow-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zenov-text-muted/65" />
                  )}
                </Link>
              );
            })}
            {/* Mobile Auth and Cart */}
            <div className="border-t border-zenov-border/60 mt-3 pt-3.5 space-y-3">
              {user.email ? (
                <>
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-zenov-surface to-zenov-surface/30 rounded-2xl border border-zenov-border/70 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id || 'guest'}`} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-zenov-border" 
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-zenov-success rounded-full border-2 border-zenov-surface" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zenov-text truncate">{user.name}</p>
                        <p className="text-xs text-zenov-text-secondary truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-widest">
                      VIP {user.vipTier}
                    </span>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zenov-primary-border/20 bg-zenov-primary-soft/30 text-xs font-bold text-zenov-primary hover:bg-zenov-primary hover:text-white transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      if (logout) await logout();
                      router.push('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zenov-error/20 bg-zenov-error-soft/10 text-xs font-bold text-zenov-error hover:bg-zenov-error hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0 text-zenov-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl border border-zenov-border hover:border-zenov-border-hover bg-zenov-surface/40 hover:bg-zenov-surface text-xs font-bold text-zenov-text-secondary transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-gradient-to-r from-zenov-primary to-blue-600 hover:from-zenov-primary-hover hover:to-blue-500 text-xs font-bold text-white transition-all shadow-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-zenov-accent to-orange-500 hover:from-zenov-accent-hover hover:to-orange-400 text-zenov-bg shadow-accent transition-all duration-300 transform active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart {totalCartCount > 0 ? `(${totalCartCount})` : ''}</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};
