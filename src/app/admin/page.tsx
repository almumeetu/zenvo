'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { Product, Order, CategoryType, CurrencyCode, UserProfile, HeroBanner, BlogArticle, SupportTicket } from '@/types';
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
  Headphones,
  MessageSquare,
  Send,
  CheckCircle2,
  User as UserIcon,
  HelpCircle,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  FolderPlus,
  Layers3,
  Bookmark,
  Coins,
  Menu,
  X,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'cms' | 'tickets' | 'security';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const GRADIENT_THEMES = [
  { label: 'Deep Blue Cyber', value: 'from-blue-950/80 via-slate-900 to-black' },
  { label: 'Orange Fire', value: 'from-amber-950/60 via-slate-900 to-black' },
  { label: 'Indigo Space', value: 'from-indigo-950 via-slate-950 to-zenvo-bg' },
  { label: 'Purple Neon', value: 'from-purple-950/80 via-zinc-950 to-black' },
  { label: 'Red Hot', value: 'from-red-950/70 via-slate-900 to-black' },
];

export default function AdminDashboardPage() {
  const {
    products,
    orders,
    selectedCurrency,
    user,
    users,
    heroBanners,
    blogArticles,
    tickets,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateUser,
    createUser,
    deleteUser,
    adjustUserWallet,
    addBanner,
    updateBanner,
    deleteBanner,
    addBlog,
    updateBlog,
    deleteBlog,
    adminReplyTicket,
    updateTicketStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Products State ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchProd, setSearchProd] = useState('');

  // --- Orders State ---
  const [searchOrder, setSearchOrder] = useState('');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Processing' | 'Delivered' | 'Refunded'>('All');

  // --- Users State ---
  const [searchUser, setSearchUser] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [walletAdjustUser, setWalletAdjustUser] = useState<UserProfile | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState<'deposit' | 'deduction'>('deposit');
  const [walletRef, setWalletRef] = useState('');

  // --- CMS State ---
  const [cmsSubTab, setCmsSubTab] = useState<'banners' | 'blogs'>('banners');
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [isAddingBlog, setIsAddingBlog] = useState(false);

  // --- Ticket State ---
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [isViewingChat, setIsViewingChat] = useState(false);

  // Restrict access if not Admin
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

  // --- Dynamic Analytics ---
  const analyticsData = useMemo(() => {
    // Sales Trend by Day calculation
    const salesMap = new Map<string, { revenue: number; count: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      salesMap.set(label, { revenue: 0, count: 0 });
    }

    orders.forEach((o) => {
      const date = new Date(o.createdAt);
      if (!isNaN(date.getTime())) {
        const label = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (salesMap.has(label)) {
          const val = salesMap.get(label)!;
          val.revenue = parseFloat((val.revenue + o.totalUSD).toFixed(2));
          val.count += 1;
        }
      }
    });

    const salesByDay = Array.from(salesMap.entries()).map(([day, val]) => ({
      day,
      revenue: val.revenue,
      orders: val.count,
    }));

    // Category distribution
    const catMap: Record<string, number> = {};
    products.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });

    const categoryMix = Object.entries(catMap).map(([name, count]) => ({
      name: name.replace('-', ' ').toUpperCase(),
      value: count,
    }));

    // Top Products by Revenue
    const topProducts = products
      .map((p) => {
        const prodSales = orders.filter((o) => o.items.some((i) => i.productId === p.id));
        const revenue = prodSales.reduce((sum, o) => sum + o.totalUSD, 0);
        return {
          id: p.id,
          title: p.title,
          sales: prodSales.length,
          revenue: parseFloat(revenue.toFixed(2)),
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalUSD, 0);
    const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'Processing').length;

    return { salesByDay, categoryMix, topProducts, totalRevenue, pendingOrders };
  }, [orders, products]);

  // --- Filtering Lists ---
  const filteredProducts = useMemo(() => {
    const q = searchProd.trim().toLowerCase();
    return products.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [products, searchProd]);

  const filteredOrders = useMemo(() => {
    const q = searchOrder.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQuery = !q || o.orderNumber.toLowerCase().includes(q) || o.playerId.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q);
      const matchStatus = orderFilter === 'All' || o.fulfillmentStatus === orderFilter;
      return matchQuery && matchStatus;
    });
  }, [orders, searchOrder, orderFilter]);

  const filteredUsers = useMemo(() => {
    const q = searchUser.trim().toLowerCase();
    return users.filter(
      (u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.vipTier.toLowerCase().includes(q)
    );
  }, [users, searchUser]);

  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    return tickets.filter(
      (t) => !q || t.subject.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q)
    );
  }, [tickets, ticketSearch]);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  // --- Products CRUD Actions ---
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get('title') as string;
    const category = data.get('category') as CategoryType;
    const publisher = data.get('publisher') as string;
    const region = data.get('region') as string;
    const deliveryType = data.get('deliveryType') as any;
    const description = data.get('description') as string;
    const instructions = data.get('instructions') as string;
    const playerIdLabel = data.get('playerIdLabel') as string;
    const image = data.get('image') as string || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600';
    const inStock = data.get('inStock') === 'true';
    const isHot = data.get('isHot') === 'true';
    const isNew = data.get('isNew') === 'true';

    const baseDenomAmount = parseFloat(data.get('price') as string) || 1.0;

    const baseProd = editingProduct || {
      id: `prod_${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      tags: ['NewItem'],
      denominations: [
        { id: `d1_${Date.now()}`, name: 'Standard Package', amount: baseDenomAmount },
        { id: `d2_${Date.now()}`, name: 'Bonus Value Pack', amount: baseDenomAmount * 5, bonus: '+15% BONUS' },
      ],
    };

    const newP: Product = {
      ...baseProd,
      title,
      category,
      publisher,
      region,
      deliveryType,
      description,
      instructions,
      playerIdLabel,
      image,
      inStock,
      isHot,
      isNew,
    } as Product;

    if (editingProduct) {
      updateProduct(newP);
      setEditingProduct(null);
    } else {
      addProduct(newP);
      setIsAddingProduct(false);
    }
  };

  // --- Users Actions ---
  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const role = data.get('role') as 'user' | 'admin';
    const vipTier = data.get('vipTier') as any;

    updateUser({
      ...editingUser,
      name,
      email,
      role,
      vipTier,
    });
    setEditingUser(null);
  };

  const handleWalletAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAdjustUser) return;
    const amt = parseFloat(walletAmount);
    if (isNaN(amt) || amt <= 0) return;

    const res = await adjustUserWallet(walletAdjustUser.id, amt, walletType, walletRef || 'Admin Adjustment');
    if (res.success) {
      alert(res.message);
      setWalletAdjustUser(null);
      setWalletAmount('');
      setWalletRef('');
    } else {
      alert(res.message || 'Operation failed');
    }
  };

  // --- Banners CRUD Actions ---
  const handleSaveBanner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get('title') as string;
    const subtitle = data.get('subtitle') as string;
    const badge = data.get('badge') as string;
    const gameId = data.get('gameId') as string;
    const bgGradient = data.get('bgGradient') as string;
    const ctaText = data.get('ctaText') as string;
    const image = data.get('image') as string;

    const baseBanner = editingBanner || { id: `banner_${Date.now()}` };
    const savedBanner: HeroBanner = {
      ...baseBanner,
      title,
      subtitle,
      badge,
      gameId,
      bgGradient,
      ctaText,
      image,
    } as HeroBanner;

    if (editingBanner) {
      updateBanner(savedBanner);
      setEditingBanner(null);
    } else {
      addBanner(savedBanner);
      setIsAddingBanner(false);
    }
  };

  // --- Blogs CRUD Actions ---
  const handleSaveBlog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get('title') as string;
    const excerpt = data.get('excerpt') as string;
    const content = data.get('content') as string;
    const image = data.get('image') as string;
    const category = data.get('category') as string;
    const author = data.get('author') as string;
    const readTime = data.get('readTime') as string;
    const tagsStr = data.get('tags') as string;
    const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [];

    const baseBlog = editingBlog || { id: `blog_${Date.now()}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) };
    const savedBlog: BlogArticle = {
      ...baseBlog,
      title,
      excerpt,
      content,
      image,
      category,
      author,
      readTime,
      tags,
    } as BlogArticle;

    if (editingBlog) {
      updateBlog(savedBlog);
      setEditingBlog(null);
    } else {
      addBlog(savedBlog);
      setIsAddingBlog(false);
    }
  };

  // --- Support Reply Action ---
  const handleSendSupportReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !activeTicketId) return;
    await adminReplyTicket(activeTicketId, ticketReply.trim());
    setTicketReply('');
  };

  const kpiCards = [
    {
      label: 'Calculated Revenue',
      value: formatCurrency(analyticsData.totalRevenue, selectedCurrency),
      delta: '+14.6% All time',
      deltaUp: true,
      Icon: DollarSign,
      accent: 'from-zenvo-success/15 to-zenvo-success/5',
      iconColor: 'text-zenvo-success',
    },
    {
      label: 'Fulfillment Queue',
      value: orders.length.toString(),
      delta: `${analyticsData.pendingOrders} Processing`,
      deltaUp: true,
      Icon: ShoppingBag,
      accent: 'from-zenvo-primary/15 to-zenvo-primary/5',
      iconColor: 'text-zenvo-primary',
    },
    {
      label: 'SKU Inventory',
      value: products.length.toString(),
      delta: '100% Operational',
      deltaUp: true,
      Icon: Package,
      accent: 'from-zenvo-accent/15 to-zenvo-accent/5',
      iconColor: 'text-zenvo-accent',
    },
    {
      label: 'Registered Gamers',
      value: users.length.toString(),
      delta: `Active Admin: ${user.name}`,
      deltaUp: true,
      Icon: Users,
      accent: 'from-violet-500/15 to-violet-500/5',
      iconColor: 'text-violet-400',
    },
  ];

  const tabMeta: { id: AdminTab; label: string; Icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', Icon: Layers },
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'orders', label: 'Orders', Icon: ShoppingBag },
    { id: 'users', label: 'Gamers', Icon: Users },
    { id: 'cms', label: 'CMS', Icon: FileText },
    { id: 'tickets', label: 'Helpdesk', Icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-zenvo-bg flex flex-col lg:flex-row text-zenvo-text">
      
      {/* 1. Mobile Header Bar */}
      <header className="lg:hidden w-full bg-zenvo-card border-b border-zenvo-border px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zenvo-primary to-blue-700 p-[1.5px] shadow-primary">
            <div className="w-full h-full rounded-[7px] bg-zenvo-bg flex items-center justify-center font-bold text-sm text-zenvo-primary">Z</div>
          </div>
          <div>
            <h2 className="text-xs font-black text-zenvo-text tracking-wider uppercase leading-none">ZENOV CONTROL</h2>
            <p className="text-[8px] text-zenvo-accent font-mono uppercase tracking-[0.12em] mt-0.5 leading-none">ROOT LEVEL</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-primary transition-all active:scale-95"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Mobile Collapsible Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          
          {/* Drawer Body */}
          <aside className="relative w-64 bg-zenvo-card border-r border-zenvo-border h-full flex flex-col justify-between z-10 p-5 space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zenvo-border pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-zenvo-primary" />
                  <span className="font-black text-sm tracking-wider uppercase text-zenvo-text">ZENOV PANEL</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-zenvo-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {tabMeta.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      activeTab === id
                        ? 'bg-zenvo-primary text-white shadow-md'
                        : 'text-zenvo-text-secondary hover:bg-zenvo-surface hover:text-zenvo-text'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="border-t border-zenvo-border pt-4 bg-zenvo-surface/20 -mx-5 px-5 -mb-5 pb-5">
              <div className="flex items-center gap-2">
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-zenvo-border" alt="" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zenvo-text truncate">{user.name}</p>
                  <p className="text-[9px] text-zenvo-accent font-mono uppercase mt-0.5">{user.vipTier}</p>
                </div>
              </div>
              <Link href="/" className="inline-flex items-center gap-1 mt-4 text-[10px] font-bold uppercase text-zenvo-primary hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-zenvo-card border-r border-zenvo-border sticky top-0 h-screen shrink-0 z-20">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3 border-b border-zenvo-border pb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zenvo-primary to-blue-700 p-[1.5px] shadow-primary">
              <div className="w-full h-full rounded-[9px] bg-zenvo-bg flex items-center justify-center font-mono font-black text-base text-zenvo-primary">Z</div>
            </div>
            <div>
              <h2 className="text-sm font-black text-zenvo-text tracking-wide uppercase leading-tight">ZENOV CONTROL</h2>
              <p className="text-[9px] text-zenvo-accent font-mono uppercase tracking-[0.1em] leading-none mt-1">ROOT LEVEL</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {tabMeta.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                  activeTab === id
                    ? 'bg-zenvo-primary text-white shadow-lg shadow-zenvo-primary/20'
                    : 'text-zenvo-text-secondary hover:bg-zenvo-surface hover:text-zenvo-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-zenvo-border bg-zenvo-surface/20">
          <div className="flex items-center gap-2">
            <img src={user.avatar} className="w-8 h-8 rounded-full border border-zenvo-border" alt="" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-zenvo-text truncate">{user.name}</p>
              <p className="text-[9px] text-zenvo-accent uppercase tracking-wider leading-none mt-0.5">{user.vipTier}</p>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center gap-1 mt-4 text-[10px] font-bold uppercase text-zenvo-primary hover:text-zenvo-primary-hover transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* 4. Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-7xl w-full mx-auto">
        
        {/* Overview Analytics Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {kpiCards.map(({ label, value, delta, deltaUp, Icon, accent, iconColor }) => (
                <div
                  key={label}
                  className={`relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${accent} border border-zenvo-border bg-zenvo-card overflow-hidden transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted mb-1">
                        {label}
                      </div>
                      <div className="text-lg sm:text-2xl font-black tracking-tight text-zenvo-text leading-tight truncate font-mono">
                        {value}
                      </div>
                      <div className="text-[11px] mt-1.5 inline-flex items-center gap-1 font-semibold text-zenvo-success">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4">
                  Dynamic Sales Revenue Trend
                </h3>
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.salesByDay}>
                      <defs>
                        <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${v}`} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gradRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-1">
                  Category Spread
                </h3>
                <p className="text-xs text-zenvo-text-muted mb-4">Catalog item categories</p>
                <div className="h-44 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.categoryMix} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" paddingAngle={4}>
                        {analyticsData.categoryMix.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {analyticsData.categoryMix.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-zenvo-text-secondary truncate">{c.name}</span>
                      <span className="ml-auto text-zenvo-text-muted font-bold">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text mb-4">
                  Top Products by Revenue
                </h3>
                <div className="h-60 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.topProducts} layout="vertical">
                      <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="title" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={110} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} background={{ fill: '#1e293b', radius: [0, 4, 4, 0] as any }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl p-4 sm:p-6 bg-zenvo-card border border-zenvo-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zenvo-text">
                    Recent Activity Queue
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[11px] font-bold text-zenvo-primary hover:underline">
                    View fulfillment panel →
                  </button>
                </div>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-zenvo-surface/40 border border-zenvo-border">
                      <div className="w-8 h-8 rounded-lg bg-zenvo-primary-soft flex items-center justify-center shrink-0 border border-zenvo-primary-border/25">
                        <ShoppingBag className="w-4 h-4 text-zenvo-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-zenvo-text truncate">{o.orderNumber}</div>
                        <div className="text-[10px] text-zenvo-text-muted truncate">{o.userEmail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-zenvo-text font-mono">
                          {formatCurrency(o.totalUSD, selectedCurrency)}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${o.fulfillmentStatus === 'Delivered' ? 'bg-zenvo-success-soft text-zenvo-success' : 'bg-zenvo-warning-soft text-zenvo-warning'}`}>
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

        {/* Products Inventory Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {(isAddingProduct || editingProduct) ? (
              <form onSubmit={handleSaveProduct} className="rounded-2xl p-5 sm:p-6 bg-zenvo-card border border-zenvo-primary-border/30 space-y-4">
                <h3 className="text-sm font-black uppercase text-zenvo-primary">
                  {editingProduct ? `Edit SKU: ${editingProduct.title}` : '+ Add New Product'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Product Title</label>
                    <input name="title" defaultValue={editingProduct?.title || ''} placeholder="e.g. Valorant Points" required className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Category</label>
                    <select name="category" defaultValue={editingProduct?.category || 'game-topup'} className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border">
                      <option value="game-topup">Game Top-Up</option>
                      <option value="gift-card">Gift Card</option>
                      <option value="subscription">Subscription</option>
                      <option value="social-topup">Social Top-Up</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Price Override ($)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.denominations?.[0]?.amount || '1.00'} className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Publisher</label>
                    <input name="publisher" defaultValue={editingProduct?.publisher || ''} placeholder="e.g. Riot Games" className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Region</label>
                    <input name="region" defaultValue={editingProduct?.region || 'Global'} placeholder="e.g. Global" className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Fulfillment Delivery</label>
                    <select name="deliveryType" defaultValue={editingProduct?.deliveryType || 'Instant'} className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none">
                      <option value="Instant">Instant (Automated)</option>
                      <option value="Manual (5-10 min)">Manual Dispatch</option>
                      <option value="Pre-Order">Pre-Order Queue</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">User input label</label>
                    <input name="playerIdLabel" defaultValue={editingProduct?.playerIdLabel || 'Player UID'} placeholder="e.g. Riot Tag / Player ID" className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Image URL</label>
                    <input name="image" defaultValue={editingProduct?.image || ''} placeholder="https://unsplash..." className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                  <div className="flex gap-4 items-center h-full pt-4 flex-wrap">
                    <label className="flex items-center gap-1.5 text-xs text-zenvo-text font-bold cursor-pointer">
                      <input type="checkbox" name="inStock" value="true" defaultChecked={editingProduct ? editingProduct.inStock : true} className="rounded accent-zenvo-primary" />
                      In Stock
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-zenvo-text font-bold cursor-pointer">
                      <input type="checkbox" name="isHot" value="true" defaultChecked={editingProduct?.isHot || false} className="rounded accent-zenvo-primary" />
                      Hot Event
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-zenvo-text font-bold cursor-pointer">
                      <input type="checkbox" name="isNew" value="true" defaultChecked={editingProduct?.isNew || false} className="rounded accent-zenvo-primary" />
                      New Arrival
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Product Description</label>
                  <textarea name="description" defaultValue={editingProduct?.description || ''} rows={3} placeholder="Full product summary details..." className="w-full px-4 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Fulfillment Instructions</label>
                  <textarea name="instructions" defaultValue={editingProduct?.instructions || ''} rows={3} placeholder="Steps to receive top-up..." className="w-full px-4 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-zenvo-primary text-white text-xs font-bold uppercase hover:brightness-110 active:scale-95 transition-all">
                    Save Product
                  </button>
                  <button type="button" onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="px-5 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-bold text-zenvo-text-secondary hover:text-zenvo-text transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border">
                    <Search className="w-[18px] h-[18px] text-zenvo-text-muted shrink-0" />
                    <input
                      value={searchProd}
                      onChange={(e) => setSearchProd(e.target.value)}
                      placeholder="Search SKU inventories..."
                      className="w-full min-w-0 bg-transparent text-sm text-zenvo-text focus:outline-none"
                    />
                  </div>
                  <button onClick={() => setIsAddingProduct(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zenvo-accent to-orange-500 text-zenvo-bg text-sm font-black uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-95 shadow-md">
                    <Plus className="w-[18px] h-[18px]" /> Create SKU
                  </button>
                </div>

                {/* Products Table (Desktop View) */}
                <div className="hidden md:block rounded-2xl overflow-hidden bg-zenvo-card border border-zenvo-border">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted bg-zenvo-surface/70 border-b border-zenvo-border">
                        <th className="p-4">SKU Product</th>
                        <th className="p-4 hidden lg:table-cell">Category</th>
                        <th className="p-4">Stock Status</th>
                        <th className="p-4 text-right">Base Amount</th>
                        <th className="p-4 text-right w-[110px]">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zenvo-border/40">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zenvo-surface/30 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-zenvo-surface border border-zenvo-border" alt="" />
                            <div className="min-w-0">
                              <p className="font-bold text-zenvo-text truncate">{p.title}</p>
                              <p className="text-[10px] text-zenvo-text-muted">ID: {p.id}</p>
                            </div>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zenvo-primary-soft text-zenvo-primary border border-zenvo-primary-border/20">
                              {p.category.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            {p.inStock ? (
                              <span className="text-[11px] font-bold text-zenvo-success flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> In-Stock
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-zenvo-error flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Out-of-Stock
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-black font-mono text-zenvo-primary text-sm">
                            {formatCurrency(p.denominations?.[0]?.amount || 0, selectedCurrency)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-1">
                              <button onClick={() => setEditingProduct(p)} className="p-1.5 rounded-lg bg-zenvo-surface hover:bg-zenvo-primary hover:text-white border border-zenvo-border transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg bg-zenvo-error-soft/30 hover:bg-zenvo-error hover:text-white border border-zenvo-error/20 text-zenvo-error transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Products Cards (Mobile View) */}
                <div className="grid grid-cols-1 gap-3.5 md:hidden">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-zenvo-card border border-zenvo-border flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-zenvo-border" alt="" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-zenvo-text text-sm truncate leading-snug">{p.title}</p>
                          <p className="text-[10px] text-zenvo-text-muted mt-0.5">ID: {p.id}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-zenvo-primary-soft text-zenvo-primary border border-zenvo-primary-border/20">
                            {p.category.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-zenvo-text-muted uppercase">Base Price</p>
                          <p className="font-mono font-black text-zenvo-primary text-sm mt-0.5">
                            {formatCurrency(p.denominations?.[0]?.amount || 0, selectedCurrency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-zenvo-border/40 pt-2.5 mt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${p.inStock ? 'text-zenvo-success' : 'text-zenvo-error'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-zenvo-success animate-pulse' : 'bg-zenvo-error'}`} />
                            {p.inStock ? 'In Stock' : 'Out'}
                          </span>
                          {p.isHot && <span className="px-1.5 py-0.2 rounded bg-zenvo-accent-soft text-zenvo-accent text-[8px] font-bold uppercase border border-zenvo-accent-border/20">Hot</span>}
                          {p.isNew && <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase border border-blue-500/20">New</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditingProduct(p)} className="p-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-primary hover:border-zenvo-primary-border transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-xl bg-zenvo-error-soft/30 border border-zenvo-error/20 text-zenvo-error hover:bg-zenvo-error hover:text-white transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {/* Live Orders Fulfillment Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border">
                <Search className="w-[18px] h-[18px] text-zenvo-text-muted shrink-0" />
                <input
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  placeholder="Search orders by Player ID, order number, or client email..."
                  className="w-full min-w-0 bg-transparent text-sm text-zenvo-text focus:outline-none"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {['All', 'Processing', 'Delivered', 'Refunded'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st as any)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-zenvo-primary text-white border border-zenvo-primary shadow-sm'
                        : 'bg-zenvo-card border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-text hover:bg-zenvo-surface'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table (Desktop View) */}
            <div className="hidden md:block rounded-2xl overflow-hidden bg-zenvo-card border border-zenvo-border">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted bg-zenvo-surface/70 border-b border-zenvo-border">
                    <th className="p-4">Order Details</th>
                    <th className="p-4">UID / Destination</th>
                    <th className="p-4">Fulfillment Product</th>
                    <th className="p-4">Gateway</th>
                    <th className="p-4 text-right">Charge amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Fulfillment Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zenvo-border/40">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-zenvo-surface/30">
                      <td className="p-4">
                        <div className="font-bold text-zenvo-text font-mono text-sm">{o.orderNumber}</div>
                        <div className="text-[10px] text-zenvo-text-muted mt-0.5">{o.createdAt}</div>
                        <div className="text-[10px] text-zenvo-primary underline mt-0.5">{o.userEmail}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-zenvo-text-secondary">{o.playerId}</td>
                      <td className="p-4">
                        <p className="font-bold text-zenvo-text text-xs leading-snug">{o.items[0]?.productTitle}</p>
                        <p className="text-[10px] text-zenvo-text-secondary leading-snug">{o.items[0]?.denomination.name} (Qty {o.items[0]?.quantity})</p>
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-zenvo-text">{o.paymentMethod}</p>
                        <p className="text-[9px] font-mono text-zenvo-text-muted uppercase mt-0.5">{o.paymentStatus}</p>
                      </td>
                      <td className="p-4 text-right font-black font-mono text-sm text-zenvo-success">
                        {formatCurrency(o.totalUSD, o.currency as any)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          o.fulfillmentStatus === 'Delivered'
                            ? 'bg-zenvo-success-soft text-zenvo-success border-zenvo-success/20'
                            : o.fulfillmentStatus === 'Processing'
                              ? 'bg-zenvo-warning-soft text-zenvo-warning border-zenvo-warning/20'
                              : 'bg-zenvo-error-soft text-zenvo-error border-zenvo-error/20'
                        }`}>
                          {o.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5 justify-end">
                          {o.fulfillmentStatus !== 'Delivered' && (
                            <button onClick={() => updateOrderStatus(o.id, 'Delivered')} className="px-2.5 py-1.5 rounded-lg bg-zenvo-success-soft/30 hover:bg-zenvo-success hover:text-white border border-zenvo-success/20 text-zenvo-success font-bold text-[10px] uppercase transition-all">
                              Ship
                            </button>
                          )}
                          {o.fulfillmentStatus !== 'Refunded' && (
                            <button onClick={() => updateOrderStatus(o.id, 'Refunded')} className="px-2.5 py-1.5 rounded-lg bg-zenvo-error-soft/30 hover:bg-zenvo-error hover:text-white border border-zenvo-error/20 text-zenvo-error font-bold text-[10px] uppercase transition-all">
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Orders Cards (Mobile View) */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {filteredOrders.map((o) => (
                <div key={o.id} className="p-4 rounded-2xl bg-zenvo-card border border-zenvo-border flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-zenvo-primary">{o.orderNumber}</span>
                      <p className="text-[10px] text-zenvo-text-muted mt-0.5">{o.createdAt}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      o.fulfillmentStatus === 'Delivered' ? 'bg-zenvo-success-soft text-zenvo-success border-zenvo-success/20' : 'bg-zenvo-warning-soft text-zenvo-warning border-zenvo-warning/20'
                    }`}>
                      {o.fulfillmentStatus}
                    </span>
                  </div>

                  <div className="bg-zenvo-surface/40 p-3 rounded-xl space-y-1.5 text-xs border border-zenvo-border/30">
                    <div className="flex justify-between">
                      <span className="text-zenvo-text-muted">Client:</span>
                      <span className="text-zenvo-text truncate max-w-[170px] font-medium">{o.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zenvo-text-muted">Destination:</span>
                      <span className="font-mono text-zenvo-text font-bold">{o.playerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zenvo-text-muted">Product:</span>
                      <span className="text-zenvo-text text-right font-bold">{o.items[0]?.productTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zenvo-text-muted">Pack:</span>
                      <span className="text-zenvo-text text-right truncate max-w-[175px]">{o.items[0]?.denomination.name} (Qty {o.items[0]?.quantity})</span>
                    </div>
                    <div className="flex justify-between border-t border-zenvo-border/30 pt-1.5 mt-1.5 text-zenvo-text">
                      <span>Gateway: {o.paymentMethod}</span>
                      <span className="font-black font-mono text-zenvo-success">{formatCurrency(o.totalUSD, o.currency as any)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-0.5">
                    {o.fulfillmentStatus !== 'Delivered' && (
                      <button onClick={() => updateOrderStatus(o.id, 'Delivered')} className="px-3.5 py-2 rounded-xl bg-zenvo-success hover:bg-zenvo-success-hover text-white font-bold text-[10px] uppercase shadow-sm transition-all flex-1 text-center">
                        Ship Order
                      </button>
                    )}
                    {o.fulfillmentStatus !== 'Refunded' && (
                      <button onClick={() => updateOrderStatus(o.id, 'Refunded')} className="px-3.5 py-2 rounded-xl bg-zenvo-error-soft/30 hover:bg-zenvo-error hover:text-white border border-zenvo-error/20 text-zenvo-error font-bold text-[10px] uppercase transition-all flex-1 text-center">
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border focus-within:border-zenvo-primary-border">
                <Search className="w-[18px] h-[18px] text-zenvo-text-muted shrink-0" />
                <input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search registered gamers by name, email, VIP tiers..."
                  className="w-full min-w-0 bg-transparent text-sm text-zenvo-text focus:outline-none"
                />
              </div>
            </div>

            {editingUser && (
              <form onSubmit={handleSaveUser} className="rounded-2xl p-5 sm:p-6 bg-zenvo-card border border-zenvo-accent-border/30 space-y-4 max-w-xl">
                <h4 className="text-sm font-black uppercase text-zenvo-accent">Edit Gamer Account Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Gamer Name</label>
                    <input name="name" defaultValue={editingUser.name} required className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">E-mail Address</label>
                    <input name="email" type="email" defaultValue={editingUser.email} required className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Access Role</label>
                    <select name="role" defaultValue={editingUser.role} className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none">
                      <option value="user">User Role</option>
                      <option value="admin">Administrator Root</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">VIP Club Rank</label>
                    <select name="vipTier" defaultValue={editingUser.vipTier} className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none">
                      <option value="Bronze">Bronze (Tier 1)</option>
                      <option value="Silver">Silver (Tier 2)</option>
                      <option value="Gold">Gold (Tier 3)</option>
                      <option value="Cyber Elite">Cyber Elite (Tier 4)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-zenvo-accent text-zenvo-bg text-xs font-bold uppercase hover:brightness-110">
                    Save Account
                  </button>
                  <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-bold text-zenvo-text-secondary hover:text-zenvo-text">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {walletAdjustUser && (
              <form onSubmit={handleWalletAdjustSubmit} className="rounded-2xl p-5 sm:p-6 bg-zenvo-card border border-zenvo-primary-border/30 space-y-4 max-w-xl">
                <h4 className="text-sm font-black uppercase text-zenvo-primary">Adjust Wallet Float: {walletAdjustUser.name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Type of operation</label>
                    <select value={walletType} onChange={(e: any) => setWalletType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none">
                      <option value="deposit">Deposit (Load balance)</option>
                      <option value="deduction">Deduction (Debit balance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Amount to adjust (USD)</label>
                    <input type="number" step="0.01" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} required placeholder="e.g. 50.00" className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted block mb-1">Operation Memo / Reference Note</label>
                  <input value={walletRef} onChange={(e) => setWalletRef(e.target.value)} placeholder="e.g. Admin reward credits" className="w-full px-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-zenvo-primary text-white text-xs font-bold uppercase hover:brightness-110">
                    Submit Adjustment
                  </button>
                  <button type="button" onClick={() => setWalletAdjustUser(null)} className="px-5 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs font-bold text-zenvo-text-secondary hover:text-zenvo-text">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Users Table (Desktop View) */}
            <div className="hidden md:block rounded-2xl overflow-hidden bg-zenvo-card border border-zenvo-border">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-zenvo-text-muted bg-zenvo-surface/70 border-b border-zenvo-border">
                    <th className="p-4">Account Gamer</th>
                    <th className="p-4">System Role</th>
                    <th className="p-4">VIP Club Rank</th>
                    <th className="p-4 text-right">Wallet Balance</th>
                    <th className="p-4 text-right w-[180px]">Wallet & Edit control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zenvo-border/40">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zenvo-surface/30">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatar} className="w-9 h-9 rounded-full object-cover bg-zenvo-surface border border-zenvo-border" alt="" />
                        <div className="min-w-0">
                          <p className="font-bold text-zenvo-text truncate">{u.name}</p>
                          <p className="text-[10px] text-zenvo-text-muted truncate">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-zenvo-error-soft text-zenvo-error border border-zenvo-error/20' : 'bg-slate-500/10 text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zenvo-accent-soft text-zenvo-accent border border-zenvo-accent-border/30">
                          {u.vipTier}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-sm text-zenvo-primary">
                        {formatCurrency(u.walletBalanceUSD, selectedCurrency)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button onClick={() => setWalletAdjustUser(u)} className="px-2.5 py-1.5 rounded-lg bg-zenvo-primary-soft/30 hover:bg-zenvo-primary hover:text-white border border-zenvo-primary-border/25 text-zenvo-primary font-bold text-[10px] uppercase flex items-center gap-1 transition-all">
                            <Coins className="w-3 h-3" /> Ledger
                          </button>
                          <button onClick={() => setEditingUser(u)} className="p-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-accent hover:border-zenvo-accent-border transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== user.id && (
                            <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg bg-zenvo-error-soft/30 hover:bg-zenvo-error hover:text-white text-zenvo-error border border-zenvo-error/20 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Users Cards (Mobile View) */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl bg-zenvo-card border border-zenvo-border flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-zenvo-border bg-zenvo-surface shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zenvo-text text-sm truncate leading-none">{u.name}</p>
                      <p className="text-[10px] text-zenvo-text-muted truncate mt-1 leading-none">{u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${u.role === 'admin' ? 'bg-zenvo-error-soft text-zenvo-error border border-zenvo-error/20' : 'bg-slate-500/10 text-slate-300'}`}>
                      {u.role}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-b border-zenvo-border/40 py-2.5 my-0.5 text-xs">
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase bg-zenvo-accent-soft text-zenvo-accent border border-zenvo-accent-border/30 tracking-wider">
                      VIP: {u.vipTier}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-zenvo-text-muted">Balance: </span>
                      <span className="font-mono font-black text-zenvo-primary text-sm">{formatCurrency(u.walletBalanceUSD, selectedCurrency)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-0.5">
                    <button onClick={() => setWalletAdjustUser(u)} className="px-3.5 py-2 rounded-xl bg-zenvo-primary-soft/40 hover:bg-zenvo-primary hover:text-white border border-zenvo-primary-border/25 text-zenvo-primary font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 flex-1 transition-all">
                      <Coins className="w-3.5 h-3.5" /> Adjust Balance
                    </button>
                    <button onClick={() => setEditingUser(u)} className="p-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-accent hover:border-zenvo-accent-border transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== user.id && (
                      <button onClick={() => deleteUser(u.id)} className="p-2 rounded-xl bg-zenvo-error-soft/30 border border-zenvo-error/20 text-zenvo-error hover:bg-zenvo-error hover:text-white transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* CMS Tab: Hero Banners & Blogs */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <div className="p-1 rounded-2xl bg-zenvo-surface border border-zenvo-border inline-flex gap-1">
              <button onClick={() => setCmsSubTab('banners')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${cmsSubTab === 'banners' ? 'bg-zenvo-card text-zenvo-primary shadow-sm border border-zenvo-border' : 'text-zenvo-text-secondary hover:text-zenvo-text'}`}>
                Homepage Banners
              </button>
              <button onClick={() => setCmsSubTab('blogs')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${cmsSubTab === 'blogs' ? 'bg-zenvo-card text-zenvo-primary shadow-sm border border-zenvo-border' : 'text-zenvo-text-secondary hover:text-zenvo-text'}`}>
                Blog Posts
              </button>
            </div>

            {cmsSubTab === 'banners' && (
              <div className="space-y-4">
                {(isAddingBanner || editingBanner) ? (
                  <form onSubmit={handleSaveBanner} className="rounded-2xl p-5 bg-zenvo-card border border-zenvo-primary-border/20 space-y-4">
                    <h4 className="text-sm font-black uppercase text-zenvo-primary">{editingBanner ? `Edit Carousel: ${editingBanner.title}` : '+ Add Homepage banner'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Banner Title</label>
                        <input name="title" defaultValue={editingBanner?.title || ''} required className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Sub-title details</label>
                        <input name="subtitle" defaultValue={editingBanner?.subtitle || ''} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Banner Badge Tag</label>
                        <input name="badge" defaultValue={editingBanner?.badge || 'OFFICIAL RESELLER'} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Gradation color theme</label>
                        <select name="bgGradient" defaultValue={editingBanner?.bgGradient || GRADIENT_THEMES[0].value} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs">
                          {GRADIENT_THEMES.map((theme) => (
                            <option key={theme.value} value={theme.value}>{theme.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Link Target (Product ID)</label>
                        <input name="gameId" defaultValue={editingBanner?.gameId || 'google-play-gift-card'} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Action CTA Button Text</label>
                        <input name="ctaText" defaultValue={editingBanner?.ctaText || 'RECHARGE NOW'} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Graphic URL (Unsplash/Imgur)</label>
                      <input name="image" defaultValue={editingBanner?.image || ''} required placeholder="https://..." className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-5 py-2 rounded-xl bg-zenvo-primary text-white text-xs font-bold uppercase">Save Banner</button>
                      <button type="button" onClick={() => { setEditingBanner(null); setIsAddingBanner(false); }} className="px-5 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-zenvo-text-muted">Home Carousel Cards ({heroBanners.length})</h4>
                      <button onClick={() => setIsAddingBanner(true)} className="px-4 py-2.5 bg-zenvo-primary text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1 active:scale-95 shadow-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Add banner
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {heroBanners.map((b) => (
                        <div key={b.id} className="rounded-2xl border border-zenvo-border bg-zenvo-card overflow-hidden flex flex-col justify-between">
                          <div className="p-4 space-y-2">
                            <div className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold text-center bg-gradient-to-r ${b.bgGradient} text-white`}>
                              {b.badge || 'TAG'}
                            </div>
                            <h5 className="font-bold text-zenvo-text leading-tight text-sm uppercase">{b.title}</h5>
                            <p className="text-xs text-zenvo-text-secondary leading-snug line-clamp-2">{b.subtitle}</p>
                            <div className="text-[10px] text-zenvo-accent font-semibold">Targets: {b.gameId}</div>
                          </div>
                          <div className="p-4 border-t border-zenvo-border bg-zenvo-surface/40 flex justify-between gap-2">
                            <button onClick={() => setEditingBanner(b)} className="px-3 py-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text-secondary hover:text-zenvo-primary flex items-center gap-1 transition-colors">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => deleteBanner(b.id)} className="px-3 py-1.5 rounded-lg bg-zenvo-error-soft/30 text-zenvo-error hover:bg-zenvo-error hover:text-white border border-zenvo-error/20 text-xs flex items-center gap-1 transition-all">
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {cmsSubTab === 'blogs' && (
              <div className="space-y-4">
                {(isAddingBlog || editingBlog) ? (
                  <form onSubmit={handleSaveBlog} className="rounded-2xl p-5 bg-zenvo-card border border-zenvo-primary-border/20 space-y-4">
                    <h4 className="text-sm font-black uppercase text-zenvo-primary">{editingBlog ? `Edit Blog: ${editingBlog.title}` : '+ Author New Blog Article'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Article Title</label>
                        <input name="title" defaultValue={editingBlog?.title || ''} required className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Author Name</label>
                        <input name="author" defaultValue={editingBlog?.author || 'ZENOV Staff'} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Topic Category</label>
                        <input name="category" defaultValue={editingBlog?.category || 'Guides'} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Read Time text</label>
                        <input name="readTime" defaultValue={editingBlog?.readTime || '3 min read'} className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Tags (Comma-separated)</label>
                        <input name="tags" defaultValue={editingBlog?.tags?.join(', ') || ''} placeholder="Free Fire, Diamonds, Event" className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Image URL</label>
                        <input name="image" defaultValue={editingBlog?.image || ''} required placeholder="https://..." className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Blog Excerpt (Brief description)</label>
                      <input name="excerpt" defaultValue={editingBlog?.excerpt || ''} required className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Main Article Content</label>
                      <textarea name="content" defaultValue={editingBlog?.content || ''} rows={6} required placeholder="Write markdown content..." className="w-full px-3 py-2 bg-zenvo-surface border border-zenvo-border rounded-lg text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-5 py-2 rounded-xl bg-zenvo-primary text-white text-xs font-bold uppercase">Publish Blog</button>
                      <button type="button" onClick={() => { setEditingBlog(null); setIsAddingBlog(false); }} className="px-5 py-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-zenvo-text-muted">Active Blog Articles ({blogArticles.length})</h4>
                      <button onClick={() => setIsAddingBlog(true)} className="px-4 py-2.5 bg-zenvo-primary text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1 active:scale-95 shadow-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Author Article
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {blogArticles.map((b) => (
                        <div key={b.id} className="rounded-2xl border border-zenvo-border bg-zenvo-card overflow-hidden flex flex-col justify-between p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={b.image} className="w-12 h-12 rounded-lg object-cover border border-zenvo-border" alt="" />
                            <div className="min-w-0">
                              <span className="px-2 py-0.2 rounded bg-zenvo-accent-soft text-zenvo-accent text-[9px] uppercase font-bold border border-zenvo-accent-border/30">
                                {b.category}
                              </span>
                              <h5 className="font-bold text-zenvo-text leading-tight text-sm mt-1">{b.title}</h5>
                            </div>
                          </div>
                          <p className="text-xs text-zenvo-text-secondary leading-snug line-clamp-2">{b.excerpt}</p>
                          <div className="flex items-center justify-between text-[10px] text-zenvo-text-muted">
                            <span>By {b.author} • {b.readTime}</span>
                            <span>{b.date}</span>
                          </div>
                          <div className="pt-2 border-t border-zenvo-border flex justify-end gap-2">
                            <button onClick={() => setEditingBlog(b)} className="px-3 py-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text-secondary hover:text-zenvo-primary flex items-center gap-1">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => deleteBlog(b.id)} className="px-3 py-1.5 rounded-lg bg-zenvo-error-soft/30 text-zenvo-error hover:bg-zenvo-error hover:text-white border border-zenvo-error/20 text-xs flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Support Helpdesk Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left: Tickets List Panel (hidden on mobile if chat is active) */}
            <div className={`lg:col-span-2 space-y-4 ${isViewingChat ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zenvo-card border border-zenvo-border">
                <Search className="w-4 h-4 text-zenvo-text-muted shrink-0" />
                <input
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search ticket number or subject..."
                  className="w-full bg-transparent text-xs text-zenvo-text focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredTickets.map((t) => {
                  const active = t.id === activeTicketId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTicketId(t.id);
                        setIsViewingChat(true);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                        active
                          ? 'bg-zenvo-primary-soft/60 border-zenvo-primary-border ring-1 ring-zenvo-primary-border/30 shadow-sm'
                          : 'bg-zenvo-card border-zenvo-border hover:border-zenvo-border-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-zenvo-primary">{t.ticketNumber}</span>
                        <span className={`px-2 py-0.2 rounded text-[9px] uppercase font-bold tracking-wide border ${
                          t.status === 'Open'
                            ? 'bg-zenvo-primary-soft text-zenvo-primary border-zenvo-primary-border/20'
                            : t.status === 'In Progress'
                              ? 'bg-zenvo-warning-soft text-zenvo-warning border-zenvo-warning/20'
                              : 'bg-zenvo-success-soft text-zenvo-success border-zenvo-success/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="font-black text-xs text-zenvo-text truncate w-full">{t.subject}</div>
                      <div className="flex justify-between items-center text-[10px] text-zenvo-text-muted mt-1">
                        <span>Cat: {t.category}</span>
                        <span>{t.updatedAt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Ticket Conversation Box (hidden on mobile if chat is NOT active) */}
            <div className={`lg:col-span-3 ${!isViewingChat ? 'hidden lg:block' : 'block'}`}>
              {activeTicket ? (
                <div className="rounded-2xl border border-zenvo-border bg-zenvo-card flex flex-col h-[520px] lg:h-[560px]">
                  {/* Chat header panel */}
                  <div className="p-4 border-b border-zenvo-border bg-zenvo-surface/50 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {/* Back button on mobile view */}
                      <button
                        onClick={() => {
                          setActiveTicketId(null);
                          setIsViewingChat(false);
                        }}
                        className="lg:hidden p-2 rounded-xl bg-zenvo-surface border border-zenvo-border text-zenvo-text-secondary hover:text-zenvo-primary transition-all active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-black text-sm text-zenvo-text flex items-center gap-1.5">
                          <span>{activeTicket.ticketNumber}</span>
                          <span className="text-zenvo-text-muted font-normal">•</span>
                          <span className="text-xs text-zenvo-text-secondary">{activeTicket.subject}</span>
                        </h4>
                        <p className="text-[10px] text-zenvo-text-muted mt-0.5">
                          Client: <span className="font-semibold text-zenvo-primary">{activeTicket.userEmail}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={activeTicket.status}
                        onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value as any)}
                        className="px-2 py-1 rounded bg-zenvo-card border border-zenvo-border text-[11px] font-bold uppercase text-zenvo-text focus:outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zenvo-surface/20">
                    {activeTicket.messages.map((msg) => {
                      const isSupport = msg.sender === 'support';
                      const isAi = msg.sender === 'ai';
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-1 ${
                            isSupport
                              ? 'ml-auto bg-zenvo-primary text-white'
                              : isAi
                                ? 'mr-auto bg-zenvo-card border border-zenvo-accent-border/30 text-zenvo-text'
                                : 'mr-auto bg-zenvo-card border border-zenvo-border text-zenvo-text'
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 text-[9px] ${isSupport ? 'text-white/70' : 'text-zenvo-text-muted'} font-bold mb-1`}>
                            <span>{msg.senderName}</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div className="whitespace-pre-line text-[12.5px] leading-relaxed font-medium">
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendSupportReply} className="p-3 border-t border-zenvo-border flex gap-2 bg-zenvo-card/60">
                    <input
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      placeholder="Type support response message..."
                      className="flex-1 bg-zenvo-surface border border-zenvo-border focus:border-zenvo-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenvo-text focus:outline-none"
                    />
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-zenvo-primary hover:bg-zenvo-primary-hover text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-zenvo-border bg-zenvo-card h-[500px] lg:h-[560px] flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare className="w-14 h-14 text-zenvo-text-muted mb-4 opacity-50" />
                  <h4 className="font-black text-zenvo-text mb-1">Helpdesk Dashboard Inbox</h4>
                  <p className="text-xs text-zenvo-text-secondary max-w-xs leading-relaxed">
                    Select any ticket from the left panel to review message transcripts and reply.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance / Security Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-5 bg-zenvo-card border border-zenvo-success/30 bg-gradient-to-br from-zenvo-success/5 to-transparent">
              <Check className="w-9 h-9 text-zenvo-success mb-3" />
              <h3 className="text-base font-black text-zenvo-text mb-2">PCI-DSS Tokenization Gateways</h3>
              <p className="text-xs text-zenvo-text-secondary leading-relaxed">
                Full bank-grade card numbers never transit through local servers. API triggers with bKash / Nagad operate strictly via secured webhook signatures. Last audit: Q3 2026.
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-zenvo-card border border-zenvo-border">
              <ShieldCheck className="w-9 h-9 text-zenvo-primary mb-3" />
              <h3 className="text-base font-black text-zenvo-text mb-2">WAF Rate-Limiter Policies</h3>
              <p className="text-xs text-zenvo-text-secondary leading-relaxed">
                Cloudflare enterprise level shield parameters are initialized. API request thresholds set to max 120 calls/min per client IP address. System alerts logged directly to telemetry stream.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
