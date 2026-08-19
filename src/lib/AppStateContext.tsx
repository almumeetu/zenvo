'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  CategoryType,
  CategoryItem,
  UnitItem,
  CurrencyCode,
  UserProfile,
  CartItem,
  Order,
  SupportTicket,
  WalletTransaction,
  HeroBanner,
  BlogArticle,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_USER,
  GUEST_USER,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
  HERO_BANNERS,
  BLOG_ARTICLES,
} from '../data/initialData';
import { supabase } from './supabase';

export type PaymentMethod =
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank Transfer'
  | 'Crypto/USDT'
  | 'Zenov Wallet';

const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr_789012',
    name: 'CyberGamer_99',
    email: 'gamer@zenovgames.com',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    walletBalanceUSD: 45.80,
    role: 'admin',
    joinedDate: 'Jan 2025',
    vipTier: 'Cyber Elite',
    totalOrders: 18,
  },
  {
    id: 'usr_112233',
    name: 'ApexPredator',
    email: 'apex@predator.gg',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    walletBalanceUSD: 120.50,
    role: 'user',
    joinedDate: 'Feb 2025',
    vipTier: 'Gold',
    totalOrders: 5,
  },
];

interface AdminToast {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppState {
  products: Product[];
  categories: CategoryItem[];
  units: UnitItem[];
  heroBanners: HeroBanner[];
  blogArticles: BlogArticle[];
  selectedCategory: CategoryType | 'all';
  selectedCurrency: CurrencyCode;
  user: UserProfile;
  users: UserProfile[];
  cartItems: CartItem[];
  orders: Order[];
  walletTransactions: WalletTransaction[];
  tickets: SupportTicket[];
  authLoading: boolean;
  productsLoading: boolean;
  adminToast: AdminToast | null;
}

interface AppActions {
  setSelectedCategory: (c: CategoryType | 'all') => void;
  setSelectedCurrency: (c: CurrencyCode) => void;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (productId: string, denominationId: string, qty: number) => void;
  removeCartItem: (productId: string, denominationId: string) => void;
  clearCart: () => void;
  directCheckout: (
    item: CartItem,
    paymentMethod: PaymentMethod,
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string }
  ) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
  placeOrder: (
    paymentMethod: PaymentMethod,
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string }
  ) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
  depositWallet: (amountUSD: number, method: string, reference: string) => Promise<{ success: boolean; message: string }>;
  searchOrder: (orderId: string) => Promise<Order | null>;
  createTicket: (subject: string, category: any, priority: any, message: string) => Promise<void>;
  replyTicket: (ticketId: string, message: string) => Promise<void>;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  dismissAdminToast: () => void;
  addCategory: (c: CategoryItem) => void;
  updateCategory: (c: CategoryItem) => void;
  deleteCategory: (id: string) => void;
  addUnit: (u: UnitItem) => void;
  updateUnit: (u: UnitItem) => void;
  deleteUnit: (id: string) => void;
  updateOrderStatus: (
    orderId: string,
    status: 'Processing' | 'Delivered' | 'Refunded' | 'Pending Verification',
    paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Pending Verification'
  ) => void;
  createAdminOrder: (
    orderData: Partial<Order>
  ) => Promise<{ success: boolean; orderNumber?: string; order?: Order; message?: string }>;
  refreshOrders: () => Promise<Order[]>;
  updateUser: (u: UserProfile) => void;
  createUser: (u: UserProfile) => void;
  deleteUser: (id: string) => void;
  adjustUserWallet: (
    userId: string,
    amountUSD: number,
    type: 'deposit' | 'deduction',
    reference: string
  ) => Promise<{ success: boolean; message: string }>;
  addBanner: (b: HeroBanner) => void;
  updateBanner: (b: HeroBanner) => void;
  deleteBanner: (id: string) => void;
  addBlog: (b: BlogArticle) => void;
  updateBlog: (b: BlogArticle) => void;
  deleteBlog: (id: string) => void;
  adminReplyTicket: (ticketId: string, message: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  signInWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; message?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUpWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; message?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
}

