'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { UnitItem } from '@/types';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Sparkles,
  Zap,
  Coins,
  Tag,
  Folder,
  X,
  Layers,
} from 'lucide-react';

const SYMBOL_PRESETS = ['💎', '🪙', '🎟️', '⚡', '👑', '⭐', '🔥', '🛡️', '📦', '🎯', '💰'];

export function UnitManager() {
  const { units, categories, addUnit, updateUnit, deleteUnit } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('💎');
  const [category, setCategory] = useState('game-topup');
  const [description, setDescription] = useState('');
  const [defaultStep, setDefaultStep] = useState<number>(100);

  const openAddModal = () => {
    setEditingUnit(null);
    setName('');
    setSymbol('💎');
    setCategory(categories[0]?.slug || 'game-topup');
    setDescription('');
    setDefaultStep(100);
    setIsAddingUnit(true);
  };

  const openEditModal = (u: UnitItem) => {
    setEditingUnit(u);
    setName(u.name);
    setSymbol(u.symbol || '💎');
    setCategory(u.category || 'game-topup');
    setDescription(u.description || '');
    setDefaultStep(u.defaultStep || 100);
    setIsAddingUnit(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingUnit) {
      updateUnit({
        ...editingUnit,
        name: name.trim(),
        symbol: symbol.trim(),
        category,
        description: description.trim(),
        defaultStep: Number(defaultStep) || 1,
      });
    } else {
      const newUnit: UnitItem = {
        id: `unit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        symbol: symbol.trim(),
        category,
        description: description.trim(),
        defaultStep: Number(defaultStep) || 1,
      };
      addUnit(newUnit);
    }

    setIsAddingUnit(false);
    setEditingUnit(null);
  };

  const handleDelete = (u: UnitItem) => {
    if (window.confirm(`Are you sure you want to delete unit "${u.name}"?`)) {
      deleteUnit(u.id);
    }
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return units.filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q)) ||
        u.category.toLowerCase().includes(q)
    );
  }, [units, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border">
          <Search className="w-4 h-4 text-zenvo-text-muted shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search units (Diamonds, UC, Gift Cards, Points)..."
            className="w-full bg-transparent text-xs text-zenvo-text focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zenvo-accent to-orange-500 hover:brightness-110 text-zenvo-bg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Unit / Variant
        </button>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map((u) => {
          const catName =
            categories.find((c) => c.slug === u.category)?.name || u.category;

          return (
            <div
              key={u.id}
              className="rounded-2xl bg-zenvo-card border border-zenvo-border hover:border-zenvo-border-hover p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all group hover:shadow-lg relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-zenvo-surface border border-zenvo-border flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                      {u.symbol || '💎'}
                    </div>
                    <div>
                      <h4 className="font-bold text-zenvo-text text-sm leading-snug">
                        {u.name}
                      </h4>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-zenvo-primary-soft text-zenvo-primary border border-zenvo-primary-border/20 text-[9px] font-black uppercase">
                        {catName}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zenvo-text-secondary line-clamp-2 leading-relaxed min-h-[32px]">
                  {u.description || 'No specific description provided for this denomination unit.'}
                </p>
              </div>

              <div className="pt-3 border-t border-zenvo-border/50 flex items-center justify-between gap-2 text-xs">
                <div className="text-[11px] font-mono text-zenvo-text-muted">
                  Default Step: <span className="text-zenvo-text font-bold">+{u.defaultStep || 100}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="px-2.5 py-1 rounded-lg bg-zenvo-surface hover:bg-zenvo-primary hover:text-white border border-zenvo-border text-zenvo-text-secondary text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(u)}
                    className="p-1.5 rounded-lg bg-zenvo-error-soft/30 hover:bg-zenvo-error hover:text-white text-zenvo-error border border-zenvo-error/20 text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUnits.length === 0 && (
        <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-8 text-center space-y-2">
          <Coins className="w-10 h-10 text-zenvo-text-muted mx-auto opacity-50" />
          <h4 className="font-bold text-zenvo-text">No Units Found</h4>
          <p className="text-xs text-zenvo-text-secondary max-w-sm mx-auto">
            Click "Add Unit / Variant" above to define unit denominations like Diamonds, UC, or Coins.
          </p>
        </div>
      )}

      {/* Add / Edit Unit Modal */}
      {isAddingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zenvo-card border border-zenvo-accent-border/40 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zenvo-border pb-3">
              <h3 className="text-sm font-black uppercase text-zenvo-accent flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {editingUnit ? `Edit Unit: ${editingUnit.name}` : 'Create Unit / Variant'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingUnit(false)}
                className="p-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-zenvo-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Unit / Denomination Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diamonds / UC / Robux"
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Icon / Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="💎"
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-center text-lg focus:outline-none focus:border-zenvo-primary-border"
                  />
                </div>
              </div>

              {/* Symbol Quick Select Chips */}
              <div>
                <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                  Quick Emoji Symbols
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {SYMBOL_PRESETS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setSymbol(sym)}
                      className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
                        symbol === sym
                          ? 'bg-zenvo-primary/20 border-zenvo-primary scale-105'
                          : 'bg-zenvo-surface border-zenvo-border hover:border-zenvo-border-hover'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Primary Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Default Step / Pack Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={defaultStep}
                    onChange={(e) => setDefaultStep(parseInt(e.target.value) || 1)}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-mono text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                  Unit Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Official Mobile Legends diamond recharges and currency..."
                  className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zenvo-border">
                <button
                  type="button"
                  onClick={() => setIsAddingUnit(false)}
                  className="px-4 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-bold text-zenvo-text-secondary hover:text-zenvo-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-zenvo-accent to-orange-500 text-zenvo-bg font-black text-xs uppercase shadow-sm transition-all"
                >
                  {editingUnit ? 'Update Unit' : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
