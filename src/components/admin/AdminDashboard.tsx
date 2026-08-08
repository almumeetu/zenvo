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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#060a0f] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,229,255,0.25)] overflow-hidden text-slate-100 my-4 flex flex-col h-[90vh]">
        {/* Top Cockpit Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950 via-[#0a141d] to-[#070b0f] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-400 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black font-mono text-white tracking-wide">
                  ZENVO ADMIN HUD CONTROL CENTER
                </h1>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                  ROOT LEVEL ACCESS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                REAL-TIME REVENUE ANALYTICS • FULFILLMENT BOT GATEWAY • INVENTORY ENGINE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#080d14] border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
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
              className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/40 shadow-[0_10px_20px_-10px_rgba(0,229,255,0.5)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
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
                <div className="bg-[#0a121c] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    TOTAL REVENUE (ALL TIME)
                  </span>
                  <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
                    {formatCurrency(analyticsData?.totalRevenue || 18950, selectedCurrency)}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +28.4% from last week
                  </span>
                </div>

                <div className="bg-[#0a121c] border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    TOTAL DELIVERED ORDERS
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                    {(analyticsData?.totalOrdersCount || 1420).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Avg delivery speed: 8 seconds
                  </span>
                </div>

                <div className="bg-[#0a121c] border border-purple-500/30 rounded-2xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    ACTIVE PRODUCTS
                  </span>
                  <span className="text-2xl font-black font-mono text-purple-400 mt-1 block">
                    {products.length} Items
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">100% In-Stock</span>
                </div>

                <div className="bg-[#0a121c] border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    REGISTERED GAMERS
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                    {(analyticsData?.registeredUsersCount || 12840).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Wallet Float: $38,920.50
                  </span>
                </div>
              </div>

              {/* Recharts Graphical Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Growth Chart */}
                <div className="lg:col-span-2 bg-[#090f17] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>WEEKLY REVENUE & ORDER VOLUME</span>
                    <span className="text-[10px] text-slate-500">REAL-TIME TELEMETRY</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData?.salesByDay || []}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                        <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#090f16', borderColor: '#00e5ff', color: '#fff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#00e5ff"
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Pie Breakdown */}
                <div className="bg-[#090f17] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4">
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#090f16', borderColor: '#00e5ff', color: '#fff' }}
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
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  GAME & CARD CATALOG MANAGEMENT ({products.length} ITEMS)
                </h3>
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                >
                  <Plus className="w-4 h-4" /> Add New Item
                </button>
              </div>

              {/* Add Product Form Modal */}
              {isAddingProduct && (
                <form
                  onSubmit={handleCreateProductSubmit}
                  className="bg-[#0a121c] border border-cyan-500/40 rounded-2xl p-4 space-y-3 font-mono text-xs"
                >
                  <h4 className="font-bold text-cyan-400 uppercase">ADD NEW GAME / GIFT CARD TOP-UP</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Title</label>
                      <input
                        type="text"
                        value={newProdTitle}
                        onChange={(e) => setNewProdTitle(e.target.value)}
                        placeholder="e.g. Apex Legends Mobile Gold"
                        className="w-full bg-[#060a0f] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as any)}
                        className="w-full bg-[#060a0f] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        <option value="game-topup">Game Top-Up</option>
                        <option value="social-topup">Social Top-Up</option>
                        <option value="gift-card">Gift Card</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Base Price ($)</label>
                      <input
                        type="number"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full bg-[#060a0f] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold uppercase"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="bg-[#080e15] border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0b131d] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Delivery</th>
                      <th className="p-3">Starting Price</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-cyan-950/20">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <img src={p.image} className="w-8 h-8 rounded object-cover" />
                          <span>{p.title}</span>
                        </td>
                        <td className="p-3 text-slate-400 capitalize">{p.category.replace('-', ' ')}</td>
                        <td className="p-3 text-emerald-400">{p.deliveryType}</td>
                        <td className="p-3 text-cyan-400 font-bold">
                          {formatCurrency(p.denominations[0]?.amount || 0, selectedCurrency)}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/30"
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
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase">
                REAL-TIME FULFILLMENT QUEUE ({orders.length} ORDERS)
              </h3>

              <div className="bg-[#080e15] border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0b131d] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Player UID</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Total Paid</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-cyan-950/20">
                        <td className="p-3 font-bold text-cyan-400">{o.orderNumber}</td>
                        <td className="p-3 text-white">{o.playerId}</td>
                        <td className="p-3 text-slate-300">{o.paymentMethod}</td>
                        <td className="p-3 text-emerald-400 font-bold">
                          {formatCurrency(o.totalUSD, selectedCurrency)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.fulfillmentStatus === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {o.fulfillmentStatus}
                          </span>
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'Delivered')}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-black font-bold text-[10px]"
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
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase">REGISTERED GAMERS & VIP TIERS</h3>
              <div className="bg-[#080e15] border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0c141f] rounded-xl border border-slate-700">
                  <div>
                    <p className="font-bold text-white">CyberGamer_99 (gamer@zenvogames.com)</p>
                    <p className="text-[10px] text-slate-400">VIP Tier: Cyber Elite | Orders: 18</p>
                  </div>
                  <span className="text-emerald-400 font-bold">Wallet: $45.80</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase">SYSTEM SECURITY & API AUDIT LOGS</h3>
              <div className="bg-[#080e15] border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2">
                {(analyticsData?.securityLogs || []).map((log: any) => (
                  <div key={log.id} className="p-2.5 bg-[#0a111a] rounded-lg border border-slate-800 flex justify-between">
                    <div>
                      <span className="text-cyan-400 font-bold">[{log.status}]</span>{' '}
                      <span className="text-white">{log.event}</span>
                    </div>
                    <div className="text-slate-500 text-[10px]">
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
