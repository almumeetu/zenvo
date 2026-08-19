'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppStateContext';
import { formatCurrency } from '@/lib/currency';
import { Product, Order, CategoryType, CategoryItem, UnitItem, CurrencyCode, UserProfile, HeroBanner, BlogArticle, SupportTicket } from '@/types';
import { ImageDropzone } from '@/components/admin/ImageDropzone';
import { DenominationsBuilder } from '@/components/admin/DenominationsBuilder';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { UnitManager } from '@/components/admin/UnitManager';
import { AdminToast } from '@/components/admin/AdminToast';
import { CreateOrderModal } from '@/components/admin/CreateOrderModal';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { ZenovLogo } from '@/components/ZenovLogo';
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
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Layers3,
  Bookmark,
  Coins,
  Menu,
  X,
  Zap,
  Copy,
  Eye,
  Filter,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'cms' | 'tickets' | 'security';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const GRADIENT_THEMES = [
  { label: 'Deep Blue Cyber', value: 'from-blue-950/80 via-slate-900 to-black' },
  { label: 'Orange Fire', value: 'from-amber-950/60 via-slate-900 to-black' },
  { label: 'Indigo Space', value: 'from-indigo-950 via-slate-950 to-zenov-bg' },
  { label: 'Purple Neon', value: 'from-purple-950/80 via-zinc-950 to-black' },
  { label: 'Red Hot', value: 'from-red-950/70 via-slate-900 to-black' },
];

