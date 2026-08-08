import React, { useState } from 'react';
import {
  Search,
  Wallet,
  ShoppingBag,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  SearchIcon,
  X,
  CreditCard,
  Menu,
  Clock,
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
  onOpenCart: () => void;
  onOpenWallet: () => void;
  onOpenOrderTracker: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  selectedCurrency,
  onSelectCurrency,
  user,
  cartItems,
  onOpenCart,
  onOpenWallet,
  onOpenOrderTracker,
  onOpenAiAssistant,
  onOpenAuth,
  onOpenAdmin,
  onSelectProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-[#060a0f]/90 backdrop-blur-md border-b border-emerald-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      {/* Top Ticker Alert */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/10 text-[11px] py-1 px-4 text-emerald-400/90 font-mono flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff66]"></span>
          <span>AUTOMATED 24/7 INSTANT TOP-UP GATEWAY ONLINE</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">SUB-30 SECOND DELIVERY GUARANTEED</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <button
            onClick={onOpenOrderTracker}
            className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Track Order Status</span>
          </button>
          <span>|</span>
          <button
            onClick={onOpenAiAssistant}
            className="hover:text-emerald-400 flex items-center gap-1 transition-colors text-emerald-300"
          >
            <Bot className="w-3 h-3 text-emerald-400" />
            <span>Zenvo AI Assistant</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 p-0.5 shadow-[0_0_15px_rgba(0,255,102,0.4)] group-hover:shadow-[0_0_25px_rgba(0,255,102,0.7)] transition-all duration-300">
              <div className="w-full h-full bg-[#080d12] rounded-[10px] flex items-center justify-center border border-emerald-400/30">
                <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono tracking-tighter">
                  Z
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-wider text-white font-mono uppercase group-hover:text-emerald-400 transition-colors">
                  ZENVO
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded shadow-[0_0_10px_rgba(0,255,102,0.2)]">
                  GAMES
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                NEXT-GEN TOP-UP COCKPIT
              </p>
            </div>
          </button>
        </div>

        {/* Middle: Global Live Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div
            className={`relative rounded-xl transition-all duration-300 ${
              isSearchFocused
                ? 'shadow-[0_0_20px_rgba(0,255,102,0.25)] border-emerald-400/60'
                : 'border-slate-800 hover:border-slate-700'
            } bg-[#0c1218] border`}
          >
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search games, diamonds, gift cards..."
              className="w-full pl-10 pr-9 py-2 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c131a] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
              <div className="p-2 text-[11px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-950/30 px-3 flex justify-between items-center">
                <span>Matching Games & Cards</span>
                <Sparkles className="w-3 h-3" />
              </div>
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    setSearchQuery('');
                  }}
                  className="w-full p-2.5 flex items-center gap-3 hover:bg-emerald-950/40 text-left transition-colors group"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 group-hover:border-emerald-400"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 truncate">
                      {product.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="capitalize">{product.category.replace('-', ' ')}</span>
                      <span>•</span>
                      <span className="text-emerald-400/90 font-mono">
                        From {formatCurrency(product.denominations[0]?.amount || 0, selectedCurrency)}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                    Instant
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions (Currency, Wallet, AI, Cart, Profile, Admin) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0c1218] border border-slate-800 hover:border-emerald-500/40 text-xs font-mono text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 transition-all"
            >
              <span className="text-emerald-400 font-bold">{selectedCurrency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isCurrencyMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#0c131a] border border-emerald-500/30 rounded-xl shadow-2xl py-1 z-50 font-mono">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onSelectCurrency(c.code);
                      setIsCurrencyMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-emerald-950/50 transition-colors ${
                      selectedCurrency === c.code ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-300'
                    }`}
                  >
                    <span>{c.code} ({c.symbol})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Wallet Balance Widget */}
          <button
            onClick={onOpenWallet}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-[#0e1620] to-[#0a1017] border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_12px_rgba(0,255,102,0.15)] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider leading-none">Wallet</p>
              <p className="text-xs font-mono font-bold text-emerald-400 leading-tight">
                {formatCurrency(user.walletBalanceUSD, selectedCurrency)}
              </p>
            </div>
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold hover:bg-emerald-500 hover:text-black transition-colors ml-1">
              +
            </span>
          </button>

          {/* AI Assistant Floating Pulse Button */}
          <button
            onClick={onOpenAiAssistant}
            title="Zenvo Cyber AI Assistant"
            className="p-2 rounded-xl bg-[#0e1721] border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all relative group"
          >
            <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-black"></span>
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={onOpenCart}
            className="p-2.5 rounded-xl bg-[#0c1218] border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-400 transition-all relative"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-black font-mono font-black text-[10px] flex items-center justify-center shadow-[0_0_10px_#00ff66]">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Profile / Auth Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0c1218] border border-slate-800 hover:border-emerald-500/40 transition-all"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0c131a] border border-emerald-500/30 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
                <div className="p-2">
                  <p className="text-xs font-bold text-white font-mono">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <span className="mt-1.5 inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    VIP: {user.vipTier}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenWallet();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>My Wallet ({formatCurrency(user.walletBalanceUSD, selectedCurrency)})</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenOrderTracker();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Order History & Tracking</span>
                  </button>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-cyan-400 hover:bg-cyan-950/40 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Admin HUD Cockpit</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Account Settings / Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Cockpit Quick Launch Button */}
          <button
            onClick={onOpenAdmin}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 hover:border-cyan-400/80 text-cyan-400 text-xs font-mono font-bold shadow-[0_0_12px_rgba(0,229,255,0.15)] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMIN COCKPIT</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input (Visible on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative rounded-xl bg-[#0c1218] border border-slate-800">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full pl-9 pr-8 py-2 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
