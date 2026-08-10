'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  CategoryType,
  CurrencyCode,
  UserProfile,
  CartItem,
  Order,
  SupportTicket,
  WalletTransaction,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USER,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
  HERO_BANNERS,
  BLOG_ARTICLES,
} from '../data/initialData';

export type PaymentMethod =
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Visa/Mastercard'
  | 'Crypto/USDT'
  | 'Zenvo Wallet';

export interface AppState {
  products: Product[];
  heroBanners: typeof HERO_BANNERS;
  blogArticles: typeof BLOG_ARTICLES;
  selectedCategory: CategoryType | 'all';
  selectedCurrency: CurrencyCode;
  user: UserProfile;
  cartItems: CartItem[];
  orders: Order[];
  walletTransactions: WalletTransaction[];
  tickets: SupportTicket[];
}

export interface AppActions {
  setSelectedCategory: (c: CategoryType | 'all') => void;
  setSelectedCurrency: (c: CurrencyCode) => void;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (productId: string, denominationId: string, qty: number) => void;
  removeCartItem: (productId: string, denominationId: string) => void;
  clearCart: () => void;
  directCheckout: (
    item: CartItem,
    paymentMethod: PaymentMethod
  ) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
  depositWallet: (
    amountUSD: number,
    method: string,
    reference: string
  ) => Promise<{ success: boolean; message?: string }>;
  searchOrder: (orderId: string) => Promise<Order | null>;
  createTicket: (
    subject: string,
    category: any,
    priority: any,
    message: string
  ) => Promise<void>;
  replyTicket: (ticketId: string, message: string) => Promise<void>;
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (
    orderId: string,
    status: 'Processing' | 'Delivered' | 'Refunded'
  ) => void;
  updateUser: (u: UserProfile) => void;
}

type AppStateValue = AppState & AppActions;

const AppCtx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  // Load from mock backend (silently — kept for compatibility)
  useEffect(() => {
    try {
      fetch('/api/products')
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.products) setProducts(data.products);
        })
        .catch(() => {});
      fetch('/api/user')
        .then((r) => r.json())
        .then((data) => {
          if (data?.success) {
            setUser(data.user);
            setWalletTransactions(data.transactions || []);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

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
      p.filter(
        (it) => !(it.productId === productId && it.denomination.id === denominationId)
      )
    );
  const clearCart = () => setCartItems([]);

  const directCheckout = async (item: CartItem, paymentMethod: PaymentMethod) => {
    const totalUSD = item.denomination.amount * item.quantity;
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [item],
          totalUSD,
          currency: selectedCurrency,
          paymentMethod,
          playerId: item.playerId,
          serverId: item.serverId,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((p) => [data.order, ...p]);
        if (data.user) setUser(data.user);
        // Remove from cart if present
        setCartItems((prev) =>
          prev.filter(
            (ci) =>
              !(
                ci.productId === item.productId &&
                ci.denomination.id === item.denomination.id
              )
          )
        );
        return { success: true, orderNumber: data.order.orderNumber, message: data.message };
      }
      return { success: false, message: data.message || 'Payment failed' };
    } catch {
      // Fulfill locally for demo: create a local order record
      const orderNumber =
        'ZNG-' +
        Math.floor(100000 + Math.random() * 900000).toString() +
        '-' +
        Date.now().toString().slice(-3);
      const mockOrder: Order = {
        id: 'ord_' + Date.now(),
        orderNumber,
        userId: user.id,
        items: [item],
        totalUSD,
        currency: selectedCurrency,
        paymentMethod,
        status: 'Paid',
        fulfillmentStatus: 'Delivered',
        createdAt: new Date().toISOString(),
        playerId: item.playerId,
        serverId: item.serverId,
      } as unknown as Order;
      setOrders((p) => [mockOrder, ...p]);
      setCartItems((prev) =>
        prev.filter(
          (ci) =>
            !(ci.productId === item.productId && ci.denomination.id === item.denomination.id)
        )
      );
      return { success: true, orderNumber, message: 'Instant top-up delivered' };
    }
  };

  const depositWallet = async (amountUSD: number, method: string, reference: string) => {
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD, paymentMethod: method, reference }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setWalletTransactions((p) => [data.transaction, ...p]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      // Local mock
      setUser((u) => ({ ...u, walletBalanceUSD: u.walletBalanceUSD + amountUSD }));
      const tx: WalletTransaction = {
        id: 'tx_' + Date.now(),
        userId: user.id,
        amount: amountUSD,
        currency: 'USD',
        type: 'deposit',
        paymentMethod: method,
        reference,
        status: 'Completed',
        createdAt: new Date().toISOString(),
      };
      setWalletTransactions((p) => [tx, ...p]);
      return { success: true, message: `Deposited $${amountUSD}` };
    }
  };

  const searchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/track/${orderId}`);
      const data = await res.json();
      if (data.success) return data.order;
    } catch {}
    return (
      orders.find((o) => o.orderNumber === orderId || o.id === orderId) || null
    );
  };

  const createTicket = async (
    subject: string,
    category: any,
    priority: any,
    message: string
  ) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, priority, message }),
      });
      const data = await res.json();
      if (data.success) setTickets((p) => [data.ticket, ...p]);
    } catch {
      const id = 'tkt_' + Date.now();
      const ticketNumber = 'TKT-' + Math.floor(10000 + Math.random() * 90000);
      const newTkt: SupportTicket = {
        id,
        ticketNumber,
        userId: user.id,
        subject,
        category,
        priority,
        status: 'Open',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'm_' + Date.now(),
            ticketId: id,
            sender: 'user',
            senderName: user.name,
            message,
            timestamp: new Date().toISOString(),
          } as any,
        ],
      } as SupportTicket;
      setTickets((p) => [newTkt, ...p]);
    }
  };

  const replyTicket = async (ticketId: string, message: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender: 'user' }),
      });
      const data = await res.json();
      if (data.success && data.ticket)
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
    } catch {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: 'm_' + Date.now(),
                    ticketId,
                    sender: 'user',
                    senderName: user.name,
                    message,
                    timestamp: new Date().toISOString(),
                  } as any,
                ],
              }
            : t
        )
      );
    }
  };

  const addProduct = (np: Product) => {
    setProducts((p) => [np, ...p]);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(np),
    }).catch(() => {});
  };

  const deleteProduct = (id: string) => {
    setProducts((p) => p.filter((x) => x.id !== id));
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const updateOrderStatus = (
    orderId: string,
    status: 'Processing' | 'Delivered' | 'Refunded'
  ) => {
    setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: status } : o)));
    fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  const value: AppStateValue = {
    products,
    heroBanners: HERO_BANNERS,
    blogArticles: BLOG_ARTICLES,
    selectedCategory,
    selectedCurrency,
    user,
    cartItems,
    orders,
    walletTransactions,
    tickets,
    setSelectedCategory,
    setSelectedCurrency,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    directCheckout,
    depositWallet,
    searchOrder,
    createTicket,
    replyTicket,
    addProduct,
    deleteProduct,
    updateOrderStatus,
    updateUser: setUser,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider');
  return ctx;
}
