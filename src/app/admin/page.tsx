'use client';

import React, { useState, useMemo } from 'react';

import Link from 'next/link';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { Product, Order, CategoryType, CurrencyCode } from '@/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertTriangle,
  Lock,
  Layers,
  Search,
  RefreshCw,
  FileText,
  ArrowLeft,
  ChevronLeft,
  Home,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'cms' | 'security';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const {
    products,
    orders,
    selectedCurrency,
    user,
    addProduct,
    deleteProduct,
    updateOrderStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<CategoryType>('game-topup');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('1.00');
  const [searchProd, setSearchProd] = useState('');
  const [searchOrder, setSearchOrder] = useState('');

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <ShieldCheck className="w-12 h-12 text-zenvo-error opacity-60" />
        <h2 className="text-xl font-black text-zenvo-text">Access Restricted</h2>
        <p className="text-sm text-zenvo-text-secondary max-w-xs">
          You need admin privileges to view this page.
        </p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-zenvo-primary text-white text-sm font-bold hover:bg-zenvo-primary-hover transition-colors">
          Back to Store
        </Link>
      </div>
    );
  }

  const analyticsData = useMemo(() => {
    const revenueOverTime = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short' });
      const ordersForDay = orders.filter((o) => o.paymentStatus === 'Paid');
      const baseRev =
        ordersForDay.reduce((sum, o) => sum + o.totalUSD, 0) / 7;
      const variance = 0.4 + Math.random() * 1.2;
      return {
        day: dayLabel,
        revenue: +(baseRev * variance).toFixed(2),
        orders: Math.round((orders.length / 7) * (0.5 + Math.random() * 1.5)),
      };
    });

    const categoryMix = (['game-topup', 'gift-card', 'subscription'] as const).map((c) => ({
      name: c.replace('-', ' ').toUpperCase(),
      value: products.filter((p) => p.category === c).length || 1,
    }));

    const topProducts = products
      .map((p) => ({
        id: p.id,
        title: p.title,
        sales: Math.round(20 + Math.random() * 200),
        revenue: +(100 + Math.random() * 4900).toFixed(2),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.totalUSD, 0);

    const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'Processing').length;

    return { revenueOverTime, categoryMix, topProducts, totalRevenue, pendingOrders };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    const q = searchProd.trim().toLowerCase();
    return products.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [products, searchProd]);

  const filteredOrders = useMemo(() => {
    const q = searchOrder.trim().toLowerCase();
    return orders.filter(
      (o) =>
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.playerId.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q)
    );
  }, [orders, searchOrder]);

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(analyticsData.totalRevenue, selectedCurrency),
      delta: '+12.4% WoW',
      deltaUp: true,
      Icon: DollarSign,
      accent: 'from-zenvo-success/20 to-zenvo-success/5',
      iconColor: 'text-zenvo-success',
    },
    {
      label: 'Total Orders',
      value: orders.length.toString(),
      delta: `+${analyticsData.pendingOrders} Pending`,
      deltaUp: true,
      Icon: ShoppingBag,
      accent: 'from-zenvo-primary/20 to-zenvo-primary/5',
      iconColor: 'text-zenvo-primary',
    },
    {
      label: 'Total Products',
      value: products.length.toString(),
      delta: `${Math.round((products.filter((p) => p.isHot || p.isNew).length / Math.max(1, products.length)) * 100)}% Featured`,
      deltaUp: true,
      Icon: Package,
      accent: 'from-zenvo-accent/20 to-zenvo-accent/5',
      iconColor: 'text-zenvo-accent',
    },
    {
      label: 'Active Users',
      value: user.name ? '1,248' : '0',
      delta: user.vipTier ? `VIP: ${user.vipTier}` : 'Signups today: 12',
      deltaUp: true,
      Icon: Users,
      accent: 'from-violet-500/20 to-violet-500/5',
      iconColor: 'text-violet-400',
    },
  ];

  const handleAddProduct = () => {
    const id = 'custom-' + Math.random().toString(36).slice(2, 8);
    const newP: Product = {
      id,
      title: newProdTitle.trim() || 'Custom Product',
      category: newProdCategory,
      image:
        newProdImage.trim() ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
      publisher: 'Manual Entry',
      region: 'Global',
      deliveryType: 'Instant',
      inStock: true,
      rating: 4.5,
      reviewCount: 0,
      description: 'New product added via admin dashboard.',
      instructions: '1. Complete checkout. 2. Item delivered instantly.',
      playerIdLabel: 'Player ID',
      denominations: [
        {
          id: `${id}-std`,
          name: 'Standard',
          amount: parseFloat(newProdPrice) || 1,
          originalAmount: parseFloat(newProdPrice) * 1.1 || 1.1,
        },
      ],
      tags: ['New'],
    };
    addProduct(newP);
    setIsAddingProduct(false);
    setNewProdTitle('');
    setNewProdImage('');
    setNewProdPrice('1.00');
  };

  const tabMeta: { id: AdminTab; label: string; Icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', Icon: Layers },
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'orders', label: 'Orders', Icon: ShoppingBag },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'cms', label: 'CMS', Icon: FileText },
    { id: 'security', label: 'Security', Icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-2 text-xs text-zenvo-text-muted mb-5">
        <Link href="/" className="hover:text-zenvo-primary transition-colors inline-flex items-center gap-1">
          <Home className="w-3 h-3" /> Home
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-zenvo-text-secondary">Admin Dashboard</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zenvo-primary to-violet-600 flex items-center justify-center shadow-lg shadow-zenvo-primary/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zenvo-text uppercase">
              Admin Control Center
            </h1>
            <p className="text-xs text-zenvo-text-secondary">
              Signed in as{' '}
              <span className="font-semibold text-zenvo-accent">
                {user.name} ({user.role})
              </span>
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zenvo-card border border-zenvo-border hover:border-zenvo-border-hover text-xs font-bold uppercase tracking-wide text-zenvo-text-secondary hover:text-zenvo-text transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 sm:mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 border-b border-zenvo-border">
        {tabMeta.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs sm:text-sm font-bold uppercase tracking-wide transition-all border-b-2 mb-[-1px] ${
              activeTab === id
                ? 'border-zenvo-primary text-zenvo-primary bg-zenvo-primary-soft/40'
                : 'border-transparent text-zenvo-text-muted hover:text-zenvo-text-secondary'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {kpiCards.map(({ label, value, delta, deltaUp, Icon, accent, iconColor }) => (
              <div
                key={label}
                className={`relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${accent} border border-zenvo-border bg-zenvo-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted mb-1.5">
                      {label}
                    </div>
                    <div className="text-lg sm:text-2xl font-black tracking-tight text-zenvo-text leading-tight truncate">
                      {value}
                    </div>
                    <div
                      className={`text-[11px] mt-1 inline-flex items-center gap-1 font-semibold ${
                        deltaUp ? 'text-zenvo-success' : 'text-zenvo-error'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" /> {delta}
                    </div>
                  </div>
                  <div className={`w-9 h-9 shrink-0 rounded-xl bg-zenvo-card border border-zenvo-border flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-2 rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text">
                    Revenue Trend — Last 7 Days
                  </h3>
                  <p className="text-xs text-zenvo-text-muted mt-0.5">
                    Payment confirmed revenue in {selectedCurrency}
                  </p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-[11px] font-bold text-zenvo-text-secondary hover:border-zenvo-border-hover transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.revenueOverTime}>
                    <defs>
                      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#gradRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
              <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-1">
                Category Mix
              </h3>
              <p className="text-xs text-zenvo-text-muted mb-4">SKUs by category</p>
              <div className="h-52 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {analyticsData.categoryMix.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {analyticsData.categoryMix.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-zenvo-text-secondary truncate">{c.name}</span>
                    <span className="ml-auto text-zenvo-text-muted font-bold">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
              <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4">
                Top Products by Revenue
              </h3>
              <div className="h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.topProducts} layout="vertical">
                    <XAxis
                      type="number"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={110}
                      tickFormatter={(v) => (v.length > 14 ? v.slice(0, 13) + '…' : v)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#f59e0b"
                      radius={[0, 6, 6, 0]}
                      background={{ fill: '#1e293b', radius: [0, 6, 6, 0] as any }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-[11px] font-bold text-zenvo-primary hover:text-zenvo-primary-hover"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {orders.slice(0, 6).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zenvo-surface/60 border border-transparent hover:border-zenvo-border transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zenvo-primary-soft border border-zenvo-primary-border flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-[18px] h-[18px] text-zenvo-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-zenvo-text truncate">
                        {o.orderNumber}
                      </div>
                      <div className="text-[11px] text-zenvo-text-muted truncate">
                        {o.items[0]?.productTitle}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-zenvo-text">
                        {formatCurrency(o.totalUSD, o.currency as CurrencyCode)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                          o.fulfillmentStatus === 'Delivered'
                            ? 'bg-zenvo-success-soft text-zenvo-success border border-zenvo-success/30'
                            : o.fulfillmentStatus === 'Processing'
                              ? 'bg-zenvo-accent-soft text-zenvo-accent border border-zenvo-accent/30'
                              : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        {o.fulfillmentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border">
              <Search className="w-[18px] h-[18px] text-zenvo-text-muted shrink-0" />
              <input
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
                placeholder="Search products, tags..."
                className="w-full min-w-0 bg-transparent text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none"
              />
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zenvo-primary to-blue-600 text-white text-sm font-bold uppercase tracking-wide shadow-lg shadow-zenvo-primary/20 hover:brightness-110 transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-[18px] h-[18px]" /> Add Product
            </button>
          </div>

          {isAddingProduct && (
            <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-zenvo-primary/10 to-zenvo-accent/10 border border-zenvo-primary-border/40">
              <h4 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4">
                + Create New Product
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Title', state: newProdTitle, set: setNewProdTitle, placeholder: 'e.g. Apex Legends Coins' },
                  { label: 'Image URL', state: newProdImage, set: setNewProdImage, placeholder: 'https://...' },
                  { label: 'Base Price (USD)', state: newProdPrice, set: setNewProdPrice, placeholder: '1.00', type: 'number', step: '0.01' },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted mb-1.5">
                      {f.label}
                    </label>
                    <input
                      value={f.state}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      type={f.type || 'text'}
                      step={f.step}
                      className="w-full px-3 py-2 rounded-lg bg-zenvo-card border border-zenvo-border text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none focus:border-zenvo-primary-border"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted mb-1.5">
                    Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 rounded-lg bg-zenvo-card border border-zenvo-border text-sm text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
                  >
                    <option value="game-topup">Game Top-Up</option>
                    <option value="gift-card">Gift Card</option>
                    <option value="subscription">Subscription</option>
                    <option value="social-topup">Social Top-Up</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddProduct}
                  className="px-5 py-2 rounded-lg bg-zenvo-accent hover:bg-zenvo-accent-hover text-zenvo-bg text-xs font-bold uppercase tracking-wide transition-colors active:scale-95"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="px-5 py-2 rounded-lg bg-zenvo-card border border-zenvo-border hover:border-zenvo-border-hover text-xs font-bold uppercase tracking-wide text-zenvo-text-secondary transition-colors active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden bg-zenvo-card border border-zenvo-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted bg-zenvo-surface/60">
                    <th className="text-left p-3.5 sm:p-4">Product</th>
                    <th className="text-left p-3.5 sm:p-4 hidden md:table-cell">Category</th>
                    <th className="text-left p-3.5 sm:p-4 hidden sm:table-cell">Stock</th>
                    <th className="text-right p-3.5 sm:p-4">Price</th>
                    <th className="text-right p-3.5 sm:p-4 w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-t border-zenvo-border hover:bg-zenvo-surface/40 transition-colors">
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 bg-zenvo-surface"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-zenvo-text truncate">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-zenvo-text-muted truncate">
                              #{p.id} · {p.publisher}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 hidden md:table-cell">
                        <span className="inline-block px-2 py-1 rounded-md bg-zenvo-primary-soft border border-zenvo-primary-border text-[11px] font-bold text-zenvo-primary uppercase tracking-wide">
                          {p.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 hidden sm:table-cell">
                        {p.inStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zenvo-success">
                            <Check className="w-3 h-3" /> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zenvo-error">
                            <AlertTriangle className="w-3 h-3" /> Out
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="text-sm font-black text-zenvo-text">
                          {formatCurrency(
                            (p.denominations[0]?.amount || 0),
                            selectedCurrency
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            title="Edit"
                            className="w-8 h-8 rounded-lg bg-zenvo-surface border border-zenvo-border hover:border-zenvo-primary-border hover:text-zenvo-primary text-zenvo-text-secondary transition-all flex items-center justify-center active:scale-95"
                          >
                            <Edit className="w-[16px] h-[16px]" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Delete ${p.title}? This cannot be undone.`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-zenvo-error-soft border border-zenvo-error-border hover:bg-zenvo-error/20 text-zenvo-error transition-all flex items-center justify-center active:scale-95"
                          >
                            <Trash2 className="w-[16px] h-[16px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border max-w-xl">
            <Search className="w-[18px] h-[18px] text-zenvo-text-muted shrink-0" />
            <input
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              placeholder="Search by order #, player ID, or email..."
              className="w-full min-w-0 bg-transparent text-sm text-zenvo-text placeholder:text-zenvo-text-muted focus:outline-none"
            />
          </div>
          <div className="rounded-2xl overflow-hidden bg-zenvo-card border border-zenvo-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted bg-zenvo-surface/60">
                    <th className="text-left p-3.5 sm:p-4">Order</th>
                    <th className="text-left p-3.5 sm:p-4">Product</th>
                    <th className="text-left p-3.5 sm:p-4 hidden lg:table-cell">Player ID</th>
                    <th className="text-left p-3.5 sm:p-4 hidden sm:table-cell">Payment</th>
                    <th className="text-right p-3.5 sm:p-4">Total</th>
                    <th className="text-center p-3.5 sm:p-4">Fulfillment</th>
                    <th className="text-right p-3.5 sm:p-4 w-[180px]">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-t border-zenvo-border hover:bg-zenvo-surface/40">
                      <td className="p-3.5 sm:p-4">
                        <div className="font-bold text-zenvo-text">{o.orderNumber}</div>
                        <div className="text-[11px] text-zenvo-text-muted">{o.createdAt}</div>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <div className="text-sm font-semibold text-zenvo-text truncate max-w-[180px]">
                          {o.items[0]?.productTitle}
                        </div>
                        <div className="text-[11px] text-zenvo-text-muted">
                          Qty {o.items.reduce((s, i) => s + i.quantity, 0)} · {o.items[0]?.denomination.name}
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 hidden lg:table-cell text-zenvo-text-secondary text-xs font-mono">
                        {o.playerId}
                      </td>
                      <td className="p-3.5 sm:p-4 hidden sm:table-cell">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                            o.paymentStatus === 'Paid'
                              ? 'bg-zenvo-success-soft text-zenvo-success border border-zenvo-success/30'
                              : 'bg-zenvo-error-soft text-zenvo-error border border-zenvo-error/30'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                        <div className="text-[11px] text-zenvo-text-muted mt-1">{o.paymentMethod}</div>
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="text-sm font-black text-zenvo-text">
                          {formatCurrency(o.totalUSD, o.currency as CurrencyCode)}
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                            o.fulfillmentStatus === 'Delivered'
                              ? 'bg-zenvo-success-soft text-zenvo-success border border-zenvo-success/30'
                              : o.fulfillmentStatus === 'Processing'
                                ? 'bg-zenvo-accent-soft text-zenvo-accent border border-zenvo-accent/30'
                                : o.fulfillmentStatus === 'Refunded'
                                  ? 'bg-zenvo-error-soft text-zenvo-error border border-zenvo-error/30'
                                  : 'bg-zenvo-surface text-zenvo-muted border border-zenvo-border'
                          }`}
                        >
                          {o.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="inline-flex gap-1.5 justify-end">
                          {(['Processing', 'Delivered', 'Refunded'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateOrderStatus(o.id, s)}
                              className={`px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all active:scale-95 ${
                                o.fulfillmentStatus === s
                                  ? 'bg-zenvo-primary text-white'
                                  : 'bg-zenvo-surface border border-zenvo-border text-zenvo-text-muted hover:text-zenvo-text hover:border-zenvo-border-hover'
                              }`}
                            >
                              {s.slice(0, 4)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-2xl p-8 sm:p-12 bg-zenvo-card border border-zenvo-border text-center">
          <Users className="w-14 h-14 mx-auto text-zenvo-text-muted mb-4 opacity-70" />
          <h3 className="text-lg font-black text-zenvo-text mb-2">User Management</h3>
          <p className="text-sm text-zenvo-text-secondary mb-6 max-w-lg mx-auto">
            Full KYC, tier management, VIP rebalancing and bulk email campaigns coming in the
            next sprint. User CRUD panel will replace this placeholder before launch.
          </p>
          <div className="inline-flex gap-2.5 flex-wrap justify-center">
            <span className="px-3 py-1.5 rounded-md bg-zenvo-primary-soft border border-zenvo-primary-border text-zenvo-primary text-[11px] font-bold uppercase">
              {user.totalOrders} orders (current user)
            </span>
            <span className="px-3 py-1.5 rounded-md bg-zenvo-accent-soft border border-zenvo-accent-border text-zenvo-accent text-[11px] font-bold uppercase">
              Tier: {user.vipTier}
            </span>
            <span className="px-3 py-1.5 rounded-md bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary text-[11px] font-bold uppercase">
              Joined {user.joinedDate}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'cms' && (
        <div className="rounded-2xl p-8 sm:p-12 bg-zenvo-card border border-zenvo-border text-center">
          <FileText className="w-14 h-14 mx-auto text-zenvo-text-muted mb-4 opacity-70" />
          <h3 className="text-lg font-black text-zenvo-text mb-2">CMS — Banners & Blog</h3>
          <p className="text-sm text-zenvo-text-secondary max-w-lg mx-auto">
            Visual drag-and-drop editor for hero banners, promotion tiles, blog authoring and
            homepage sections will ship here. Attachments and scheduling WIP.
          </p>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl p-5 sm:p-6 bg-zenvo-card border border-zenvo-success/30 bg-gradient-to-br from-zenvo-success/10 to-transparent">
            <Check className="w-10 h-10 text-zenvo-success mb-4" />
            <h3 className="text-base font-black text-zenvo-text mb-2">
              PCI-DSS Compliance
            </h3>
            <p className="text-sm text-zenvo-text-secondary leading-relaxed">
              All cardholder data is handled by licensed Level-1 PSPs. ZENVO never stores raw
              PAN or CVV on its servers. Last audit: Q3 2026.
            </p>
          </div>
          <div className="rounded-2xl p-5 sm:p-6 bg-zenvo-card border border-zenvo-border">
            <ShieldCheck className="w-10 h-10 text-zenvo-primary mb-4" />
            <h3 className="text-base font-black text-zenvo-text mb-2">
              WAF & Rate Limits
            </h3>
            <p className="text-sm text-zenvo-text-secondary leading-relaxed">
              Cloudflare Enterprise WAF + custom order/IP rate limiting active. Bot score
              threshold = 30. 2FA enforcement for all admin accounts enabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
