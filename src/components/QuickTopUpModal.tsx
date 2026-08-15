import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Product, ProductDenomination, CurrencyCode, UserProfile, CartItem } from '../types';
import { formatCurrency } from '../lib/currency';
import {
  X,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  CreditCard,
  QrCode,
  Tag,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface QuickTopUpModalProps {
  product: Product | null;
  selectedCurrency: CurrencyCode;
  user: UserProfile;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onDirectCheckout: (
    item: CartItem,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Visa/Mastercard' | 'Crypto/USDT' | 'Zenov Wallet'
  ) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
}

export const QuickTopUpModal: React.FC<QuickTopUpModalProps> = ({
  product,
  selectedCurrency,
  user,
  onClose,
  onAddToCart,
  onDirectCheckout,
}) => {
  if (!product) return null;

  const [selectedDenom, setSelectedDenom] = useState<ProductDenomination>(
    product.denominations[0] || { id: 'default', name: 'Standard Package', amount: 1.00 }
  );
  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');
  const [isValidatingId, setIsValidatingId] = useState(false);
  const [isIdValidated, setIsIdValidated] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<
    'bKash' | 'Nagad' | 'Rocket' | 'Visa/Mastercard' | 'Crypto/USDT' | 'Zenov Wallet'
  >('bKash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);

  // Validate Player ID Simulation
  const handleValidateId = () => {
    if (!playerId.trim()) return;
    setIsValidatingId(true);
    setTimeout(() => {
      setIsValidatingId(false);
      setIsIdValidated(true);
      setVerifiedName(`Verified_Player_${playerId.slice(-4)} (Lv.65)`);
    }, 600);
  };

  // Coupon Application
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'ZENVO2026' || couponCode.toUpperCase() === 'BONUS10') {
      setAppliedDiscount(0.50);
      setCouponStatus('Coupon ZENVO2026 Applied: -$0.50 Discount!');
    } else {
      setCouponStatus('Invalid Coupon Code. Try "ZENVO2026"');
    }
  };

  const finalUSDPrice = Math.max(0, selectedDenom.amount - appliedDiscount);

  // Handle Instant Order
  const handleInstantPay = async () => {
    if (!playerId.trim()) {
      alert(`Please enter your ${product.playerIdLabel}`);
      return;
    }

    setIsSubmitting(true);

    const cartItem: CartItem = {
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      denomination: selectedDenom,
      quantity: 1,
      playerId,
      serverId,
    };

    const res = await onDirectCheckout(cartItem, selectedPayment);
    setIsSubmitting(false);

    if (res.success && res.orderNumber) {
      setCompletedOrderNum(res.orderNumber);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#10b981', '#ffffff'],
      });
    } else {
      alert(res.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenvo-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zenvo-surface border border-zenvo-border rounded-2xl shadow-xl overflow-hidden my-8 text-zenvo-text">
        {/* Modal Header Bar */}
        <div className="bg-zenvo-card/80 border-b border-zenvo-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              className="w-12 h-12 rounded-xl object-cover border border-zenvo-border"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zenvo-primary font-bold uppercase tracking-wider">
                  {product.publisher}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-zenvo-success-soft text-zenvo-success font-mono text-[9px] font-bold flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  {product.deliveryType}
                </span>
              </div>
              <h2 className="text-lg font-black text-zenvo-text uppercase">{product.title} Top-Up</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zenvo-surface border border-zenvo-border hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft text-zenvo-secondary hover:text-zenvo-primary transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrderNum ? (
          /* Success Invoice View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-zenvo-success-soft border-2 border-zenvo-success rounded-full flex items-center justify-center mx-auto text-zenvo-success">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-zenvo-success-soft text-zenvo-success font-mono text-xs font-bold uppercase border border-zenvo-success/30 flex items-center gap-1.5 w-fit mx-auto">
                <Zap className="w-3.5 h-3.5" />
                TOP-UP DELIVERED SUCCESSFULLY
              </span>
              <h3 className="text-2xl font-black text-zenvo-text mt-3">Order #{completedOrderNum}</h3>
              <p className="text-xs text-zenvo-muted max-w-md mx-auto mt-1">
                Your game items ({selectedDenom.name}) have been dispatched directly to Player ID{' '}
                <span className="text-zenvo-primary font-bold">{playerId}</span>.
              </p>
            </div>

            <div className="bg-zenvo-card border border-zenvo-border rounded-xl p-4 text-left font-mono text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between text-zenvo-secondary">
                <span>Product:</span>
                <span className="text-zenvo-text font-bold">{product.title}</span>
              </div>
              <div className="flex justify-between text-zenvo-secondary">
                <span>Package:</span>
                <span className="text-zenvo-primary font-bold">{selectedDenom.name}</span>
              </div>
              <div className="flex justify-between text-zenvo-secondary">
                <span>Payment Method:</span>
                <span className="text-zenvo-text">{selectedPayment}</span>
              </div>
              <div className="flex justify-between text-zenvo-secondary pt-2 border-t border-zenvo-border/60">
                <span>Total Paid:</span>
                <span className="text-zenvo-success font-bold text-sm">
                  {formatCurrency(finalUSDPrice, selectedCurrency)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => setCompletedOrderNum(null)}
                className="px-6 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border hover:bg-zenvo-card hover:border-zenvo-primary-border text-zenvo-text font-bold text-sm transition-all active:scale-[0.98]"
              >
                Top-Up Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg font-black text-sm uppercase tracking-wide flex items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Select Package / Denomination */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zenvo-primary flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded bg-zenvo-primary-soft text-zenvo-primary flex items-center justify-center text-[11px] font-black">
                  1
                </span>
                <span>SELECT DENOMINATION / PACKAGE</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.denominations.map((denom) => {
                  const isSelected = selectedDenom.id === denom.id;
                  return (
                    <button
                      key={denom.id}
                      onClick={() => setSelectedDenom(denom)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group ${
                        isSelected
                          ? 'bg-zenvo-primary-soft/50 border-zenvo-primary-border text-zenvo-text shadow-sm scale-[1.01]'
                          : 'bg-zenvo-card border-zenvo-border hover:border-zenvo-primary-border/60 text-zenvo-secondary hover:text-zenvo-text'
                      }`}
                    >
                      {denom.bonus && (
                        <span className="absolute top-0 right-0 px-2 py-0.5 bg-zenvo-accent text-zenvo-bg text-[9px] font-mono font-black rounded-bl-lg">
                          {denom.bonus}
                        </span>
                      )}
                      <p className="text-xs font-bold">{denom.name}</p>
                      <p className="text-sm font-black font-mono text-zenvo-primary mt-1">
                        {formatCurrency(denom.amount, selectedCurrency)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Player ID Credentials */}
            <div className="bg-zenvo-card border border-zenvo-border rounded-xl p-4 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zenvo-primary flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-zenvo-primary-soft text-zenvo-primary flex items-center justify-center text-[11px] font-black">
                  2
                </span>
                <span>ENTER PLAYER CREDENTIALS</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zenvo-secondary block mb-1 font-medium">
                    {product.playerIdLabel} <span className="text-zenvo-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => {
                        setPlayerId(e.target.value);
                        setIsIdValidated(false);
                      }}
                      placeholder="e.g. 284910284"
                      className="w-full bg-zenvo-bg border border-zenvo-border focus:border-zenvo-primary focus:ring-2 focus:ring-zenvo-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenvo-text focus:outline-none font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleValidateId}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-zenvo-primary-soft hover:bg-zenvo-primary text-zenvo-primary hover:text-white font-mono text-[10px] font-bold transition-colors"
                    >
                      {isValidatingId ? 'Checking...' : 'Verify ID'}
                    </button>
                  </div>
                </div>

                {product.hasServerId && (
                  <div>
                    <label className="text-[11px] text-zenvo-secondary block mb-1 font-medium">
                      {product.serverIdLabel || 'Server / Zone ID'}
                    </label>
                    <input
                      type="text"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-zenvo-bg border border-zenvo-border focus:border-zenvo-primary focus:ring-2 focus:ring-zenvo-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenvo-text focus:outline-none font-mono transition-all"
                    />
                  </div>
                )}
              </div>

              {isIdValidated && (
                <div className="flex items-center gap-2 text-xs text-zenvo-success bg-zenvo-success-soft/50 p-2.5 rounded-lg border border-zenvo-success/30">
                  <CheckCircle2 className="w-4 h-4 text-zenvo-success shrink-0" />
                  <span className="font-medium">Account Verified: {verifiedName}</span>
                </div>
              )}
            </div>

            {/* Step 3: Payment Gateway Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zenvo-primary flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded bg-zenvo-primary-soft text-zenvo-primary flex items-center justify-center text-[11px] font-black">
                  3
                </span>
                <span>SELECT PAYMENT METHOD</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'bKash', label: 'bKash Auto', badge: 'Popular BD', icon: '🇧🇩' },
                  { id: 'Nagad', label: 'Nagad Pay', badge: 'Instant BD', icon: '⚡' },
                  { id: 'Rocket', label: 'Rocket', badge: 'BD Bank', icon: '🚀' },
                  { id: 'Visa/Mastercard', label: 'Cards (Visa/MC)', badge: 'Global', icon: '💳' },
                  { id: 'Crypto/USDT', label: 'Crypto USDT', badge: 'Web3', icon: '🪙' },
                ].map((pm) => {
                  const isSelected = selectedPayment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all group ${
                        isSelected
                          ? 'bg-zenvo-primary-soft/50 border-zenvo-primary-border text-zenvo-text shadow-sm'
                          : 'bg-zenvo-card border-zenvo-border hover:border-zenvo-primary-border/60 text-zenvo-secondary hover:text-zenvo-text'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{pm.icon}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zenvo-surface text-zenvo-muted border border-zenvo-border/50 group-hover:bg-zenvo-primary-soft group-hover:text-zenvo-primary group-hover:border-zenvo-primary-border/40 transition-colors">
                          {pm.badge}
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-1.5">{pm.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Promo Coupon Code */}
            <div className="flex items-center gap-2 bg-zenvo-card border border-zenvo-border rounded-xl p-3 focus-within:border-zenvo-primary-border transition-colors">
              <Tag className="w-4 h-4 text-zenvo-primary shrink-0" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo code (e.g. ZENVO2026)"
                className="flex-1 bg-transparent text-xs text-zenvo-text focus:outline-none uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-3 py-1.5 rounded-lg bg-zenvo-primary-soft hover:bg-zenvo-primary text-zenvo-primary hover:text-white font-bold text-xs transition-colors"
              >
                Apply
              </button>
            </div>
            {couponStatus && (
              <p className={`text-xs font-medium ${
                couponStatus.includes('Applied') ? 'text-zenvo-success' : 'text-zenvo-warning'
              }`}>
                {couponStatus}
              </p>
            )}

            {/* Final Summary & Checkout CTA */}
            <div className="bg-zenvo-card border border-zenvo-border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-zenvo-secondary block uppercase font-bold tracking-wider">TOTAL AMOUNT TO PAY</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-mono text-zenvo-primary">
                    {formatCurrency(finalUSDPrice, selectedCurrency)}
                  </span>
                  {appliedDiscount > 0 && (
                    <span className="text-xs text-zenvo-muted line-through font-mono">
                      {formatCurrency(selectedDenom.amount, selectedCurrency)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zenvo-success font-mono flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" />
                  Instant Delivery • 100% Secure
                </span>
              </div>

              <button
                onClick={handleInstantPay}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg font-black text-sm uppercase tracking-wider shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-zenvo-bg" />
                <span>{isSubmitting ? 'PROCESSING RECHARGE...' : 'PAY & TOP UP INSTANTLY'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
