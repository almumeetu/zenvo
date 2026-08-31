'use client';

import React, { useState } from 'react';
import { ProductDenomination } from '@/types';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  Tag,
  DollarSign,
  Coins,
  Flame,
  Check,
} from 'lucide-react';

interface DenominationsBuilderProps {
  initialDenominations?: ProductDenomination[];
  onChange?: (denominations: ProductDenomination[]) => void;
  exchangeRate?: number; // default 1 USD = 120 BDT
}

const PRESET_TEMPLATES = [
  {
    label: '💎 Diamonds Tier',
    items: [
      { name: '100+10 Diamonds', amount: 0.99, priceBDT: 119, bonus: '+10% Bonus' },
      { name: '310+31 Diamonds', amount: 2.99, priceBDT: 359, bonus: '+10% Bonus' },
      { name: '520+52 Diamonds', amount: 4.99, priceBDT: 599, bonus: '🔥 Popular', popular: true },
      { name: '1060+106 Diamonds', amount: 9.99, priceBDT: 1199, bonus: '+10% Bonus' },
      { name: '2180+218 Diamonds', amount: 19.99, priceBDT: 2399, bonus: '⚡ Best Value' },
    ],
  },
  {
    label: '🎟️ Gift Card Tier',
    items: [
      { name: '$5 Digital Card', amount: 5.42, priceBDT: 650, bonus: 'Instant Delivery' },
      { name: '$10 Digital Card', amount: 10.83, priceBDT: 1300, bonus: '🔥 Most Popular', popular: true },
      { name: '$25 Digital Card', amount: 27.08, priceBDT: 3250, bonus: 'Instant Dispatch' },
      { name: '$50 Digital Card', amount: 52.92, priceBDT: 6350, bonus: 'VIP Rate' },
      { name: '$100 Digital Card', amount: 105.83, priceBDT: 12700, bonus: '⚡ Max Saver' },
    ],
  },
  {
    label: '🪙 UC Pack Tier',
    items: [
      { name: '60 UC', amount: 0.99, priceBDT: 120, bonus: 'Instant Delivery' },
      { name: '300 + 25 UC', amount: 4.99, priceBDT: 600, bonus: '+25 UC Free' },
      { name: '600 + 60 UC', amount: 9.99, priceBDT: 1200, bonus: '🔥 Royale Pass', popular: true },
      { name: '1500 + 300 UC', amount: 24.99, priceBDT: 3000, bonus: '+300 UC Bonus' },
      { name: '3000 + 850 UC', amount: 49.99, priceBDT: 6000, bonus: '⚡ Huge Bonus' },
    ],
  },
  {
    label: '👑 Passes / Subscriptions',
    items: [
      { name: 'Weekly Membership Pass', amount: 1.99, priceBDT: 240, bonus: '7 Days Daily Claim', popular: true },
      { name: 'Monthly Membership Pass', amount: 7.99, priceBDT: 960, bonus: '30 Days VIP Perk' },
      { name: 'Season Elite Pass Bundle', amount: 12.99, priceBDT: 1550, bonus: '⚡ Instant Unlocks' },
    ],
  },
];

