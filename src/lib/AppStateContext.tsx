'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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
  SiteSettings,
} from '../types';
import { DEFAULT_SITE_SETTINGS } from '@/data/siteSettings';
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
  siteSettings: SiteSettings;
  authLoading: boolean;
  productsLoading: boolean;
  adminToast: AdminToast | null;
}

interface AppActions {
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{ success: boolean; message?: string }>;
  setSelectedCategory: (c: CategoryType | 'all') => void;
  setSelectedCurrency: (c: CurrencyCode) => void;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (productId: string, denominationId: string, qty: number) => void;
  removeCartItem: (productId: string, denominationId: string) => void;
  clearCart: () => void;
  directCheckout: (
    item: CartItem,
    paymentMethod: PaymentMethod,
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string; address?: string; city?: string; postCode?: string }
  ) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
  placeOrder: (
    paymentMethod: PaymentMethod,
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string; address?: string; city?: string; postCode?: string; shippingFeeUSD?: number; shippingFeeBDT?: number }
  ) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
  depositWallet: (amountUSD: number, method: string, reference: string) => Promise<{ success: boolean; message: string }>;
  searchOrder: (orderId: string) => Promise<Order | null>;
  createTicket: (subject: string, category: any, priority: any, message: string) => Promise<SupportTicket>;
  replyTicket: (ticketId: string, message: string) => Promise<void>;
  refreshTickets: () => Promise<SupportTicket[] | null>;
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
  const designatedAdmins = [
    'almumeetu@gmail.com',
    'zenovgamesbd@gmail.com',
    'admin@zenov.gg',
    'admin@zenovgames.com',
  ];
  return designatedAdmins.includes(cleanEmail);
};

const MAX_LOCAL_STORAGE_ITEMS = 50;

const sanitizeForLocalStorage = (key: string, value: unknown): unknown => {
  if (key === 'zenov_v3_products' && Array.isArray(value)) {
    // Strip massive base64 image strings and cap cached products
    return value.slice(0, MAX_LOCAL_STORAGE_ITEMS).map((p: any) => {
      if (typeof p?.image === 'string' && p.image.startsWith('data:')) {
        return { ...p, image: '' };
      }
      return p;
    });
  }
  if (Array.isArray(value) && value.length > 100) {
    return value.slice(-100);
  }
  return value;
};

