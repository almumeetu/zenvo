'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { Order } from '@/types';
import {
  CheckCircle2,
  Zap,
  Copy,
  ExternalLink,
  ArrowLeft,
  Download,
  MessageCircle,
  Phone,
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, selectedCurrency, user } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!orderId) return;
    const found = orders.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    setOrder(found || null);
  }, [orderId, orders]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-12 h-12 border-4 border-zenov-primary/30 border-t-zenov-primary rounded-full animate-spin" />
        <p className="text-sm text-zenov-text-secondary">Loading order details...</p>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'Paid';
  const isPending = order.paymentStatus === 'Pending Verification';

  return (
    <div className="min-h-screen bg-zenov-bg text-zenov-text">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6">
          <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zenov-text font-semibold">Order Confirmation</span>
        </div>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zenov-success-soft border-2 border-zenov-success rounded-full flex items-center justify-center mx-auto text-zenov-success mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase border inline-flex items-center gap-1.5 ${
            isPaid
              ? 'bg-zenov-success-soft text-zenov-success border-zenov-success/30'
              : 'bg-zenov-warning-soft text-zenov-warning border-zenov-warning/30'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            {isPaid ? 'ORDER CONFIRMED' : 'PENDING VERIFICATION'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zenov-text mt-3">
            {isPaid ? 'Payment Successful!' : 'Awaiting Payment Verification'}
          </h1>
          <p className="text-sm text-zenov-text-secondary mt-2 max-w-md mx-auto">
            {isPaid
              ? 'Your order has been placed successfully. We are processing your top-up now.'
              : 'Your order is pending verification. Our team will confirm your payment shortly.'}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-2xl bg-zenov-card border border-zenov-border overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-zenov-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zenov-text-muted mb-1">Order Number</p>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-zenov-primary">
                {order.orderNumber}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zenov-text-muted mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                order.fulfillmentStatus === 'Delivered'
                  ? 'bg-zenov-success-soft text-zenov-success border-zenov-success/30'
                  : order.fulfillmentStatus === 'Processing'
                  ? 'bg-zenov-primary-soft text-zenov-primary border-zenov-primary-border'
                  : 'bg-zenov-warning-soft text-zenov-warning border-zenov-warning/30'
              }`}>
                {order.fulfillmentStatus}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Order Items */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zenov-text mb-3">Order Items</h3>
              <div className="space-y-2.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zenov-surface/60 border border-zenov-border">
                    {item.productImage && (
                      <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-zenov-border shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zenov-text truncate">{item.productTitle}</p>
                      <p className="text-xs text-zenov-text-secondary">Package: {item.denomination.name}</p>
                      {item.playerId && (
                        <p className="text-xs font-mono text-zenov-text-muted mt-0.5">Player: {item.playerId}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-zenov-text-muted">Qty {item.quantity}</p>
                      <p className="font-mono font-black text-zenov-text text-sm">
                        {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zenov-surface/60 border border-zenov-border">
                <h4 className="text-xs font-bold text-zenov-text-muted uppercase tracking-wider mb-2">Payment</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zenov-text-muted">Method</span>
                    <span className="font-bold text-zenov-text">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zenov-text-muted">Trx ID</span>
                    <button
                      onClick={() => copyToClipboard(order.transactionId)}
                      className="font-mono text-zenov-primary hover:underline inline-flex items-center gap-1"
                    >
                      {order.transactionId}
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  {order.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-zenov-text-muted">Phone</span>
                      <span className="font-bold text-zenov-text">{order.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zenov-primary-soft/50 border border-zenov-primary-border">
                <h4 className="text-xs font-bold text-zenov-text-muted uppercase tracking-wider mb-2">Order Summary</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zenov-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(order.totalUSD, selectedCurrency)}</span>
                  </div>
                  <div className="h-px bg-zenov-border my-1.5" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zenov-text-muted">Total Paid</span>
                    <span className="text-xl font-black font-mono text-zenov-text">
                      {formatCurrency(order.totalUSD, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Help Card */}
        <div className="rounded-2xl bg-green-500/10 border border-green-500/25 p-4 sm:p-5 flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-green-300">Need Help with This Order?</h4>
            <p className="text-xs text-green-200/80 mt-0.5">Chat with our support team on WhatsApp for instant assistance.</p>
          </div>
          <a
            href={`https://wa.me/8801300529836?text=${encodeURIComponent('Hi ZENOV, I need help with order ' + order.orderNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/orders/track"
            className="flex-1 px-4 py-3 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft/40 text-sm font-bold text-zenov-text-secondary hover:text-zenov-primary transition-all inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Track All Orders
          </Link>
          <Link
            href="/shop"
            className="flex-1 px-4 py-3 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg text-sm font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-zenov-bg/60" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
