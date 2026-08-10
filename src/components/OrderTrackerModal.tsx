import React, { useState } from 'react';
import { Order, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { Search, Clock, CheckCircle2, AlertCircle, X, Copy, Zap, ShieldCheck } from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  orders: Order[];
  selectedCurrency: CurrencyCode;
  onClose: () => void;
  onSearchOrder: (orderId: string) => Promise<Order | null>;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  orders,
  selectedCurrency,
  onClose,
  onSearchOrder,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(orders[0] || null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    const result = await onSearchOrder(searchQuery);
    setIsSearching(false);

    if (result) {
      setSearchedOrder(result);
    } else {
      setSearchError('No order found with that Order Number or Transaction ID.');
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'Received in API gateway' },
    { title: 'Payment Verified', desc: 'Payment Gateway Confirmed' },
    { title: 'Recharge In Progress', desc: 'Direct UID Dispatch' },
    { title: 'Top-Up Delivered', desc: 'Credited to In-Game Mail' },
  ];

  const getStepState = (status: string, stepIndex: number) => {
    if (status === 'Delivered') return true;
    if (status === 'Processing') return stepIndex <= 2;
    if (status === 'Pending Verification') return stepIndex <= 1;
    return stepIndex === 0;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Delivered') return { bg: 'bg-zenvo-success-soft', text: 'text-zenvo-success', border: 'border-zenvo-success/30' };
    if (status === 'Processing') return { bg: 'bg-zenvo-primary-soft', text: 'text-zenvo-primary', border: 'border-zenvo-primary-border/40' };
    return { bg: 'bg-zenvo-warning-soft', text: 'text-zenvo-warning', border: 'border-zenvo-warning/30' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenvo-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zenvo-surface border border-zenvo-border rounded-2xl shadow-xl overflow-hidden text-zenvo-text my-8">
        {/* Header */}
        <div className="p-4 bg-zenvo-card/80 border-b border-zenvo-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zenvo-primary-soft text-zenvo-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-zenvo-text">LIVE ORDER TRACKING HUD</h2>
              <p className="text-[10px] text-zenvo-muted">REAL-TIME OPENAPI TOP-UP STATUS</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-zenvo-secondary hover:text-zenvo-primary hover:border-zenvo-primary-border hover:bg-zenvo-primary-soft transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-zenvo-card border border-zenvo-border rounded-xl p-2 focus-within:border-zenvo-primary-border transition-colors">
            <Search className="w-4 h-4 text-zenvo-primary ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ZNG-894102) or Transaction ID"
              className="flex-1 bg-transparent text-xs text-zenvo-text focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 rounded-lg bg-zenvo-primary hover:bg-zenvo-primary-hover text-white font-bold text-xs uppercase transition-colors active:scale-[0.97] disabled:opacity-50"
            >
              {isSearching ? 'Tracking...' : 'Track'}
            </button>
          </div>

          {searchError && <p className="text-xs text-zenvo-error font-medium">{searchError}</p>}

          {searchedOrder && (
            <div className="space-y-6">
              {/* Order Meta Header Card */}
              <div className="bg-zenvo-card border border-zenvo-border rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zenvo-border/60 pb-2.5">
                  <div>
                    <span className="text-[10px] text-zenvo-muted block uppercase tracking-wider font-bold">ORDER NUMBER</span>
                    <span className="text-sm font-black font-mono text-zenvo-primary">{searchedOrder.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zenvo-muted block uppercase tracking-wider font-bold">STATUS</span>
                    {(() => {
                      const sb = getStatusBadge(searchedOrder.fulfillmentStatus);
                      return (
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${sb.bg} ${sb.text} ${sb.border} mt-0.5`}>
                          {searchedOrder.fulfillmentStatus}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-zenvo-secondary">
                  <div>
                  <span className="text-zenvo-muted block text-[10px] uppercase tracking-wide">Player UID:</span>
                  <span className="font-bold text-zenvo-text text-sm block">{searchedOrder.playerId}</span>
                </div>
                <div>
                  <span className="text-zenvo-muted block text-[10px] uppercase tracking-wide">Payment Method:</span>
                  <span className="text-zenvo-text text-sm block">{searchedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-zenvo-muted block text-[10px] uppercase tracking-wide">Total Paid:</span>
                  <span className="text-zenvo-success font-bold text-sm font-mono block">
                    {formatCurrency(searchedOrder.totalUSD, selectedCurrency)}
                  </span>
                </div>
              </div>
            </div>

              {/* Animated HUD Timeline Steps */}
              <div>
                <h3 className="text-xs font-bold text-zenvo-primary uppercase tracking-wider mb-4">
                  FULFILLMENT PROGRESS TIMELINE
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zenvo-border">
                  {steps.map((st, idx) => {
                    const isCompleted = getStepState(searchedOrder.fulfillmentStatus, idx);
                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition-all ${
                            isCompleted
                              ? 'bg-zenvo-primary text-white shadow-sm'
                              : 'bg-zenvo-surface text-zenvo-muted border border-zenvo-border'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isCompleted ? 'text-zenvo-text' : 'text-zenvo-muted'
                            }`}
                          >
                            {st.title}
                          </p>
                          <p className="text-[11px] text-zenvo-secondary mt-0.5">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick List of User Orders */}
          <div className="pt-4 border-t border-zenvo-border/60">
            <h3 className="text-xs font-bold text-zenvo-secondary uppercase tracking-wider mb-2">
              YOUR RECENT ORDERS ({orders.length})
            </h3>

            <div className="space-y-2">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setSearchedOrder(ord)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all active:scale-[0.99] ${
                    searchedOrder?.id === ord.id
                      ? 'bg-zenvo-primary-soft/40 border-zenvo-primary-border text-zenvo-text'
                      : 'bg-zenvo-card border-zenvo-border text-zenvo-secondary hover:border-zenvo-primary-border/50 hover:text-zenvo-text'
                  }`}
                >
                  <div>
                    <span className="font-bold text-zenvo-primary font-mono text-sm">{ord.orderNumber}</span>
                    <span className="text-zenvo-muted ml-2 text-[11px]">({ord.items[0]?.productTitle})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zenvo-secondary font-mono">{formatCurrency(ord.totalUSD, selectedCurrency)}</span>
                    {(() => {
                      const sb = getStatusBadge(ord.fulfillmentStatus);
                      return (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] border ${sb.bg} ${sb.text} ${sb.border} font-bold`}>
                          {ord.fulfillmentStatus}
                        </span>
                      );
                    })()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
