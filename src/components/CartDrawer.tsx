import React from 'react';
import { CartItem, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { X, ShoppingBag, Trash2, ArrowRight, Zap } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#080e14] border-l border-emerald-500/30 text-slate-100 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-[#0a121a] border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-black font-mono uppercase text-white">Your Shopping Cart</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs">
                {cartItems.length} items
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-sm font-mono text-slate-400">Your cart is currently empty.</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-xl font-mono text-xs font-bold transition-colors"
                >
                  Browse Top-Ups
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.denomination.id}-${idx}`}
                  className="bg-[#0c141f] border border-slate-800 rounded-xl p-3 flex gap-3 items-center"
                >
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white font-mono truncate">{item.productTitle}</h4>
                    <p className="text-[11px] text-emerald-400 font-mono">{item.denomination.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">UID: {item.playerId}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black font-mono text-emerald-400">
                      {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                    </p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.productId, item.denomination.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono px-1">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.productId, item.denomination.id, item.quantity + 1)
                        }
                        className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.productId, item.denomination.id)}
                        className="p-1 text-red-400 hover:text-red-300 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-[#0a111a] border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-sm font-mono">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-emerald-400 font-black text-lg">
                  {formatCurrency(totalUSD, selectedCurrency)}
                </span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.5)] flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>PROCEED TO CHECKOUT</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
