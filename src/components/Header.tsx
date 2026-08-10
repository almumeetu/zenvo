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
} from 'lucide-react';
import { Product, CurrencyCode, UserProfile, CartItem } from '../types';
import { CURRENCIES } from '../data/initialData';
import { formatCurrency } from '../lib/currency';

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
}

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Support', href: '/support' },
];

export const Header: React.FC<HeaderProps> = ({
  products,
  selectedCurrency,
  onSelectCurrency,
  user,
  cartItems,
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

  // Scroll: update header style + progress bar
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 12);
      if (progressBarRef.current) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? scrollY / docH : 0;
        progressBarRef.current.style.transform = `scaleX(${pct})`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP entrance animation (once on mount)
  useEffect(() => {
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
            ? 'bg-zenvo-bg/92 backdrop-blur-2xl border-b border-zenvo-border shadow-lg shadow-black/20'
            : 'bg-zenvo-bg/50 backdrop-blur-md border-b border-transparent'
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-zenvo-surface/70 border-b border-zenvo-border/60 text-[11px] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
            <div className="flex items-center gap-3 text-zenvo-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-zenvo-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zenvo-success" />
                </span>
                <span className="font-semibold text-zenvo-text">24/7 Instant Delivery</span>
              </div>
              <span className="text-zenvo-border">•</span>
              <span>Sub-30 Second Automated Fulfillment</span>
              <span className="text-zenvo-border">•</span>
              <span>1M+ Trusted Gamers Worldwide</span>
            </div>
            <div className="flex items-center gap-1 text-zenvo-text-muted">
              <Zap className="w-3 h-3 text-zenvo-accent" />
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
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-zenvo-primary to-blue-700 p-[1.5px] shadow-primary group-hover:shadow-glow-blue transition-all duration-300">
              <div className="w-full h-full rounded-[9px] bg-zenvo-bg flex items-center justify-center overflow-hidden">
                <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-br from-zenvo-primary to-zenvo-accent font-mono">
                  Z
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-zenvo-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[9px]" />
              </div>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[17px] font-black tracking-tight text-zenvo-text uppercase group-hover:text-zenvo-primary transition-colors duration-200">
                ZENOV
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-zenvo-text-muted uppercase">
                Gaming Store
              </span>
            </div>
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
                      ? 'text-zenvo-primary bg-zenvo-primary-soft'
                      : 'text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-zenvo-primary" />
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
                  ? 'bg-zenvo-surface ring-2 ring-zenvo-primary/30 shadow-primary border border-zenvo-primary-border'
                  : 'bg-zenvo-surface/60 border border-zenvo-border hover:border-zenvo-border-hover'
              }`}
            >
              <Search className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search games, diamonds, gift cards..."
                className="w-full pl-10 pr-9 py-2.5 bg-transparent text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zenvo-text-muted hover:text-zenvo-text transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zenvo-card border border-zenvo-border rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zenvo-primary bg-zenvo-primary-soft/40 flex justify-between items-center border-b border-zenvo-border">
                  <span>Quick Results</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="divide-y divide-zenvo-border/50">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/top-up/${product.id}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zenvo-surface transition-colors group"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover border border-zenvo-border group-hover:border-zenvo-primary-border transition-colors shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zenvo-text group-hover:text-zenvo-primary transition-colors truncate">
                          {product.title}
                        </h4>
                        <p className="text-xs text-zenvo-text-secondary flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
                          <span className="text-zenvo-border">•</span>
                          <span className="text-zenvo-primary font-semibold font-mono">
                            From {formatCurrency(product.denominations[0]?.amount || 0, selectedCurrency)}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zenvo-text-muted group-hover:text-zenvo-primary transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
                <button
                  onMouseDown={() => handleSearchSubmit()}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-zenvo-text-secondary hover:text-zenvo-primary hover:bg-zenvo-primary-soft/30 transition-colors border-t border-zenvo-border text-center"
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
                className="px-2.5 py-2 rounded-lg bg-zenvo-surface/60 border border-zenvo-border hover:border-zenvo-border-hover text-xs font-bold text-zenvo-primary flex items-center gap-1.5 transition-all"
                aria-label="Select currency"
              >
                {selectedCurrency}
                <ChevronDown className={`w-3 h-3 text-zenvo-text-muted transition-transform duration-200 ${isCurrencyMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCurrencyMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-zenvo-card border border-zenvo-border rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onSelectCurrency(c.code);
                        setIsCurrencyMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between hover:bg-zenvo-surface transition-colors ${
                        selectedCurrency === c.code
                          ? 'text-zenvo-primary font-bold bg-zenvo-primary-soft'
                          : 'text-zenvo-text-secondary'
                      }`}
                    >
                      <span>{c.code}</span>
                      <span className="text-zenvo-text-muted">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet */}
            <Link
              href="/wallet"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-zenvo-surface/60 border border-zenvo-border hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft/50 transition-all group"
            >
              <Wallet className="w-4 h-4 text-zenvo-primary group-hover:scale-110 transition-transform" />
              <div className="text-left leading-tight">
                <p className="text-[9px] uppercase tracking-wider text-zenvo-text-muted font-semibold">Wallet</p>
                <p className="text-xs font-mono font-bold text-zenvo-text">
                  {formatCurrency(user.walletBalanceUSD, selectedCurrency)}
                </p>
              </div>
            </Link>

            {/* AI Assistant */}
            <Link
              href="/ai-assistant"
              title="ZENOV AI Assistant"
              className="hidden sm:flex p-2.5 rounded-xl bg-zenvo-surface/60 border border-zenvo-border hover:border-zenvo-accent-border hover:bg-zenvo-accent-soft/50 text-zenvo-text-secondary hover:text-zenvo-accent transition-all duration-200 relative"
            >
              <Bot className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-zenvo-success rounded-full border-2 border-zenvo-bg" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2.5 rounded-xl bg-zenvo-surface/60 border border-zenvo-border hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft/50 text-zenvo-text-secondary hover:text-zenvo-primary transition-all duration-200 relative"
              aria-label="View cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-zenvo-accent text-zenvo-bg font-mono font-black text-[10px] flex items-center justify-center shadow-md animate-bounce-subtle">
                  {totalCartCount > 99 ? '99+' : totalCartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2 p-1.5 pl-1.5 pr-2.5 rounded-xl bg-zenvo-surface/60 border border-zenvo-border hover:border-zenvo-border-hover transition-all"
                aria-label="Open profile menu"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-zenvo-border"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-zenvo-success rounded-full border-2 border-zenvo-bg" />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zenvo-text-muted hidden sm:block transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zenvo-card border border-zenvo-border rounded-2xl shadow-2xl overflow-hidden z-50">
                  {/* Profile header */}
                  <div className="p-4 bg-gradient-to-br from-zenvo-primary-soft to-zenvo-surface border-b border-zenvo-border">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover border-2 border-zenvo-primary-border" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zenvo-text truncate">{user.name}</p>
                        <p className="text-xs text-zenvo-text-secondary truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zenvo-accent-soft text-zenvo-accent border border-zenvo-accent-border uppercase tracking-wider">
                      ⭐ VIP {user.vipTier}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/wallet"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-xs text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-zenvo-primary shrink-0" />
                      <span>My Wallet ({formatCurrency(user.walletBalanceUSD, selectedCurrency)})</span>
                    </Link>
                    <Link
                      href="/orders/track"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-xs text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-zenvo-primary shrink-0" />
                      <span>Order History & Tracking</span>
                    </Link>
                    <Link
                      href="/ai-assistant"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-xs text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-zenvo-accent shrink-0" />
                      <span>AI Assistant</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold text-zenvo-primary hover:bg-zenvo-primary-soft rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <div className="h-px bg-zenvo-border mx-2 my-1" />
                    <Link
                      href="/auth/login"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-xs text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span>Account Settings / Login</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl bg-zenvo-surface/60 border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-text hover:border-zenvo-border-hover transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative rounded-xl bg-zenvo-surface/60 border border-zenvo-border focus-within:border-zenvo-primary-border transition-colors">
            <Search className="w-4 h-4 text-zenvo-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              className="w-full pl-10 pr-8 py-2.5 bg-transparent text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`lg:hidden border-t border-zenvo-border bg-zenvo-bg/95 backdrop-blur-2xl overflow-hidden transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 pt-3 pb-4 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label + item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  isActive(item.href)
                    ? 'text-zenvo-primary bg-zenvo-primary-soft'
                    : 'text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface'
                }`}
              >
                {item.label}
                {isActive(item.href) && <ChevronRight className="w-4 h-4 text-zenvo-primary" />}
              </Link>
            ))}
            <div className="border-t border-zenvo-border mt-3 pt-3 grid grid-cols-2 gap-2">
              <Link
                href="/wallet"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-zenvo-primary-soft text-zenvo-primary text-center hover:bg-zenvo-primary hover:text-white transition-all"
              >
                💰 Wallet
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-zenvo-accent-soft text-zenvo-accent text-center hover:bg-zenvo-accent hover:text-zenvo-bg transition-all"
              >
                🛒 Cart {totalCartCount > 0 ? `(${totalCartCount})` : ''}
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};
