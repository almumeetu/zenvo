import React, { useState, useEffect } from 'react';
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
import { Product, Order, UserProfile, CurrencyCode } from '../../types';
import { formatCurrency } from '../../lib/currency';
import {
  ShieldCheck,
  X,
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
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  products: Product[];
  orders: Order[];
  selectedCurrency: CurrencyCode;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: 'Processing' | 'Delivered' | 'Refunded') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  products,
  orders,
  selectedCurrency,
  onClose,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'cms' | 'security'>('overview');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // New Product Modal Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'game-topup' | 'social-topup' | 'gift-card' | 'subscription'>('game-topup');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('1.00');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalyticsData(data.analytics);
        }
        setIsLoadingAnalytics(false);
      })
      .catch((err) => {
        console.error('Analytics fetch error:', err);
        setIsLoadingAnalytics(false);
      });
  }, []);

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim()) return;

    const baseAmount = parseFloat(newProdPrice) || 1.0;
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      title: newProdTitle,
      category: newProdCategory,
      image: newProdImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
      publisher: 'Zenvo Publishing',
      region: 'Global',
      deliveryType: 'Instant',
      inStock: true,
      rating: 5.0,
      reviewCount: 1,
      description: 'Official direct top-up package with sub-30 sec delivery.',
      instructions: 'Enter your Player UID and confirm checkout.',
      playerIdLabel: 'Player UID',
      denominations: [
        { id: `d1_${Date.now()}`, name: 'Standard Package', amount: baseAmount },
        { id: `d2_${Date.now()}`, name: 'Bonus Value Pack', amount: baseAmount * 5, bonus: '+15% BONUS' },
      ],
      tags: ['NewItem', 'Instant'],
    };

    onAddProduct(newProd);
    setIsAddingProduct(false);
    setNewProdTitle('');
  };

  const CHART_COLORS = {
    primary: '#3b82f6',
    accent: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zenov-bg/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-zenov-surface border border-zenov-border rounded-2xl shadow-xl overflow-hidden text-zenov-text my-4 flex flex-col h-[90vh]">
        {/* Top Cockpit Header */}
        <div className="p-4 bg-zenov-card/80 border-b border-zenov-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zenov-primary to-zenov-accent text-zenov-bg flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black tracking-wide text-zenov-text">
                  ZENOV ADMIN HUD CONTROL CENTER
                </h1>
                <span className="px-2 py-0.5 rounded bg-zenov-primary-soft text-zenov-primary text-[10px] font-bold border border-zenov-primary-border/40">
                  ROOT LEVEL ACCESS
                </span>
              </div>
              <p className="text-[10px] text-zenov-muted">
                REAL-TIME REVENUE ANALYTICS • FULFILLMENT BOT GATEWAY • INVENTORY ENGINE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zenov-surface border border-zenov-border hover:border-zenov-primary-border hover:bg-zenov-primary-soft text-zenov-secondary hover:text-zenov-primary transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-zenov-card/40 border-b border-zenov-border px-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'ANALYTICS & OVERVIEW', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'products', label: 'PRODUCT INVENTORY', icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: 'LIVE FULFILLMENT', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'users', label: 'USER MANAGEMENT', icon: <Users className="w-4 h-4" /> },
            { id: 'security', label: 'SECURITY LOGS', icon: <Lock className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-zenov-primary text-zenov-primary bg-zenov-primary-soft/40'
                  : 'border-transparent text-zenov-muted hover:text-zenov-text hover:bg-zenov-primary-soft/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zenov-card border border-zenov-primary-border/30 rounded-2xl p-4">
                  <span className="text-[10px] text-zenov-muted uppercase tracking-widest block font-bold">
                    TOTAL REVENUE (ALL TIME)
                  </span>
                  <span className="text-2xl font-black font-mono text-zenov-primary mt-1 block">
                    {formatCurrency(analyticsData?.totalRevenue || 18950, selectedCurrency)}
                  </span>
                  <span className="text-[10px] text-zenov-success flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="w-3 h-3" /> +28.4% from last week
                  </span>
                </div>

                <div className="bg-zenov-card border border-zenov-success/30 rounded-2xl p-4">
                  <span className="text-[10px] text-zenov-muted uppercase tracking-widest block font-bold">
                    TOTAL DELIVERED ORDERS
                  </span>
                  <span className="text-2xl font-black font-mono text-zenov-success mt-1 block">
                    {(analyticsData?.totalOrdersCount || 1420).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zenov-muted mt-1 block font-medium">
                    Avg delivery speed: 8 seconds
                  </span>
                </div>

                <div className="bg-zenov-card border border-zenov-accent/30 rounded-2xl p-4">
                  <span className="text-[10px] text-zenov-muted uppercase tracking-widest block font-bold">
                    ACTIVE PRODUCTS
                  </span>
                  <span className="text-2xl font-black font-mono text-zenov-accent mt-1 block">
                    {products.length} Items
                  </span>
                  <span className="text-[10px] text-zenov-muted mt-1 block font-medium">100% In-Stock</span>
                </div>

                <div className="bg-zenov-card border border-zenov-border rounded-2xl p-4">
                  <span className="text-[10px] text-zenov-muted uppercase tracking-widest block font-bold">
                    REGISTERED GAMERS
                  </span>
                  <span className="text-2xl font-black font-mono text-zenov-text mt-1 block">
                    {(analyticsData?.registeredUsersCount || 12840).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zenov-muted mt-1 block font-medium">
                    Wallet Float: {formatCurrency(38920.5, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Recharts Graphical Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Growth Chart */}
                <div className="lg:col-span-2 bg-zenov-card border border-zenov-border rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zenov-primary uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>WEEKLY REVENUE & ORDER VOLUME</span>
                    <span className="text-[10px] text-zenov-muted">REAL-TIME TELEMETRY</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData?.salesByDay || []}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.75} />
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                        <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0c1119', borderColor: '#3b82f6', color: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke={CHART_COLORS.primary}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Pie Breakdown */}
                <div className="bg-zenov-card border border-zenov-border rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zenov-accent uppercase tracking-wider mb-4">
                    SALES BY CATEGORY
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData?.categoryDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(analyticsData?.categoryDistribution || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || Object.values(CHART_COLORS)[index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0c1119', borderColor: '#f59e0b', color: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <h3 className="text-xs font-bold text-zenov-primary uppercase">
                  GAME & CARD CATALOG MANAGEMENT ({products.length} ITEMS)
                </h3>
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="px-4 py-2 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-bold text-xs uppercase flex items-center gap-1.5 active:scale-[0.97] transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add New Item
                </button>
              </div>

              {/* Add Product Form Modal */}
              {isAddingProduct && (
                <form
                  onSubmit={handleCreateProductSubmit}
                  className="bg-zenov-card border border-zenov-primary-border/40 rounded-2xl p-5 space-y-4"
                >
                  <h4 className="font-bold text-zenov-primary uppercase">ADD NEW GAME / GIFT CARD TOP-UP</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-zenov-muted text-xs block mb-1 font-medium">Title</label>
                      <input
                        type="text"
                        value={newProdTitle}
                        onChange={(e) => setNewProdTitle(e.target.value)}
                        placeholder="e.g. Apex Legends Mobile Gold"
                        className="w-full bg-zenov-bg border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3 py-2.5 text-sm text-zenov-text focus:outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-zenov-muted text-xs block mb-1 font-medium">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as any)}
                        className="w-full bg-zenov-bg border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3 py-2.5 text-sm text-zenov-text focus:outline-none transition-all"
                      >
                        <option value="game-topup">Game Top-Up</option>
                        <option value="social-topup">Social Top-Up</option>
                        <option value="gift-card">Gift Card</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-zenov-muted text-xs block mb-1 font-medium">Base Price ($)</label>
                      <input
                        type="number"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full bg-zenov-bg border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3 py-2.5 text-sm text-zenov-text focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-4 py-1.5 rounded-xl bg-zenov-surface border border-zenov-border hover:bg-zenov-bg text-zenov-text text-xs font-bold transition-all active:scale-[0.97]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs font-bold uppercase transition-all active:scale-[0.97]"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="bg-zenov-card border border-zenov-border rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zenov-surface text-zenov-muted border-b border-zenov-border uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5 font-bold tracking-wider">Product Name</th>
                      <th className="p-3.5 font-bold tracking-wider">Category</th>
                      <th className="p-3.5 font-bold tracking-wider">Delivery</th>
                      <th className="p-3.5 font-bold tracking-wider">Starting Price</th>
                      <th className="p-3.5 font-bold tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zenov-border/50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-zenov-primary-soft/30 transition-colors">
                        <td className="p-3.5 font-bold text-zenov-text flex items-center gap-2.5 text-sm">
                          <img src={p.image} className="w-9 h-9 rounded-lg object-cover border border-zenov-border" alt={p.title} />
                          <span>{p.title}</span>
                        </td>
                        <td className="p-3.5 text-zenov-secondary capitalize">{p.category.replace('-', ' ')}</td>
                        <td className="p-3.5 text-zenov-success font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {p.deliveryType}
                        </td>
                        <td className="p-3.5 text-zenov-primary font-bold font-mono text-sm">
                          {formatCurrency(p.denominations[0]?.amount || 0, selectedCurrency)}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 rounded-lg bg-zenov-error-soft text-zenov-error hover:bg-zenov-error hover:text-white border border-zenov-error/30 hover:border-zenov-error transition-all active:scale-[0.97]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zenov-primary uppercase">
                REAL-TIME FULFILLMENT QUEUE ({orders.length} ORDERS)
              </h3>

              <div className="bg-zenov-card border border-zenov-border rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zenov-surface text-zenov-muted border-b border-zenov-border uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5 font-bold tracking-wider">Order #</th>
                      <th className="p-3.5 font-bold tracking-wider">Player UID</th>
                      <th className="p-3.5 font-bold tracking-wider">Payment Method</th>
                      <th className="p-3.5 font-bold tracking-wider">Total Paid</th>
                      <th className="p-3.5 font-bold tracking-wider">Status</th>
                      <th className="p-3.5 font-bold tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zenov-border/50">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zenov-primary-soft/30 transition-colors">
                        <td className="p-3.5 font-bold text-zenov-primary font-mono text-sm">{o.orderNumber}</td>
                        <td className="p-3.5 text-zenov-text text-sm">{o.playerId}</td>
                        <td className="p-3.5 text-zenov-secondary">{o.paymentMethod}</td>
                        <td className="p-3.5 text-zenov-success font-bold font-mono text-sm">
                          {formatCurrency(o.totalUSD, selectedCurrency)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              o.fulfillmentStatus === 'Delivered'
                                ? 'bg-zenov-success-soft text-zenov-success border-zenov-success/30'
                                : 'bg-zenov-warning-soft text-zenov-warning border-zenov-warning/30'
                            }`}
                          >
                            {o.fulfillmentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 flex items-center gap-2">
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'Delivered')}
                            className="px-3 py-1.5 bg-zenov-success-soft text-zenov-success rounded-lg hover:bg-zenov-success hover:text-white border border-zenov-success/30 hover:border-zenov-success font-bold text-[11px] transition-all active:scale-[0.97]"
                          >
                            Mark Delivered
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zenov-primary uppercase">REGISTERED GAMERS & VIP TIERS</h3>
              <div className="bg-zenov-card border border-zenov-border rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-zenov-surface rounded-xl border border-zenov-border flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-zenov-text text-sm">CyberGamer_99 (gamer@zenovgames.com)</p>
                    <p className="text-[10px] text-zenov-muted mt-0.5">VIP Tier: <span className="text-zenov-accent font-bold">Cyber Elite</span> | Orders: 18</p>
                  </div>
                  <span className="text-zenov-success font-bold font-mono">Wallet: {formatCurrency(45.8, selectedCurrency)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zenov-primary uppercase">SYSTEM SECURITY & API AUDIT LOGS</h3>
              <div className="bg-zenov-card border border-zenov-border rounded-2xl p-4 text-xs space-y-2.5">
                {(analyticsData?.securityLogs || []).map((log: any) => (
                  <div key={log.id} className="p-3 bg-zenov-surface rounded-lg border border-zenov-border flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <span className={`font-bold ${log.status === 'PASS' ? 'text-zenov-success' : 'text-zenov-error'}`}>[{log.status}]</span>{' '}
                      <span className="text-zenov-text">{log.event}</span>
                    </div>
                    <div className="text-zenov-muted text-[10px] font-mono whitespace-nowrap">
                      IP: {log.ip} | {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
