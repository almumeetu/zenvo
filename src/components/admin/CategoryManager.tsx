'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { CategoryItem } from '@/types';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Gamepad2,
  Gift,
  Smartphone,
  Crown,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Package,
  Layers3,
  X,
  Check,
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Gamepad2', label: '🎮 Gamepad / Gaming', Icon: Gamepad2 },
  { id: 'Gift', label: '🎁 Gift Card / Voucher', Icon: Gift },
  { id: 'Smartphone', label: '📱 Mobile / Social', Icon: Smartphone },
  { id: 'Crown', label: '👑 Crown / VIP Pass', Icon: Crown },
  { id: 'Layers', label: '📦 Layers / Accounts', Icon: Layers },
  { id: 'Sparkles', label: '✨ Sparkles / Special', Icon: Sparkles },
];

export function CategoryManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Gamepad2');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('Gamepad2');
    setDescription('');
    setBadge('');
    setActive(true);
    setIsAddingCategory(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || 'Gamepad2');
    setDescription(cat.description || '');
    setBadge(cat.badge || '');
    setActive(cat.active !== false);
    setIsAddingCategory(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug from name
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon,
        description: description.trim(),
        badge: badge.trim() || undefined,
        active,
      });
    } else {
      const newCategory: CategoryItem = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon,
        description: description.trim(),
        badge: badge.trim() || undefined,
        active,
      };
      addCategory(newCategory);
    }

    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleDelete = (cat: CategoryItem) => {
    const productCount = products.filter((p) => p.category === cat.slug).length;
    const confirmMsg = productCount > 0
      ? `Are you sure? Category "${cat.name}" has ${productCount} active products assigned to it.`
      : `Are you sure you want to delete the category "${cat.name}"?`;

    if (window.confirm(confirmMsg)) {
      deleteCategory(cat.id);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border">
          <Search className="w-4 h-4 text-zenvo-text-muted shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, slug, or keywords..."
            className="w-full bg-transparent text-xs text-zenvo-text focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zenvo-primary to-blue-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
        >
          <FolderPlus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Categories Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.slug).length;
          const IconComp =
            ICON_OPTIONS.find((opt) => opt.id === cat.icon)?.Icon || Gamepad2;

          return (
            <div
              key={cat.id}
              className="rounded-2xl bg-zenvo-card border border-zenvo-border hover:border-zenvo-border-hover p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all group hover:shadow-lg relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zenvo-primary-soft flex items-center justify-center border border-zenvo-primary-border/30 text-zenvo-primary group-hover:scale-105 transition-transform shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zenvo-text text-sm leading-snug flex items-center gap-2">
                        {cat.name}
                        {cat.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                            {cat.badge}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-mono text-zenvo-text-muted mt-0.5">
                        slug: <span className="text-zenvo-primary">{cat.slug}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      cat.active !== false
                        ? 'bg-zenvo-success-soft text-zenvo-success border-zenvo-success/20'
                        : 'bg-zenvo-error-soft text-zenvo-error border-zenvo-error/20'
                    }`}
                  >
                    {cat.active !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-zenvo-text-secondary line-clamp-2 leading-relaxed min-h-[32px]">
                  {cat.description || 'No description provided for this category.'}
                </p>
              </div>

              <div className="pt-3 border-t border-zenvo-border/50 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-zenvo-text-muted font-bold text-[11px]">
                  <Package className="w-3.5 h-3.5 text-zenvo-accent" />
                  <span>{productCount} SKU Products</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="px-2.5 py-1 rounded-lg bg-zenvo-surface hover:bg-zenvo-primary hover:text-white border border-zenvo-border text-zenvo-text-secondary text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
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

      {filteredCategories.length === 0 && (
        <div className="rounded-2xl bg-zenvo-card border border-zenvo-border p-8 text-center space-y-2">
          <Layers3 className="w-10 h-10 text-zenvo-text-muted mx-auto opacity-50" />
          <h4 className="font-bold text-zenvo-text">No Categories Found</h4>
          <p className="text-xs text-zenvo-text-secondary max-w-sm mx-auto">
            Try adjusting your search query or click "Add New Category" above to create one.
          </p>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zenvo-card border border-zenvo-primary-border/40 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zenvo-border pb-3">
              <h3 className="text-sm font-black uppercase text-zenvo-primary flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-zenvo-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Game Top-Up"
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Slug ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. game-topup"
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-mono text-zenvo-primary focus:outline-none focus:border-zenvo-primary-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Display Icon
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Popular / Instant / Hot"
                    className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zenvo-text-muted block mb-1">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of products and items in this category..."
                  className="w-full px-3 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-zenvo-text cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded accent-zenvo-primary w-4 h-4"
                  />
                  Enable Category (Visible on Storefront)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zenvo-border">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-bold text-zenvo-text-secondary hover:text-zenvo-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zenvo-primary hover:bg-zenvo-primary-hover text-white text-xs font-bold uppercase shadow-sm transition-all"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