export const checkIsAdmin = (email?: string): boolean => {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail.includes('admin') || cleanEmail === 'almumeetu@gmail.com' || cleanEmail === 'zenovgamesbd@gmail.com';
};

type AppStateValue = AppState & AppActions;

const AppCtx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [units, setUnits] = useState<UnitItem[]>(INITIAL_UNITS);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(HERO_BANNERS);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(BLOG_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('BDT');
  const [user, setUser] = useState<UserProfile>(GUEST_USER);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  const [isMounted, setIsMounted] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [adminToast, setAdminToast] = useState<AdminToast | null>(null);

  const showAdminToast = (type: AdminToast['type'], message: string) => {
    setAdminToast({ type, message });
    // Auto-dismiss after 5 seconds
    setTimeout(() => setAdminToast(null), 5000);
  };

  const dismissAdminToast = () => setAdminToast(null);

  // Fast Instant Hydration + Background SWR Sync
  useEffect(() => {
    // 1. Instantly load cache from localStorage (0ms render time)
    try {
      const storedProducts = localStorage.getItem('zenov_v3_products');
      const storedCategories = localStorage.getItem('zenov_v3_categories');
      const storedUnits = localStorage.getItem('zenov_v3_units');
      const storedBanners = localStorage.getItem('zenov_v3_banners');
      const storedBlogs = localStorage.getItem('zenov_v3_blogs');
      const storedUser = localStorage.getItem('zenov_v3_user');
      const storedUsers = localStorage.getItem('zenov_v3_users');
      const storedOrders = localStorage.getItem('zenov_v3_orders');
      const storedTransactions = localStorage.getItem('zenov_v3_transactions');
      const storedTickets = localStorage.getItem('zenov_v3_tickets');

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedUnits) setUnits(JSON.parse(storedUnits));
      if (storedBanners) setHeroBanners(JSON.parse(storedBanners));
      if (storedBlogs) setBlogArticles(JSON.parse(storedBlogs));
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedTransactions) setWalletTransactions(JSON.parse(storedTransactions));
      if (storedTickets) setTickets(JSON.parse(storedTickets));
    } catch (e) {
      console.error('Error loading initial cache', e);
    }
    setIsMounted(true);

    // 2. Background parallel sync with database (non-blocking)
    // CRITICAL: always replace state with DB results when the fetch succeeds,
    // even if the result is an empty array. The old `length > 0` guard was
    // causing stale seed data to persist when Supabase returned empty due to
    // RLS policies or missing tables.
    setProductsLoading(true);
    Promise.allSettled([
      fetch('/api/products', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
      fetch('/api/orders', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
      fetch('/api/tickets', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
    ]).then(([pRes, oRes, tRes]) => {
      if (pRes.status === 'fulfilled' && pRes.value?.success) {
        // Always update — DB is the source of truth, even if it returns []
        setProducts(pRes.value.products ?? []);
      }
      if (oRes.status === 'fulfilled' && oRes.value?.success) {
        setOrders(oRes.value.orders ?? []);
      }
      if (tRes.status === 'fulfilled' && tRes.value?.success) {
        setTickets(tRes.value.tickets ?? []);
      }
    }).catch((err) => {
      console.warn('Background sync error (using local cache):', err);
    }).finally(() => {
      setProductsLoading(false);
    });
  }, []);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Gamer';
        const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`;
        setUser((prev) => {
          const newRole: 'user' | 'admin' = checkIsAdmin(u.email) ? 'admin' : 'user';
          const updated = {
            ...prev,
            id: u.id,
            email: u.email || prev.email,
            name,
            avatar,
            role: newRole,
          };
          if (prev.id === 'guest' || prev.id === '' || prev.role === 'user') {
            setOrders((ords) =>
              ords.map((o) =>
                o.userId === 'guest' || o.userId === '' || o.userEmail === 'guest@zenovgames.com' || o.userEmail === prev.email
                  ? { ...o, userId: u.id, userEmail: u.email || prev.email }
                  : o
              )
            );
          }
          return updated;
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Gamer';
        const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`;
        setUser((prev) => {
          const newRole: 'user' | 'admin' = checkIsAdmin(u.email) ? 'admin' : 'user';
          const updated = {
            ...prev,
            id: u.id,
            email: u.email || prev.email,
            name,
            avatar,
            role: newRole,
          };
          if (prev.id === 'guest' || prev.id === '' || prev.role === 'user') {
            setOrders((ords) =>
              ords.map((o) =>
                o.userId === 'guest' || o.userId === '' || o.userEmail === 'guest@zenovgames.com' || o.userEmail === prev.email
                  ? { ...o, userId: u.id, userEmail: u.email || prev.email }
                  : o
              )
            );
          }
          return updated;
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(GUEST_USER);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zenov_v3_user');
        }
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save changes to localStorage (only as fallback sync)
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_products', JSON.stringify(products));
  }, [products, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_categories', JSON.stringify(categories));
  }, [categories, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_units', JSON.stringify(units));
  }, [units, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_banners', JSON.stringify(heroBanners));
  }, [heroBanners, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_blogs', JSON.stringify(blogArticles));
  }, [blogArticles, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_user', JSON.stringify(user));
  }, [user, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_users', JSON.stringify(users));
  }, [users, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_orders', JSON.stringify(orders));
  }, [orders, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_transactions', JSON.stringify(walletTransactions));
  }, [walletTransactions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zenov_v3_tickets', JSON.stringify(tickets));
  }, [tickets, isMounted]);

  const addToCart = (item: CartItem) => setCartItems((p) => [...p, item]);

  const updateCartQuantity = (productId: string, denominationId: string, qty: number) =>
    setCartItems((p) =>
      p.map((it) =>
        it.productId === productId && it.denomination.id === denominationId
          ? { ...it, quantity: Math.max(1, qty) }
          : it
      )
    );

  const removeCartItem = (productId: string, denominationId: string) =>
    setCartItems((p) =>
      p.filter((it) => !(it.productId === productId && it.denomination.id === denominationId))
    );

  const clearCart = () => setCartItems([]);

  const directCheckout = async (
    item: CartItem,
    paymentMethod: PaymentMethod,
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string }
  ) => {
    const totalUSD = item.denomination.amount * item.quantity;
    const orderNumber = 'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3);
    const transactionId = customerInfo?.trxId?.trim() || ('TX-' + Math.random().toString(36).slice(2, 10).toUpperCase());
    const senderNumber = customerInfo?.senderNumber?.trim() || customerInfo?.phone || '';

    const customerName = customerInfo?.name || user.name || (user.id === 'guest' || !user.id ? 'Guest Gamer' : 'Customer');
    const customerEmail = customerInfo?.email || user.email || 'guest@zenovgames.com';
    const customerPhone = customerInfo?.phone || user.phone || '';
    const isManualVerification = Boolean(customerInfo?.trxId);

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      userId: user.id || 'guest',
      userEmail: customerEmail,
      customerName,
      customerPhone,
      senderNumber,
      items: [item],
      totalUSD,
      currency: selectedCurrency,
      paidAmountCurrency: totalUSD,
      paymentMethod,
      paymentStatus: isManualVerification ? 'Pending Verification' : 'Paid',
      fulfillmentStatus: isManualVerification ? 'Pending Verification' : 'Processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerId: item.playerId || 'PLAYER_GUEST',
      serverId: item.serverId || '',
      transactionId,
    } as unknown as Order;

    let finalOrder = newOrder;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          finalOrder = data.order;
        }
      }
    } catch (e) {
      console.error('Failed to post order to database API', e);
    }

    setOrders((p) => [finalOrder, ...p]);

    // Clear item from cart
    setCartItems((p) =>
      p.filter(
        (ci) =>
          !(ci.productId === item.productId && ci.denomination.id === item.denomination.id)
      )
    );

    return { success: true, orderNumber: finalOrder.orderNumber, message: 'Order submitted! Payment verification in progress.' };
  };

  const placeOrder = async (
    paymentMethod: PaymentMethod,
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string }
  ) => {
    if (cartItems.length === 0) return { success: false, message: 'Your cart is empty' };

    const totalUSD = cartItems.reduce((s, it) => s + it.denomination.amount * it.quantity, 0);
    const orderNumber = 'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3);
    const transactionId = customerInfo?.trxId?.trim() || ('TX-' + Math.random().toString(36).slice(2, 10).toUpperCase());
    const senderNumber = customerInfo?.senderNumber?.trim() || customerInfo?.phone || '';

    const customerName = customerInfo?.name || user.name || (user.id === 'guest' || !user.id ? 'Guest Gamer' : 'Customer');
    const customerEmail = customerInfo?.email || user.email || 'guest@zenovgames.com';
    const customerPhone = customerInfo?.phone || user.phone || '';
    const isManualVerification = Boolean(customerInfo?.trxId);

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      userId: user.id || 'guest',
      userEmail: customerEmail,
      customerName,
      customerPhone,
      senderNumber,
      items: [...cartItems],
      totalUSD,
      currency: selectedCurrency,
      paidAmountCurrency: totalUSD,
      paymentMethod,
      paymentStatus: isManualVerification ? 'Pending Verification' : 'Paid',
      fulfillmentStatus: isManualVerification ? 'Pending Verification' : 'Processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerId: cartItems[0]?.playerId || 'PLAYER_GUEST',
      serverId: cartItems[0]?.serverId || '',
      transactionId,
    } as unknown as Order;

    let finalOrder = newOrder;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          finalOrder = data.order;
        }
      }
    } catch (e) {
      console.error('Failed to post cart order to database API', e);
    }

    setOrders((p) => [finalOrder, ...p]);
    clearCart();

    return { success: true, orderNumber: finalOrder.orderNumber, message: 'Order submitted! Payment verification in progress.' };
  };

  const createAdminOrder = async (orderData: Partial<Order>) => {
    const id = orderData.id || 'ord_' + Date.now();
    const orderNumber =
      orderData.orderNumber ||
      'ZNG-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now().toString().slice(-3);
    const transactionId =
      orderData.transactionId?.trim() ||
      'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    const newOrder: Order = {
      id,
      orderNumber,
      userId: orderData.userId || 'guest',
      userEmail: orderData.userEmail || 'guest@zenovgames.com',
      customerName: orderData.customerName || (orderData.userId === 'guest' || !orderData.userId ? 'Guest Gamer' : 'Customer'),
      customerPhone: orderData.customerPhone || '',
      senderNumber: orderData.senderNumber || '',
      items: orderData.items || [],
      totalUSD: Number(orderData.totalUSD) || 0,
      currency: orderData.currency || selectedCurrency,
      paidAmountCurrency: Number(orderData.paidAmountCurrency) || Number(orderData.totalUSD) || 0,
      paymentMethod: orderData.paymentMethod || 'bKash',
      paymentStatus: orderData.paymentStatus || 'Paid',
      fulfillmentStatus: orderData.fulfillmentStatus || 'Delivered',
      playerId: orderData.playerId || orderData.items?.[0]?.playerId || 'PLAYER_GUEST',
      serverId: orderData.serverId || orderData.items?.[0]?.serverId || '',
      transactionId,
      notes: orderData.notes || '',
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Order;

    let finalOrder = newOrder;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          finalOrder = data.order;
        }
      }
    } catch (e) {
      console.error('Failed to post manual admin order to API', e);
    }

    setOrders((p) => [finalOrder, ...p]);
    return { success: true, orderNumber: finalOrder.orderNumber, order: finalOrder, message: 'Order created successfully!' };
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          return data.orders;
        }
      }
    } catch (err) {
      console.warn('Failed to refresh orders from server:', err);
    }
    return orders;
  };

  const depositWallet = async (amountUSD: number, method: string, reference: string) => {
    const newBal = parseFloat((user.walletBalanceUSD + amountUSD).toFixed(2));
    setUser((curr) => ({ ...curr, walletBalanceUSD: newBal }));
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, walletBalanceUSD: newBal } : u))
    );

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      userId: user.id,
      amount: amountUSD,
      currency: 'USD',
      type: 'deposit',
      paymentMethod: method,
      reference,
      status: 'Completed',
      createdAt: new Date().toLocaleString(),
    };

    setWalletTransactions((p) => [tx, ...p]);
    return { success: true, message: `Successfully deposited $${amountUSD.toFixed(2)}` };
  };

  const searchOrder = async (orderId: string): Promise<Order | null> => {
    const query = orderId.trim().toUpperCase();
    return (
      orders.find(
        (o) =>
          o.id.toUpperCase() === query ||
          o.orderNumber.toUpperCase() === query ||
          o.transactionId?.toUpperCase() === query
      ) || null
    );
  };

  const createTicket = async (
    subject: string,
    category: any,
    priority: any,
    message: string
  ) => {
    const id = 'tkt_' + Date.now();
    const newTicket: SupportTicket = {
      id,
      ticketNumber: 'TCK-' + Math.floor(10000 + Math.random() * 90000),
      userId: 'guest',
      userEmail: user.email,
      subject,
      category,
      priority,
      status: 'Open',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      messages: [
        {
          id: 'm1_' + Date.now(),
          ticketId: id,
          sender: 'user',
          senderName: user.name,
          message,
          timestamp: new Date().toLocaleString(),
        } as any,
        {
          id: 'm2_' + Date.now(),
          ticketId: id,
          sender: 'ai',
          senderName: 'ZENOV Support',
          message: `Thank you for reaching out! Your ticket has been received and assigned to our support queue. An agent will respond shortly.`,
          timestamp: new Date(Date.now() + 1000).toLocaleString(),
        } as any,
      ],
    } as SupportTicket;

    if (isDbConnected) {
      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTicket),
        });
      } catch (e) {
        console.error('Failed to post ticket to database API', e);
      }
    }

    setTickets((p) => [newTicket, ...p]);
  };

  const replyTicket = async (ticketId: string, message: string) => {
    let updatedTicketObj: any = null;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId || (t as any)._id === ticketId) {
          const updated = {
            ...t,
            status: 'Open' as any,
            updatedAt: new Date().toLocaleString(),
            messages: [
              ...t.messages,
              {
                id: 'm_' + Date.now(),
                ticketId,
                sender: 'user',
                senderName: user.name,
                message,
                timestamp: new Date().toLocaleString(),
              } as any,
            ],
          };
          updatedTicketObj = updated;
          return updated;
        }
        return t;
      })
    );

    if (isDbConnected && updatedTicketObj) {
      try {
        await fetch(`/api/tickets/${ticketId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTicketObj),
        });
      } catch (e) {
        console.error('Failed to update ticket reply in database API', e);
      }
    }
  };

  const addProduct = async (np: Product) => {
    if (isDbConnected) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(np),
        });
        const data = await res.json();
        if (!data.success) {
          console.error('Failed to create product in database:', data.message);
          showAdminToast('error', `❌ Failed to save product to database: ${data.message || 'Unknown error'}`);
          return; // Don't update local state if DB save failed
        }
        showAdminToast('success', `✅ Product "${np.title}" created successfully.`);
      } catch (e: any) {
        console.error('Failed to create product in database API', e);
        showAdminToast('error', `❌ Network error saving product: ${e?.message || 'Check your connection'}`);
        return;
      }
    }
    setProducts((p) => [np, ...p]);
  };

  const updateProduct = async (updatedProd: Product) => {
    if (isDbConnected) {
      try {
        const res = await fetch(`/api/products/${updatedProd.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProd),
        });
        const data = await res.json();
        if (!data.success) {
          console.error('Failed to update product in database:', data.message);
          showAdminToast('error', `❌ Failed to update product in database: ${data.message || 'Unknown error'}`);
          return;
        }
        showAdminToast('success', `✅ Product "${updatedProd.title}" updated successfully.`);
      } catch (e: any) {
        console.error('Failed to update product in database API', e);
        showAdminToast('error', `❌ Network error updating product: ${e?.message || 'Check your connection'}`);
        return;
      }
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const deleteProduct = async (id: string) => {
    if (isDbConnected) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) {
          console.error('Failed to delete product from database:', data.message);
          showAdminToast('error', `❌ Failed to delete product from database: ${data.message || 'Unknown error'}`);
          return;
        }
        showAdminToast('success', `🗑️ Product deleted successfully.`);
      } catch (e: any) {
        console.error('Failed to delete product in database API', e);
        showAdminToast('error', `❌ Network error deleting product: ${e?.message || 'Check your connection'}`);
        return;
      }
    }
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const addCategory = (c: CategoryItem) => {
    setCategories((prev) => [c, ...prev]);
  };

  const updateCategory = (c: CategoryItem) => {
    setCategories((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((x) => x.id !== id));
  };

  const addUnit = (u: UnitItem) => {
    setUnits((prev) => [u, ...prev]);
  };

  const updateUnit = (u: UnitItem) => {
    setUnits((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  };

  const deleteUnit = (id: string) => {
    setUnits((prev) => prev.filter((x) => x.id !== id));
  };

  const updateOrderStatus = async (
    orderId: string,
    status: 'Processing' | 'Delivered' | 'Refunded' | 'Pending Verification',
    paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Pending Verification'
  ) => {
    const updatedPaymentStatus = paymentStatus || (status === 'Delivered' ? 'Paid' : status === 'Refunded' ? 'Failed' : undefined);

    if (isDbConnected) {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fulfillmentStatus: status,
            ...(updatedPaymentStatus ? { paymentStatus: updatedPaymentStatus } : {}),
          }),
        });
        const data = await res.json();
        if (!data.success) {
          console.error('Failed to update order status in database:', data.message);
        }
      } catch (e) {
        console.error('Failed to update order in database API', e);
      }
    }

    setOrders((p) =>
      p.map((o) => {
        if (o.id === orderId || (o as any)._id === orderId) {
          return {
            ...o,
            fulfillmentStatus: status,
            paymentStatus: updatedPaymentStatus || o.paymentStatus,
            updatedAt: new Date().toLocaleString(),
          };
        }
        return o;
      })
    );
  };

  const createUser = (newUsr: UserProfile) => {
    setUsers((prev) => [...prev, newUsr]);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const adjustUserWallet = async (
    userId: string,
    amountUSD: number,
    type: 'deposit' | 'deduction',
    reference: string
  ) => {
    let success = false;
    let message = '';
    
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentBalance = u.walletBalanceUSD;
          let newBalance = currentBalance;
          if (type === 'deposit') {
            newBalance = parseFloat((currentBalance + amountUSD).toFixed(2));
            message = `Successfully deposited $${amountUSD.toFixed(2)} to ${u.name}'s wallet.`;
            success = true;
          } else {
            if (currentBalance < amountUSD) {
              message = `Insufficient user balance ($${currentBalance.toFixed(2)} available).`;
              success = false;
              return u;
            }
            newBalance = parseFloat((currentBalance - amountUSD).toFixed(2));
            message = `Successfully deducted $${amountUSD.toFixed(2)} from ${u.name}'s wallet.`;
            success = true;
          }
          
          if (u.id === user.id) {
            setUser((curr) => ({ ...curr, walletBalanceUSD: newBalance }));
          }
          
          const tx: WalletTransaction = {
            id: 'wtx_' + Date.now(),
            userId: u.id,
            type: type === 'deposit' ? 'deposit' : 'purchase',
            amount: amountUSD,
            currency: 'USD',
            paymentMethod: 'Admin Dashboard',
            status: 'Completed',
            createdAt: new Date().toLocaleString(),
            reference,
          };
          setWalletTransactions((prevTxs) => [tx, ...prevTxs]);
          
          return { ...u, walletBalanceUSD: newBalance };
        }
        return u;
      })
    );
    
    return { success, message };
  };

  const addBanner = (b: HeroBanner) => setHeroBanners((prev) => [b, ...prev]);
  const updateBanner = (updatedB: HeroBanner) => setHeroBanners((prev) => prev.map((x) => x.id === updatedB.id ? updatedB : x));
  const deleteBanner = (id: string) => setHeroBanners((prev) => prev.filter((x) => x.id !== id));

  const addBlog = (b: BlogArticle) => setBlogArticles((prev) => [b, ...prev]);
  const updateBlog = (updatedB: BlogArticle) => setBlogArticles((prev) => prev.map((x) => x.id === updatedB.id ? updatedB : x));
  const deleteBlog = (id: string) => setBlogArticles((prev) => prev.filter((x) => x.id !== id));

  const adminReplyTicket = async (ticketId: string, message: string) => {
    const newReply = {
      id: 'msg_admin_' + Date.now(),
      sender: 'support' as const,
      senderName: 'ZENOV Support Admin',
      message,
      timestamp: new Date().toLocaleString(),
    };

    let updatedTicketObj: any = null;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId || (t as any)._id === ticketId) {
          const updated = {
            ...t,
            status: 'In Progress' as any,
            updatedAt: new Date().toLocaleString(),
            messages: [...t.messages, newReply],
          };
          updatedTicketObj = updated;
          return updated;
        }
        return t;
      })
    );

    if (isDbConnected && updatedTicketObj) {
      try {
        await fetch(`/api/tickets/${ticketId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTicketObj),
        });
      } catch (e) {
        console.error('Failed to save ticket reply in database API', e);
      }
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    if (isDbConnected) {
      try {
        await fetch(`/api/tickets/${ticketId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } catch (e) {
        console.error('Failed to update ticket status in database API', e);
      }
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId || (t as any)._id === ticketId
          ? { ...t, status, updatedAt: new Date().toLocaleString() }
          : t
      )
    );
  };

  const signInWithGoogle = async (redirectTo = '/') => {
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured yet.' };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      setUser((prev) => {
        const newRole: 'user' | 'admin' = checkIsAdmin(email) ? 'admin' : 'user';
        const updated = { ...prev, email, name, role: newRole };
        if (prev.id === 'guest' || prev.id === '') {
          setOrders((ords) =>
            ords.map((o) =>
              o.userId === 'guest' || o.userId === '' || o.userEmail === 'guest@zenovgames.com' || o.userEmail === prev.email
                ? { ...o, userId: 'usr_' + Date.now(), userEmail: email }
                : o
            )
          );
        }
        return updated;
      });
      return { success: true };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, message: error.message };
    }
    if (data?.user) {
      const authUser = data.user;
      const name = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Gamer';
      setUser((prev) => ({
        ...prev,
        id: authUser.id,
        email: authUser.email || email,
        name,
        role: checkIsAdmin(authUser.email || email) ? 'admin' : 'user',
      }));
    }
    return { success: true };
  };

  const signUpWithEmail = async (email: string, password: string, name: string, phone?: string) => {
    if (!supabase) {
      setUser((prev) => ({ ...prev, email, name, phone: phone || prev.phone, role: checkIsAdmin(email) ? 'admin' : 'user' }));
      return { success: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone || '',
        },
      },
    });
    if (error) {
      return { success: false, message: error.message };
    }
    if (data?.user) {
      const authUser = data.user;
      setUser((prev) => ({
        ...prev,
        id: authUser.id,
        email: authUser.email || email,
        name,
        phone: phone || prev.phone,
        role: checkIsAdmin(authUser.email || email) ? 'admin' : 'user',
      }));
    }
    return { success: true, needsConfirmation: data.session === null };
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(GUEST_USER);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zenov_v3_user');
    }
  };

  const value: AppStateValue = {
    products,
    categories,
    units,
    heroBanners,
    blogArticles,
    selectedCategory,
    selectedCurrency,
    user,
    users,
    cartItems,
    orders,
    walletTransactions,
    tickets,
    productsLoading,
    adminToast,
    setSelectedCategory,
    setSelectedCurrency,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    directCheckout,
    placeOrder,
    depositWallet,
    searchOrder,
    createTicket,
    replyTicket,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addUnit,
    updateUnit,
    deleteUnit,
    updateOrderStatus,
    createAdminOrder,
    refreshOrders,
    updateUser: setUser,
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
    dismissAdminToast,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    authLoading,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider');
  return ctx;
}
