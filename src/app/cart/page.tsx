'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { useState } from 'react';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const {
    cartItems,
    selectedCurrency,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    user,
  } = useApp();
  const router = useRouter();

  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState<{ applied: boolean; code?: string; pct?: number; message?: string }>({ applied: false });

  const subtotal = cartItems.reduce(
    (s, it) => s + it.denomination.amount * it.quantity,
    0
  );
  const discount = couponState.applied && couponState.pct ? subtotal * (couponState.pct / 100) : 0;
  const serviceFee = subtotal * 0.015;
  const total = Math.max(0, subtotal - discount + serviceFee);
  const savingsEstimated = subtotal - (subtotal - discount);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const map: Record<string, number> = { ZENVO2026: 20, BONUS10: 10, WELCOME5: 5, VIP30: 30 };
    if (map[code]) {
      setCouponState({ applied: true, code, pct: map[code], message: `Discount applied (-${map[code]}%)` });
    } else {
      setCouponState({ applied: false, message: 'Invalid or expired code' });
    }
  };

  const onCheckout = () => {
    if (cartItems.length === 0) return;
    // For demo, just jump to first item's top-up page with cart context, or process via summary
    // Since this is a demo, simulate and show a message - or redirect to first item
    router.push(`/top-up/${cartItems[0].productId}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center gap-2 text-xs text-zenvo-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenvo-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zenvo-text font-semibold">Shopping Cart ({cartItems.length})</span>
      </div>

      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl sm:text-3xl font-black text-zenvo-text tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-zenvo-primary-soft border border-zenvo-primary-border">
            <ShoppingBag className="w-6 h-6 text-zenvo-primary" />
          </span>
          Your Cart
        </h1>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-zenvo-text-secondary hover:text-zenvo-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-zenvo-card border border-zenvo-border">
          <div className="w-20 h-20 rounded-2xl bg-zenvo-surface border border-zenvo-border flex items-center justify-center mx-auto mb-5">
            <CartIcon className="w-9 h-9 text-zenvo-text-muted" />
          </div>
          <h2 className="text-xl font-black text-zenvo-text mb-2">Your cart is empty</h2>
          <p className="text-zenvo-text-secondary mb-7 max-w-md mx-auto text-sm">
            Browse our gaming catalog to add top-ups, gift cards, and subscriptions.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-zenvo-primary to-indigo-600 text-white text-sm font-black uppercase tracking-wider shadow-primary"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.denomination.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-zenvo-card border border-zenvo-border flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href={`/top-up/${item.productId}`}
                  className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-zenvo-surface border border-zenvo-border shrink-0"
                >
                  <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/top-up/${item.productId}`}>
                      <h3 className="text-base font-bold text-zenvo-text hover:text-zenvo-primary transition-colors line-clamp-1">
                        {item.productTitle}
                      </h3>
                    </Link>
                    <p className="text-xs text-zenvo-text-secondary mt-1 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-zenvo-primary" /> Package:{' '}
                      <span className="font-semibold text-zenvo-text">{item.denomination.label || item.denomination.name}</span>
                    </p>
                    {item.playerId && (
                      <p className="text-xs text-zenvo-text-muted mt-0.5 font-mono">
                        Player ID: {item.playerId}{item.serverId ? ` • ${item.serverId}` : ''}
                      </p>
                    )}
                    <p className="text-[10px] uppercase tracking-wider text-zenvo-text-muted mt-3 font-semibold">
                      Unit Price
                    </p>
                    <p className="font-mono font-black text-lg text-zenvo-text">
                      {formatCurrency(item.denomination.amount, selectedCurrency)}
                    </p>
                  </div>

                  <div className="sm:min-w-[170px] flex sm:flex-col justify-between sm:items-end gap-3">
                    <div className="flex sm:flex-col sm:items-end items-center gap-3">
                      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zenvo-surface border border-zenvo-border">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.denomination.id, item.quantity - 1)}
                          className="p-2 rounded-md text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-card transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-[32px] text-center font-mono font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.denomination.id, item.quantity + 1)}
                          className="p-2 rounded-md text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-card transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeCartItem(item.productId, item.denomination.id)}
                        className="p-2 rounded-md bg-zenvo-surface border border-zenvo-border text-zenvo-text-muted hover:text-zenvo-error hover:border-zenvo-error/40 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right sm:mt-auto">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zenvo-text-muted">Line total</p>
                      <p className="font-mono font-black text-xl text-zenvo-primary">
                        {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => clearCart()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-zenvo-text-secondary border border-zenvo-border hover:border-zenvo-error/40 hover:text-zenvo-error transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear cart
            </button>

            {/* Trust */}
            <div className="mt-6 p-5 rounded-2xl bg-zenvo-surface/50 border border-zenvo-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
              {[
                { I: ShieldCheck, t: 'Secure SSL', s: 'Payments' },
                { I: CreditCard, t: 'All Methods', s: 'Supported' },
                { I: Gift, t: 'Auto Bonuses', s: 'Instantly' },
                { I: CartIcon, t: '24/7 Live', s: 'Chat support' },
              ].map(({ I, t, s }) => (
                <div key={t}>
                  <div className="w-9 h-9 rounded-lg bg-zenvo-primary-soft text-zenvo-primary mx-auto mb-2 flex items-center justify-center">
                    <I className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-zenvo-text">{t}</p>
                  <p className="text-zenvo-text-muted">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-zenvo-accent" /> Promo Code
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); if (couponState.applied) setCouponState({ applied: false }); }}
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                    placeholder="ZENVO2026"
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-zenvo-surface border border-zenvo-border focus:border-zenvo-accent-border focus:ring-2 focus:ring-zenvo-accent-border/40 outline-none text-sm font-mono uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 rounded-lg bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg text-sm font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponState.message && (
                  <div className={`mt-2 text-xs font-semibold ${couponState.applied ? 'text-zenvo-success' : 'text-zenvo-error'}`}>
                    {couponState.applied ? '✓' : '✗'} {couponState.message}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-zenvo-card border border-zenvo-border overflow-hidden">
                <div className="px-5 py-4 border-b border-zenvo-border flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text">Order Summary</h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-zenvo-primary-soft text-zenvo-primary">
                    {cartItems.reduce((s, it) => s + it.quantity, 0)} items
                  </span>
                </div>
                <div className="p-5 space-y-2.5 text-sm">
                  <div className="flex justify-between text-zenvo-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-zenvo-text-secondary">
                    <span>Service fee (1.5%)</span>
                    <span className="font-mono">{formatCurrency(serviceFee, selectedCurrency)}</span>
                  </div>
                  {couponState.applied && couponState.pct && (
                    <div className="flex justify-between text-zenvo-success">
                      <span>Promo ({couponState.code})</span>
                      <span className="font-mono">−{formatCurrency(discount, selectedCurrency)}</span>
                    </div>
                  )}
                  <div className="h-px bg-zenvo-border my-3" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold uppercase tracking-wider text-zenvo-text-muted">You Pay</span>
                    <span className="text-3xl font-black font-mono text-zenvo-text">
                      {formatCurrency(total, selectedCurrency)}
                    </span>
                  </div>
                  {savingsEstimated > 0 && (
                    <p className="text-center text-xs font-semibold text-zenvo-success pt-1">
                      You save {formatCurrency(savingsEstimated, selectedCurrency)} with {couponState.code}
                    </p>
                  )}
                </div>
                <div className="p-5 pt-0 space-y-2.5">
                  <button
                    onClick={onCheckout}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zenvo-accent via-orange-500 to-zenvo-accent-hover text-zenvo-bg text-sm font-black uppercase tracking-wider shadow-md active:scale-[0.98] transition-all"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => router.push('/wallet')}
                    className="w-full py-3 rounded-xl bg-zenvo-surface border border-zenvo-border hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft/40 text-sm font-bold text-zenvo-text-secondary hover:text-zenvo-primary transition-all"
                  >
                    Use Wallet Balance (${user.walletBalanceUSD.toFixed(2)})
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