export default function AdminDashboardPage() {
  const {
    products,
    categories,
    units,
    orders,
    selectedCurrency,
    setSelectedCurrency,
    user,
    users,
    heroBanners,
    blogArticles,
    tickets,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    createAdminOrder,
    refreshOrders,
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
    authLoading,
    adminToast,
    dismissAdminToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openProductsMenu, setOpenProductsMenu] = useState(true);
  const [openOrdersMenu, setOpenOrdersMenu] = useState(false);
  const [openCmsMenu, setOpenCmsMenu] = useState(false);

  // --- Products State ---
  const [productSubTab, setProductSubTab] = useState<'products' | 'categories' | 'units'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchProd, setSearchProd] = useState('');

  // --- Orders State ---
  const [searchOrder, setSearchOrder] = useState('');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending Verification' | 'Processing' | 'Delivered' | 'Refunded'>('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('All');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    return orders
      .filter((o) => {
        const matchQuery =
          !q ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.playerId.toLowerCase().includes(q) ||
          o.userEmail.toLowerCase().includes(q) ||
          (o.customerPhone || '').includes(q) ||
          (o.transactionId || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          (o.items?.[0]?.productTitle || '').toLowerCase().includes(q);
        const matchStatus = orderFilter === 'All' || o.fulfillmentStatus === orderFilter;
        const matchPayment = orderPaymentFilter === 'All' || o.paymentMethod === orderPaymentFilter;
        return matchQuery && matchStatus && matchPayment;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchOrder, orderFilter, orderPaymentFilter]);

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

  // Restrict access if not Admin
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-12 h-12 border-4 border-zenov-primary/30 border-t-zenov-primary rounded-full animate-spin" />
        <p className="text-sm text-zenov-text-secondary">Verifying admin privileges...</p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <ShieldCheck className="w-12 h-12 text-zenov-error opacity-60" />
        <h2 className="text-xl font-black text-zenov-text">Access Restricted</h2>
        <p className="text-sm text-zenov-text-secondary max-w-xs">
          You need admin privileges to view this page.
        </p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-zenov-primary text-white text-sm font-bold hover:bg-zenov-primary-hover transition-colors">
          Back to Store
        </Link>
      </div>
    );
  }

  // --- Products CRUD Actions ---
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get('title') as string;
    const category = (data.get('category') as string) || 'game-topup';
    const unitId = (data.get('unitId') as string) || undefined;
    const publisher = (data.get('publisher') as string) || '';
    const region = (data.get('region') as string) || 'Global';
    const deliveryType = (data.get('deliveryType') as any) || 'Instant';
    const description = (data.get('description') as string) || '';
    const instructions = (data.get('instructions') as string) || '';
    const playerIdLabel = (data.get('playerIdLabel') as string) || 'Player ID / Email';
    const image = (data.get('image') as string) || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600';
    const inStock = data.get('inStock') === 'true';
    const isHot = data.get('isHot') === 'true';
    const isNew = data.get('isNew') === 'true';

    const baseDenomAmount = parseFloat(data.get('price') as string) || 1.0;

    // Parse Tags
    const tagsRaw = (data.get('tags') as string) || '';
    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : ['Gaming', category];

    // Parse Steps
    const stepsRaw = (data.get('howToFindPlayerId') as string) || '';
    const howToFindPlayerId = stepsRaw ? stepsRaw.split('\n').map((s) => s.trim()).filter(Boolean) : [];

    // Parse Denominations from JSON (Builder) or textarea fallback
    let parsedDenoms: any[] = [];
    const denominationsJsonRaw = data.get('denominationsJson') as string;
    if (denominationsJsonRaw) {
      try {
        const jsonList = JSON.parse(denominationsJsonRaw);
        if (Array.isArray(jsonList) && jsonList.length > 0) {
          parsedDenoms = jsonList.map((item: any, idx: number) => ({
            id: item.id || `denom_${idx + 1}_${Date.now()}`,
            name: item.name || `Package ${idx + 1}`,
            amount: Number(item.amount) || baseDenomAmount,
            priceBDT: Number(item.priceBDT) || Math.round((Number(item.amount) || baseDenomAmount) * 120),
            bonus: item.bonus || undefined,
            popular: !!item.popular,
          }));
        }
      } catch (err) {
        console.error('Failed to parse denominationsJson:', err);
      }
    }

    if (parsedDenoms.length === 0) {
      const denomsRaw = (data.get('denominations') as string) || '';
      if (denomsRaw.trim()) {
        parsedDenoms = denomsRaw
          .split('\n')
          .map((line, idx) => {
            const parts = line.split(',').map((p) => p.trim());
            if (!parts[0]) return null;
            const name = parts[0];
            const amount = parseFloat(parts[1]) || baseDenomAmount;
            const priceBDT = parts[2] ? parseFloat(parts[2]) : Math.round(amount * 120);
            const bonus = parts[3] || undefined;
            return {
              id: `denom_${idx + 1}_${Date.now()}`,
              name,
              amount,
              priceBDT,
              bonus,
            };
          })
          .filter(Boolean);
      }
    }

    if (parsedDenoms.length === 0) {
      parsedDenoms = editingProduct?.denominations || [
        { id: `d1_${Date.now()}`, name: 'Standard Package', amount: baseDenomAmount, priceBDT: Math.round(baseDenomAmount * 120) },
        { id: `d2_${Date.now()}`, name: 'Pro Value Pack', amount: baseDenomAmount * 5, priceBDT: Math.round(baseDenomAmount * 5 * 120), bonus: '+15% BONUS' },
      ];
    }

    const baseProd = editingProduct || {
      id: `prod_${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
    };

    const newP: Product = {
      ...baseProd,
      title,
      category,
      unitId,
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
      tags,
      howToFindPlayerId,
      denominations: parsedDenoms,
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
      accent: 'from-zenov-success/15 to-zenov-success/5',
      iconColor: 'text-zenov-success',
    },
    {
      label: 'Fulfillment Queue',
      value: orders.length.toString(),
      delta: `${analyticsData.pendingOrders} Processing`,
      deltaUp: true,
      Icon: ShoppingBag,
      accent: 'from-zenov-primary/15 to-zenov-primary/5',
      iconColor: 'text-zenov-primary',
    },
    {
      label: 'SKU Inventory',
      value: products.length.toString(),
      delta: '100% Operational',
      deltaUp: true,
      Icon: Package,
      accent: 'from-zenov-accent/15 to-zenov-accent/5',
      iconColor: 'text-zenov-accent',
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

  const renderSidebarNav = (onItemClick?: () => void) => (
    <nav className="admin-sidebar-nav space-y-0.5">

      {/* ── OVERVIEW ── */}
      <button
        onClick={() => { setActiveTab('overview'); onItemClick?.(); }}
        className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          activeTab === 'overview'
            ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
            : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
        }`}
      >
        <TrendingUp className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Dashboard</span>
      </button>

      {/* ── CATALOG ── */}
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zenov-text-muted/50">Catalog</p>

      <div>
        <button
          onClick={() => { setActiveTab('products'); setOpenProductsMenu((prev) => !prev); }}
          className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
            activeTab === 'products'
              ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
              : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Products</span>
          {openProductsMenu ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
        </button>

        {openProductsMenu && (
          <div className="mt-1 ml-4 pl-3 border-l border-zenov-border/50 space-y-0.5">
            <button
              onClick={() => { setActiveTab('products'); setProductSubTab('products'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'products' && productSubTab === 'products'
                  ? 'bg-zenov-primary/10 text-zenov-primary font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5 shrink-0" /> SKU Products</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{products.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); setProductSubTab('categories'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'products' && productSubTab === 'categories'
                  ? 'bg-zenov-primary/10 text-zenov-primary font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 shrink-0" /> Categories</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{categories.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); setProductSubTab('units'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'products' && productSubTab === 'units'
                  ? 'bg-zenov-accent/10 text-zenov-accent font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 shrink-0" /> Units &amp; Variants</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{units.length}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── ORDERS ── */}
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zenov-text-muted/50">Orders</p>

      <div>
        <button
          onClick={() => { setActiveTab('orders'); setOpenOrdersMenu((prev) => !prev); }}
          className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
              : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
          }`}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Orders</span>
          {analyticsData.pendingOrders > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse mr-1">
              {analyticsData.pendingOrders}
            </span>
          )}
          {openOrdersMenu ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
        </button>

        {openOrdersMenu && (
          <div className="mt-1 ml-4 pl-3 border-l border-zenov-border/50 space-y-0.5">
            <button
              onClick={() => { setActiveTab('orders'); setOrderFilter('All'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'orders' && orderFilter === 'All'
                  ? 'bg-zenov-primary/10 text-zenov-primary font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 shrink-0" /> All Orders</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/20 text-blue-400 font-bold">{orders.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setOrderFilter('Processing'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'orders' && orderFilter === 'Processing'
                  ? 'bg-amber-500/10 text-amber-400 font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0" /> Pending</span>
              {analyticsData.pendingOrders > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold animate-pulse">{analyticsData.pendingOrders}</span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setOrderFilter('Delivered'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'orders' && orderFilter === 'Delivered'
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Delivered</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
                {orders.filter((o) => o.fulfillmentStatus === 'Delivered').length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ── COMMUNITY ── */}
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zenov-text-muted/50">Community</p>

      <button
        onClick={() => { setActiveTab('users'); onItemClick?.(); }}
        className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          activeTab === 'users'
            ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
            : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
        }`}
      >
        <Users className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Gamers</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{users.length}</span>
      </button>

      {/* ── CONTENT ── */}
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zenov-text-muted/50">Content</p>

      <div>
        <button
          onClick={() => { setActiveTab('cms'); setOpenCmsMenu((prev) => !prev); }}
          className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
            activeTab === 'cms'
              ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
              : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Content Manager</span>
          {openCmsMenu ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
        </button>

        {openCmsMenu && (
          <div className="mt-1 ml-4 pl-3 border-l border-zenov-border/50 space-y-0.5">
            <button
              onClick={() => { setActiveTab('cms'); setCmsSubTab('banners'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'cms' && cmsSubTab === 'banners'
                  ? 'bg-zenov-primary/10 text-zenov-primary font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><Bookmark className="w-3.5 h-3.5 shrink-0" /> Promo Banners</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{heroBanners.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('cms'); setCmsSubTab('blogs'); onItemClick?.(); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === 'cms' && cmsSubTab === 'blogs'
                  ? 'bg-zenov-primary/10 text-zenov-primary font-bold'
                  : 'text-zenov-text-muted hover:text-zenov-text hover:bg-zenov-surface/40'
              }`}
            >
              <span className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 shrink-0" /> Articles &amp; Blog</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{blogArticles.length}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── SUPPORT ── */}
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zenov-text-muted/50">Support</p>

      <button
        onClick={() => { setActiveTab('tickets'); onItemClick?.(); }}
        className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          activeTab === 'tickets'
            ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
            : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
        }`}
      >
        <Headphones className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Helpdesk</span>
        {tickets.length > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zenov-surface border border-zenov-border text-zenov-text-muted">{tickets.length}</span>
        )}
      </button>

      <button
        onClick={() => { setActiveTab('security'); onItemClick?.(); }}
        className={`admin-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          activeTab === 'security'
            ? 'active-item bg-zenov-primary/15 text-zenov-primary border-l-2 border-zenov-primary pl-[10px]'
            : 'text-zenov-text-secondary hover:bg-zenov-surface/60 hover:text-zenov-text'
        }`}
      >
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Security</span>
      </button>
    </nav>
  );

  return (
    <div className="admin-panel-wrapper min-h-screen bg-zenov-bg flex flex-col lg:flex-row text-zenov-text">
      {/* Admin Toast Notification */}
      {adminToast && (
        <AdminToast
          type={adminToast.type}
          message={adminToast.message}
          onDismiss={dismissAdminToast}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-panel-wrapper {
          line-height: 1.6;
        }
        .admin-panel-wrapper table td,
        .admin-panel-wrapper table th {
          letter-spacing: 0.01em;
        }
        .admin-sidebar-item {
          transition: all 0.15s ease;
        }
        .admin-sidebar-item:not(.active-item):hover {
          transform: translateX(2px);
        }
        .admin-sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(59,130,246,0.3);
          border-radius: 99px;
        }
      `}} />
      
      {/* 1. Mobile Header Bar */}
      <header className="lg:hidden w-full bg-zenov-card border-b border-zenov-border px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <ZenovLogo size="sm" isLink href="/" />
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary transition-all active:scale-95"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Mobile Collapsible Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />

          {/* Drawer Body */}
          <aside className="relative w-64 bg-zenov-card border-r border-zenov-border h-full flex flex-col z-10 overflow-hidden">
            {/* Drawer Header */}
            <div className="px-5 pt-5 pb-4 border-b border-zenov-border/60 bg-gradient-to-b from-zenov-primary/5 to-transparent shrink-0 flex items-center justify-between">
              <ZenovLogo size="sm" isLink href="/" />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-white hover:bg-zenov-error/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Nav */}
            <div className="flex-1 overflow-y-auto py-4 px-3 admin-sidebar-scroll">
              {renderSidebarNav(() => setIsSidebarOpen(false))}
            </div>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-zenov-border/60 bg-zenov-surface/20 shrink-0">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zenov-surface/60 border border-zenov-border/50">
                <img src={user.avatar} className="w-8 h-8 rounded-lg border border-zenov-border object-cover shrink-0" alt={user.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zenov-text truncate leading-none">{user.name}</p>
                  <p className="text-[9px] text-zenov-accent font-mono uppercase tracking-wider mt-1">{user.vipTier}</p>
                </div>
              </div>
              <Link href="/" className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zenov-surface hover:bg-zenov-primary/10 hover:text-zenov-primary border border-zenov-border text-[11px] font-semibold text-zenov-text-secondary transition-all">
                <ArrowLeft className="w-3 h-3" /> Back to Store
              </Link>
            </div>
          </aside>
        </div>
      )}


      {/* 3. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-zenov-card border-r border-zenov-border sticky top-0 h-screen shrink-0 z-20">
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-zenov-border/60 bg-gradient-to-b from-zenov-primary/5 to-transparent shrink-0">
          <ZenovLogo size="md" isLink href="/" />
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3 admin-sidebar-scroll">
          {renderSidebarNav()}
        </div>

        {/* Admin User Footer */}
        <div className="px-4 py-4 border-t border-zenov-border/60 bg-zenov-surface/20 shrink-0">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zenov-surface/60 border border-zenov-border/50">
            <img src={user.avatar} className="w-8 h-8 rounded-lg border border-zenov-border object-cover shrink-0" alt={user.name} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zenov-text truncate leading-none">{user.name}</p>
              <p className="text-[9px] text-zenov-accent font-mono uppercase tracking-wider mt-1">{user.vipTier}</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-zenov-primary/60 shrink-0" />
          </div>
          <Link
            href="/"
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zenov-surface hover:bg-zenov-primary/10 hover:text-zenov-primary border border-zenov-border text-[11px] font-semibold text-zenov-text-secondary transition-all"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* 4. Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Clean Admin Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zenov-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-zenov-primary-soft text-zenov-primary text-[10px] font-mono font-bold uppercase tracking-wider border border-zenov-primary-border/30">
                Zenov Root Control
              </span>
              <span className="text-[11px] text-zenov-success flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-zenov-success animate-pulse" /> Live Telemetry Stream
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zenov-text tracking-tight capitalize mt-1">
              {activeTab === 'overview' && '📊 Store Analytics & Revenue Control'}
              {activeTab === 'products' && '📦 SKU Product Catalogue & Inventory'}
              {activeTab === 'orders' && '⚡ Live Orders & Fulfillment Desk'}
              {activeTab === 'users' && '👥 Registered Gamers & VIP Accounts'}
              {activeTab === 'cms' && '📝 Content Management & Hero Banners'}
              {activeTab === 'tickets' && '💬 Customer Support & Helpdesk'}
              {activeTab === 'security' && '🛡️ Security, PCI-DSS & Webhooks'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zenov-card border border-zenov-border text-xs font-bold text-zenov-text-secondary shadow-sm">
              <span className="text-zenov-text-muted text-[10px] uppercase font-mono">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                className="bg-transparent text-zenov-primary font-mono font-bold text-xs outline-none cursor-pointer"
              >
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-zenov-surface hover:bg-zenov-primary hover:text-white border border-zenov-border text-xs font-bold text-zenov-text-secondary transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
          </div>
        </div>
        
        {/* Overview Analytics Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {kpiCards.map(({ label, value, delta, deltaUp, Icon, accent, iconColor }) => (
                <div
                  key={label}
                  className={`relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${accent} border border-zenov-border bg-zenov-card overflow-hidden transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted mb-1">
                        {label}
                      </div>
                      <div className="text-lg sm:text-2xl font-black tracking-tight text-zenov-text leading-tight truncate font-mono">
                        {value}
                      </div>
                      <div className="text-[11px] mt-1.5 inline-flex items-center gap-1 font-semibold text-zenov-success">
                        <TrendingUp className="w-3 h-3" /> {delta}
                      </div>
                    </div>
                    <div className={`w-9 h-9 shrink-0 rounded-xl bg-zenov-card border border-zenov-border flex items-center justify-center ${iconColor}`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-2xl p-4 sm:p-6 bg-zenov-card border border-zenov-border">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4">
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

              <div className="rounded-2xl p-4 sm:p-6 bg-zenov-card border border-zenov-border flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-1">
                  Category Spread
                </h3>
                <p className="text-xs text-zenov-text-muted mb-4">Catalog item categories</p>
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
                      <span className="text-zenov-text-secondary truncate">{c.name}</span>
                      <span className="ml-auto text-zenov-text-muted font-bold">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl p-4 sm:p-6 bg-zenov-card border border-zenov-border">
                <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text mb-4">
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

              <div className="rounded-2xl p-4 sm:p-6 bg-zenov-card border border-zenov-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zenov-text">
                    Recent Activity Queue
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[11px] font-bold text-zenov-primary hover:underline">
                    View fulfillment panel →
                  </button>
                </div>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-zenov-surface/40 border border-zenov-border">
                      <div className="w-8 h-8 rounded-lg bg-zenov-primary-soft flex items-center justify-center shrink-0 border border-zenov-primary-border/25">
                        <ShoppingBag className="w-4 h-4 text-zenov-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-zenov-text truncate">{o.orderNumber}</div>
                        <div className="text-[10px] text-zenov-text-muted truncate">{o.userEmail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-zenov-text font-mono">
                          {formatCurrency(o.totalUSD, selectedCurrency)}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${o.fulfillmentStatus === 'Delivered' ? 'bg-zenov-success-soft text-zenov-success' : 'bg-zenov-warning-soft text-zenov-warning'}`}>
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

        {/* Products Inventory & Management Tab */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* Products Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zenov-card border border-zenov-border overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setProductSubTab('products');
                  setEditingProduct(null);
                  setIsAddingProduct(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                  productSubTab === 'products'
                    ? 'bg-gradient-to-r from-zenov-primary to-blue-600 text-white shadow-md'
                    : 'text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-surface'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>SKU Products</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  productSubTab === 'products' ? 'bg-white/20 text-white' : 'bg-zenov-surface text-zenov-text-muted border border-zenov-border'
                }`}>
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProductSubTab('categories');
                  setEditingProduct(null);
                  setIsAddingProduct(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                  productSubTab === 'categories'
                    ? 'bg-gradient-to-r from-zenov-primary to-blue-600 text-white shadow-md'
                    : 'text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-surface'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Categories</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  productSubTab === 'categories' ? 'bg-white/20 text-white' : 'bg-zenov-surface text-zenov-text-muted border border-zenov-border'
                }`}>
                  {categories.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProductSubTab('units');
                  setEditingProduct(null);
                  setIsAddingProduct(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                  productSubTab === 'units'
                    ? 'bg-gradient-to-r from-zenov-accent to-orange-500 text-zenov-bg shadow-md'
                    : 'text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-surface'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Units & Variants</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  productSubTab === 'units' ? 'bg-black/20 text-zenov-bg' : 'bg-zenov-surface text-zenov-text-muted border border-zenov-border'
                }`}>
                  {units.length}
                </span>
              </button>
            </div>

            {/* View 1: Categories CRUD */}
            {productSubTab === 'categories' && <CategoryManager />}

            {/* View 2: Units & Variants CRUD */}
            {productSubTab === 'units' && <UnitManager />}

            {/* View 3: Products (SKUs) Management */}
            {productSubTab === 'products' && (
              <div className="space-y-4">
                {(isAddingProduct || editingProduct) ? (
                  <form onSubmit={handleSaveProduct} className="rounded-2xl p-5 sm:p-6 bg-zenov-card border border-zenov-primary-border/40 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-zenov-border pb-3">
                      <div>
                        <h3 className="text-sm font-black uppercase text-zenov-primary flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {editingProduct ? `Edit SKU Product: ${editingProduct.title}` : 'Create New SKU Product'}
                        </h3>
                        <p className="text-[11px] text-zenov-text-muted mt-0.5">
                          Set up catalog attributes, drag-and-drop imagery, and customizable package denominations.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                        className="p-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          Product Title *
                        </label>
                        <input
                          name="title"
                          defaultValue={editingProduct?.title || ''}
                          placeholder="e.g. Free Fire Diamonds / PUBG Mobile UC"
                          required
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text font-semibold focus:outline-none focus:border-zenov-primary-border"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted">
                            Category *
                          </label>
                          <button
                            type="button"
                            onClick={() => setProductSubTab('categories')}
                            className="text-[9px] font-bold text-zenov-primary hover:underline"
                          >
                            + Manage
                          </button>
                        </div>
                        <select
                          name="category"
                          defaultValue={editingProduct?.category || categories[0]?.slug || 'game-topup'}
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none focus:border-zenov-primary-border font-medium"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted">
                            Denomination Unit Type
                          </label>
                          <button
                            type="button"
                            onClick={() => setProductSubTab('units')}
                            className="text-[9px] font-bold text-zenov-accent hover:underline"
                          >
                            + Manage
                          </button>
                        </div>
                        <select
                          name="unitId"
                          defaultValue={editingProduct?.unitId || units[0]?.id || ''}
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none focus:border-zenov-primary-border font-medium"
                        >
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.symbol} {u.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          Publisher / Brand
                        </label>
                        <input
                          name="publisher"
                          defaultValue={editingProduct?.publisher || ''}
                          placeholder="e.g. Garena / Krafton / Valve / Apple"
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          Region / Availability
                        </label>
                        <input
                          name="region"
                          defaultValue={editingProduct?.region || 'Global'}
                          placeholder="e.g. Global / Bangladesh / US / Asia"
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          Fulfillment Delivery Speed
                        </label>
                        <select
                          name="deliveryType"
                          defaultValue={editingProduct?.deliveryType || 'Instant'}
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none"
                        >
                          <option value="Instant">Instant (Automated ≤30s)</option>
                          <option value="Manual (5-10 min)">Manual Dispatch (5-10m)</option>
                          <option value="Pre-Order">Pre-Order Queue</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          User Checkout Input Label
                        </label>
                        <input
                          name="playerIdLabel"
                          defaultValue={editingProduct?.playerIdLabel || 'Player ID / Email'}
                          placeholder="e.g. Player ID / UID or Character ID & Zone ID or Email Address"
                          className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Drag & Drop Product Image Upload */}
                    <div className="pt-1">
                      <ImageDropzone
                        initialValue={editingProduct?.image || ''}
                        name="image"
                        label="Product SKU Image (Drag & Drop or Direct URL)"
                      />
                    </div>

                    {/* Stock & Highlights Switches */}
                    <div className="flex gap-4 items-center pt-2 pb-1 flex-wrap bg-zenov-surface/40 p-3 rounded-xl border border-zenov-border/60">
                      <label className="flex items-center gap-2 text-xs text-zenov-text font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="inStock"
                          value="true"
                          defaultChecked={editingProduct ? editingProduct.inStock : true}
                          className="rounded accent-zenov-primary w-4 h-4"
                        />
                        In Stock (Available for Purchase)
                      </label>
                      <label className="flex items-center gap-2 text-xs text-amber-300 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="isHot"
                          value="true"
                          defaultChecked={editingProduct?.isHot || false}
                          className="rounded accent-amber-500 w-4 h-4"
                        />
                        🔥 Trending / Hot Highlight
                      </label>
                      <label className="flex items-center gap-2 text-xs text-blue-400 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="isNew"
                          value="true"
                          defaultChecked={editingProduct?.isNew || false}
                          className="rounded accent-blue-500 w-4 h-4"
                        />
                        ⚡ New Arrival Badge
                      </label>
                    </div>

                    {/* Interactive Packages & Denominations Builder */}
                    <div className="pt-1">
                      <DenominationsBuilder
                        initialDenominations={editingProduct?.denominations}
                      />
                    </div>

                    {/* Description and Delivery Guide */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          Product Description
                        </label>
                        <textarea
                          name="description"
                          defaultValue={editingProduct?.description || ''}
                          rows={3}
                          placeholder="Full product overview, redeem terms, and item details..."
                          className="w-full px-4 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none focus:border-zenov-primary-border"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                          Instructions / Delivery Guide
                        </label>
                        <textarea
                          name="instructions"
                          defaultValue={editingProduct?.instructions || ''}
                          rows={3}
                          placeholder="Customer instructions on how to receive or redeem the top-up..."
                          className="w-full px-4 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                        Steps to Find Player ID (1 Step per line)
                      </label>
                      <textarea
                        name="howToFindPlayerId"
                        rows={2}
                        defaultValue={editingProduct?.howToFindPlayerId ? editingProduct.howToFindPlayerId.join('\n') : 'Open the game on your mobile device\nTap your avatar in top left corner to view Player ID\nEnter your UID in the box to checkout'}
                        placeholder="Step 1: Open game profile\nStep 2: Copy your Player UID"
                        className="w-full px-4 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">
                        Search Keywords & Tags (Comma-separated)
                      </label>
                      <input
                        name="tags"
                        defaultValue={editingProduct?.tags ? editingProduct.tags.join(', ') : ''}
                        placeholder="e.g. Free Fire, Diamond, Topup, Garena, BD Topup"
                        className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-zenov-border">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-zenov-primary to-blue-600 text-white text-xs font-black uppercase tracking-wide hover:brightness-110 active:scale-95 shadow-md transition-all"
                      >
                        {editingProduct ? 'Save Changes' : 'Publish Product'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                        className="px-5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs font-bold text-zenov-text-secondary hover:text-zenov-text transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenov-card border border-zenov-border focus-within:border-zenov-primary-border">
                        <Search className="w-[18px] h-[18px] text-zenov-text-muted shrink-0" />
                        <input
                          value={searchProd}
                          onChange={(e) => setSearchProd(e.target.value)}
                          placeholder="Search SKU inventories..."
                          className="w-full min-w-0 bg-transparent text-sm text-zenov-text focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => setIsAddingProduct(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zenov-accent to-orange-500 text-zenov-bg text-sm font-black uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                      >
                        <Plus className="w-[18px] h-[18px]" /> Create SKU
                      </button>
                    </div>

                {/* Products Table (Desktop View) */}
                <div className="hidden md:block rounded-2xl overflow-hidden bg-zenov-card border border-zenov-border">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted bg-zenov-surface/70 border-b border-zenov-border">
                        <th className="p-4">SKU Product</th>
                        <th className="p-4 hidden lg:table-cell">Category</th>
                        <th className="p-4">Stock Status</th>
                        <th className="p-4 text-right">Base Amount</th>
                        <th className="p-4 text-right w-[110px]">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zenov-border/40">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zenov-surface/30 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-zenov-surface border border-zenov-border" alt="" />
                            <div className="min-w-0">
                              <p className="font-bold text-zenov-text truncate">{p.title}</p>
                              <p className="text-[10px] text-zenov-text-muted">ID: {p.id}</p>
                            </div>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zenov-primary-soft text-zenov-primary border border-zenov-primary-border/20">
                              {p.category.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            {p.inStock ? (
                              <span className="text-[11px] font-bold text-zenov-success flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> In-Stock
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-zenov-error flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Out-of-Stock
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-black font-mono text-zenov-primary text-sm">
                            {formatCurrency(p.denominations?.[0]?.amount || 0, selectedCurrency)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-1">
                              <button onClick={() => setEditingProduct(p)} className="p-1.5 rounded-lg bg-zenov-surface hover:bg-zenov-primary hover:text-white border border-zenov-border transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg bg-zenov-error-soft/30 hover:bg-zenov-error hover:text-white border border-zenov-error/20 text-zenov-error transition-all">
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
                    <div key={p.id} className="p-4 rounded-2xl bg-zenov-card border border-zenov-border flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-zenov-border" alt="" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-zenov-text text-sm truncate leading-snug">{p.title}</p>
                          <p className="text-[10px] text-zenov-text-muted mt-0.5">ID: {p.id}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-zenov-primary-soft text-zenov-primary border border-zenov-primary-border/20">
                            {p.category.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-zenov-text-muted uppercase">Base Price</p>
                          <p className="font-mono font-black text-zenov-primary text-sm mt-0.5">
                            {formatCurrency(p.denominations?.[0]?.amount || 0, selectedCurrency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-zenov-border/40 pt-2.5 mt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${p.inStock ? 'text-zenov-success' : 'text-zenov-error'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-zenov-success animate-pulse' : 'bg-zenov-error'}`} />
                            {p.inStock ? 'In Stock' : 'Out'}
                          </span>
                          {p.isHot && <span className="px-1.5 py-0.2 rounded bg-zenov-accent-soft text-zenov-accent text-[8px] font-bold uppercase border border-zenov-accent-border/20">Hot</span>}
                          {p.isNew && <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase border border-blue-500/20">New</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditingProduct(p)} className="p-2 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary hover:border-zenov-primary-border transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-xl bg-zenov-error-soft/30 border border-zenov-error/20 text-zenov-error hover:bg-zenov-error hover:text-white transition-all">
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
      </div>
    )}

        {/* Live Orders Fulfillment Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-zenov-card border border-zenov-border/80 shadow-md">
                <div className="flex items-center justify-between text-zenov-text-muted mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-zenov-primary" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-zenov-text">{orders.length}</span>
                  <span className="text-[10px] text-zenov-text-muted font-semibold">Lifetime</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zenov-card border border-sky-500/30 bg-gradient-to-br from-sky-500/5 to-transparent shadow-md">
                <div className="flex items-center justify-between text-sky-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
                  <AlertTriangle className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-sky-400">
                    {orders.filter((o) => o.fulfillmentStatus === 'Pending Verification').length}
                  </span>
                  <span className="text-[10px] text-sky-300/80 font-semibold">Verify Payment</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zenov-card border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent shadow-md">
                <div className="flex items-center justify-between text-amber-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">In Processing</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {orders.filter((o) => o.fulfillmentStatus === 'Processing').length}
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-semibold">Delivering</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zenov-card border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-md">
                <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Completed Value</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {formatCurrency(
                      orders
                        .filter((o) => o.fulfillmentStatus === 'Delivered')
                        .reduce((acc, o) => acc + o.totalUSD, 0),
                      selectedCurrency
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Action Controls Bar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-zenov-card border border-zenov-border space-y-3.5 shadow-lg">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search input */}
                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border focus-within:border-zenov-primary focus-within:ring-1 focus-within:ring-zenov-primary/30 transition-all">
                  <Search className="w-4 h-4 text-zenov-text-muted shrink-0" />
                  <input
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    placeholder="Search by Order #, Name, Email, Phone, UID, TrxID, Product..."
                    className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-zenov-text focus:outline-none placeholder:text-zenov-text-muted/60"
                  />
                  {searchOrder && (
                    <button
                      onClick={() => setSearchOrder('')}
                      className="p-1 rounded text-zenov-text-muted hover:text-zenov-text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Gateway Dropdown, Refresh & Create Order Button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs font-semibold text-zenov-text focus:border-zenov-primary focus:outline-none"
                  >
                    <option value="All">All Gateways</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Crypto/USDT">Crypto / USDT</option>
                    <option value="Zenov Wallet">Zenov Wallet</option>
                  </select>

                  <button
                    onClick={async () => {
                      setIsRefreshingOrders(true);
                      try {
                        await refreshOrders();
                      } finally {
                        setTimeout(() => setIsRefreshingOrders(false), 600);
                      }
                    }}
                    disabled={isRefreshingOrders}
                    className="p-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary hover:border-zenov-primary transition-all active:scale-95 disabled:opacity-50"
                    title="Refresh orders from database"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingOrders ? 'animate-spin text-zenov-primary' : ''}`} />
                  </button>

                  <button
                    onClick={() => setIsCreateOrderOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-zenov-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Order</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-zenov-border/60 pt-3">
                {[
                  { key: 'All', label: 'All Orders', count: orders.length },
                  {
                    key: 'Pending Verification',
                    label: 'Pending Verification',
                    count: orders.filter((o) => o.fulfillmentStatus === 'Pending Verification').length,
                    badgeColor: 'bg-sky-500/20 text-sky-300',
                  },
                  {
                    key: 'Processing',
                    label: 'Processing',
                    count: orders.filter((o) => o.fulfillmentStatus === 'Processing').length,
                    badgeColor: 'bg-amber-500/20 text-amber-300',
                  },
                  {
                    key: 'Delivered',
                    label: 'Delivered',
                    count: orders.filter((o) => o.fulfillmentStatus === 'Delivered').length,
                    badgeColor: 'bg-emerald-500/20 text-emerald-300',
                  },
                  {
                    key: 'Refunded',
                    label: 'Refunded',
                    count: orders.filter((o) => o.fulfillmentStatus === 'Refunded').length,
                    badgeColor: 'bg-red-500/20 text-red-300',
                  },
                ].map((tab) => {
                  const isSelected = orderFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setOrderFilter(tab.key as any)}
                      className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-zenov-primary text-white shadow-sm'
                          : 'bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-text hover:bg-zenov-surface/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : tab.badgeColor || 'bg-zenov-border text-zenov-text-muted'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders Table (Desktop View) */}
            <div className="hidden lg:block rounded-2xl overflow-hidden bg-zenov-card border border-zenov-border shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted bg-zenov-surface/80 border-b border-zenov-border">
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Game & Player UID</th>
                      <th className="p-4">Payment & TrxID</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zenov-border/40">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-zenov-text-muted">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-bold text-zenov-text">No orders found</p>
                          <p className="text-xs text-zenov-text-secondary mt-1">
                            {searchOrder || orderFilter !== 'All'
                              ? 'Try adjusting your search query or filters.'
                              : 'Orders placed by customers and guests will appear here live.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const isGuest = o.userId === 'guest' || !o.userId || o.userId === '';
                        return (
                          <tr
                            key={o.id}
                            onClick={() => setSelectedOrderForDetails(o)}
                            className="hover:bg-zenov-surface/40 transition-colors cursor-pointer group"
                          >
                            {/* 1. Order ID & Date */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zenov-text font-mono text-xs">
                                  {o.orderNumber}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(o.orderNumber);
                                    setCopiedKey(`ord_${o.id}`);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="p-1 rounded hover:bg-zenov-surface text-zenov-text-muted hover:text-zenov-text transition-all"
                                  title="Copy Order #"
                                >
                                  {copiedKey === `ord_${o.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[10px] text-zenov-text-muted mt-0.5">
                                {new Date(o.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="mt-1.5">
                                {isGuest ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                    👤 GUEST
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-300">
                                    👑 MEMBER
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 2. Customer */}
                            <td className="p-4 max-w-[200px]">
                              <div className="text-xs font-bold text-zenov-text truncate">
                                {o.customerName || (isGuest ? 'Guest Gamer' : 'Customer')}
                              </div>
                              <div className="text-[10px] text-zenov-primary truncate mt-0.5">
                                {o.userEmail}
                              </div>
                              {o.customerPhone && (
                                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold mt-1">
                                  <span>📞 {o.customerPhone}</span>
                                </div>
                              )}
                            </td>

                            {/* 3. Product & UID */}
                            <td className="p-4 max-w-[240px]">
                              <div className="flex items-center gap-2.5">
                                {o.items[0]?.productImage && (
                                  <img
                                    src={o.items[0]?.productImage}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover bg-zenov-surface shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-zenov-text text-xs leading-snug truncate">
                                    {o.items[0]?.productTitle || 'Top Up Package'}
                                  </p>
                                  <p className="text-[10px] text-zenov-text-secondary truncate">
                                    {o.items[0]?.denomination?.name} (Qty {o.items[0]?.quantity || 1})
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1.5 flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded bg-zenov-surface border border-zenov-border font-mono text-[11px] font-bold text-zenov-text truncate max-w-[160px]">
                                  🎮 {o.playerId}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(o.playerId);
                                    setCopiedKey(`uid_${o.id}`);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="p-1 rounded hover:bg-zenov-surface text-zenov-text-muted hover:text-zenov-text transition-all"
                                  title="Copy Player UID"
                                >
                                  {copiedKey === `uid_${o.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-60" />
                                  )}
                                </button>
                              </div>
                              {o.serverId && (
                                <p className="text-[9px] font-mono text-zenov-text-muted mt-0.5">
                                  Zone: {o.serverId}
                                </p>
                              )}
                            </td>

                            {/* 4. Payment & TrxID */}
                            <td className="p-4 max-w-[200px]">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-zenov-surface border border-zenov-border font-bold text-xs text-zenov-text">
                                  {o.paymentMethod}
                                </span>
                              </div>
                              {o.senderNumber && (
                                <p className="text-[10px] font-mono text-amber-400 mt-1">
                                  Sender: <span className="font-bold">{o.senderNumber}</span>
                                </p>
                              )}
                              {o.transactionId && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-[10px] font-bold truncate max-w-[140px]">
                                    TX: {o.transactionId}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(o.transactionId);
                                      setCopiedKey(`tx_${o.id}`);
                                      setTimeout(() => setCopiedKey(null), 2000);
                                    }}
                                    className="p-1 rounded hover:bg-zenov-surface text-zenov-text-muted hover:text-zenov-text transition-all"
                                    title="Copy TrxID"
                                  >
                                    {copiedKey === `tx_${o.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 opacity-60" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* 5. Amount */}
                            <td className="p-4 text-right">
                              <p className="font-black font-mono text-sm text-zenov-success">
                                {formatCurrency(o.totalUSD, o.currency as any)}
                              </p>
                              <p className="text-[10px] font-mono text-zenov-text-muted mt-0.5">
                                ৳{o.paidAmountCurrency || Math.round(o.totalUSD * 120)}
                              </p>
                            </td>

                            {/* 6. Status */}
                            <td className="p-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                  o.fulfillmentStatus === 'Delivered'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : o.fulfillmentStatus === 'Pending Verification'
                                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 animate-pulse'
                                      : o.fulfillmentStatus === 'Processing'
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                        : 'bg-red-500/15 text-red-400 border-red-500/30'
                                }`}
                              >
                                {o.fulfillmentStatus}
                              </span>
                              <div className="text-[9px] font-medium text-zenov-text-muted mt-1 uppercase">
                                Payment: <span className="font-bold">{o.paymentStatus}</span>
                              </div>
                            </td>

                            {/* 7. Actions */}
                            <td className="p-4 text-right">
                              <div
                                className="inline-flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {o.fulfillmentStatus !== 'Delivered' && (
                                  <button
                                    onClick={() => updateOrderStatus(o.id, 'Delivered', 'Paid')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all flex items-center gap-1 active:scale-95"
                                    title="Approve & Deliver"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => setSelectedOrderForDetails(o)}
                                  className="p-1.5 rounded-lg bg-zenov-surface border border-zenov-border hover:border-zenov-primary text-zenov-text-muted hover:text-zenov-text transition-all"
                                  title="View Full Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {o.fulfillmentStatus !== 'Refunded' && (
                                  <button
                                    onClick={() => updateOrderStatus(o.id, 'Refunded', 'Failed')}
                                    className="p-1.5 rounded-lg bg-zenov-surface border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                                    title="Reject / Refund"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Cards (Mobile / Tablet View) */}
            <div className="grid grid-cols-1 gap-3.5 lg:hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zenov-card border border-zenov-border text-center text-zenov-text-muted">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold text-zenov-text">No orders found</p>
                </div>
              ) : (
                filteredOrders.map((o) => {
                  const isGuest = o.userId === 'guest' || !o.userId || o.userId === '';
                  return (
                    <div
                      key={o.id}
                      className="p-4 rounded-2xl bg-zenov-card border border-zenov-border flex flex-col gap-3 shadow-lg"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-zenov-primary">
                              {o.orderNumber}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(o.orderNumber);
                                setCopiedKey(`ord_m_${o.id}`);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="p-1 text-zenov-text-muted hover:text-zenov-text"
                            >
                              {copiedKey === `ord_m_${o.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            {isGuest ? (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                GUEST
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-300">
                                MEMBER
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zenov-text-muted mt-0.5">
                            {new Date(o.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                            o.fulfillmentStatus === 'Delivered'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : o.fulfillmentStatus === 'Pending Verification'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                                : o.fulfillmentStatus === 'Processing'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {o.fulfillmentStatus}
                        </span>
                      </div>

                      {/* Content Box */}
                      <div className="bg-zenov-surface/50 p-3 rounded-xl space-y-2 text-xs border border-zenov-border/40">
                        <div className="flex justify-between items-center">
                          <span className="text-zenov-text-muted">Customer:</span>
                          <span className="text-zenov-text font-bold">
                            {o.customerName || (isGuest ? 'Guest Gamer' : 'Customer')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zenov-text-muted">Email:</span>
                          <span className="font-mono text-zenov-primary truncate max-w-[180px]">
                            {o.userEmail}
                          </span>
                        </div>
                        {o.customerPhone && (
                          <div className="flex justify-between items-center">
                            <span className="text-zenov-text-muted">Phone:</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              {o.customerPhone}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-zenov-text-muted">Destination UID:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-zenov-text font-black">{o.playerId}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(o.playerId);
                                setCopiedKey(`uid_m_${o.id}`);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="p-1 text-zenov-text-muted hover:text-zenov-text"
                            >
                              {copiedKey === `uid_m_${o.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zenov-text-muted">Package:</span>
                          <span className="text-zenov-text text-right font-bold truncate max-w-[180px]">
                            {o.items[0]?.productTitle} ({o.items[0]?.denomination?.name})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zenov-text-muted">Gateway / TrxID:</span>
                          <div className="text-right">
                            <span className="text-zenov-text font-bold">{o.paymentMethod}</span>
                            {o.transactionId && (
                              <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-sky-400 font-bold">
                                <span>{o.transactionId}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(o.transactionId);
                                    setCopiedKey(`tx_m_${o.id}`);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="p-0.5"
                                >
                                  {copiedKey === `tx_m_${o.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-60" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between border-t border-zenov-border/40 pt-2 mt-2 text-zenov-text">
                          <span className="font-bold">Total Amount:</span>
                          <span className="font-black font-mono text-zenov-success text-sm">
                            {formatCurrency(o.totalUSD, o.currency as any)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-0.5">
                        {o.fulfillmentStatus !== 'Delivered' && (
                          <button
                            onClick={() => updateOrderStatus(o.id, 'Delivered', 'Paid')}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-sm transition-all flex-1 text-center flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForDetails(o)}
                          className="px-3 py-2 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text font-bold text-xs uppercase transition-all flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        {o.fulfillmentStatus !== 'Refunded' && (
                          <button
                            onClick={() => updateOrderStatus(o.id, 'Refunded', 'Failed')}
                            className="px-3 py-2 rounded-xl bg-zenov-surface border border-red-500/40 text-red-400 font-bold text-xs uppercase transition-all"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenov-card border border-zenov-border focus-within:border-zenov-primary-border">
                <Search className="w-[18px] h-[18px] text-zenov-text-muted shrink-0" />
                <input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search registered gamers by name, email, VIP tiers..."
                  className="w-full min-w-0 bg-transparent text-sm text-zenov-text focus:outline-none"
                />
              </div>
            </div>

            {editingUser && (
              <form onSubmit={handleSaveUser} className="rounded-2xl p-5 sm:p-6 bg-zenov-card border border-zenov-accent-border/30 space-y-4 max-w-xl">
                <h4 className="text-sm font-black uppercase text-zenov-accent">Edit Gamer Account Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">Gamer Name</label>
                    <input name="name" defaultValue={editingUser.name} required className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">E-mail Address</label>
                    <input name="email" type="email" defaultValue={editingUser.email} required className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">Access Role</label>
                    <select name="role" defaultValue={editingUser.role} className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none">
                      <option value="user">User Role</option>
                      <option value="admin">Administrator Root</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">VIP Club Rank</label>
                    <select name="vipTier" defaultValue={editingUser.vipTier} className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none">
                      <option value="Bronze">Bronze (Tier 1)</option>
                      <option value="Silver">Silver (Tier 2)</option>
                      <option value="Gold">Gold (Tier 3)</option>
                      <option value="Cyber Elite">Cyber Elite (Tier 4)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-zenov-accent text-zenov-bg text-xs font-bold uppercase hover:brightness-110">
                    Save Account
                  </button>
                  <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs font-bold text-zenov-text-secondary hover:text-zenov-text">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {walletAdjustUser && (
              <form onSubmit={handleWalletAdjustSubmit} className="rounded-2xl p-5 sm:p-6 bg-zenov-card border border-zenov-primary-border/30 space-y-4 max-w-xl">
                <h4 className="text-sm font-black uppercase text-zenov-primary">Adjust Wallet Float: {walletAdjustUser.name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">Type of operation</label>
                    <select value={walletType} onChange={(e: any) => setWalletType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none">
                      <option value="deposit">Deposit (Load balance)</option>
                      <option value="deduction">Deduction (Debit balance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">Amount to adjust (USD)</label>
                    <input type="number" step="0.01" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} required placeholder="e.g. 50.00" className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1">Operation Memo / Reference Note</label>
                  <input value={walletRef} onChange={(e) => setWalletRef(e.target.value)} placeholder="e.g. Admin reward credits" className="w-full px-3 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-zenov-primary text-white text-xs font-bold uppercase hover:brightness-110">
                    Submit Adjustment
                  </button>
                  <button type="button" onClick={() => setWalletAdjustUser(null)} className="px-5 py-2.5 rounded-xl bg-zenov-surface border border-zenov-border text-xs font-bold text-zenov-text-secondary hover:text-zenov-text">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Users Table (Desktop View) */}
            <div className="hidden md:block rounded-2xl overflow-hidden bg-zenov-card border border-zenov-border">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-zenov-text-muted bg-zenov-surface/70 border-b border-zenov-border">
                    <th className="p-4">Account Gamer</th>
                    <th className="p-4">System Role</th>
                    <th className="p-4">VIP Club Rank</th>
                    <th className="p-4 text-right">Wallet Balance</th>
                    <th className="p-4 text-right w-[180px]">Wallet & Edit control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zenov-border/40">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zenov-surface/30">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatar} className="w-9 h-9 rounded-full object-cover bg-zenov-surface border border-zenov-border" alt="" />
                        <div className="min-w-0">
                          <p className="font-bold text-zenov-text truncate">{u.name}</p>
                          <p className="text-[10px] text-zenov-text-muted truncate">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-zenov-error-soft text-zenov-error border border-zenov-error/20' : 'bg-slate-500/10 text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border/30">
                          {u.vipTier}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-sm text-zenov-primary">
                        {formatCurrency(u.walletBalanceUSD, selectedCurrency)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button onClick={() => setWalletAdjustUser(u)} className="px-2.5 py-1.5 rounded-lg bg-zenov-primary-soft/30 hover:bg-zenov-primary hover:text-white border border-zenov-primary-border/25 text-zenov-primary font-bold text-[10px] uppercase flex items-center gap-1 transition-all">
                            <Coins className="w-3 h-3" /> Ledger
                          </button>
                          <button onClick={() => setEditingUser(u)} className="p-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-accent hover:border-zenov-accent-border transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== user.id && (
                            <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg bg-zenov-error-soft/30 hover:bg-zenov-error hover:text-white text-zenov-error border border-zenov-error/20 transition-all">
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
                <div key={u.id} className="p-4 rounded-2xl bg-zenov-card border border-zenov-border flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-zenov-border bg-zenov-surface shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zenov-text text-sm truncate leading-none">{u.name}</p>
                      <p className="text-[10px] text-zenov-text-muted truncate mt-1 leading-none">{u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${u.role === 'admin' ? 'bg-zenov-error-soft text-zenov-error border border-zenov-error/20' : 'bg-slate-500/10 text-slate-300'}`}>
                      {u.role}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-b border-zenov-border/40 py-2.5 my-0.5 text-xs">
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border/30 tracking-wider">
                      VIP: {u.vipTier}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-zenov-text-muted">Balance: </span>
                      <span className="font-mono font-black text-zenov-primary text-sm">{formatCurrency(u.walletBalanceUSD, selectedCurrency)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-0.5">
                    <button onClick={() => setWalletAdjustUser(u)} className="px-3.5 py-2 rounded-xl bg-zenov-primary-soft/40 hover:bg-zenov-primary hover:text-white border border-zenov-primary-border/25 text-zenov-primary font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 flex-1 transition-all">
                      <Coins className="w-3.5 h-3.5" /> Adjust Balance
                    </button>
                    <button onClick={() => setEditingUser(u)} className="p-2 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-accent hover:border-zenov-accent-border transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== user.id && (
                      <button onClick={() => deleteUser(u.id)} className="p-2 rounded-xl bg-zenov-error-soft/30 border border-zenov-error/20 text-zenov-error hover:bg-zenov-error hover:text-white transition-all">
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
            <div className="p-1 rounded-2xl bg-zenov-surface border border-zenov-border inline-flex gap-1">
              <button onClick={() => setCmsSubTab('banners')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${cmsSubTab === 'banners' ? 'bg-zenov-card text-zenov-primary shadow-sm border border-zenov-border' : 'text-zenov-text-secondary hover:text-zenov-text'}`}>
                Homepage Banners
              </button>
              <button onClick={() => setCmsSubTab('blogs')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${cmsSubTab === 'blogs' ? 'bg-zenov-card text-zenov-primary shadow-sm border border-zenov-border' : 'text-zenov-text-secondary hover:text-zenov-text'}`}>
                Blog Posts
              </button>
            </div>

            {cmsSubTab === 'banners' && (
              <div className="space-y-4">
                {(isAddingBanner || editingBanner) ? (
                  <form onSubmit={handleSaveBanner} className="rounded-2xl p-5 bg-zenov-card border border-zenov-primary-border/20 space-y-4">
                    <h4 className="text-sm font-black uppercase text-zenov-primary">{editingBanner ? `Edit Carousel: ${editingBanner.title}` : '+ Add Homepage banner'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Banner Title</label>
                        <input name="title" defaultValue={editingBanner?.title || ''} required className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Sub-title details</label>
                        <input name="subtitle" defaultValue={editingBanner?.subtitle || ''} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Banner Badge Tag</label>
                        <input name="badge" defaultValue={editingBanner?.badge || 'OFFICIAL RESELLER'} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Gradation color theme</label>
                        <select name="bgGradient" defaultValue={editingBanner?.bgGradient || GRADIENT_THEMES[0].value} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs">
                          {GRADIENT_THEMES.map((theme) => (
                            <option key={theme.value} value={theme.value}>{theme.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Link Target (Product ID)</label>
                        <input name="gameId" defaultValue={editingBanner?.gameId || 'google-play-gift-card'} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Action CTA Button Text</label>
                        <input name="ctaText" defaultValue={editingBanner?.ctaText || 'RECHARGE NOW'} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Graphic URL (Unsplash/Imgur)</label>
                      <input name="image" defaultValue={editingBanner?.image || ''} required placeholder="https://..." className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-5 py-2 rounded-xl bg-zenov-primary text-white text-xs font-bold uppercase">Save Banner</button>
                      <button type="button" onClick={() => { setEditingBanner(null); setIsAddingBanner(false); }} className="px-5 py-2 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-zenov-text-muted">Home Carousel Cards ({heroBanners.length})</h4>
                      <button onClick={() => setIsAddingBanner(true)} className="px-4 py-2.5 bg-zenov-primary text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1 active:scale-95 shadow-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Add banner
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {heroBanners.map((b) => (
                        <div key={b.id} className="rounded-2xl border border-zenov-border bg-zenov-card overflow-hidden flex flex-col justify-between">
                          <div className="p-4 space-y-2">
                            <div className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold text-center bg-gradient-to-r ${b.bgGradient} text-white`}>
                              {b.badge || 'TAG'}
                            </div>
                            <h5 className="font-bold text-zenov-text leading-tight text-sm uppercase">{b.title}</h5>
                            <p className="text-xs text-zenov-text-secondary leading-snug line-clamp-2">{b.subtitle}</p>
                            <div className="text-[10px] text-zenov-accent font-semibold">Targets: {b.gameId}</div>
                          </div>
                          <div className="p-4 border-t border-zenov-border bg-zenov-surface/40 flex justify-between gap-2">
                            <button onClick={() => setEditingBanner(b)} className="px-3 py-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-xs text-zenov-text-secondary hover:text-zenov-primary flex items-center gap-1 transition-colors">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => deleteBanner(b.id)} className="px-3 py-1.5 rounded-lg bg-zenov-error-soft/30 text-zenov-error hover:bg-zenov-error hover:text-white border border-zenov-error/20 text-xs flex items-center gap-1 transition-all">
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
                  <form onSubmit={handleSaveBlog} className="rounded-2xl p-5 bg-zenov-card border border-zenov-primary-border/20 space-y-4">
                    <h4 className="text-sm font-black uppercase text-zenov-primary">{editingBlog ? `Edit Blog: ${editingBlog.title}` : '+ Author New Blog Article'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Article Title</label>
                        <input name="title" defaultValue={editingBlog?.title || ''} required className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Author Name</label>
                        <input name="author" defaultValue={editingBlog?.author || 'ZENOV Staff'} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Topic Category</label>
                        <input name="category" defaultValue={editingBlog?.category || 'Guides'} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Read Time text</label>
                        <input name="readTime" defaultValue={editingBlog?.readTime || '3 min read'} className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Tags (Comma-separated)</label>
                        <input name="tags" defaultValue={editingBlog?.tags?.join(', ') || ''} placeholder="Free Fire, Diamonds, Event" className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1">Image URL</label>
                        <input name="image" defaultValue={editingBlog?.image || ''} required placeholder="https://..." className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Blog Excerpt (Brief description)</label>
                      <input name="excerpt" defaultValue={editingBlog?.excerpt || ''} required className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Main Article Content</label>
                      <textarea name="content" defaultValue={editingBlog?.content || ''} rows={6} required placeholder="Write markdown content..." className="w-full px-3 py-2 bg-zenov-surface border border-zenov-border rounded-lg text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-5 py-2 rounded-xl bg-zenov-primary text-white text-xs font-bold uppercase">Publish Blog</button>
                      <button type="button" onClick={() => { setEditingBlog(null); setIsAddingBlog(false); }} className="px-5 py-2 rounded-xl bg-zenov-surface border border-zenov-border text-xs text-zenov-text-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-zenov-text-muted">Active Blog Articles ({blogArticles.length})</h4>
                      <button onClick={() => setIsAddingBlog(true)} className="px-4 py-2.5 bg-zenov-primary text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1 active:scale-95 shadow-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Author Article
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {blogArticles.map((b) => (
                        <div key={b.id} className="rounded-2xl border border-zenov-border bg-zenov-card overflow-hidden flex flex-col justify-between p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={b.image} className="w-12 h-12 rounded-lg object-cover border border-zenov-border" alt="" />
                            <div className="min-w-0">
                              <span className="px-2 py-0.2 rounded bg-zenov-accent-soft text-zenov-accent text-[9px] uppercase font-bold border border-zenov-accent-border/30">
                                {b.category}
                              </span>
                              <h5 className="font-bold text-zenov-text leading-tight text-sm mt-1">{b.title}</h5>
                            </div>
                          </div>
                          <p className="text-xs text-zenov-text-secondary leading-snug line-clamp-2">{b.excerpt}</p>
                          <div className="flex items-center justify-between text-[10px] text-zenov-text-muted">
                            <span>By {b.author} • {b.readTime}</span>
                            <span>{b.date}</span>
                          </div>
                          <div className="pt-2 border-t border-zenov-border flex justify-end gap-2">
                            <button onClick={() => setEditingBlog(b)} className="px-3 py-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-xs text-zenov-text-secondary hover:text-zenov-primary flex items-center gap-1">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => deleteBlog(b.id)} className="px-3 py-1.5 rounded-lg bg-zenov-error-soft/30 text-zenov-error hover:bg-zenov-error hover:text-white border border-zenov-error/20 text-xs flex items-center gap-1">
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
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zenov-card border border-zenov-border">
                <Search className="w-4 h-4 text-zenov-text-muted shrink-0" />
                <input
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search ticket number or subject..."
                  className="w-full bg-transparent text-xs text-zenov-text focus:outline-none"
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
                          ? 'bg-zenov-primary-soft/60 border-zenov-primary-border ring-1 ring-zenov-primary-border/30 shadow-sm'
                          : 'bg-zenov-card border-zenov-border hover:border-zenov-border-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-zenov-primary">{t.ticketNumber}</span>
                        <span className={`px-2 py-0.2 rounded text-[9px] uppercase font-bold tracking-wide border ${
                          t.status === 'Open'
                            ? 'bg-zenov-primary-soft text-zenov-primary border-zenov-primary-border/20'
                            : t.status === 'In Progress'
                              ? 'bg-zenov-warning-soft text-zenov-warning border-zenov-warning/20'
                              : 'bg-zenov-success-soft text-zenov-success border-zenov-success/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="font-black text-xs text-zenov-text truncate w-full">{t.subject}</div>
                      <div className="flex justify-between items-center text-[10px] text-zenov-text-muted mt-1">
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
                <div className="rounded-2xl border border-zenov-border bg-zenov-card flex flex-col h-[520px] lg:h-[560px]">
                  {/* Chat header panel */}
                  <div className="p-4 border-b border-zenov-border bg-zenov-surface/50 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {/* Back button on mobile view */}
                      <button
                        onClick={() => {
                          setActiveTicketId(null);
                          setIsViewingChat(false);
                        }}
                        className="lg:hidden p-2 rounded-xl bg-zenov-surface border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary transition-all active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-black text-sm text-zenov-text flex items-center gap-1.5">
                          <span>{activeTicket.ticketNumber}</span>
                          <span className="text-zenov-text-muted font-normal">•</span>
                          <span className="text-xs text-zenov-text-secondary">{activeTicket.subject}</span>
                        </h4>
                        <p className="text-[10px] text-zenov-text-muted mt-0.5">
                          Client: <span className="font-semibold text-zenov-primary">{activeTicket.userEmail}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={activeTicket.status}
                        onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value as any)}
                        className="px-2 py-1 rounded bg-zenov-card border border-zenov-border text-[11px] font-bold uppercase text-zenov-text focus:outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zenov-surface/20">
                    {activeTicket.messages.map((msg) => {
                      const isSupport = msg.sender === 'support';
                      const isAi = msg.sender === 'ai';
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-1 ${
                            isSupport
                              ? 'ml-auto bg-zenov-primary text-white'
                              : isAi
                                ? 'mr-auto bg-zenov-card border border-zenov-accent-border/30 text-zenov-text'
                                : 'mr-auto bg-zenov-card border border-zenov-border text-zenov-text'
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 text-[9px] ${isSupport ? 'text-white/70' : 'text-zenov-text-muted'} font-bold mb-1`}>
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
                  <form onSubmit={handleSendSupportReply} className="p-3 border-t border-zenov-border flex gap-2 bg-zenov-card/60">
                    <input
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      placeholder="Type support response message..."
                      className="flex-1 bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none"
                    />
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-zenov-border bg-zenov-card h-[500px] lg:h-[560px] flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare className="w-14 h-14 text-zenov-text-muted mb-4 opacity-50" />
                  <h4 className="font-black text-zenov-text mb-1">Helpdesk Dashboard Inbox</h4>
                  <p className="text-xs text-zenov-text-secondary max-w-xs leading-relaxed">
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
            <div className="rounded-2xl p-5 bg-zenov-card border border-zenov-success/30 bg-gradient-to-br from-zenov-success/5 to-transparent">
              <Check className="w-9 h-9 text-zenov-success mb-3" />
              <h3 className="text-base font-black text-zenov-text mb-2">PCI-DSS Tokenization Gateways</h3>
              <p className="text-xs text-zenov-text-secondary leading-relaxed">
                Full bank-grade card numbers never transit through local servers. API triggers with bKash / Nagad operate strictly via secured webhook signatures. Last audit: Q3 2026.
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-zenov-card border border-zenov-border">
              <ShieldCheck className="w-9 h-9 text-zenov-primary mb-3" />
              <h3 className="text-base font-black text-zenov-text mb-2">WAF Rate-Limiter Policies</h3>
              <p className="text-xs text-zenov-text-secondary leading-relaxed">
                Cloudflare enterprise level shield parameters are initialized. API request thresholds set to max 120 calls/min per client IP address. System alerts logged directly to telemetry stream.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Manual Order Creation Modal */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        products={products}
        selectedCurrency={selectedCurrency}
        onCreateOrder={createAdminOrder}
      />

      {/* Order Details & Inspection Modal */}
      <OrderDetailsModal
        order={selectedOrderForDetails}
        isOpen={selectedOrderForDetails !== null}
        onClose={() => setSelectedOrderForDetails(null)}
        selectedCurrency={selectedCurrency}
        onUpdateStatus={updateOrderStatus}
      />
    </div>
  );
}
