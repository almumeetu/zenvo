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
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Visa/Mastercard' | 'Crypto/USDT' | 'Zenvo Wallet'
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
    'bKash' | 'Nagad' | 'Rocket' | 'Visa/Mastercard' | 'Crypto/USDT' | 'Zenvo Wallet'
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
      });
    } else {
      alert(res.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090f16] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden my-8 text-slate-100">
        {/* Modal Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a141d] to-[#070b0f] p-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">{product.publisher}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
                  {product.deliveryType}
                </span>
              </div>
              <h2 className="text-lg font-black text-white font-mono uppercase">{product.title} Top-Up</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrderNum ? (
          /* Success Invoice View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_#00ff66]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase border border-emerald-500/40">
                ⚡ TOP-UP DELIVERED SUCCESSFULLY
              </span>
              <h3 className="text-2xl font-black text-white font-mono mt-3">Order #{completedOrderNum}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Your game items ({selectedDenom.name}) have been dispatched directly to Player ID{' '}
                <span className="text-emerald-400 font-bold">{playerId}</span>.
              </p>
            </div>

            <div className="bg-[#0c141e] border border-emerald-500/30 rounded-xl p-4 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-slate-400">
                <span>Product:</span>
                <span className="text-white font-bold">{product.title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Package:</span>
                <span className="text-emerald-400 font-bold">{selectedDenom.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="text-white">{selectedPayment}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Total Paid:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(finalUSDPrice, selectedCurrency)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCompletedOrderNum(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold"
              >
                Top-Up Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Select Package / Denomination */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">
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
                      className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(0,255,102,0.3)] scale-[1.02]'
                          : 'bg-[#0b121a] border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {denom.bonus && (
                        <span className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-mono font-black rounded-bl-lg">
                          {denom.bonus}
                        </span>
                      )}
                      <p className="text-xs font-bold font-mono">{denom.name}</p>
                      <p className="text-sm font-black font-mono text-emerald-400 mt-1">
                        {formatCurrency(denom.amount, selectedCurrency)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Player ID Credentials */}
            <div className="bg-[#0b121a] border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">
                  2
                </span>
                <span>ENTER PLAYER CREDENTIALS</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {product.playerIdLabel} <span className="text-red-400">*</span>
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
                      className="w-full bg-[#080d12] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleValidateId}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-mono text-[10px] font-bold transition-colors"
                    >
                      {isValidatingId ? 'Checking...' : 'Verify ID'}
                    </button>
                  </div>
                </div>

                {product.hasServerId && (
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      {product.serverIdLabel || 'Server / Zone ID'}
                    </label>
                    <input
                      type="text"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-[#080d12] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              {isIdValidated && (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Account Verified: {verifiedName}</span>
                </div>
              )}
            </div>

            {/* Step 3: Payment Gateway Selector */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">
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
                  {
                    id: 'Zenvo Wallet',
                    label: `Zenvo Wallet (${formatCurrency(user.walletBalanceUSD, selectedCurrency)})`,
                    badge: 'Zero Fee',
                    icon: '👛',
                  },
                ].map((pm) => {
                  const isSelected = selectedPayment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                          : 'bg-[#0b121a] border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{pm.icon}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {pm.badge}
                        </span>
                      </div>
                      <p className="text-xs font-bold font-mono mt-1.5">{pm.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Promo Coupon Code */}
            <div className="flex items-center gap-2 bg-[#0b121a] border border-slate-800 rounded-xl p-3">
              <Tag className="w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo code (e.g. ZENVO2026)"
                className="flex-1 bg-transparent text-xs text-white font-mono focus:outline-none uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-mono text-xs font-bold transition-colors"
              >
                Apply
              </button>
            </div>
            {couponStatus && (
              <p className="text-xs font-mono text-emerald-400">{couponStatus}</p>
            )}

            {/* Final Summary & Checkout CTA */}
            <div className="bg-[#0c1520] border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block uppercase">TOTAL AMOUNT TO PAY</span>
                <span className="text-2xl font-black font-mono text-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                  {formatCurrency(finalUSDPrice, selectedCurrency)}
                </span>
                {appliedDiscount > 0 && (
                  <span className="text-xs text-slate-500 line-through ml-2 font-mono">
                    {formatCurrency(selectedDenom.amount, selectedCurrency)}
                  </span>
                )}
              </div>

              <button
                onClick={handleInstantPay}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,102,0.6)] hover:shadow-[0_0_40px_rgba(0,255,102,0.9)] transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>{isSubmitting ? 'PROCESSING RECHARGE...' : 'PAY & TOP UP INSTANTLY'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