const safeSetItem = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = sanitizeForLocalStorage(key, value);
    const serialized = JSON.stringify(sanitized);
    localStorage.setItem(key, serialized);
  } catch (e: any) {
    const isQuotaError =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' ||
        e.code === 22 ||
        e.code === 1014 ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    if (isQuotaError) {
      console.warn(`[AppStateContext] LocalStorage quota exceeded when storing "${key}". Attempting recovery...`);
      try {
        if (Array.isArray(value)) {
          const fallback = value.slice(0, 20).map((item: any) => {
            if (typeof item?.image === 'string' && item.image.startsWith('data:')) {
              return { ...item, image: '' };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(fallback));
          return;
        }
      } catch (e2) {
        try {
          localStorage.removeItem('zenov_v3_products');
          localStorage.removeItem('zenov_v3_blogs');
          localStorage.removeItem('zenov_v3_banners');
        } catch {}
        console.warn(`[AppStateContext] Failed to persist "${key}" in localStorage after trimming. Cleaned cache.`, e2);
      }
    } else {
      console.warn(`[AppStateContext] Error saving "${key}" to localStorage:`, e);
    }
  }
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

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
    let hasLocalProducts = false;
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
      const storedSettings = localStorage.getItem('zenov_v3_settings');

      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          hasLocalProducts = true;
        }
      }
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedUnits) setUnits(JSON.parse(storedUnits));
      if (storedBanners) setHeroBanners(JSON.parse(storedBanners));
      if (storedBlogs) setBlogArticles(JSON.parse(storedBlogs));
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedTransactions) setWalletTransactions(JSON.parse(storedTransactions));
      if (storedTickets) setTickets(JSON.parse(storedTickets));
      if (storedSettings) setSiteSettings(JSON.parse(storedSettings));
    } catch (e) {
      console.error('Error loading initial cache', e);
    }
    setIsMounted(true);

    // If we have cached or initial products, don't block the UI with a skeleton
    if (hasLocalProducts || INITIAL_PRODUCTS.length > 0) {
      setProductsLoading(false);
    } else {
      setProductsLoading(true);
    }

    // 2. High-speed background sync (non-blocking SWR)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    Promise.allSettled([
      fetch('/api/products', { signal: controller.signal, cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
      fetch('/api/categories', { signal: controller.signal, cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
      fetch('/api/settings', { signal: controller.signal, cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
    ]).then(([pRes, cRes, sRes]) => {
      clearTimeout(timeoutId);
      if (pRes.status === 'fulfilled' && pRes.value?.success && Array.isArray(pRes.value.products)) {
        setProducts(pRes.value.products);
      }
      if (cRes.status === 'fulfilled' && cRes.value?.success && Array.isArray(cRes.value.categories)) {
        setCategories(cRes.value.categories);
      }
      if (sRes.status === 'fulfilled' && sRes.value?.success && sRes.value.settings) {
        setSiteSettings(sRes.value.settings);
      }
    }).catch((err) => {
      console.warn('Background sync warning:', err);
    }).finally(() => {
      setProductsLoading(false);
    });

    return () => clearTimeout(timeoutId);
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
          try {
            localStorage.removeItem('zenov_v3_user');
          } catch {}
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
    safeSetItem('zenov_v3_products', products);
  }, [products, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_categories', categories);
  }, [categories, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_units', units);
  }, [units, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_banners', heroBanners);
  }, [heroBanners, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_blogs', blogArticles);
  }, [blogArticles, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_user', user);
  }, [user, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_users', users);
  }, [users, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_orders', orders);
  }, [orders, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_transactions', walletTransactions);
  }, [walletTransactions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_tickets', tickets);
  }, [tickets, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    safeSetItem('zenov_v3_settings', siteSettings);
  }, [siteSettings, isMounted]);

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
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string; address?: string; city?: string; postCode?: string }
  ) => {
    if (item.productType === 'physical') {
      return { success: false, message: 'Physical products must be placed through the cart with a delivery address.' };
    }
    const qty = Math.max(1, item.quantity || 1);
    const unitUSD = Number(item.denomination.amount) || 0;
    const totalUSD = Number((unitUSD * qty).toFixed(2));
    const unitBDT =
      item.denomination.priceBDT !== undefined && Number(item.denomination.priceBDT) > 0
        ? Number(item.denomination.priceBDT)
        : Math.round(unitUSD * 120);
    const totalBDT = unitBDT * qty;
    const paidAmountCurrency = selectedCurrency === 'BDT' ? totalBDT : totalUSD;

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
      paidAmountCurrency,
      paymentMethod,
      paymentStatus: isManualVerification ? 'Pending Verification' : 'Paid',
      fulfillmentStatus: isManualVerification ? 'Pending Verification' : 'Processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerId: item.playerId || 'PLAYER_GUEST',
      serverId: item.serverId || '',
      transactionId,
      deliveryAddress: customerInfo?.address?.trim() || item.deliveryAddress || '',
      deliveryCity: customerInfo?.city?.trim() || item.deliveryCity || '',
      deliveryPostCode: customerInfo?.postCode?.trim() || item.deliveryPostCode || '',
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
    customerInfo?: { name?: string; email?: string; phone?: string; senderNumber?: string; trxId?: string; address?: string; city?: string; postCode?: string; shippingFeeUSD?: number; shippingFeeBDT?: number }
  ) => {
    if (cartItems.length === 0) return { success: false, message: 'Your cart is empty' };

    const totalUSD = Number(
      cartItems.reduce((s, it) => s + (Number(it.denomination.amount) || 0) * Math.max(1, it.quantity || 1), 0).toFixed(2)
    );
    const totalBDT = cartItems.reduce((s, it) => {
      const qty = Math.max(1, it.quantity || 1);
      const uUSD = Number(it.denomination.amount) || 0;
      const bdt =
        it.denomination.priceBDT !== undefined && Number(it.denomination.priceBDT) > 0
          ? Number(it.denomination.priceBDT)
          : Math.round(uUSD * 120);
      return s + bdt * qty;
    }, 0);
    const shippingFeeUSD = Math.max(0, Number(customerInfo?.shippingFeeUSD) || 0);
    const shippingFeeBDT = Math.max(0, Number(customerInfo?.shippingFeeBDT) || 0);
    const totalWithShippingUSD = Number((totalUSD + shippingFeeUSD).toFixed(2));
    const paidAmountCurrency = selectedCurrency === 'BDT'
      ? totalBDT + shippingFeeBDT
      : totalWithShippingUSD;

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
      totalUSD: totalWithShippingUSD,
      currency: selectedCurrency,
      paidAmountCurrency,
      paymentMethod,
      paymentStatus: isManualVerification ? 'Pending Verification' : 'Paid',
      fulfillmentStatus: isManualVerification ? 'Pending Verification' : 'Processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerId: cartItems[0]?.playerId || 'PLAYER_GUEST',
      serverId: cartItems[0]?.serverId || '',
      transactionId,
      shippingFeeUSD,
      shippingFeeBDT,
      deliveryAddress: customerInfo?.address?.trim() || '',
      deliveryCity: customerInfo?.city?.trim() || '',
      deliveryPostCode: customerInfo?.postCode?.trim() || '',
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

    const calcUSD =
      Number(orderData.totalUSD) ||
      Number(
        (orderData.items || []).reduce(
          (s, it) => s + (Number(it.denomination?.amount) || 0) * Math.max(1, it.quantity || 1),
          0
        ).toFixed(2)
      );

    const calcBDT =
      (orderData.items || []).reduce((s, it) => {
        const qty = Math.max(1, it.quantity || 1);
        const uUSD = Number(it.denomination?.amount) || 0;
        const bdt =
          it.denomination?.priceBDT !== undefined && Number(it.denomination.priceBDT) > 0
            ? Number(it.denomination.priceBDT)
            : Math.round(uUSD * 120);
        return s + bdt * qty;
      }, 0) || Math.round(calcUSD * 120);

    const currency = orderData.currency || selectedCurrency;
    const paidAmountCurrency =
      Number(orderData.paidAmountCurrency) || (currency === 'BDT' ? calcBDT : calcUSD);

    const newOrder: Order = {
      id,
      orderNumber,
      userId: orderData.userId || 'guest',
      userEmail: orderData.userEmail || 'guest@zenovgames.com',
      customerName: orderData.customerName || (orderData.userId === 'guest' || !orderData.userId ? 'Guest Gamer' : 'Customer'),
      customerPhone: orderData.customerPhone || '',
      senderNumber: orderData.senderNumber || '',
      items: orderData.items || [],
      totalUSD: calcUSD,
      currency,
      paidAmountCurrency,
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

  const getSessionHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!supabase) return {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {}
    return {};
  }, []);

  const refreshOrders = useCallback(async (): Promise<Order[]> => {
    try {
      const authHeaders = await getSessionHeaders();
      const res = await fetch('/api/orders', { cache: 'no-store', headers: authHeaders });
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
  }, [orders, getSessionHeaders]);

  const refreshTickets = useCallback(async (): Promise<SupportTicket[] | null> => {
    try {
      const authHeaders = await getSessionHeaders();
      const res = await fetch('/api/tickets', { cache: 'no-store', headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
          return data.tickets;
        }
      }
    } catch (err) {
      console.warn('Failed to refresh tickets from server:', err);
    }
    return null;
  }, [getSessionHeaders]);

  // Real-time admin order & ticket sync: poll /api/orders and /api/tickets while the admin panel is open
  const adminPathname = usePathname();
  useEffect(() => {
    if (adminPathname !== '/admin') return;
    if (user.role !== 'admin') return;

    let active = true;
    const sync = async () => {
      if (!active) return;
      await Promise.allSettled([refreshOrders(), refreshTickets()]);
    };

    sync();
    const intervalId = setInterval(sync, 30000);

    // Re-sync whenever the tab becomes visible again
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sync();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
    }

    return () => {
      active = false;
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisible);
      }
    };
  }, [adminPathname, user.role, refreshOrders, refreshTickets]);

  const depositWallet = async (amountUSD: number, method: string, reference: string) => {
    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      userId: user.id,
      amount: amountUSD,
      currency: 'USD',
      type: 'deposit',
      paymentMethod: method,
      reference,
      status: 'Pending',
      createdAt: new Date().toLocaleString(),
    };

    setWalletTransactions((p) => [tx, ...p]);

    try {
      const authHeaders = await getSessionHeaders();
      await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ amountUSD, paymentMethod: method, reference }),
      });
    } catch (e) {
      console.warn('Wallet deposit notification error:', e);
    }

    return {
      success: true,
      message: `Deposit request for $${amountUSD.toFixed(2)} submitted. Your balance will be credited after admin payment verification.`,
    };
  };

  const searchOrder = async (orderId: string): Promise<Order | null> => {
    const query = orderId.trim().toUpperCase();
    const localMatch = orders.find(
      (o) =>
        o.id.toUpperCase() === query ||
        o.orderNumber.toUpperCase() === query ||
        o.transactionId?.toUpperCase() === query
    );
    if (localMatch) return localMatch;

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          return data.order;
        }
      }
    } catch (err) {
      console.warn('Order tracking API call error:', err);
    }
    return null;
  };

  const createTicket = async (
    subject: string,
    category: any,
    priority: any,
    message: string
  ): Promise<SupportTicket> => {
    const id = 'tkt_' + Date.now();
    const newTicket: SupportTicket = {
      id,
      ticketNumber: 'TCK-' + Math.floor(10000 + Math.random() * 90000),
      userId: user.id || 'guest',
      userEmail: user.email || 'guest@zenov.gg',
      userName: user.name || 'Gamer',
      subject: subject || 'Support Request',
      category: category || 'General Query',
      priority: priority || 'Medium',
      status: 'Open',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      messages: [
        {
          id: 'm1_' + Date.now(),
          ticketId: id,
          sender: 'user',
          senderName: user.name || 'Gamer',
          message,
          timestamp: new Date().toLocaleString(),
        } as any,
        {
          id: 'm2_' + Date.now(),
          ticketId: id,
          sender: 'ai',
          senderName: 'ZENOV Support',
          message: `Thank you for reaching out! Your support ticket has been received. Our support agent will assist you here shortly.`,
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
    return newTicket;
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

  const addCategory = async (c: CategoryItem) => {
    setCategories((prev) => [c, ...prev]);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    } catch (err) {
      console.warn('Failed to sync category to backend API:', err);
    }
  };

  const updateCategory = async (c: CategoryItem) => {
    setCategories((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    try {
      await fetch(`/api/categories/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    } catch (err) {
      console.warn('Failed to sync category update to backend API:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((x) => x.id !== id));
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to sync category deletion to backend API:', err);
    }
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

  const addBanner = async (b: HeroBanner) => {
    setHeroBanners((prev) => [b, ...prev]);
    try {
      await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
    } catch (err) {
      console.warn('Failed to sync banner to API:', err);
    }
  };

  const updateBanner = (updatedB: HeroBanner) => setHeroBanners((prev) => prev.map((x) => x.id === updatedB.id ? updatedB : x));
  const deleteBanner = (id: string) => setHeroBanners((prev) => prev.filter((x) => x.id !== id));

  const addBlog = async (b: BlogArticle) => {
    setBlogArticles((prev) => [b, ...prev]);
    try {
      await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
    } catch (err) {
      console.warn('Failed to sync blog to API:', err);
    }
  };

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

  const updateSiteSettings = async (partial: Partial<SiteSettings>): Promise<{ success: boolean; message?: string }> => {
    const nextSettings: SiteSettings = {
      ...siteSettings,
      ...partial,
      socialLinks: {
        ...siteSettings.socialLinks,
        ...(partial.socialLinks || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    setSiteSettings(nextSettings);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      });
      const data = await res.json();
      if (data.success) {
        if (data.settings) {
          setSiteSettings(data.settings);
        }
        showAdminToast('success', 'Site & Footer settings saved successfully!');
        return { success: true, message: 'Settings saved.' };
      } else {
        showAdminToast('error', data.message || 'Failed to save settings to server.');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      console.warn('Network error saving settings, saved locally:', err);
      showAdminToast('info', 'Settings updated and saved to local storage.');
      return { success: true, message: 'Saved locally.' };
    }
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
      try {
        localStorage.removeItem('zenov_v3_user');
      } catch {}
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
    siteSettings,
    productsLoading,
    adminToast,
    updateSiteSettings,
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
    refreshTickets,
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
