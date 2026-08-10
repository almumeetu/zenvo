import React from 'react';
import { CartItem, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { X, ShoppingBag, Trash2, Zap, Minus, Plus } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  selectedCurrency: CurrencyCode;
  onClose: () => void;
  onUpdateQuantity: (productId: string, denominationId: string, quantity: number) => void;
  onRemoveItem: (productId: string, denominationId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  selectedCurrency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const totalUSD = cartItems.reduce(
    (acc, item) => acc + item.denomination.amount * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zenvo-bg/75 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zenvo-card border-l border-zenvo-border text-zenvo-text flex flex-col shadow-xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zenvo-border flex items-center justify-between bg-zenvo-surface/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zenvo-primary-soft border border-zenvo-primary-border flex items-center justify-center">
                <ShoppingBag className="w-[18px] h-[18px] text-zenvo-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zenvo-text">Your Cart</h2>
                <p className="text-xs text-zenvo-text-muted">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zenvo-surface border border-zenvo-border hover:border-zenvo-border-hover text-zenvo-text-secondary hover:text-zenvo-text transition-all"
              aria-label="Close cart"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 bg-zenvo-surface border border-zenvo-border rounded-2xl flex items-center justify-center mx-auto text-zenvo-text-muted">
                  <ShoppingBag className="w-9 h-9" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zenvo-text">Your cart is empty</p>
                  <p className="text-xs text-zenvo-text-muted mt-1">
                    Browse the store and add some top-ups to get started
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-zenvo-primary hover:bg-zenvo-primary-hover text-white text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  Browse Top-Ups
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.denomination.id}-${idx}`}
                  className="bg-zenvo-surface/60 border border-zenvo-border rounded-xl p-3.5 flex gap-3 items-center hover:border-zenvo-border-hover transition-colors"
                >
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-12 h-12 rounded-lg object-cover border border-zenvo-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zenvo-text truncate">
                      {item.productTitle}
                    </h4>
                    <p className="text-[11px] text-zenvo-primary font-medium mt-0.5 truncate">
                      {item.denomination.name}
                    </p>
                    <p className="text-[10px] text-zenvo-text-muted mt-0.5 font-mono">
                      UID: {item.playerId}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-zenvo-text font-mono">
                      {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 justify-end">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.productId, item.denomination.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-6 h-6 rounded-md bg-zenvo-card border border-zenvo-border hover:border-zenvo-primary-border hover:text-zenvo-primary text-zenvo-text-secondary transition-all inline-flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono px-1.5 min-w-[22px] text-center text-zenvo-text font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.productId, item.denomination.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-md bg-zenvo-card border border-zenvo-border hover:border-zenvo-primary-border hover:text-zenvo-primary text-zenvo-text-secondary transition-all inline-flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.productId, item.denomination.id)}
                        className="p-1.5 rounded-md text-zenvo-text-muted hover:text-zenvo-error hover:bg-zenvo-error-soft ml-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zenvo-border bg-zenvo-surface/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zenvo-border/70">
                <div>
                  <p className="text-xs text-zenvo-text-muted">Total Amount</p>
                  <p className="text-[11px] text-zenvo-text-secondary">
                    {cartItems.reduce((a, i) => a + i.quantity, 0)} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-zenvo-text font-mono tracking-tight">
                    {formatCurrency(totalUSD, selectedCurrency)}
                  </p>
                  <p className="text-[10px] text-zenvo-success font-medium">Instant Delivery</p>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-lg bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg font-bold text-sm uppercase tracking-wide shadow-accent hover:shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2 active:scale-[0.99] will-change-transform"
              >
                <Zap className="w-4 h-4 fill-zenvo-bg/60" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
