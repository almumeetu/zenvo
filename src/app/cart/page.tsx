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
  X,
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zenov-text font-semibold">Shopping Cart ({cartItems.length})</span>
      </div>

      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl sm:text-3xl font-black text-zenov-text tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-zenov-primary-soft border border-zenov-primary-border">
            <ShoppingBag className="w-6 h-6 text-zenov-primary" />
          </span>
          Your Cart
        </h1>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-zenov-text-secondary hover:text-zenov-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

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
        <div className="py-20 text-center rounded-3xl bg-zenov-card border border-zenov-border">
          <div className="w-20 h-20 rounded-2xl bg-zenov-surface border border-zenov-border flex items-center justify-center mx-auto mb-5">
            <CartIcon className="w-9 h-9 text-zenov-text-muted" />
          </div>
          <h2 className="text-xl font-black text-zenov-text mb-2">Your cart is empty</h2>
          <p className="text-zenov-text-secondary mb-7 max-w-md mx-auto text-sm">
            Browse our gaming catalog to add top-ups, gift cards, and subscriptions.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-zenov-primary to-indigo-600 text-white text-sm font-black uppercase tracking-wider shadow-primary"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.denomination.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-zenov-card border border-zenov-border flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href={`/top-up/${item.productId}`}
                  className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-zenov-surface border border-zenov-border shrink-0"
                >
                  <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/top-up/${item.productId}`}>
                      <h3 className="text-base font-bold text-zenov-text hover:text-zenov-primary transition-colors line-clamp-1">
                        {item.productTitle}
                      </h3>
                    </Link>
                    <p className="text-xs text-zenov-text-secondary mt-1 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-zenov-primary" /> Package:{' '}
                      <span className="font-semibold text-zenov-text">{item.denomination.label || item.denomination.name}</span>
                    </p>
                    {item.playerId && (
                      <p className="text-xs text-zenov-text-muted mt-0.5 font-mono">
                        Player ID: {item.playerId}{item.serverId ? ` • ${item.serverId}` : ''}
                      </p>
                    )}
                    <p className="text-[10px] uppercase tracking-wider text-zenov-text-muted mt-3 font-semibold">
                      Unit Price
                    </p>
                    <p className="font-mono font-black text-lg text-zenov-text">
                      {formatCurrency(item.denomination.amount, selectedCurrency)}
                    </p>
                  </div>

                  <div className="sm:min-w-[170px] flex sm:flex-col justify-between sm:items-end gap-3">
                    <div className="flex sm:flex-col sm:items-end items-center gap-3">
                      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zenov-surface border border-zenov-border">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.denomination.id, item.quantity - 1)}
                          className="p-2 rounded-md text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-card transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-[32px] text-center font-mono font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.denomination.id, item.quantity + 1)}
                          className="p-2 rounded-md text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-card transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeCartItem(item.productId, item.denomination.id)}
                        className="p-2 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-zenov-error hover:border-zenov-error/40 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right sm:mt-auto">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zenov-text-muted">Line total</p>
                      <p className="font-mono font-black text-xl text-zenov-primary">
                        {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => clearCart()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-zenov-text-secondary border border-zenov-border hover:border-zenov-error/40 hover:text-zenov-error transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear cart
            </button>

            {/* Customer Details Form */}
            <div className="p-5 rounded-2xl bg-zenov-card border border-zenov-border space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text flex items-center gap-2">
                <User className="w-4 h-4 text-zenov-primary" /> Customer Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-5 rounded-2xl bg-zenov-card border border-zenov-border space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zenov-primary" /> Select Payment Method
              </h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Crypto/USDT'].map((method) => {
                  const active = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        active
                          ? 'bg-zenov-primary-soft/50 border-zenov-primary-border ring-2 ring-zenov-primary-border/40 shadow-sm'
                          : 'bg-zenov-surface border-zenov-border text-zenov-text hover:border-zenov-border-hover'
                      }`}
                    >
                      <PaymentLogo method={method} className="w-7 h-7 rounded-lg shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${active ? 'text-white' : 'text-zenov-text'}`}>{method}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Manual Payment Details & TrxID Input Box */}
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

            {/* Trust */}
            <div className="p-5 rounded-2xl bg-zenov-surface/50 border border-zenov-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
              {[
                { I: ShieldCheck, t: 'Secure SSL', s: 'Payments' },
                { I: CreditCard, t: 'All Methods', s: 'Supported' },
                { I: Gift, t: 'Auto Bonuses', s: 'Instantly' },
                { I: CartIcon, t: '24/7 Live', s: 'Chat support' },
              ].map(({ I, t, s }) => (
                <div key={t}>
                  <div className="w-9 h-9 rounded-lg bg-zenov-primary-soft text-zenov-primary mx-auto mb-2 flex items-center justify-center">
                    <I className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-zenov-text">{t}</p>
                  <p className="text-zenov-text-muted">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-3xl bg-zenov-card border border-zenov-border overflow-hidden">
                <div className="px-5 py-4 border-b border-zenov-border flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text">Order Summary</h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-zenov-primary-soft text-zenov-primary">
                    {cartItems.reduce((s, it) => s + it.quantity, 0)} items
                  </span>
                </div>
                <div className="p-5 space-y-2.5 text-sm">
                  <div className="flex justify-between text-zenov-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-zenov-text-secondary">
                    <span>Service fee (1.5%)</span>
                    <span className="font-mono">{formatCurrency(serviceFee, selectedCurrency)}</span>
                  </div>
                  <div className="h-px bg-zenov-border my-3" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold uppercase tracking-wider text-zenov-text-muted">Total</span>
                    <span className="text-3xl font-black font-mono text-zenov-text">
                      {formatCurrency(total, selectedCurrency)}
                    </span>
                  </div>
                </div>
                <div className="p-5 pt-0 space-y-2.5">
                  <button
                    onClick={onCheckout}
                    disabled={submitting || !trxId.trim() || total <= 0}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenov-accent via-orange-500 to-zenov-accent-hover text-zenov-bg text-sm font-black uppercase tracking-wider shadow-md active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>Processing <div className="w-4 h-4 border-2 border-zenov-bg/30 border-t-zenov-bg rounded-full animate-spin" /></>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" /> Submit Order with TrxID
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => router.push('/wallet')}
                    className="w-full py-3 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/40 text-sm font-bold text-zenov-text-secondary hover:text-zenov-primary transition-all"
                  >
                    Use Wallet Balance (${user?.walletBalanceUSD?.toFixed(2) || '0.00'})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
