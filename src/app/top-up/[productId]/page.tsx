'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useApp, PaymentMethod } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  Star,
  Heart,
  Minus,
  Plus,
  X,
  Gift,
  CreditCard,
  Phone,
  Wallet,
  Copy,
  ChevronRight,
  Gamepad2,
  Download,
  MessageCircle,
} from 'lucide-react';

export default function TopUpPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const {
    products,
    selectedCurrency,
    user,
    directCheckout,
    addToCart,
  } = useApp();

  const product = useMemo(
    () => products.find((p) => p.id === params.productId),
    [products, params.productId]
  );

  // form state
  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedPlayer, setVerifiedPlayer] = useState<{ name: string; level: string } | null>(null);
  const [selectedDenom, setSelectedDenom] = useState<string | null>(
    product?.denominations?.[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState<{ applied: boolean; code?: string; discountPct?: number; message?: string }>({ applied: false });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ orderNumber: string; message?: string; txid: string } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // reset denom if product changes
  useEffect(() => {
    if (product?.denominations?.[0]) {
      setSelectedDenom(product.denominations[0].id);
      setQuantity(1);
      setVerifiedPlayer(null);
      setPlayerId('');
      setServerId('');
      setCoupon('');
      setCouponState({ applied: false });
      setSuccessResult(null);
    }
  }, [product?.id]);

  if (!product) {
    notFound();
  }

  const denom = product.denominations.find((d) => d.id === selectedDenom);
  const subtotal = (denom?.amount || 0) * quantity;
  const discount = couponState.applied && couponState.discountPct ? subtotal * (couponState.discountPct / 100) : 0;
  const serviceFee = Math.max(0, subtotal * 0.015);
  const total = Math.max(0, subtotal - discount + serviceFee);

  const verifyPlayer = () => {
    if (!playerId.trim()) return;
    setVerifying(true);
    // Mock verification
    setTimeout(() => {
      const names = ['ShadowHunter', 'PhoenixRider', 'NoobMaster69', 'EpicGamer', 'ZENOVKing'];
      setVerifiedPlayer({
        name: names[Math.floor(Math.random() * names.length)] + '#' + Math.floor(1000 + Math.random() * 9000),
        level: 'Lv ' + Math.floor(30 + Math.random() * 70),
      });
      setVerifying(false);
    }, 900);
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    const map: Record<string, { pct: number }> = {
      ZENOV2026: { pct: 20 },
      BONUS10: { pct: 10 },
      WELCOME5: { pct: 5 },
      VIP30: { pct: 30 },
    };
    if (map[code]) {
      setCouponState({ applied: true, code, discountPct: map[code].pct, message: `${map[code].pct}% discount applied!` });
    } else {
      setCouponState({ applied: false, message: 'Invalid coupon code' });
    }
  };

  const fireConfetti = () => {
    const end = Date.now() + 1200;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 75, origin: { x: 0 }, colors: ['#3b82f6', '#f59e0b', '#10b981'] });
      confetti({ particleCount: 5, angle: 120, spread: 75, origin: { x: 1 }, colors: ['#3b82f6', '#f59e0b', '#10b981'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const onPay = async () => {
    if (!denom || !playerId.trim()) return;
    setSubmitting(true);
    const item = {
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      denomination: denom,
      quantity,
      playerId,
      serverId,
    } as any;
    const result = await directCheckout(item, paymentMethod);
    setSubmitting(false);
    if (result.success && result.orderNumber) {
      fireConfetti();
      setSuccessResult({
        orderNumber: result.orderNumber,
        message: result.message || 'Instant top-up delivered successfully',
        txid: 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      });
    }
  };

  const onAddToCart = () => {
    if (!denom) return;
    addToCart({
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      denomination: denom,
      quantity,
      playerId,
      serverId,
    } as any);
    router.push('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zenvo-text-muted mb-4 sm:mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenvo-primary transition-colors">Home</Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <Link href="/shop" className="hover:text-zenvo-primary transition-colors">Shop</Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="text-zenvo-text font-semibold truncate max-w-[160px] sm:max-w-[240px]">{product.title}</span>
      </div>

      {/* SUCCESS STATE */}
      {successResult && (
        <div className="mb-8 rounded-3xl border border-zenvo-success/30 bg-zenvo-success-soft/40 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zenvo-success/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-zenvo-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase font-bold tracking-widest text-zenvo-success mb-1">Payment Successful</p>
              <h2 className="text-xl sm:text-2xl font-black text-zenvo-text mb-1">{successResult.message}</h2>
              <p className="text-zenvo-text-secondary text-sm">
                Order <span className="font-mono font-bold text-zenvo-primary">{successResult.orderNumber}</span> • Ref{' '}
                <span className="font-mono text-zenvo-accent">{successResult.txid}</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/orders/track"
                className="px-4 py-2.5 rounded-lg bg-zenvo-surface border border-zenvo-border hover:border-zenvo-border-hover text-sm font-semibold text-zenvo-text-secondary hover:text-zenvo-text transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Invoice
              </Link>
              <Link
                href="/shop"
                className="px-4 py-2.5 rounded-lg bg-zenvo-primary hover:bg-zenvo-primary-hover text-white text-sm font-semibold shadow-primary inline-flex items-center gap-1.5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
        {/* RIGHT: Checkout form — comes FIRST on mobile */}
        <div className="lg:col-span-2 lg:order-2">
          <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
            {/* 1. Player ID */}
            <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-3.5 sm:p-5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenvo-text mb-3 flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zenvo-primary" />
                {product.playerIdLabel}
              </h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">
                    Enter {product.playerIdLabel}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => { setPlayerId(e.target.value); setVerifiedPlayer(null); }}
                      placeholder={product.playerIdPlaceholder || 'Enter ID...'}
                      className="flex-1 px-3 py-2 rounded-lg bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-xs sm:text-sm font-mono"
                    />
                    <button
                      onClick={verifyPlayer}
                      disabled={!playerId.trim() || verifying}
                      className="px-3 py-2 rounded-lg bg-zenvo-primary-soft hover:bg-zenvo-primary hover:text-white disabled:opacity-50 text-zenvo-primary text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
                    >
                      {verifying ? '...' : <><span className="hidden sm:inline">Verify</span> <CheckCircle2 className="w-3 h-3" /></>}
                    </button>
                  </div>
                </div>
                {verifiedPlayer && (
                  <div className="p-2.5 rounded-xl bg-zenvo-success-soft/60 border border-zenvo-success/30 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zenvo-success shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-zenvo-text-muted">Player found:</p>
                      <p className="text-xs font-bold text-zenvo-text truncate">
                        {verifiedPlayer.name} <span className="text-zenvo-primary">• {verifiedPlayer.level}</span>
                      </p>
                    </div>
                  </div>
                )}
                {(product.requiresServerId || product.hasServerId) && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1.5">
                      Server / Region (optional)
                    </label>
                    <input
                      type="text"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      placeholder="e.g. NA / EU / Asia"
                      className="w-full px-3 py-2 rounded-lg bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border focus:ring-2 focus:ring-zenvo-primary-border/40 outline-none transition-all text-xs sm:text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Denominations */}
            <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-3.5 sm:p-5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenvo-text mb-3">
                Select Package
              </h3>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {product.denominations.map((d) => {
                  const active = d.id === selectedDenom;
                  const save = d.originalAmount && d.originalAmount > d.amount
                    ? Math.round((1 - d.amount / d.originalAmount) * 100)
                    : 0;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDenom(d.id)}
                      className={`relative text-left p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all active:scale-[0.97] ${
                        active
                          ? 'bg-zenvo-primary-soft/60 border-zenvo-primary-border ring-1 ring-zenvo-primary-border/40 shadow-sm'
                          : 'bg-zenvo-surface/60 border-zenvo-border hover:border-zenvo-border-hover'
                      }`}
                    >
                      {save > 0 && (
                        <span className="absolute -top-1 -right-1 px-1 py-px rounded bg-zenvo-error text-white text-[8px] font-bold leading-tight">
                          -{save}%
                        </span>
                      )}
                      <p className={`text-[10px] sm:text-xs font-black font-mono leading-snug truncate ${active ? 'text-zenvo-primary' : 'text-zenvo-text'}`}>
                        {d.label || d.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] mt-0.5 text-zenvo-text-secondary font-bold leading-tight">
                        {formatCurrency(d.amount, selectedCurrency)}
                      </p>
                      {(d.bonusAmount || d.bonus || d.bonusLabel) && (
                        <p className="text-[8px] sm:text-[9px] mt-0.5 text-zenvo-accent font-semibold leading-tight truncate">
                          {d.bonusLabel || d.bonus}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quantity */}
              <div className="mt-3.5 flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-zenvo-text-muted">Qty</span>
                <div className="flex items-center gap-2 p-0.5 rounded-lg bg-zenvo-surface border border-zenvo-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 rounded-md text-zenvo-text-secondary hover:bg-zenvo-card hover:text-zenvo-text transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[32px] text-center font-mono font-black text-zenvo-text text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="p-1.5 rounded-md text-zenvo-text-secondary hover:bg-zenvo-card hover:text-zenvo-text transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Coupon */}
            <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-3.5 sm:p-5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenvo-text mb-2.5 flex items-center gap-2">
                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zenvo-accent" /> Promo Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); if (couponState.applied) setCouponState({ applied: false }); }}
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  placeholder="e.g. ZENOV2026"
                  className="flex-1 px-3 py-2 rounded-lg bg-zenvo-surface border border-zenvo-border focus:border-zenvo-accent-border focus:ring-2 focus:ring-zenvo-accent-border/40 outline-none transition-all text-xs sm:text-sm font-mono uppercase"
                />
                <button
                  onClick={applyCoupon}
                  className="px-3.5 py-2 rounded-lg bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg text-xs sm:text-sm font-bold transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponState.message && (
                <div className={`mt-1.5 text-[10px] sm:text-xs font-semibold ${couponState.applied ? 'text-zenvo-success' : 'text-zenvo-error'}`}>
                  {couponState.applied ? '✓ ' : '✗ '}{couponState.message}
                </div>
              )}
            </div>

            {/* 4. Payment + Summary */}
            <div className="rounded-2xl bg-zenvo-card border border-zenvo-border overflow-hidden">
              <div className="px-3.5 sm:px-5 pt-3.5 sm:pt-5">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenvo-text mb-2.5 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zenvo-primary" /> Payment
                </h3>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[
                    { id: 'bKash', I: Phone, tag: 'Popular' },
                    { id: 'Nagad', I: Phone, tag: '' },
                    { id: 'Rocket', I: Phone, tag: '' },
                    { id: 'Visa/Mastercard', I: CreditCard, tag: 'Card' },
                    { id: 'Crypto/USDT', I: Wallet, tag: 'Web3' },
                    { id: 'Zenov Wallet', I: Wallet, tag: user.walletBalanceUSD > 0 ? `$${user.walletBalanceUSD}` : 'Empty' },
                  ].map(({ id, I: Ic, tag }) => {
                    const active = paymentMethod === (id as PaymentMethod);
                    return (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id as PaymentMethod)}
                        className={`relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all flex items-center gap-2 text-left ${
                          active
                            ? 'bg-zenvo-primary-soft/50 border-zenvo-primary-border'
                            : 'bg-zenvo-surface/60 border-zenvo-border hover:border-zenvo-border-hover'
                        }`}
                      >
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shrink-0 ${active ? 'bg-zenvo-primary/15 text-zenvo-primary' : 'bg-zenvo-card text-zenvo-text-muted'}`}>
                          <Ic className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] sm:text-xs font-bold truncate ${active ? 'text-zenvo-primary' : 'text-zenvo-text'}`}>{id}</p>
                          {tag && <p className="text-[9px] text-zenvo-text-muted leading-tight">{tag}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="px-3.5 sm:px-5 pt-4 mt-1 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-zenvo-text-secondary">
                  <span>Subtotal ({quantity}×)</span>
                  <span className="font-mono">{formatCurrency(subtotal, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between text-zenvo-text-secondary">
                  <span>Service fee (1.5%)</span>
                  <span className="font-mono">{formatCurrency(serviceFee, selectedCurrency)}</span>
                </div>
                {couponState.applied && couponState.discountPct && (
                  <div className="flex justify-between text-zenvo-success">
                    <span>Discount ({couponState.code} −{couponState.discountPct}%)</span>
                    <span className="font-mono">−{formatCurrency(discount, selectedCurrency)}</span>
                  </div>
                )}
                <div className="h-px bg-zenvo-border my-2" />
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zenvo-text-muted">Total</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-zenvo-text">
                    {formatCurrency(total, selectedCurrency)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 sm:p-5 pt-3 space-y-2">
                <button
                  onClick={onPay}
                  disabled={!denom || !playerId.trim() || submitting || total <= 0}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-zenvo-primary via-blue-600 to-indigo-600 hover:shadow-primary text-white text-xs sm:text-sm font-black uppercase tracking-wider disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
                >
                  {submitting ? (
                    <>Processing <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      Pay {formatCurrency(total, selectedCurrency)} & Top-Up
                    </>
                  )}
                </button>
                <button
                  onClick={onAddToCart}
                  disabled={!denom || total <= 0}
                  className="w-full py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft/40 disabled:opacity-50 text-xs sm:text-sm font-bold text-zenvo-text-secondary hover:text-zenvo-primary transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-zenvo-text-muted flex-wrap">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SSL</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> 24/7</span>
                  <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Refundable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT: Product detail — below checkout on mobile */}
        <div className="lg:col-span-3 lg:order-1 space-y-4 sm:space-y-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zenvo-text-secondary hover:text-zenvo-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-zenvo-card border border-zenvo-border">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-zenvo-surface aspect-square border border-zenvo-border">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.deliveryType === 'Instant' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zenvo-success text-zenvo-bg text-[9px] font-bold uppercase shadow-sm">
                    <Zap className="w-2 h-2 fill-zenvo-bg" /> Instant
                  </span>
                )}
                {product.isHot && (
                  <span className="px-1.5 py-0.5 rounded bg-zenvo-accent text-zenvo-bg text-[9px] font-bold uppercase shadow-sm">
                    TRENDING
                  </span>
                )}
                {product.discountPercent && (
                  <span className="px-1.5 py-0.5 rounded bg-zenvo-error text-white text-[9px] font-bold">
                    -{product.discountPercent}% OFF
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsWishlisted((w) => !w)}
                className={`absolute top-2 right-2 p-1.5 rounded border transition-all ${
                  isWishlisted
                    ? 'bg-zenvo-error/20 border-zenvo-error/40 text-zenvo-error'
                    : 'bg-zenvo-bg/70 border-zenvo-border text-zenvo-text-muted hover:text-zenvo-error'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-zenvo-error' : ''}`} />
              </button>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[9px] sm:text-[11px] uppercase tracking-widest text-zenvo-text-muted font-semibold mb-1.5">
                  {product.publisher || product.category.replace('-', ' ')}
                </p>
                <h1 className="text-base sm:text-2xl lg:text-3xl font-black text-zenvo-text tracking-tight leading-tight mb-2 sm:mb-3">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-xs flex-wrap">
                  <div className="flex items-center gap-0.5 text-zenvo-text-secondary">
                    <Star className="w-3 h-3 fill-zenvo-accent text-zenvo-accent" />
                    <span className="font-semibold text-zenvo-text">{product.rating}</span>
                    <span className="text-zenvo-text-muted hidden sm:inline">({product.reviewCount.toLocaleString()})</span>
                  </div>
                  <span className="text-zenvo-text-muted capitalize hidden sm:inline">{product.region}</span>
                </div>
                <p className="text-[10px] sm:text-sm text-zenvo-text-secondary leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {product.description}
                </p>
              </div>

              <div className="mt-3 sm:mt-6 grid grid-cols-3 gap-1.5 sm:gap-3 text-[9px] sm:text-xs">
                {[
                  { I: Zap, label: product.deliveryType, sub: '≤30s' },
                  { I: ShieldCheck, label: 'Verified', sub: 'Official' },
                  { I: Clock, label: '24/7', sub: 'Support' },
                ].map(({ I, label, sub }) => (
                  <div key={label} className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-zenvo-surface/60 border border-zenvo-border text-center">
                    <I className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-zenvo-primary" />
                    <p className="font-bold text-zenvo-text leading-tight">{label}</p>
                    <p className="text-zenvo-text-muted leading-tight">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How to Top-Up */}
          <div className="rounded-2xl bg-zenvo-card border border-zenvo-border overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zenvo-border flex gap-4 text-xs sm:text-sm font-semibold">
              <div className="text-zenvo-primary border-b-2 border-zenvo-primary pb-2.5 sm:pb-3 -mb-[13px] sm:-mb-4">How to Top-Up</div>
              <div className="text-zenvo-text-secondary">Reviews</div>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {product.howToFindPlayerId?.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-zenvo-primary-soft text-zenvo-primary font-bold flex items-center justify-center text-xs sm:text-sm">
                    {i + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-zenvo-text-secondary pt-0.5 sm:pt-1.5">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