export function DenominationsBuilder({
  initialDenominations = [],
  onChange,
  exchangeRate = 120,
}: DenominationsBuilderProps) {
  const [denominations, setDenominations] = useState<ProductDenomination[]>(() => {
    if (initialDenominations && initialDenominations.length > 0) {
      return initialDenominations;
    }
    return [
      { id: `d_${Date.now()}_1`, name: '$5 Standard Package', amount: 5.42, priceBDT: 650, bonus: '+5% BONUS' },
      { id: `d_${Date.now()}_2`, name: '$10 Popular Package', amount: 10.83, priceBDT: 1300, popular: true },
      { id: `d_${Date.now()}_3`, name: '$25 Mega Package', amount: 27.08, priceBDT: 3250 },
    ];
  });

  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(exchangeRate || 120);

  const updateList = (newList: ProductDenomination[]) => {
    setDenominations(newList);
    if (onChange) onChange(newList);
  };

  const handleFieldChange = (id: string, field: keyof ProductDenomination, value: any) => {
    const updated = denominations.map((d) => {
      if (d.id === id) {
        const item = { ...d, [field]: value };
        
        // 1. Auto-calculate BDT if amount (USD/USDT) is modified
        if (field === 'amount') {
          const numUsd = parseFloat(value) || 0;
          item.priceBDT = Math.round(numUsd * currentExchangeRate);
        }

        // 2. Auto-calculate USD/USDT if price (BDT) is modified
        if (field === 'priceBDT') {
          const numBdt = parseFloat(value) || 0;
          if (currentExchangeRate > 0) {
            // Round to 4 decimal places for precise micro-rates (e.g. 5.4167)
            item.amount = Math.round((numBdt / currentExchangeRate) * 10000) / 10000;
          }
        }

        return item;
      }
      return d;
    });
    updateList(updated);
  };

  const handleAddRow = () => {
    const newItem: ProductDenomination = {
      id: `denom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      amount: 1.0,
      priceBDT: 120,
      bonus: '',
    };
    updateList([...denominations, newItem]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = denominations[index];
    const duplicated: ProductDenomination = {
      ...target,
      id: `denom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${target.name} (Copy)`,
    };
    const newList = [...denominations];
    newList.splice(index + 1, 0, duplicated);
    updateList(newList);
  };

  const handleDeleteRow = (index: number) => {
    if (denominations.length <= 1) {
      alert('You must have at least one package/denomination for the product.');
      return;
    }
    const newList = denominations.filter((_, i) => i !== index);
    updateList(newList);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === denominations.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...denominations];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    updateList(newList);
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    const generated: ProductDenomination[] = preset.items.map((item, idx) => ({
      id: `denom_pre_${Date.now()}_${idx}`,
      name: item.name,
      amount: item.amount,
      priceBDT: item.priceBDT,
      bonus: item.bonus,
      popular: item.popular,
    }));
    updateList(generated);
  };

  const handleAutoCalcAllBDT = () => {
    const updated = denominations.map((d) => ({
      ...d,
      priceBDT: Math.round(Number(d.amount || 0) * currentExchangeRate),
    }));
    updateList(updated);
  };

  const handleAutoCalcAllUSD = () => {
    if (currentExchangeRate <= 0) return;
    const updated = denominations.map((d) => ({
      ...d,
      amount: Math.round((Number(d.priceBDT || 0) / currentExchangeRate) * 10000) / 10000,
    }));
    updateList(updated);
  };

  // Convert denominations to string format compatible with backend or fallback
  const serializedDenominationsString = denominations
    .map((d) => `${d.name}, ${d.amount}, ${d.priceBDT || Math.round(d.amount * currentExchangeRate)}, ${d.bonus || ''}`)
    .join('\n');

  return (
    <div className="space-y-3.5 rounded-2xl bg-zenov-surface/50 border border-zenov-border p-4 sm:p-5">
      {/* Hidden input to ensure FormData receives the packages */}
      <textarea
        name="denominations"
        value={serializedDenominationsString}
        readOnly
        className="hidden"
      />
      <input
        type="hidden"
        name="denominationsJson"
        value={JSON.stringify(denominations)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zenov-border/60">
        <div>
          <h4 className="text-xs font-black uppercase text-zenov-text tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-zenov-accent" />
            Packages & Denominations Builder
          </h4>
          <p className="text-[11px] text-zenov-text-muted mt-0.5">
            Auto-converts between ৳ BDT & $ USDT/USD in real-time as you type.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Rate Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zenov-surface border border-zenov-border text-[11px] font-mono">
            <span className="text-zenov-text-muted font-bold">1$ =</span>
            <input
              type="number"
              min="1"
              value={currentExchangeRate}
              onChange={(e) => setCurrentExchangeRate(parseFloat(e.target.value) || 120)}
              className="w-12 bg-transparent text-emerald-400 font-bold focus:outline-none text-center"
              title="Change exchange rate (BDT per USD)"
            />
            <span className="text-emerald-400 font-bold">৳</span>
          </div>

          <button
            type="button"
            onClick={handleAutoCalcAllBDT}
            title={`Sync all BDT prices from USD (1$ = ${currentExchangeRate}৳)`}
            className="px-2.5 py-1.5 rounded-xl bg-zenov-surface border border-zenov-border hover:border-emerald-500/50 text-[11px] font-bold text-zenov-text-secondary hover:text-emerald-400 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            $ ➔ ৳ Sync
          </button>

          <button
            type="button"
            onClick={handleAutoCalcAllUSD}
            title={`Sync all USD amounts from BDT (1$ = ${currentExchangeRate}৳)`}
            className="px-2.5 py-1.5 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary text-[11px] font-bold text-zenov-text-secondary hover:text-zenov-primary flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            ৳ ➔ $ Sync
          </button>

          <button
            type="button"
            onClick={handleAddRow}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-zenov-primary to-blue-600 hover:brightness-110 text-white text-[11px] font-black uppercase flex items-center gap-1 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Package
          </button>
        </div>
      </div>

      {/* Preset Quick Generator Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold uppercase text-zenov-text-muted shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-zenov-primary" /> Quick Presets:
        </span>
        {PRESET_TEMPLATES.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-zenov-card border border-zenov-border hover:border-zenov-primary text-[10.5px] font-semibold text-zenov-text-secondary hover:text-zenov-primary transition-all active:scale-95"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Denominations List Items */}
      <div className="space-y-2.5">
        {denominations.map((denom, index) => (
          <div
            key={denom.id}
            className={`rounded-xl border transition-all p-3 sm:p-3.5 flex flex-col gap-3 ${
              denom.popular
                ? 'bg-amber-500/5 border-amber-500/30'
                : 'bg-zenov-card/80 border-zenov-border hover:border-zenov-border-hover'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Index & Reorder Controls */}
              <div className="sm:col-span-1 flex items-center gap-1">
                <span className="w-6 h-6 rounded-lg bg-zenov-surface border border-zenov-border text-[11px] font-black text-zenov-text-muted flex items-center justify-center font-mono">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="text-zenov-text-muted hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === denominations.length - 1}
                    className="text-zenov-text-muted hover:text-white disabled:opacity-20 p-0.5"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Package Name Input */}
              <div className="sm:col-span-4">
                <label className="text-[9.5px] font-bold uppercase text-zenov-text-muted block mb-0.5">
                  Package Name / Denomination
                </label>
                <input
                  type="text"
                  value={denom.name}
                  onChange={(e) => handleFieldChange(denom.id, 'name', e.target.value)}
                  placeholder="e.g. 100 Diamonds / $10 Card"
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-xs text-zenov-text font-semibold focus:outline-none focus:border-zenov-primary-border"
                />
              </div>

              {/* USD Price */}
              <div className="sm:col-span-2">
                <label className="text-[9.5px] font-bold uppercase text-zenov-text-muted block mb-0.5">
                  Price ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-zenov-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={denom.amount}
                    onChange={(e) => handleFieldChange(denom.id, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.99"
                    required
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-xs text-zenov-text font-mono font-bold focus:outline-none focus:border-zenov-primary-border"
                  />
                </div>
              </div>

              {/* BDT Price */}
              <div className="sm:col-span-2">
                <label className="text-[9.5px] font-bold uppercase text-zenov-text-muted block mb-0.5">
                  Price (৳ BDT)
                </label>
                <div className="relative">
                  <span className="text-[11px] font-bold text-zenov-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={denom.priceBDT ?? Math.round(denom.amount * currentExchangeRate)}
                    onChange={(e) => handleFieldChange(denom.id, 'priceBDT', parseFloat(e.target.value) || 0)}
                    placeholder="120"
                    required
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-zenov-primary-border"
                  />
                </div>
              </div>

              {/* Bonus / Badge Input */}
              <div className="sm:col-span-2">
                <label className="text-[9.5px] font-bold uppercase text-zenov-text-muted block mb-0.5 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-amber-400" /> Badge / Bonus
                </label>
                <input
                  type="text"
                  value={denom.bonus || ''}
                  onChange={(e) => handleFieldChange(denom.id, 'bonus', e.target.value)}
                  placeholder="+10% Bonus"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-xs text-amber-300 placeholder:text-zenov-text-muted/60 focus:outline-none focus:border-zenov-primary-border"
                />
              </div>

              {/* Action Buttons */}
              <div className="sm:col-span-1 flex items-center justify-end gap-1.5 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleDuplicateRow(index)}
                  title="Duplicate Package"
                  className="p-1.5 rounded-lg bg-zenov-surface hover:bg-zenov-primary-soft hover:text-zenov-primary text-zenov-text-muted border border-zenov-border transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRow(index)}
                  title="Delete Package"
                  className="p-1.5 rounded-lg bg-zenov-error-soft/30 hover:bg-zenov-error hover:text-white text-zenov-error border border-zenov-error/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Row Attributes */}
            <div className="flex items-center justify-between pt-1 border-t border-zenov-border/40 text-[11px]">
              <label className="flex items-center gap-1.5 text-zenov-text-secondary hover:text-zenov-text cursor-pointer select-none font-semibold">
                <input
                  type="checkbox"
                  checked={!!denom.popular}
                  onChange={(e) => handleFieldChange(denom.id, 'popular', e.target.checked)}
                  className="rounded accent-amber-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Mark as "Popular / Best Value" Highlight
                </span>
              </label>

              {denom.bonus && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                  Badge: {denom.bonus}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
