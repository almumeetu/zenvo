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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenvo-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zenvo-surface border border-zenvo-border rounded-2xl shadow-xl overflow-hidden text-zenvo-text my-8">
        {/* Header */}
        <div className="p-4 bg-zenvo-card/80 border-b border-zenvo-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zenvo-primary-soft text-zenvo-primary flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-zenvo-text">ZENVO WALLET CENTER</h2>
              <p className="text-[10px] text-zenvo-muted">INSTANT RECHARGE & CASHBACK FLOAT</p>
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
          {/* Balance Banner */}
          <div className="bg-gradient-to-br from-zenvo-primary-soft/70 via-zenvo-card to-zenvo-surface border border-zenvo-primary-border/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-zenvo-muted uppercase tracking-widest block font-bold">
                CURRENT WALLET BALANCE
              </span>
              <span className="text-3xl font-black font-mono text-zenvo-primary">
                {formatCurrency(user.walletBalanceUSD, selectedCurrency)}
              </span>
              <p className="text-[11px] text-zenvo-secondary mt-1">
                VIP Tier: <span className="text-zenvo-accent font-bold">{user.vipTier} (+5% Cashback)</span>
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-zenvo-success-soft text-zenvo-success font-mono text-xs font-bold border border-zenvo-success/30 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                ACTIVE 24/7 AUTO-PAY
              </span>
            </div>
          </div>

          {message && (
            <div className="bg-zenvo-success-soft/60 border border-zenvo-success/40 text-zenvo-success p-3 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zenvo-success shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Deposit Form */}
          <div className="bg-zenvo-card border border-zenvo-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zenvo-primary uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>ADD FUNDS TO ZENVO WALLET</span>
            </h3>

            {/* Quick Amounts */}
            <div>
              <label className="text-[11px] text-zenvo-secondary block mb-1.5 font-medium">Select Deposit Amount (USD)</label>
              <div className="grid grid-cols-4 gap-2">
                {['5', '10', '25', '50'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2.5 rounded-xl font-mono text-xs font-bold border transition-all active:scale-[0.97] ${
                      amount === val
                        ? 'bg-zenvo-primary text-white border-zenvo-primary shadow-sm'
                        : 'bg-zenvo-bg border-zenvo-border text-zenvo-secondary hover:border-zenvo-primary-border/60 hover:text-zenvo-text'
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
                <label className="text-[11px] text-zenvo-secondary block mb-1 font-medium">Custom Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zenvo-bg border border-zenvo-border focus:border-zenvo-primary focus:ring-2 focus:ring-zenvo-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenvo-text focus:outline-none font-mono transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] text-zenvo-secondary block mb-1 font-medium">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-zenvo-bg border border-zenvo-border focus:border-zenvo-primary focus:ring-2 focus:ring-zenvo-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenvo-text focus:outline-none font-mono transition-all"
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
              <label className="text-[11px] text-zenvo-secondary block mb-1 font-medium">
                Transaction Ref / TrxID (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. BKASH_9910284"
                className="w-full bg-zenvo-bg border border-zenvo-border focus:border-zenvo-primary focus:ring-2 focus:ring-zenvo-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenvo-text focus:outline-none font-mono transition-all"
              />
            </div>

            <button
              onClick={handleDepositSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {isSubmitting ? 'DEPOSITING FUNDS...' : `CONFIRM DEPOSIT (${formatCurrency(parseFloat(amount) || 0, selectedCurrency)})`}
            </button>
          </div>

          {/* Transaction History Log */}
          <div>
            <h3 className="text-xs font-bold text-zenvo-secondary uppercase tracking-wider mb-3">
              RECENT WALLET TRANSACTIONS
            </h3>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-zenvo-card border border-zenvo-border rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tx.type === 'deposit'
                          ? 'bg-zenvo-success-soft text-zenvo-success'
                          : 'bg-zenvo-error-soft text-zenvo-error'
                      }`}
                    >
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-zenvo-text capitalize text-sm">
                        {tx.type} via {tx.paymentMethod}
                      </p>
                      <p className="text-[10px] text-zenvo-muted font-mono">{tx.createdAt}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-black font-mono text-sm ${
                        tx.type === 'deposit' ? 'text-zenvo-success' : 'text-zenvo-text'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, selectedCurrency)}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                      tx.status === 'Completed'
                        ? 'bg-zenvo-success-soft/40 text-zenvo-success border-zenvo-success/30'
                        : 'bg-zenvo-warning-soft/40 text-zenvo-warning border-zenvo-warning/30'
                    }`}>
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
