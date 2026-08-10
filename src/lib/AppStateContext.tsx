'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  | 'Zenov Wallet';

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
  updateOrderStatus: (orderId: string, status: 'Processing' | 'Delivered' | 'Refunded') => void;
  updateUser: (u: UserProfile) => void;
}

type AppStateValue = AppState & AppActions;

const AppCtx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('BDT');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

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

  const directCheckout = async (item: CartItem, paymentMethod: PaymentMethod) => {
    const totalUSD = item.denomination.amount * item.quantity;
    const orderNumber =
      'ZNG-' +
      Math.floor(100000 + Math.random() * 900000).toString() +
      '-' +
      Date.now().toString().slice(-3);
    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      userId: user.id,
      userEmail: user.email,
      items: [item],
      totalUSD,
      currency: selectedCurrency,
      paidAmountCurrency: totalUSD,
      paymentMethod,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      playerId: item.playerId,
      serverId: item.serverId,
      transactionId: 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    } as unknown as Order;
    setOrders((p) => [newOrder, ...p]);
    setCartItems((p) =>
      p.filter(
        (ci) =>
          !(ci.productId === item.productId && ci.denomination.id === item.denomination.id)
      )
    );
    return { success: true, orderNumber, message: 'Instant top-up delivered' };
  };

  const depositWallet = async (amountUSD: number, method: string, reference: string) => {
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
      userId: user.id,
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
    setTickets((p) => [newTicket, ...p]);
  };

  const replyTicket = async (ticketId: string, message: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
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
            }
          : t
      )
    );
  };

  const addProduct = (np: Product) => setProducts((p) => [np, ...p]);

  const deleteProduct = (id: string) => setProducts((p) => p.filter((x) => x.id !== id));

  const updateOrderStatus = (
    orderId: string,
    status: 'Processing' | 'Delivered' | 'Refunded'
  ) =>
    setOrders((p) =>
      p.map((o) =>
        o.id === orderId ? { ...o, fulfillmentStatus: status, updatedAt: new Date().toLocaleString() } : o
      )
    );

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
