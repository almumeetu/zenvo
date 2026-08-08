import React, { useState } from 'react';
import { UserProfile, WalletTransaction, CurrencyCode } from '../types';
import { formatCurrency } from '../lib/currency';
import { Wallet, X, PlusCircle, CheckCircle2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  user: UserProfile;
  transactions: WalletTransaction[];
  selectedCurrency: CurrencyCode;
  onClose: () => void;
  onDeposit: (
    amountUSD: number,
    method: string,
    reference: string
  ) => Promise<{ success: boolean; message?: string }>;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  user,
  transactions,
  selectedCurrency,
  onClose,
  onDeposit,
}) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState('10');
  const [method, setMethod] = useState('bKash');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDepositSubmit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    const res = await onDeposit(num, method, reference || `TXN_${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSubmitting(false);

    if (res.success) {
      setMessage(`Successfully deposited ${formatCurrency(num, selectedCurrency)} to your Zenvo Wallet!`);
      setReference('');
    } else {
      alert(res.message || 'Deposit failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#080e15] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#0a141d] to-[#070b0f] border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">ZENVO WALLET CENTER</h2>
              <p className="text-[10px] text-slate-400 font-mono">INSTANT RECHARGE & CASHBACK FLOAT</p>
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
          {/* Balance Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-[#0a1622] to-slate-900 border border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                CURRENT WALLET BALANCE
              </span>
              <span className="text-3xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                {formatCurrency(user.walletBalanceUSD, selectedCurrency)}
              </span>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                VIP Tier: <span className="text-emerald-300 font-bold">{user.vipTier} (+5% Cashback)</span>
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40">
                ACTIVE 24/7 AUTO-PAY
              </span>
            </div>
          </div>

          {message && (
            <div className="bg-emerald-950/80 border border-emerald-400 text-emerald-300 p-3 rounded-xl text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          {/* Deposit Form */}
          <div className="bg-[#0b121a] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>ADD FUNDS TO ZENVO WALLET</span>
            </h3>

            {/* Quick Amounts */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">Select Deposit Amount (USD)</label>
              <div className="grid grid-cols-4 gap-2">
                {['5', '10', '25', '50'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                      amount === val
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_#00ff66]'
                        : 'bg-[#080e14] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Custom Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#080e14] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-[#080e14] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                >
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad Direct</option>
                  <option value="Rocket">Rocket Pay</option>
                  <option value="Visa/Mastercard">Visa / Mastercard</option>
                  <option value="Crypto USDT">Crypto (USDT / Binance Pay)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Transaction Ref / TrxID (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. BKASH_9910284"
                className="w-full bg-[#080e14] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <button
              onClick={handleDepositSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.5)] hover:shadow-[0_0_30px_rgba(0,255,102,0.8)] transition-all"
            >
              {isSubmitting ? 'DEPOSITING FUNDS...' : `CONFIRM DEPOSIT (${formatCurrency(parseFloat(amount) || 0, selectedCurrency)})`}
            </button>
          </div>

          {/* Transaction History Log */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              RECENT WALLET TRANSACTIONS
            </h3>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-[#0b121a] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-white capitalize">
                        {tx.type} via {tx.paymentMethod}
                      </p>
                      <p className="text-[10px] text-slate-400">{tx.createdAt}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-black ${
                        tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, selectedCurrency)}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
