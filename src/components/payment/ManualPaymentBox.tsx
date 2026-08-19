'use client';

import React, { useState } from 'react';
import { PAYMENT_ACCOUNTS } from '@/data/paymentSettings';
import { Copy, Check, Info, ShieldCheck, MessageCircle, ChevronDown } from 'lucide-react';
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
    bg: 'from-pink-500/10 via-slate-900 to-slate-950',
    text: 'text-pink-400',
    ring: 'focus:ring-pink-500/30 focus:border-pink-500',
  },
  Nagad: {
    border: 'border-orange-500/40',
    bg: 'from-orange-500/10 via-slate-900 to-slate-950',
    text: 'text-orange-400',
    ring: 'focus:ring-orange-500/30 focus:border-orange-500',
  },
  Rocket: {
    border: 'border-purple-500/40',
    bg: 'from-purple-500/10 via-slate-900 to-slate-950',
    text: 'text-purple-400',
    ring: 'focus:ring-purple-500/30 focus:border-purple-500',
  },
  'Bank Transfer': {
    border: 'border-blue-500/40',
    bg: 'from-blue-500/10 via-slate-900 to-slate-950',
    text: 'text-blue-400',
    ring: 'focus:ring-blue-500/30 focus:border-blue-500',
  },
  'Crypto/USDT': {
    border: 'border-emerald-500/40',
    bg: 'from-emerald-500/10 via-slate-900 to-slate-950',
    text: 'text-emerald-400',
    ring: 'focus:ring-emerald-500/30 focus:border-emerald-500',
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
  const [showInstructions, setShowInstructions] = useState(false);
  const account = PAYMENT_ACCOUNTS[paymentMethod] || PAYMENT_ACCOUNTS['bKash'];
  const brand = BRAND_ACCENTS[paymentMethod] || BRAND_ACCENTS['bKash'];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappLink = account.whatsapp
    ? `https://wa.me/${account.whatsapp}?text=${encodeURIComponent('Hi ZENOV, I need help with payment for ' + paymentMethod)}`
    : null;

  return (
    <div className={`rounded-xl sm:rounded-2xl bg-gradient-to-b ${brand.bg} border ${brand.border} p-3 sm:p-4 space-y-3 shadow-lg transition-all`}>
      {/* Account Info Header (Compact) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <PaymentLogo method={paymentMethod} className="w-8 h-8 rounded-lg shadow-sm shrink-0" />
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-1.5">
              <span>{account.name}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${brand.text} bg-slate-900/80 border border-white/10`}>
                {account.type}
              </span>
            </h4>
            <p className="text-[9.5px] text-slate-400 truncate">Manual Send Money</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] uppercase font-bold text-slate-400">Total Payable</p>
          <p className="text-sm sm:text-base font-black font-mono text-amber-400 leading-tight">
            {formatCurrency(totalAmountUSD, selectedCurrency)}
          </p>
        </div>
      </div>

      {/* Copyable Number Card (Compact) */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2 shadow-inner">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Send Payment to:
          </p>
          <p className="text-xs sm:text-sm font-mono font-black text-white tracking-wider truncate select-all">
            {account.number}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => copyToClipboard(account.number)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Help</span>
            </a>
          )}
        </div>
      </div>

      {/* Collapsible Instruction Accordion (Silky Smooth CSS Grid) */}
      <div className="rounded-lg border border-white/5 bg-slate-950/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full px-3 py-2 flex items-center justify-between text-[10.5px] font-bold text-amber-300/90 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>পেমেন্ট নির্দেশিকা (Payment Steps)</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showInstructions ? 'rotate-180 text-amber-400' : ''}`} />
        </button>
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            showInstructions ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-2.5 pt-1 text-[10.5px] sm:text-xs text-amber-200/80 leading-relaxed border-t border-white/5">
              {account.instruction}
            </div>
          </div>
        </div>
      </div>

      {/* Inputs: Sender Number + TrxID (Compact side-by-side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        <div>
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
            Sender Number / Account *
          </label>
          <input
            type="text"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            required
            placeholder="e.g. 017XXXXXXXX"
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 ${brand.ring} outline-none text-xs font-mono text-white transition-all`}
          />
        </div>
        <div>
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
            Transaction ID (TrxID) *
          </label>
          <input
            type="text"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
            required
            placeholder="e.g. 9K7J4L8N2P"
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 ${brand.ring} outline-none text-xs font-mono uppercase tracking-wider text-white transition-all`}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[9.5px] text-slate-400 pt-0.5">
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>TrxID সাবমিট করার পর স্বয়ংক্রিয়ভাবে ভেরিফাই হয়ে ডেলিভারি সম্পন্ন হবে।</span>
      </div>
    </div>
  );
}
