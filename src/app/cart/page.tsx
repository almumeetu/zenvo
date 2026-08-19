'use client';

import Link from 'next/link';
import { useApp, PaymentMethod } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Gift,
  ShieldCheck,
  CreditCard,
  Tag,
  ChevronRight,
  ShoppingCart as CartIcon,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Zap,
  Lock,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ManualPaymentBox from '@/components/payment/ManualPaymentBox';
import { PaymentLogo } from '@/components/payment/PaymentLogos';

export default function CartPage() {
  const {
    cartItems,
    selectedCurrency,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    placeOrder,
    user,
  } = useApp();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ orderNumber: string; message: string } | null>(null);

  useEffect(() => {
    if (user?.name && !customerName) setCustomerName(user.name);
    if (user?.email && !customerEmail) setCustomerEmail(user.email);
    if (user?.phone && !customerPhone) setCustomerPhone(user.phone);
  }, [user]);

  const totalItemsCount = cartItems.reduce((s, it) => s + it.quantity, 0);
  const subtotal = cartItems.reduce(
    (s, it) => s + it.denomination.amount * it.quantity,
    0
  );
  const serviceFee = subtotal * 0.015;
  const total = Math.max(0, subtotal + serviceFee);

  const fireConfetti = () => {
    const end = Date.now() + 1200;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 75, origin: { x: 0 }, colors: ['#3b82f6', '#f59e0b', '#10b981'] });
      confetti({ particleCount: 5, angle: 120, spread: 75, origin: { x: 1 }, colors: ['#3b82f6', '#f59e0b', '#10b981'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const onCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!customerEmail.trim()) {
      alert('Please provide your email address for instant order delivery & receipt.');
      return;
    }
    if (!trxId.trim()) {
      alert(`Please send ${paymentMethod} payment and provide the Transaction ID (TrxID).`);
      return;
    }
    setSubmitting(true);
    const res = await placeOrder(paymentMethod, {
      name: customerName.trim() || user?.name || 'Gamer',
      email: customerEmail.trim() || user?.email || 'guest@zenovgames.com',
      phone: customerPhone.trim() || user?.phone || '',
      senderNumber: senderNumber.trim() || customerPhone.trim(),
      trxId: trxId.trim(),
    });
    setSubmitting(false);
    if (res.success && res.orderNumber) {
      fireConfetti();
      router.push(`/orders/confirmation/${encodeURIComponent(res.orderNumber!)}`);
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zenov-text-muted mb-4 sm:mb-6 flex-wrap">
          <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-zenov-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zenov-text font-semibold">Shopping Cart ({totalItemsCount})</span>
        </div>

      {/* Cart Header */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8 pb-4 border-b border-zenov-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-zenov-primary-soft border border-zenov-primary-border flex items-center justify-center text-zenov-primary shadow-xs">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-zenov-text uppercase tracking-tight flex items-center gap-2">
              <span>Shopping Cart</span>
              <span className="text-xs sm:text-sm font-bold text-zenov-primary bg-zenov-primary-soft px-2.5 py-0.5 rounded-full border border-zenov-primary-border/40">
                {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zenov-text-secondary mt-0.5">
              Review your selected digital packages and complete checkout
            </p>
          </div>
        </div>

        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zenov-surface hover:bg-zenov-card border border-zenov-border hover:border-zenov-primary-border text-xs font-bold text-zenov-text-secondary hover:text-zenov-primary transition-all shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" /> Continue Shopping
        </Link>
      </div>

      {/* SUCCESS CONFIRMATION STATE */}
      {successOrder ? (
        <div className="max-w-xl mx-auto py-12 px-6 rounded-3xl bg-zenov-card border border-zenov-border text-center space-y-5 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-zenov-success/15 border border-zenov-success/40 text-zenov-success flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zenov-text">Order Confirmed!</h2>
            <p className="text-sm text-zenov-text-secondary mt-1">
              Your digital game top-up is being processed. An email receipt has been sent to <span className="text-zenov-primary font-bold">{customerEmail}</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zenov-surface border border-zenov-border font-mono text-center">
            <p className="text-[10px] uppercase font-bold text-zenov-text-muted">Order Tracking Number</p>
            <p className="text-xl font-black text-zenov-accent mt-0.5">#{successOrder.orderNumber}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/orders/track?orderId=${encodeURIComponent(successOrder.orderNumber)}`}
              className="flex-1 py-3 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs font-black uppercase tracking-wider transition-all"
            >
              Track This Order
            </Link>
            <Link
              href="/shop"
              className="flex-1 py-3 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border text-zenov-text text-xs font-bold uppercase tracking-wider transition-all"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        /* EMPTY CART STATE */
        <div className="py-16 sm:py-24 text-center rounded-3xl bg-zenov-card/70 border border-zenov-border shadow-md">
          <div className="w-20 h-20 rounded-2xl bg-zenov-surface border border-zenov-border flex items-center justify-center mx-auto mb-4 text-zenov-text-muted">
            <CartIcon className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zenov-text uppercase tracking-tight mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-xs sm:text-sm text-zenov-text-secondary mb-7 max-w-sm mx-auto">
            Looks like you haven't added any game top-ups or gift cards yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-primary transition-all active:scale-95"
          >
            Browse All Games & Top-Ups <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* MAIN LIST SYSTEM & CHECKOUT LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: LIST SYSTEM */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* 1. Item List Container */}
            <div className="rounded-2xl sm:rounded-3xl bg-zenov-card border border-zenov-border overflow-hidden shadow-sm">
              {/* List Header Bar */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3.5 bg-zenov-surface/80 border-b border-zenov-border text-[10.5px] font-black uppercase tracking-wider text-zenov-text-muted">
                <div className="col-span-6">Item / Game Package</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Items List Rows */}
              <div className="divide-y divide-zenov-border/60">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.denomination.id}`}
                    className="p-3.5 sm:p-5 hover:bg-zenov-surface/30 transition-colors"
                  >
                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-3 items-start sm:items-center">
                      
                      {/* Product Poster + Title + Package info (Col 1-6) */}
                      <div className="sm:col-span-6 flex items-center gap-3 min-w-0 w-full">
                        <Link
                          href={`/top-up/${item.productId}`}
                          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-zenov-surface border border-zenov-border shrink-0 group/img"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link href={`/top-up/${item.productId}`}>
                            <h3 className="text-xs sm:text-sm font-black text-zenov-text hover:text-zenov-primary transition-colors line-clamp-1">
                              {item.productTitle}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zenov-primary-soft text-zenov-primary text-[9px] sm:text-[10px] font-bold">
                              <Tag className="w-2.5 h-2.5" />
                              {item.denomination.label || item.denomination.name}
                            </span>
                            {item.playerId && (
                              <span className="text-[9.5px] sm:text-[10px] font-mono text-zenov-text-muted truncate">
                                ID: {item.playerId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unit Price (Col 7-8) */}
                      <div className="sm:col-span-2 sm:text-center w-full flex justify-between sm:block">
                        <span className="sm:hidden text-[10px] text-zenov-text-muted font-semibold">Unit Price:</span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-zenov-text">
                          {formatCurrency(item.denomination.amount, selectedCurrency)}
                        </span>
                      </div>

                      {/* Quantity Controller (Col 9-10) */}
                      <div className="sm:col-span-2 sm:flex sm:justify-center w-full flex justify-between items-center">
                        <span className="sm:hidden text-[10px] text-zenov-text-muted font-semibold">Quantity:</span>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zenov-surface border border-zenov-border">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.denomination.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-md text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-card transition-colors disabled:opacity-30 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[24px] text-center font-mono font-black text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.denomination.id, item.quantity + 1)}
                            className="p-1 rounded-md text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-card transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Line Subtotal & Delete Action (Col 11-12) */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 w-full pt-1 sm:pt-0 border-t sm:border-0 border-zenov-border/40">
                        <span className="sm:hidden text-[10px] text-zenov-text-muted font-semibold">Total:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs sm:text-sm text-zenov-primary">
                            {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                          </span>
                          <button
                            onClick={() => removeCartItem(item.productId, item.denomination.id)}
                            className="p-1.5 rounded-lg text-zenov-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* List Footer Bar */}
              <div className="px-4 py-3 bg-zenov-surface/50 border-t border-zenov-border flex items-center justify-between text-xs">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 font-bold text-zenov-text-secondary hover:text-zenov-primary transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" /> Continue Shopping
                </Link>
                <button
                  onClick={() => clearCart()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-zenov-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Cart
                </button>
              </div>
            </div>

            {/* 2. Customer Contact Info Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zenov-card border border-zenov-border space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text flex items-center gap-2">
                  <User className="w-4 h-4 text-zenov-primary" /> Delivery & Customer Information
                </h3>
                <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Instant Automated Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zenov-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Shakib Ahmed"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-1 focus:ring-zenov-primary-border text-xs sm:text-sm text-zenov-text outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Email Address * (For Receipt)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zenov-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      placeholder="e.g. name@gmail.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-1 focus:ring-zenov-primary-border text-xs sm:text-sm text-zenov-text outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    WhatsApp / Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-zenov-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-1 focus:ring-zenov-primary-border text-xs sm:text-sm text-zenov-text outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method & TrxID Verification */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zenov-card border border-zenov-border space-y-4 shadow-sm">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zenov-primary" /> Select Payment Gateway
              </h3>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Crypto/USDT'].map((method) => {
                  const active = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-zenov-primary-soft/60 border-zenov-primary text-white shadow-xs ring-1 ring-zenov-primary'
                          : 'bg-zenov-surface border-zenov-border text-zenov-text-secondary hover:border-zenov-border-hover hover:text-zenov-text'
                      }`}
                    >
                      <PaymentLogo method={method} className="w-7 h-7 rounded-lg shrink-0" />
                      <span className="text-[10px] sm:text-xs font-bold truncate max-w-full">{method}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Instructions & TrxID Box */}
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

          </div>

          {/* RIGHT 1 COLUMN: STICKY ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl sm:rounded-3xl bg-zenov-card border border-zenov-border overflow-hidden shadow-xl">
                
                {/* Summary Header */}
                <div className="px-5 py-4 bg-zenov-surface/80 border-b border-zenov-border flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zenov-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Order Summary
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zenov-primary-soft text-zenov-primary">
                    {totalItemsCount} items
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="p-5 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-zenov-text-secondary">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-bold text-zenov-text">
                      {formatCurrency(subtotal, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-zenov-text-secondary">
                    <span className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">FREE</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">$0.00</span>
                  </div>

                  <div className="flex justify-between text-zenov-text-secondary">
                    <span>Service & Gateway Fee (1.5%)</span>
                    <span className="font-mono font-bold text-zenov-text">
                      {formatCurrency(serviceFee, selectedCurrency)}
                    </span>
                  </div>

                  <div className="h-px bg-zenov-border/80 my-2" />

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-zenov-text block">Grand Total</span>
                      <span className="text-[10px] text-zenov-text-muted">Includes all taxes & delivery</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-zenov-text tracking-tight">
                      {formatCurrency(total, selectedCurrency)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button & Actions */}
                <div className="p-5 pt-0 space-y-2.5">
                  <button
                    onClick={onCheckout}
                    disabled={submitting || !trxId.trim() || total <= 0}
                    className="w-full py-3.5 px-4 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-zenov-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>Processing <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Confirm &amp; Place Order
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push('/wallet')}
                    className="w-full py-2.5 rounded-xl bg-zenov-surface hover:bg-zenov-primary-soft/40 border border-zenov-border hover:border-zenov-primary-border text-xs font-bold text-zenov-text-secondary hover:text-zenov-primary transition-all cursor-pointer"
                  >
                    Pay with Wallet (${user?.walletBalanceUSD?.toFixed(2) || '0.00'})
                  </button>
                </div>
              </div>

              {/* Trust Badge Grid */}
              <div className="p-4 rounded-2xl bg-zenov-card/60 border border-zenov-border/80 grid grid-cols-2 gap-3 text-center text-[10px]">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="font-bold text-zenov-text">100% Genuine</span>
                  <span className="text-zenov-text-muted">Official Partner</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="font-bold text-zenov-text">≤30s Delivery</span>
                  <span className="text-zenov-text-muted">Instant Processing</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
      </div>
    </div>
  );
}
