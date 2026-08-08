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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#080e15] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#0a141d] to-[#070b0f] border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">LIVE ORDER TRACKING HUD</h2>
              <p className="text-[10px] text-slate-400 font-mono">REAL-TIME OPENAPI TOP-UP STATUS</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-[#0b121a] border border-slate-800 rounded-xl p-2 focus-within:border-emerald-400">
            <Search className="w-4 h-4 text-emerald-400 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ZNG-894102) or Transaction ID"
              className="flex-1 bg-transparent text-xs text-white font-mono focus:outline-none uppercase"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase"
            >
              {isSearching ? 'Tracking...' : 'Track'}
            </button>
          </div>

          {searchError && <p className="text-xs font-mono text-red-400">{searchError}</p>}

          {searchedOrder && (
            <div className="space-y-6">
              {/* Order Meta Header Card */}
              <div className="bg-[#0b131c] border border-emerald-500/30 rounded-2xl p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ORDER NUMBER</span>
                    <span className="text-sm font-black text-emerald-400">{searchedOrder.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">STATUS</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                      {searchedOrder.fulfillmentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Player UID:</span>
                    <span className="font-bold text-white">{searchedOrder.playerId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Method:</span>
                    <span className="text-white">{searchedOrder.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Paid:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(searchedOrder.totalUSD, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated HUD Timeline Steps */}
              <div>
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-4">
                  FULFILLMENT PROGRESS TIMELINE
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {steps.map((st, idx) => {
                    const isCompleted = getStepState(searchedOrder.fulfillmentStatus, idx);
                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-black z-10 transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-black shadow-[0_0_10px_#00ff66]'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-mono font-bold ${
                              isCompleted ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {st.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-sans">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick List of User Orders */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              YOUR RECENT ORDERS ({orders.length})
            </h3>

            <div className="space-y-2">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setSearchedOrder(ord)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between font-mono text-xs transition-colors ${
                    searchedOrder?.id === ord.id
                      ? 'bg-emerald-950/40 border-emerald-400 text-white'
                      : 'bg-[#0a1017] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-emerald-400">{ord.orderNumber}</span>
                    <span className="text-slate-500 ml-2">({ord.items[0]?.productTitle})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{formatCurrency(ord.totalUSD, selectedCurrency)}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                      {ord.fulfillmentStatus}
                    </span>
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
