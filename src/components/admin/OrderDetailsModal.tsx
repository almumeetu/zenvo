'use client';

import React, { useState } from 'react';
import { Order, CurrencyCode } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  User,
  Gamepad2,
  CreditCard,
  FileText,
  Calendar,
  Globe,
} from 'lucide-react';
import { PaymentLogo } from '@/components/payment/PaymentLogos';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: CurrencyCode;
  onUpdateStatus: (
    orderId: string,
    status: 'Processing' | 'Delivered' | 'Refunded' | 'Pending Verification',
    paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Pending Verification'
  ) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  selectedCurrency,
  onUpdateStatus,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isGuest = order.userId === 'guest' || !order.userId || order.userId === '';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/15 border border-sky-500/30 text-sky-300 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> Pending Verification
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/15 border border-red-500/30 text-red-400">
            <XCircle className="w-3.5 h-3.5" /> Refunded / Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-zenov-surface border border-zenov-border text-zenov-text-secondary">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-zenov-card border border-zenov-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zenov-border bg-zenov-surface/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-zenov-text font-mono">
                  {order.orderNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(order.orderNumber, 'orderNumber')}
                  className="p-1 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-zenov-text transition-all"
                  title="Copy Order #"
                >
                  {copiedKey === 'orderNumber' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {isGuest ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    👤 Guest
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-300">
                    👑 Member
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zenov-text-muted mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(order.fulfillmentStatus)}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-zenov-text hover:border-zenov-primary transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Destination & Game Section */}
          <div className="p-4 rounded-xl bg-zenov-surface/60 border border-zenov-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" /> Game & Destination UID
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-zenov-card border border-zenov-border/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Player ID / UID
                  </span>
                  <span className="text-sm font-mono font-black text-zenov-text">
                    {order.playerId || 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(order.playerId, 'playerId')}
                  className="px-2.5 py-1 rounded-md bg-zenov-surface border border-zenov-border hover:border-zenov-primary text-xs font-bold flex items-center gap-1 transition-all"
                >
                  {copiedKey === 'playerId' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {order.serverId && (
                <div className="p-3 rounded-lg bg-zenov-card border border-zenov-border/70">
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Server / Zone ID
                  </span>
                  <span className="text-sm font-mono font-bold text-zenov-text">
                    {order.serverId}
                  </span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-zenov-text-muted uppercase">
                Order Items ({order.items.length})
              </span>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zenov-card border border-zenov-border/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-10 h-10 rounded-lg object-cover bg-zenov-surface"
                        />
                      )}
                      <div>
                        <p className="font-bold text-zenov-text leading-tight">{item.productTitle}</p>
                        <p className="text-xs text-zenov-text-secondary">
                          {item.denomination.name} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-zenov-success">
                        {formatCurrency(item.denomination.amount * item.quantity, selectedCurrency)}
                      </p>
                      <p className="text-[10px] font-mono text-zenov-text-muted">
                        ৳{(item.denomination.priceBDT || Math.round(item.denomination.amount * 120)) * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer & Contact Details */}
          <div className="p-4 rounded-xl bg-zenov-surface/60 border border-zenov-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
              <User className="w-4 h-4" /> Customer Contact Info
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Customer Name
                  </span>
                  <span className="font-bold text-zenov-text">{order.customerName || 'Gamer'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Email Address
                  </span>
                  <span className="font-mono font-medium text-zenov-text truncate block">
                    {order.userEmail}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(order.userEmail, 'email')}
                  className="shrink-0 p-1.5 rounded bg-zenov-surface border border-zenov-border hover:border-zenov-primary transition-all"
                >
                  {copiedKey === 'email' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {order.customerPhone && (
                <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                      Phone Number
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {order.customerPhone}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.customerPhone || '', 'phone')}
                    className="p-1.5 rounded bg-zenov-surface border border-zenov-border hover:border-zenov-primary transition-all"
                  >
                    {copiedKey === 'phone' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {order.ipAddress && (
                <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70">
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Client IP Address
                  </span>
                  <span className="font-mono text-zenov-text-muted">{order.ipAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Gateway Breakdown */}
          <div className="p-4 rounded-xl bg-zenov-surface/60 border border-zenov-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zenov-primary flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> Payment Verification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70">
                <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                  Gateway
                </span>
                <span className="font-black text-zenov-text text-sm flex items-center gap-1.5 mt-0.5">
                  <PaymentLogo method={order.paymentMethod} className="w-5 h-5 rounded-md shrink-0 shadow-sm" />
                  <span>{order.paymentMethod}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Transaction ID
                  </span>
                  <span className="font-mono font-black text-sky-400 truncate block">
                    {order.transactionId || 'N/A'}
                  </span>
                </div>
                {order.transactionId && (
                  <button
                    onClick={() => copyToClipboard(order.transactionId, 'trxId')}
                    className="shrink-0 p-1.5 rounded bg-zenov-surface border border-zenov-border hover:border-zenov-primary transition-all"
                  >
                    {copiedKey === 'trxId' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              {order.senderNumber && (
                <div className="p-2.5 rounded-lg bg-zenov-card border border-zenov-border/70">
                  <span className="text-[10px] uppercase font-bold text-zenov-text-muted block">
                    Sender Number
                  </span>
                  <span className="font-mono font-bold text-amber-400">{order.senderNumber}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-zenov-card border border-zenov-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zenov-text-muted uppercase">
                  Total Paid Amount:
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-zenov-success">
                  {formatCurrency(order.totalUSD, order.currency as any)}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {order.notes && (
            <div className="p-4 rounded-xl bg-zenov-surface/60 border border-zenov-border space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zenov-text-muted flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Order Notes / Codes
              </span>
              <p className="text-xs text-zenov-text bg-zenov-card p-3 rounded-lg border border-zenov-border font-mono whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4.5 border-t border-zenov-border bg-zenov-surface/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zenov-text-muted uppercase">Set Status:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.fulfillmentStatus !== 'Delivered' && (
              <button
                onClick={() => {
                  onUpdateStatus(order.id, 'Delivered', 'Paid');
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Deliver
              </button>
            )}

            {order.fulfillmentStatus !== 'Processing' && (
              <button
                onClick={() => {
                  onUpdateStatus(order.id, 'Processing', 'Paid');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Mark Processing
              </button>
            )}

            {order.fulfillmentStatus !== 'Refunded' && (
              <button
                onClick={() => {
                  onUpdateStatus(order.id, 'Refunded', 'Failed');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Reject & Refund
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zenov-card border border-zenov-border text-zenov-text-secondary hover:text-zenov-text font-bold text-xs uppercase tracking-wider transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
