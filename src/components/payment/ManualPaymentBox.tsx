'use client';

import React, { useState } from 'react';
import { PAYMENT_ACCOUNTS } from '@/data/paymentSettings';
import { Copy, Check, Info, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { CurrencyCode } from '@/types';
import { PaymentLogo } from './PaymentLogos';

interface ManualPaymentBoxProps {
  paymentMethod: string;
  totalAmountUSD: number;
  selectedCurrency: CurrencyCode;
  senderNumber: string;
  setSenderNumber: (val: string) => void;
  trxId: string;
  setTrxId: (val: string) => void;
}

const BRAND_ACCENTS: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  bKash: {
    border: 'border-pink-500/40',
    bg: 'from-pink-500/10 via-zenvo-card to-zenvo-bg',
    text: 'text-pink-400',
    ring: 'focus:ring-pink-500/40 focus:border-pink-500',
  },
  Nagad: {
    border: 'border-orange-500/40',
    bg: 'from-orange-500/10 via-zenvo-card to-zenvo-bg',
    text: 'text-orange-400',
    ring: 'focus:ring-orange-500/40 focus:border-orange-500',
  },
  Rocket: {
    border: 'border-purple-500/40',
    bg: 'from-purple-500/10 via-zenvo-card to-zenvo-bg',
    text: 'text-purple-400',
    ring: 'focus:ring-purple-500/40 focus:border-purple-500',
  },
  'Visa/Mastercard': {
    border: 'border-blue-500/40',
    bg: 'from-blue-500/10 via-zenvo-card to-zenvo-bg',
    text: 'text-blue-400',
    ring: 'focus:ring-blue-500/40 focus:border-blue-500',
  },
  'Crypto/USDT': {
    border: 'border-emerald-500/40',
    bg: 'from-emerald-500/10 via-zenvo-card to-zenvo-bg',
    text: 'text-emerald-400',
    ring: 'focus:ring-emerald-500/40 focus:border-emerald-500',
  },
};

export default function ManualPaymentBox({
  paymentMethod,
  totalAmountUSD,
  selectedCurrency,
  senderNumber,
  setSenderNumber,
  trxId,
  setTrxId,
}: ManualPaymentBoxProps) {
  const [copied, setCopied] = useState(false);
  const account = PAYMENT_ACCOUNTS[paymentMethod] || PAYMENT_ACCOUNTS['bKash'];
  const brand = BRAND_ACCENTS[paymentMethod] || BRAND_ACCENTS['bKash'];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-b ${brand.bg} border ${brand.border} p-4 sm:p-5 space-y-4 shadow-xl transition-all`}>
      {/* Account Info Header */}
      <div className="flex items-center justify-between border-b border-zenvo-border/60 pb-3.5">
        <div className="flex items-center gap-3">
          <PaymentLogo method={paymentMethod} className="w-10 h-10 rounded-xl shadow-md shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-black text-zenvo-text tracking-wide flex items-center gap-2">
              {account.name} <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${brand.text} bg-zenvo-surface border border-zenvo-border`}>{account.type}</span>
            </h4>
            <p className="text-[10px] text-zenvo-text-muted">Manual payment & transaction verification</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-zenvo-text-muted">Total Payable</p>
          <p className="text-base sm:text-lg font-black font-mono text-zenvo-accent">
            {formatCurrency(totalAmountUSD, selectedCurrency)}
          </p>
        </div>
      </div>

      {/* Copyable Number Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-zenvo-surface/90 border border-zenvo-border flex items-center justify-between gap-3 shadow-inner">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted">
            Send Payment to this Number / Account:
          </p>
          <p className="text-sm sm:text-base font-mono font-black text-zenvo-text tracking-wider truncate mt-0.5 select-all">
            {account.number}
          </p>
        </div>
        <button
          type="button"
          onClick={() => copyToClipboard(account.number)}
          className="px-4 py-2 rounded-xl bg-zenvo-primary hover:bg-zenvo-primary-hover text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Instruction Note */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs">
          {account.instruction}
        </p>
      </div>

      {/* Inputs: Sender Number + TrxID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">
            Sender Number / Account *
          </label>
          <input
            type="text"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            required
            placeholder="e.g. 017XXXXXXXX"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border ${brand.ring} outline-none text-xs sm:text-sm font-mono transition-all`}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">
            Transaction ID (TrxID) *
          </label>
          <input
            type="text"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
            required
            placeholder="e.g. 9K7J4L8N2P"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border ${brand.ring} outline-none text-xs sm:text-sm font-mono uppercase tracking-wider transition-all`}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-zenvo-text-muted pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-zenvo-success" />
        <span>After submitting TrxID, our admin team will instantly verify and process your order.</span>
      </div>
    </div>
  );
}
