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
  User,
  Mail,
} from 'lucide-react';
import { PaymentLogo } from '@/components/payment/PaymentLogos';
import ManualPaymentBox from '@/components/payment/ManualPaymentBox';

export default function TopUpPage() {
  const params = useParams<{ productId: string }>() ?? { productId: '' };
  const router = useRouter();
  const {
    products,
    selectedCurrency,
    user,
    directCheckout,
    addToCart,
  } = useApp();

  const product = useMemo(
    () => products.find((p) => p.id === params?.productId),
    [products, params?.productId]
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
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Sync with user profile
  useEffect(() => {
    if (user?.email && !customerEmail) setCustomerEmail(user.email);
    if (user?.name && !customerName) setCustomerName(user.name);
    if (user?.phone && !customerPhone) setCustomerPhone(user.phone);
  }, [user]);

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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-zenov-card border border-zenov-border space-y-4 shadow-xl">
          <Gamepad2 className="w-12 h-12 text-zenov-primary mx-auto opacity-80 animate-pulse" />
          <h2 className="text-xl font-black text-zenov-text uppercase tracking-tight">Catalog Item Not Found</h2>
          <p className="text-xs text-zenov-text-secondary leading-relaxed">
            The top-up game or gift card item you selected is currently unavailable or being updated in our server catalog.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zenov-primary text-slate-950 font-black text-xs uppercase tracking-wide hover:bg-zenov-primary-hover transition-all active:scale-95 shadow-md shadow-zenov-primary/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop Catalog
          </Link>
        </div>
      </div>
    );
  }

  const denom = product.denominations.find((d) => d.id === selectedDenom) || product.denominations[0];
  const unitPrice = denom ? denom.amount : 0;
  const subtotal = unitPrice * quantity;
  const serviceFee = Math.max(0, subtotal * 0.015);
  const total = Math.max(0, subtotal + serviceFee);

  const isGiftCard = product.category === 'gift-card' || product.playerIdLabel?.toLowerCase().includes('email');
  const requiresPlayerId = product.category === 'game-topup' && !isGiftCard;

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
    if (!denom) return;
    if (requiresPlayerId && !playerId.trim()) {
      alert(`Please enter your ${product.playerIdLabel || 'Player ID / UID'}.`);
      return;
    }
    if (!customerEmail.trim()) {
      alert('Please enter your email address to receive your order receipt.');
      return;
    }
    if (!trxId.trim()) {
      alert(`Please send ${paymentMethod} payment to the number above and enter the Transaction ID (TrxID).`);
      return;
    }
    setSubmitting(true);
    const item = {
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      denomination: denom,
      quantity,
      playerId: requiresPlayerId ? playerId.trim() : (customerEmail.trim() || 'GIFT_CARD_ORDER'),
      serverId: requiresPlayerId ? serverId.trim() : '',
    } as any;
    const result = await directCheckout(item, paymentMethod, {
      name: customerName.trim() || user?.name || 'Gamer',
      email: customerEmail.trim() || user?.email || 'guest@zenovgames.com',
      phone: customerPhone.trim() || user?.phone || '',
      senderNumber: senderNumber.trim() || customerPhone.trim(),
      trxId: trxId.trim(),
    });
    setSubmitting(false);
    if (result.success && result.orderNumber) {
      fireConfetti();
      router.push(`/orders/confirmation/${encodeURIComponent(result.orderNumber)}`);
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
      playerId: requiresPlayerId ? playerId.trim() : (customerEmail.trim() || 'GIFT_CARD_ORDER'),
      serverId: requiresPlayerId ? serverId.trim() : '',
    } as any);
    router.push('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zenov-text-muted mb-4 sm:mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <Link href="/shop" className="hover:text-zenov-primary transition-colors">Shop</Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="text-zenov-text font-semibold truncate max-w-[160px] sm:max-w-[240px]">{product.title}</span>
      </div>

      {/* SUCCESS STATE */}
      {successResult && (
        <div className="mb-8 rounded-3xl border border-zenov-success/30 bg-zenov-success-soft/40 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zenov-success/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-zenov-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase font-bold tracking-widest text-zenov-success mb-1">Payment Successful</p>
              <h2 className="text-xl sm:text-2xl font-black text-zenov-text mb-1">{successResult.message}</h2>
              <p className="text-zenov-text-secondary text-sm">
                Order <span className="font-mono font-bold text-zenov-primary">{successResult.orderNumber}</span> • Ref{' '}
                <span className="font-mono text-zenov-accent">{successResult.txid}</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/orders/track"
                className="px-4 py-2.5 rounded-lg bg-zenov-surface border border-zenov-border hover:border-zenov-border-hover text-sm font-semibold text-zenov-text-secondary hover:text-zenov-text transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Invoice
              </Link>
              <Link
                href="/shop"
                className="px-4 py-2.5 rounded-lg bg-zenov-primary hover:bg-zenov-primary-hover text-white text-sm font-semibold shadow-primary inline-flex items-center gap-1.5"
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
            {/* 1. Player ID / UID (Only for Game Top-Ups, Hidden for Gift Cards) */}
            {requiresPlayerId && (
              <div className="rounded-2xl bg-zenov-card border border-zenov-border p-3.5 sm:p-5">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zenov-primary" />
                  {product.playerIdLabel || 'Player ID / UID'}
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">
                      Enter {product.playerIdLabel || 'Player ID'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={playerId}
                        onChange={(e) => { setPlayerId(e.target.value); setVerifiedPlayer(null); }}
                        placeholder={product.playerIdPlaceholder || 'Enter Player UID...'}
                        className="flex-1 px-3 py-2 rounded-lg bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-xs sm:text-sm font-mono"
                      />
                      <button
                        onClick={verifyPlayer}
                        disabled={!playerId.trim() || verifying}
                        className="px-3 py-2 rounded-lg bg-zenov-primary-soft hover:bg-zenov-primary hover:text-white disabled:opacity-50 text-zenov-primary text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        {verifying ? '...' : <><span className="hidden sm:inline">Verify</span> <CheckCircle2 className="w-3 h-3" /></>}
                      </button>
                    </div>
                  </div>
                  {verifiedPlayer && (
                    <div className="p-2.5 rounded-xl bg-zenov-success-soft/60 border border-zenov-success/30 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-zenov-success shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-zenov-text-muted">Player found:</p>
                        <p className="text-xs font-bold text-zenov-text truncate">
                          {verifiedPlayer.name} <span className="text-zenov-primary">• {verifiedPlayer.level}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  {(product.requiresServerId || product.hasServerId) && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">
                        Server / Region (optional)
                      </label>
                      <input
                        type="text"
                        value={serverId}
                        onChange={(e) => setServerId(e.target.value)}
                        placeholder="e.g. NA / EU / Asia"
                        className="w-full px-3 py-2 rounded-lg bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none transition-all text-xs sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Denominations / Packages */}
            <div className="rounded-2xl bg-zenov-card border border-zenov-border p-3.5 sm:p-5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text mb-3">
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
                          ? 'bg-zenov-primary-soft/60 border-zenov-primary-border ring-1 ring-zenov-primary-border/40 shadow-sm'
                          : 'bg-zenov-surface/60 border-zenov-border hover:border-zenov-border-hover'
                      }`}
                    >
                      {save > 0 && (
                        <span className="absolute -top-1 -right-1 px-1 py-px rounded bg-zenov-error text-white text-[8px] font-bold leading-tight">
                          -{save}%
                        </span>
                      )}
                      <p className={`text-[10px] sm:text-xs font-black font-mono leading-snug truncate ${active ? 'text-zenov-primary' : 'text-zenov-text'}`}>
                        {d.label || d.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] mt-0.5 text-zenov-text-secondary font-bold leading-tight">
                        {formatCurrency(d.amount, selectedCurrency)}
                      </p>
                      {(d.bonusAmount || d.bonus || d.bonusLabel) && (
                        <p className="text-[8px] sm:text-[9px] mt-0.5 text-zenov-accent font-semibold leading-tight truncate">
                          {d.bonusLabel || d.bonus}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quantity */}
              <div className="mt-3.5 flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-zenov-text-muted">Qty</span>
                <div className="flex items-center gap-2 p-0.5 rounded-lg bg-zenov-surface border border-zenov-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 rounded-md text-zenov-text-secondary hover:bg-zenov-card hover:text-zenov-text transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[32px] text-center font-mono font-black text-zenov-text text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="p-1.5 rounded-md text-zenov-text-secondary hover:bg-zenov-card hover:text-zenov-text transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Customer Contact Details */}
            <div className="rounded-2xl bg-zenov-card border border-zenov-border p-3.5 sm:p-5 space-y-3">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text flex items-center gap-2">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zenov-primary" />
                Customer Details
              </h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Shakib Ahmed"
                    className="w-full px-3 py-2 rounded-lg bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-xs sm:text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Email Address (For Instant Receipt) *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    placeholder="e.g. shakib@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-xs sm:text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-xs sm:text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. Payment + Summary */}
            <div className="rounded-2xl bg-zenov-card border border-zenov-border overflow-hidden space-y-4">
              <div className="px-3.5 sm:px-5 pt-3.5 sm:pt-5">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text mb-2.5 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zenov-primary" /> Select Payment Method
                </h3>
                 <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { id: 'bKash', tag: 'Personal', accent: 'border-pink-500 bg-pink-500/15 shadow-pink-500/20' },
                    { id: 'Nagad', tag: 'Personal', accent: 'border-orange-500 bg-orange-500/15 shadow-orange-500/20' },
                    { id: 'Rocket', tag: 'Personal', accent: 'border-purple-500 bg-purple-500/15 shadow-purple-500/20' },
                    { id: 'Bank Transfer', tag: 'Local Bank', accent: 'border-blue-500 bg-blue-500/15 shadow-blue-500/20' },
                    { id: 'Crypto/USDT', tag: 'TRC20', accent: 'border-emerald-500 bg-emerald-500/15 shadow-emerald-500/20' },
                  ].map(({ id, tag, accent }) => {
                    const active = paymentMethod === (id as PaymentMethod);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id as PaymentMethod)}
                        className={`relative p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center gap-2.5 text-left ${
                          active
                            ? `${accent} shadow-md scale-[1.02]`
                            : 'bg-zenov-surface/70 border-zenov-border hover:border-zenov-border-hover hover:bg-zenov-surface'
                        }`}
                      >
                        <PaymentLogo method={id} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] sm:text-xs font-black truncate leading-tight ${active ? 'text-white' : 'text-zenov-text'}`}>
                            {id}
                          </p>
                          {tag && <p className="text-[9px] text-zenov-text-muted font-medium leading-none mt-0.5">{tag}</p>}
                        </div>
                        {/* Active checkmark */}
                        {active && (
                          <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-zenov-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual Payment Details & TrxID Input Box */}
              <div className="px-3.5 sm:px-5">
                <ManualPaymentBox
                  paymentMethod={paymentMethod}
                  totalAmountUSD={total}
                  selectedCurrency={selectedCurrency}
                  senderNumber={senderNumber}
                  setSenderNumber={setSenderNumber}
                  trxId={trxId}
                  setTrxId={setTrxId}
                />
              </div>

              {/* Summary */}
              <div className="px-3.5 sm:px-5 pt-1 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-zenov-text-secondary">
                  <span>Subtotal ({quantity}×)</span>
                  <span className="font-mono">{formatCurrency(subtotal, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between text-zenov-text-secondary">
                  <span>Service fee (1.5%)</span>
                  <span className="font-mono">{formatCurrency(serviceFee, selectedCurrency)}</span>
                </div>
                <div className="h-px bg-zenov-border my-2" />
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zenov-text-muted">Total Payable</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-zenov-text">
                    {formatCurrency(total, selectedCurrency)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 sm:p-5 pt-1 space-y-2">
                {/* PRIMARY ACTION: Submit with TrxID */}
                <div className="relative">
                  <div className="absolute -top-2.5 left-3 px-1.5 bg-zenov-card z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zenov-primary">Step 1 — Pay &amp; Submit TrxID</span>
                  </div>
                  <button
                    onClick={onPay}
                    disabled={!denom || (requiresPlayerId && !playerId.trim()) || !trxId.trim() || submitting || total <= 0}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenov-primary via-blue-600 to-indigo-600 hover:shadow-primary text-white text-xs sm:text-sm font-black uppercase tracking-wider disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
                  >
                    {submitting ? (
                      <>Submitting Order <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        Submit Order with TrxID ({formatCurrency(total, selectedCurrency)})
                      </>
                    )}
                  </button>
                </div>

                {/* DIVIDER */}
                <div className="relative flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-zenov-border" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zenov-text-muted px-1">or</span>
                  <div className="flex-1 h-px bg-zenov-border" />
                </div>

                {/* SECONDARY ACTION: Add to Cart */}
                <div className="relative">
                  <div className="absolute -top-2.5 left-3 px-1.5 bg-zenov-card z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zenov-text-muted">Step 1 alt — Add to Cart</span>
                  </div>
                  <button
                    onClick={onAddToCart}
                    disabled={!denom || total <= 0}
                    className="w-full py-2.5 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/40 disabled:opacity-50 text-xs sm:text-sm font-bold text-zenov-text-secondary hover:text-zenov-primary transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Cart &amp; Pay Later
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-zenov-text-muted flex-wrap">
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
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zenov-text-secondary hover:text-zenov-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-zenov-card border border-zenov-border">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-zenov-surface aspect-square border border-zenov-border">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.deliveryType === 'Instant' && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-zenov-success text-zenov-bg text-[9px] font-bold uppercase shadow-sm">
                    <Zap className="w-2.5 h-2.5 fill-zenov-bg" /> Instant
                  </span>
                )}
                {product.isHot && (
                  <span className="px-2 py-0.5 rounded-md bg-zenov-accent text-zenov-bg text-[9px] font-bold uppercase shadow-sm">
                    TRENDING
                  </span>
                )}
                {Boolean(product.discountPercent && product.discountPercent > 0) && (
                  <span className="px-2 py-0.5 rounded-md bg-zenov-error text-white text-[9px] font-bold shadow-sm">
                    -{product.discountPercent}% OFF
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsWishlisted((w) => !w)}
                className={`absolute top-2 right-2 p-1.5 rounded-lg border transition-all ${
                  isWishlisted
                    ? 'bg-zenov-error/20 border-zenov-error/40 text-zenov-error'
                    : 'bg-zenov-bg/70 border-zenov-border text-zenov-text-muted hover:text-zenov-error'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-zenov-error' : ''}`} />
              </button>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[9px] sm:text-[11px] uppercase tracking-widest text-zenov-text-muted font-semibold mb-1.5">
                  {product.publisher || product.category.replace('-', ' ')}
                </p>
                <h1 className="text-base sm:text-2xl lg:text-3xl font-black text-zenov-text tracking-tight leading-tight mb-2 sm:mb-3">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-xs flex-wrap">
                  {product.reviewCount && product.reviewCount > 0 ? (
                    <div className="flex items-center gap-0.5 text-zenov-text-secondary">
                      <Star className="w-3 h-3 fill-zenov-accent text-zenov-accent" />
                      <span className="font-semibold text-zenov-text">{product.rating}</span>
                      <span className="text-zenov-text-muted hidden sm:inline">({product.reviewCount.toLocaleString()} Verified Reviews)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zenov-success uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Partner
                    </div>
                  )}
                  <span className="text-zenov-text-muted capitalize hidden sm:inline">• {product.region}</span>
                </div>
                <p className="text-[10px] sm:text-sm text-zenov-text-secondary leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {product.description}
                </p>
              </div>

              <div className="mt-3 sm:mt-6 grid grid-cols-3 gap-1.5 sm:gap-3 text-[9px] sm:text-xs">
                {[
                  { I: Zap, label: product.deliveryType, sub: '≤30s' },
                  { I: ShieldCheck, label: 'Verified', sub: 'Official' },
                  { I: Clock, label: '24/7', sub: 'Support' },
                ].map(({ I, label, sub }) => (
                  <div key={label} className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-zenov-surface/60 border border-zenov-border text-center">
                    <I className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-zenov-primary" />
                    <p className="font-bold text-zenov-text leading-tight">{label}</p>
                    <p className="text-zenov-text-muted leading-tight">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How to Top-Up & Instructions */}
          <div className="rounded-2xl bg-zenov-card border border-zenov-border overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zenov-border flex items-center justify-between">
              <div className="text-xs sm:text-sm font-black text-zenov-text uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-zenov-primary" /> How to Top-Up & Redeem
              </div>
              <span className="text-[10px] font-bold uppercase text-zenov-primary bg-zenov-primary-soft px-2.5 py-0.5 rounded-full border border-zenov-primary-border/30">
                Instant Automated Delivery
              </span>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {product.instructions && (
                <div className="p-3.5 rounded-xl bg-zenov-surface/70 border border-zenov-border text-xs sm:text-sm text-zenov-text leading-relaxed">
                  <p className="font-bold text-zenov-primary mb-1 text-[10px] uppercase tracking-wider">Instructions:</p>
                  <p className="text-zenov-text-secondary">{product.instructions}</p>
                </div>
              )}

              {product.howToFindPlayerId && product.howToFindPlayerId.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted">
                    Steps to complete order:
                  </p>
                  {product.howToFindPlayerId.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zenov-primary-soft text-zenov-primary font-bold flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-zenov-text-secondary pt-0.5 sm:pt-1">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
