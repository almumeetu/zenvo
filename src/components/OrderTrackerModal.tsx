import React, { useState } from 'react';
import { Order, CurrencyCode, UserProfile } from '../types';
import { formatCurrency } from '../lib/currency';
import { Search, Clock, CheckCircle2, AlertCircle, X, Copy, Zap, ShieldCheck } from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  orders: Order[];
  selectedCurrency: CurrencyCode;
  onClose: () => void;
  onSearchOrder: (orderId: string) => Promise<Order | null>;
  user?: UserProfile;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  orders,
  selectedCurrency,
  onClose,
  onSearchOrder,
  user,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const userOrders = React.useMemo(() => {
    if (!orders.length) return [];
    if (!user || !user.email) return orders.slice(0, 5);
    return orders.filter(
      (o) => o.userEmail?.toLowerCase() === user.email.toLowerCase() || o.userId === user.id
    );
  }, [orders, user]);

  React.useEffect(() => {
    if (userOrders.length > 0 && !searchedOrder) {
      setSearchedOrder(userOrders[0]);
    }
  }, [userOrders, searchedOrder]);

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
    if (status === 'Delivered') return { bg: 'bg-zenov-success-soft', text: 'text-zenov-success', border: 'border-zenov-success/30' };
    if (status === 'Processing') return { bg: 'bg-zenov-primary-soft', text: 'text-zenov-primary', border: 'border-zenov-primary-border/40' };
    return { bg: 'bg-zenov-warning-soft', text: 'text-zenov-warning', border: 'border-zenov-warning/30' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenov-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zenov-surface border border-zenov-border rounded-2xl shadow-xl overflow-hidden text-zenov-text my-8">
        {/* Header */}
        <div className="p-4 bg-zenov-card/80 border-b border-zenov-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zenov-primary-soft text-zenov-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-zenov-text">LIVE ORDER TRACKING HUD</h2>
              <p className="text-[10px] text-zenov-muted">REAL-TIME OPENAPI TOP-UP STATUS</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-zenov-secondary hover:text-zenov-primary hover:border-zenov-primary-border hover:bg-zenov-primary-soft transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-zenov-card border border-zenov-border rounded-xl p-2 focus-within:border-zenov-primary-border transition-colors">
            <Search className="w-4 h-4 text-zenov-primary ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ZNG-894102) or Transaction ID"
              className="flex-1 bg-transparent text-xs text-zenov-text focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 rounded-lg bg-zenov-primary hover:bg-zenov-primary-hover text-white font-bold text-xs uppercase transition-colors active:scale-[0.97] disabled:opacity-50"
            >
              {isSearching ? 'Tracking...' : 'Track'}
            </button>
          </div>

          {searchError && <p className="text-xs text-zenov-error font-medium">{searchError}</p>}

          {searchedOrder && (
            <div className="space-y-6">
              {/* Order Meta Header Card */}
              <div className="bg-zenov-card border border-zenov-border rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zenov-border/60 pb-2.5">
                  <div>
                    <span className="text-[10px] text-zenov-muted block uppercase tracking-wider font-bold">ORDER NUMBER</span>
                    <span className="text-sm font-black font-mono text-zenov-primary">{searchedOrder.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zenov-muted block uppercase tracking-wider font-bold">STATUS</span>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-zenov-secondary">
                  <div>
                  <span className="text-zenov-muted block text-[10px] uppercase tracking-wide">Player UID:</span>
                  <span className="font-bold text-zenov-text text-sm block">{searchedOrder.playerId}</span>
                </div>
                <div>
                  <span className="text-zenov-muted block text-[10px] uppercase tracking-wide">Payment Method:</span>
                  <span className="text-zenov-text text-sm block">{searchedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-zenov-muted block text-[10px] uppercase tracking-wide">Total Paid:</span>
                  <span className="text-zenov-success font-bold text-sm font-mono block">
                    {formatCurrency(searchedOrder.totalUSD, selectedCurrency)}
                  </span>
                </div>
              </div>
            </div>

              {/* Animated HUD Timeline Steps */}
              <div>
                <h3 className="text-xs font-bold text-zenov-primary uppercase tracking-wider mb-4">
                  FULFILLMENT PROGRESS TIMELINE
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zenov-border">
                  {steps.map((st, idx) => {
                    const isCompleted = getStepState(searchedOrder.fulfillmentStatus, idx);
                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition-all ${
                            isCompleted
                              ? 'bg-zenov-primary text-white shadow-sm'
                              : 'bg-zenov-surface text-zenov-muted border border-zenov-border'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isCompleted ? 'text-zenov-text' : 'text-zenov-muted'
                            }`}
                          >
                            {st.title}
                          </p>
                          <p className="text-[11px] text-zenov-secondary mt-0.5">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick List of User Orders */}
          {userOrders.length > 0 && (
            <div className="pt-4 border-t border-zenov-border/60">
              <h3 className="text-xs font-bold text-zenov-secondary uppercase tracking-wider mb-2">
                YOUR RECENT ORDERS ({userOrders.length})
              </h3>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSearchedOrder(ord)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all active:scale-[0.99] ${
                      searchedOrder?.id === ord.id
                        ? 'bg-zenov-primary-soft/40 border-zenov-primary-border text-zenov-text'
                        : 'bg-zenov-card border-zenov-border text-zenov-secondary hover:border-zenov-primary-border/50 hover:text-zenov-text'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-zenov-primary font-mono text-sm">{ord.orderNumber}</span>
                      <span className="text-zenov-muted ml-2 text-[11px]">({ord.items[0]?.productTitle})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zenov-secondary font-mono">{formatCurrency(ord.totalUSD, selectedCurrency)}</span>
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
          )}
        </div>
      </div>
    </div>
  );
};
