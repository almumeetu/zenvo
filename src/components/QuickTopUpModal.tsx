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
  ExternalLink,
  Copy,
  AlertCircle,
  Tag,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PaymentLogo } from './payment/PaymentLogos';

interface QuickTopUpModalProps {
  product: Product | null;
  selectedCurrency: CurrencyCode;
  user: UserProfile;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onDirectCheckout: (
    item: CartItem,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Crypto/USDT' | 'Zenov Wallet'
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
  const router = useRouter();
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
    'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Crypto/USDT' | 'Zenov Wallet'
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
    if (couponCode.toUpperCase() === 'ZENOV2026' || couponCode.toUpperCase() === 'BONUS10') {
      setAppliedDiscount(0.50);
      setCouponStatus('Coupon ZENOV2026 Applied: -$0.50 Discount!');
    } else {
      setCouponStatus('Invalid Coupon Code. Try "ZENOV2026"');
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
      setTimeout(() => {
        router.push(`/orders/confirmation/${encodeURIComponent(res.orderNumber!)}`);
        onClose();
      }, 1800);
    } else {
      alert(res.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenov-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zenov-surface border border-zenov-border rounded-2xl shadow-xl overflow-hidden my-8 text-zenov-text">
        {/* Modal Header Bar */}
        <div className="bg-zenov-card/80 border-b border-zenov-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              className="w-12 h-12 rounded-xl object-cover border border-zenov-border"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zenov-primary font-bold uppercase tracking-wider">
                  {product.publisher}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-zenov-success-soft text-zenov-success font-mono text-[9px] font-bold flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  {product.deliveryType}
                </span>
              </div>
              <h2 className="text-lg font-black text-zenov-text uppercase">{product.title} Top-Up</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft text-zenov-secondary hover:text-zenov-primary transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrderNum ? (
          /* Success Invoice View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-zenov-success-soft border-2 border-zenov-success rounded-full flex items-center justify-center mx-auto text-zenov-success">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-zenov-success-soft text-zenov-success font-mono text-xs font-bold uppercase border border-zenov-success/30 flex items-center gap-1.5 w-fit mx-auto">
                <Zap className="w-3.5 h-3.5" />
                TOP-UP DELIVERED SUCCESSFULLY
              </span>
              <h3 className="text-2xl font-black text-zenov-text mt-3">Order #{completedOrderNum}</h3>
              <p className="text-xs text-zenov-muted max-w-md mx-auto mt-1">
                Your game items ({selectedDenom.name}) have been dispatched directly to Player ID{' '}
                <span className="text-zenov-primary font-bold">{playerId}</span>.
              </p>
            </div>

            <div className="bg-zenov-card border border-zenov-border rounded-xl p-4 text-left font-mono text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between text-zenov-secondary">
                <span>Product:</span>
                <span className="text-zenov-text font-bold">{product.title}</span>
              </div>
              <div className="flex justify-between text-zenov-secondary">
                <span>Package:</span>
                <span className="text-zenov-primary font-bold">{selectedDenom.name}</span>
              </div>
              <div className="flex justify-between text-zenov-secondary">
                <span>Payment Method:</span>
                <span className="text-zenov-text">{selectedPayment}</span>
              </div>
              <div className="flex justify-between text-zenov-secondary pt-2 border-t border-zenov-border/60">
                <span>Total Paid:</span>
                <span className="text-zenov-success font-bold text-sm">
                  {formatCurrency(finalUSDPrice, selectedCurrency)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => setCompletedOrderNum(null)}
                className="px-6 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border hover:bg-zenov-card hover:border-zenov-primary-border text-zenov-text font-bold text-sm transition-all active:scale-[0.98]"
              >
                Top-Up Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-black text-sm uppercase tracking-wide flex items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Package Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zenov-primary mb-2.5 block">
                SELECT PACKAGE
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
                          ? 'bg-zenov-primary-soft/50 border-zenov-primary-border text-zenov-text shadow-sm scale-[1.01]'
                          : 'bg-zenov-card border-zenov-border hover:border-zenov-primary-border/60 text-zenov-secondary hover:text-zenov-text'
                      }`}
                    >
                      {denom.bonus && (
                        <span className="absolute top-0 right-0 px-2 py-0.5 bg-zenov-accent text-zenov-bg text-[9px] font-mono font-black rounded-bl-lg">
                          {denom.bonus}
                        </span>
                      )}
                      <p className="text-xs font-medium">{denom.name}</p>
                      <p className="text-sm font-black font-mono text-zenov-primary mt-1">
                        {formatCurrency(denom.amount, selectedCurrency)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player ID */}
            <div className="bg-zenov-card border border-zenov-border rounded-xl p-4 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zenov-primary block">
                ENTER PLAYER CREDENTIALS
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zenov-secondary block mb-1 font-medium">
                    {product.playerIdLabel} <span className="text-zenov-error">*</span>
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
                      className="w-full bg-zenov-bg border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleValidateId}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-zenov-primary-soft hover:bg-zenov-primary text-zenov-primary hover:text-white font-mono text-[10px] font-bold transition-colors"
                    >
                      {isValidatingId ? 'Checking...' : 'Verify ID'}
                    </button>
                  </div>
                </div>

                {product.hasServerId && (
                  <div>
                    <label className="text-[11px] text-zenov-secondary block mb-1 font-medium">
                      {product.serverIdLabel || 'Server / Zone ID'}
                    </label>
                    <input
                      type="text"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-zenov-bg border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none font-mono transition-all"
                    />
                  </div>
                )}
              </div>

              {isIdValidated && (
                <div className="flex items-center gap-2 text-xs text-zenov-success bg-zenov-success-soft/50 p-2.5 rounded-lg border border-zenov-success/30">
                  <CheckCircle2 className="w-4 h-4 text-zenov-success shrink-0" />
                  <span className="font-medium">Account Verified: {verifiedName}</span>
                </div>
              )}
            </div>

            {/* Payment + Coupon Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zenov-primary mb-2.5 block">
                    SELECT PAYMENT METHOD
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'bKash', label: 'bKash Auto', badge: 'Popular BD' },
                      { id: 'Nagad', label: 'Nagad Pay', badge: 'Instant BD' },
                      { id: 'Rocket', label: 'Rocket', badge: 'BD Bank' },
                      { id: 'Bank Transfer', label: 'Bank Transfer', badge: 'Local Bank' },
                      { id: 'Crypto/USDT', label: 'Crypto USDT', badge: 'Web3' },
                    ].map((pm) => {
                      const isSelected = selectedPayment === pm.id;
                      return (
                        <button
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 group ${
                            isSelected
                              ? 'bg-zenov-primary-soft/50 border-zenov-primary-border text-zenov-text shadow-sm ring-1 ring-zenov-primary-border/40'
                              : 'bg-zenov-card border-zenov-border hover:border-zenov-primary-border/60 text-zenov-secondary hover:text-zenov-text'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <PaymentLogo method={pm.id} className="w-6 h-6 rounded-lg shadow-sm" />
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-zenov-surface text-zenov-muted border border-zenov-border/50 group-hover:bg-zenov-primary-soft group-hover:text-zenov-primary group-hover:border-zenov-primary-border/40 transition-colors">
                              {pm.badge}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold leading-tight">{pm.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zenov-primary mb-2.5 block">
                  PROMO CODE
                </label>
                <div className="flex items-center gap-2 bg-zenov-card border border-zenov-border rounded-xl p-2.5 focus-within:border-zenov-primary-border transition-colors">
                  <Tag className="w-4 h-4 text-zenov-primary shrink-0" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. ZENOV2026"
                    className="flex-1 bg-transparent text-xs text-zenov-text focus:outline-none uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 rounded-lg bg-zenov-primary-soft hover:bg-zenov-primary text-zenov-primary hover:text-white font-bold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus && (
                  <p className={`text-xs font-medium mt-1.5 ${
                    couponStatus.includes('Applied') ? 'text-zenov-success' : 'text-zenov-warning'
                  }`}>
                    {couponStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Final Summary & Checkout CTA */}
            <div className="bg-zenov-card border border-zenov-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-zenov-secondary block uppercase font-bold tracking-wider">TOTAL AMOUNT TO PAY</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-mono text-zenov-primary">
                    {formatCurrency(finalUSDPrice, selectedCurrency)}
                  </span>
                  {appliedDiscount > 0 && (
                    <span className="text-xs text-zenov-muted line-through font-mono">
                      {formatCurrency(selectedDenom.amount, selectedCurrency)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zenov-success font-mono flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" />
                  Instant Delivery • 100% Secure
                </span>
              </div>

              <button
                onClick={handleInstantPay}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-black text-sm uppercase tracking-wider shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-zenov-bg" />
                <span>{isSubmitting ? 'PROCESSING...' : 'PAY & TOP UP INSTANTLY'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
