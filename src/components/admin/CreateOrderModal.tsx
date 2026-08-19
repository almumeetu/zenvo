'use client';

import React, { useState } from 'react';
import { Product, CurrencyCode, Order, CartItem } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  X,
  Plus,
  ShoppingBag,
  User,
  Zap,
  Check,
  CreditCard,
  Gamepad2,
  Phone,
  Mail,
  FileText,
  DollarSign,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedCurrency: CurrencyCode;
  onCreateOrder: (order: Partial<Order>) => Promise<{ success: boolean; message?: string }>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedCurrency,
  onCreateOrder,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedDenomId, setSelectedDenomId] = useState<string>(
    products[0]?.denominations[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [serverId, setServerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Crypto/USDT' | 'Zenov Wallet'>('bKash');
  const [transactionId, setTransactionId] = useState<string>(
    'TX-ADM-' + Math.random().toString(36).slice(2, 9).toUpperCase()
  );
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Pending Verification' | 'Failed'>('Paid');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<'Delivered' | 'Processing' | 'Pending Verification' | 'Refunded'>('Delivered');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentDenom =
    currentProduct?.denominations.find((d) => d.id === selectedDenomId) ||
    currentProduct?.denominations[0];

  const totalUSD = (currentDenom?.amount || 0) * quantity;
  const totalBDT = (currentDenom?.priceBDT || (currentDenom?.amount || 0) * 120) * quantity;

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.denominations.length > 0) {
      setSelectedDenomId(prod.denominations[0].id);
    }
  };

  const handleGenerateTrxId = () => {
    setTransactionId('TX-ADM-' + Math.random().toString(36).slice(2, 9).toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentProduct || !currentDenom) {
      setErrorMsg('Please select a valid product and denomination package.');
      return;
    }

    if (!playerId.trim()) {
      setErrorMsg('Please enter a destination Player ID / UID / Email.');
      return;
    }

    if (!customerEmail.trim() && !customerPhone.trim()) {
      setErrorMsg('Please enter at least a Customer Email or Phone number.');
      return;
    }

    setIsSubmitting(true);

    const cartItem: CartItem = {
      productId: currentProduct.id,
      productTitle: currentProduct.title,
      productImage: currentProduct.image,
      denomination: currentDenom,
      quantity,
      playerId: playerId.trim(),
      serverId: serverId.trim() || undefined,
    };

    const orderPayload: Partial<Order> = {
      orderNumber: 'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3),
      userId: isGuest ? 'guest' : 'manual_user',
      userEmail: customerEmail.trim() || 'guest@zenovgames.com',
      customerName: customerName.trim() || (isGuest ? 'Guest Gamer' : 'Customer'),
      customerPhone: customerPhone.trim(),
      senderNumber: senderNumber.trim(),
      items: [cartItem],
      totalUSD,
      currency: selectedCurrency,
      paidAmountCurrency: selectedCurrency === 'BDT' ? totalBDT : totalUSD,
      paymentMethod,
      paymentStatus,
      fulfillmentStatus,
      playerId: playerId.trim(),
      serverId: serverId.trim() || '',
      transactionId: transactionId.trim() || ('TX-' + Math.random().toString(36).slice(2, 9).toUpperCase()),
      notes: adminNotes.trim(),
    };

    try {
      const res = await onCreateOrder(orderPayload);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to create order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-zenov-card border border-zenov-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zenov-border/80 bg-zenov-surface/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zenov-primary/20 border border-zenov-primary/40 flex items-center justify-center text-zenov-primary">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zenov-text tracking-tight uppercase flex items-center gap-2">
                <span>Create New Order</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border font-bold">
                  Admin Manual Desk
                </span>
              </h2>
              <p className="text-xs text-zenov-text-muted">
                Manually record or fulfill an order for a customer or guest
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-zenov-text hover:border-zenov-primary transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-zenov-error/15 border border-zenov-error/30 text-zenov-error text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Product & Package Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" /> 1. Select Product & Denomination
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Game / Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-medium focus:border-zenov-primary focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Package / Denomination
                </label>
                <select
                  value={selectedDenomId}
                  onChange={(e) => setSelectedDenomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-medium focus:border-zenov-primary focus:outline-none"
                >
                  {currentProduct?.denominations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {formatCurrency(d.amount, selectedCurrency)} (৳{d.priceBDT || Math.round(d.amount * 120)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-bold focus:border-zenov-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Destination UID / Player ID <span className="text-zenov-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5839201948 or user email"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-mono focus:border-zenov-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Server / Zone ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2049 (Asia)"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-mono focus:border-zenov-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Customer Information */}
          <div className="space-y-3 pt-3 border-t border-zenov-border/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
                <User className="w-4 h-4" /> 2. Customer Information
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGuest(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isGuest
                      ? 'bg-zenov-primary text-white shadow-sm'
                      : 'bg-zenov-surface text-zenov-text-muted hover:text-zenov-text'
                  }`}
                >
                  Guest Order
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuest(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !isGuest
                      ? 'bg-zenov-primary text-white shadow-sm'
                      : 'bg-zenov-surface text-zenov-text-muted hover:text-zenov-text'
                  }`}
                >
                  Registered User
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahim Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text focus:border-zenov-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Customer Email <span className="text-zenov-error">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahim@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text focus:border-zenov-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Customer Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="e.g. 017XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-mono focus:border-zenov-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment & Gateway Details */}
          <div className="space-y-3 pt-3 border-t border-zenov-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> 3. Payment & Gateway Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-medium focus:border-zenov-primary focus:outline-none"
                >
                  <option value="bKash">bKash (Personal/Merchant)</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Crypto/USDT">Crypto / USDT</option>
                  <option value="Zenov Wallet">Zenov Wallet Float</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zenov-text-secondary">
                    Transaction ID (TrxID)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTrxId}
                    className="text-[10px] text-zenov-primary font-bold hover:underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-mono font-bold focus:border-zenov-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Sender Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 018XXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-mono focus:border-zenov-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Status & Admin Notes */}
          <div className="space-y-3 pt-3 border-t border-zenov-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> 4. Fulfillment Status & Internal Notes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Fulfillment Status
                </label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-bold focus:border-zenov-primary focus:outline-none"
                >
                  <option value="Delivered">Delivered / Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Refunded">Refunded / Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-bold focus:border-zenov-primary focus:outline-none"
                >
                  <option value="Paid">Paid / Verified</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed / Declined</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zenov-text-secondary mb-1.5">
                Admin Notes / Delivery Codes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Delivered gift code via WhatsApp; verified by Admin"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text focus:border-zenov-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-zenov-primary-soft/60 to-zenov-accent-soft/40 border border-zenov-primary-border/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-zenov-text-muted uppercase font-bold">Total Order Value</p>
              <p className="text-lg font-black text-zenov-text font-mono">
                {formatCurrency(totalUSD, selectedCurrency)} <span className="text-xs font-bold text-zenov-accent font-sans">({totalBDT} BDT)</span>
              </p>
            </div>
            <div className="text-right text-xs text-zenov-text-secondary">
              <span>{quantity}x {currentDenom?.name}</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-text font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-zenov-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating Order...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Create & Record Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
