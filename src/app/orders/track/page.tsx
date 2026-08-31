'use client';

import { Suspense } from 'react';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { PaymentLogo } from '@/components/payment/PaymentLogos';
import {
  Search, ArrowLeft, Package, ChevronRight, Truck, CheckCircle2, AlertCircle,
  Download, RefreshCw, Calendar, User, ArrowUpRight, MessageCircle, Crown,
} from 'lucide-react';

const STEPS: readonly string[] = ['Order Placed', 'Paid', 'Processing', 'Delivered'];

function OrderTrackerContent() {
  const router = useRouter();
  const params = useSearchParams();
  const prefill = params.get('q') || params.get('orderNumber') || params.get('orderId') || '';
  const { orders, searchOrder, selectedCurrency, user, authLoading } = useApp();
  const [q, setQ] = useState<string>(prefill);
  const [found, setFound] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchedEmpty, setSearchedEmpty] = useState(false);

  useEffect(() => {
    if (prefill) {
      setQ(prefill);
      const executePrefillSearch = async () => {
        setLoading(true);
        setSearchedEmpty(false);
        const r = await searchOrder(prefill);
        if (r) {
          setFound(r);
        } else {
          setSearchedEmpty(true);
        }
        setLoading(false);
      };
      executePrefillSearch();
    }
  }, [prefill]);

  const preSelected = useMemo(() => {
    if (!q.trim()) return null;
    return orders.find((o) => o.orderNumber === q || o.id === q) || null;
  }, [q, orders]);

  const result = found || preSelected;

  const onSearch = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setSearchedEmpty(false);
    const r = await searchOrder(q);
    setFound(r);
    setTimeout(() => {
      setLoading(false);
      if (!r) setSearchedEmpty(true);
    }, 400);
  };

  const recent = useMemo(() => {
    if (authLoading) return [];
    if (!user || !user.email) return orders.slice(0, 10);
    return orders
      .filter((o) => o.userEmail?.toLowerCase() === user.email.toLowerCase() || o.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, user, authLoading]);


  const fulfillmentIdx = useMemo(() => {
    if (!result) return -1;
    const status = result.fulfillmentStatus;
    if (status === 'Delivered') return 3;
    if (status === 'Processing') return 2;
    if (status === 'Paid') return 1;
    if (status === 'Refunded') return 0;
    return 0;
  }, [result]);

  const statusBadge = (s: string) => {
    const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border';
    if (s === 'Delivered') return <span className={`${base} bg-zenov-success-soft text-zenov-success border-zenov-success/30`}><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
    if (s === 'Processing') return <span className={`${base} bg-zenov-primary-soft text-zenov-primary border-zenov-primary-border`}><Truck className="w-3.5 h-3.5" /> Processing</span>;
    if (s === 'Refunded') return <span className={`${base} bg-zenov-error/10 text-zenov-error border-zenov-error/30`}><AlertCircle className="w-3.5 h-3.5" /> Refunded</span>;
    if (s === 'Paid') return <span className={`${base} bg-zenov-accent-soft text-zenov-accent border-zenov-accent-border`}><Crown className="w-3.5 h-3.5" /> Paid</span>;
    return <span className={`${base} bg-zenov-surface text-zenov-text-secondary border-zenov-border`}>{s}</span>;
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-zenov-bg">
      {/* ── CRISP HIGH-DPI DEEP GAMING BACKGROUND (ZERO BANDING, CRYSTAL CLEAR) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
          <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zenov-text font-semibold">Order Tracking</span>
        </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-zenov-primary-soft border border-zenov-primary-border">
            <Package className="w-6 h-6 text-zenov-primary" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zenov-text tracking-tight">Order Tracker</h1>
            <p className="text-sm text-zenov-text-secondary">
              Track any Zenvo order in real-time using your order number
            </p>
          </div>
        </div>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-zenov-text-secondary hover:text-zenov-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      {/* Search box */}
      <div className="p-5 sm:p-7 rounded-3xl bg-zenov-card border border-zenov-border mb-8">
        <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-3">Search by Order Number</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setFound(null); setSearchedEmpty(false); }}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="e.g. ZNG-123456"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-sm font-mono"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={loading || !q.trim()}
            className="px-6 py-3 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-sm font-black uppercase tracking-wider shadow-primary disabled:opacity-50 active:scale-[0.98] transition-all inline-flex items-center gap-2"
          >
            {loading ? (
              <>Searching <RefreshCw className="w-4 h-4 animate-spin" /></>
            ) : (
              <><Search className="w-4 h-4" /> Track Order</>
            )}
          </button>
        </div>

        {searchedEmpty && !result && (
          <div className="mt-4 p-4 rounded-xl bg-zenov-error/10 border border-zenov-error/30 text-zenov-error text-sm font-semibold inline-flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            We couldn't find an order matching "{q}". Double-check your order number or check recent orders below.
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="mb-10">
          <div className="rounded-3xl bg-zenov-card border border-zenov-border overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-zenov-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zenov-text-muted mb-1">Order Number</p>
                <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-zenov-text">
                  {result.orderNumber}
                </h2>
                <p className="text-xs text-zenov-text-secondary mt-1">
                  Placed on {new Date(result.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap sm:justify-end">
                {statusBadge(result.fulfillmentStatus)}
              </div>
            </div>

            <div className="px-6 sm:px-8 py-8">
              <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-6">Fulfillment Timeline</h3>
              <div className="relative mb-12">
                <div className="absolute left-5 right-5 top-5 h-[3px] rounded-full bg-zenov-border" />
                <div
                  className="absolute left-5 top-5 h-[3px] rounded-full bg-gradient-to-r from-zenov-primary to-zenov-accent transition-all"
                  style={{ width: `calc(${(fulfillmentIdx / (STEPS.length - 1)) * 100}% )` }}
                />
                <div className="relative grid grid-cols-4 gap-1 sm:gap-4 text-xs sm:text-sm">
                  {STEPS.map((label, i) => {
                    const done = i <= fulfillmentIdx;
                    return (
                      <div key={label} className="flex flex-col items-center text-center gap-2">
                        <div
                          className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-[3px] ${
                            done
                              ? 'bg-gradient-to-br from-zenov-primary to-zenov-accent text-white border-0 shadow-md'
                              : 'bg-zenov-card border-zenov-border text-zenov-text-muted'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : <span className="font-bold">{i + 1}</span>}
                        </div>
                        <span className={`font-bold ${done ? 'text-zenov-primary' : 'text-zenov-text-muted'}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 rounded-2xl bg-zenov-surface/60 border border-zenov-border p-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-zenov-primary" /> Order Items
                  </h3>
                  <div className="space-y-3">
                    {result.items?.length ? (
                      result.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-zenov-card border border-zenov-border">
                          {it.productImage && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-zenov-surface border border-zenov-border shrink-0">
                              <img src={it.productImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zenov-text truncate">{it.productTitle || 'Item'}</p>
                            <p className="text-xs text-zenov-text-secondary mt-0.5">Package: {it.denomination?.label || it.denomination?.name || '-'}</p>
                            {(it.playerId || it.serverId) && (
                              <p className="text-xs font-mono text-zenov-text-muted mt-0.5">
                                {it.playerId && <>Player: {it.playerId}</>}
                                {it.serverId && <> • {it.serverId}</>}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zenov-text-muted">Qty {it.quantity || 1}</p>
                            <p className="font-mono font-black text-zenov-text">
                              {formatCurrency(((it.denomination?.amount || 0) * (it.quantity || 1)), selectedCurrency)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-zenov-text-secondary text-sm">No items recorded.</div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl bg-zenov-surface/60 border border-zenov-border p-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-zenov-primary" /> Customer
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zenov-text-muted">Name</span>
                        <span className="font-bold text-zenov-text">{user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zenov-text-muted">Email</span>
                        <span className="font-bold text-zenov-text truncate max-w-[160px]">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zenov-text-muted">Payment</span>
                        <span className="font-bold text-zenov-text inline-flex items-center gap-1.5">
                          <PaymentLogo method={result.paymentMethod} className="w-5 h-5 rounded-md shrink-0 shadow-sm" />
                          <span>{result.paymentMethod}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-zenov-primary-soft/50 border border-zenov-primary-border p-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-zenov-text-secondary">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(result.totalUSD, selectedCurrency)}</span>
                      </div>
                      <div className="h-px bg-zenov-border my-2" />
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-zenov-text-muted">Total Paid</span>
                        <span className="text-2xl font-black font-mono text-zenov-text">
                          {formatCurrency(result.totalUSD, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button className="flex-1 px-4 py-2.5 rounded-lg border border-zenov-border hover:border-zenov-border-hover bg-zenov-card text-sm font-semibold text-zenov-text-secondary hover:text-zenov-text transition-colors inline-flex items-center justify-center gap-1.5">
                        <Download className="w-4 h-4" /> Invoice
                      </button>
                      <Link
                        href={`/support?order=${encodeURIComponent(result.orderNumber)}`}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-zenov-surface border border-zenov-border hover:border-zenov-accent-border hover:bg-zenov-accent-soft/40 text-sm font-semibold text-zenov-text-secondary hover:text-zenov-accent transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" /> Need Help?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent orders table */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-zenov-text tracking-tight">Your Recent Orders</h2>
          <button
            onClick={() => router?.refresh?.()}
            className="text-sm font-semibold text-zenov-primary hover:underline inline-flex items-center gap-1"
          >
            Refresh <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-zenov-card border border-zenov-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zenov-border text-xs uppercase text-zenov-text-muted text-left">
                  <th className="px-5 py-3 font-bold">Order</th>
                  <th className="px-5 py-3 font-bold">Summary</th>
                  <th className="px-5 py-3 font-bold">Amount</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zenov-border">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-zenov-surface/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-zenov-primary whitespace-nowrap">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {o.items?.[0]?.productImage && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zenov-surface border border-zenov-border shrink-0">
                            <img src={o.items[0].productImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-zenov-text-secondary truncate max-w-[220px]">
                          {o.items?.[0]?.productTitle || `${o.items?.length || 1} item(s)`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-black text-zenov-text whitespace-nowrap">
                      {formatCurrency(o.totalUSD, selectedCurrency)}
                    </td>
                    <td className="px-5 py-4 text-zenov-text-secondary whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {statusBadge(o.fulfillmentStatus)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setQ(o.orderNumber)}
                        className="text-xs font-bold text-zenov-primary hover:underline inline-flex items-center gap-1"
                      >
                        Track <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function OrderTrackerPage() {
  return (
    <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-zenov-primary/30 border-t-zenov-primary rounded-full animate-spin" /></div>}>
      <OrderTrackerContent />
    </Suspense>
  );
}
