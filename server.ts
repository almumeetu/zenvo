import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PRODUCTS,
  BLOG_ARTICLES,
  HERO_BANNERS,
  CURRENCIES,
  INITIAL_USER,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
} from './src/data/initialData.js';
import { Product, Order, SupportTicket, WalletTransaction } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for server lifecycle
let productsStore: Product[] = [...INITIAL_PRODUCTS];
let ordersStore: Order[] = [...INITIAL_ORDERS];
let ticketsStore: SupportTicket[] = [...INITIAL_TICKETS];
let userStore = { ...INITIAL_USER };
let walletTransactionsStore: WalletTransaction[] = [
  {
    id: 'wtx_101',
    type: 'deposit',
    amount: 50.00,
    currency: 'BDT',
    paymentMethod: 'bKash',
    status: 'Completed',
    createdAt: '2026-08-01 10:00 AM',
    reference: 'BKASH_DEP_9910',
  },
  {
    id: 'wtx_102',
    type: 'purchase',
    amount: 4.20,
    currency: 'USD',
    paymentMethod: 'Zenvo Wallet',
    status: 'Completed',
    createdAt: '2026-08-07 04:15 PM',
    reference: 'ORD_ZNG-894103',
  },
];

// Security Log store for Admin Dashboard
let securityLogsStore = [
  { id: 'log-1', timestamp: new Date().toISOString(), event: 'Admin Session Authenticated', ip: '192.168.1.42', status: 'SUCCESS' },
  { id: 'log-2', timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'OpenAPI Gateway Webhook Received', ip: '10.0.4.12', status: 'SUCCESS' },
  { id: 'log-3', timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Wallet Top-Up Request Verified (bKash)', ip: '180.211.19.4', status: 'SUCCESS' },
];

// Gemini AI Setup
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// ==================== API ROUTES ====================

// 1. Products API
app.get('/api/products', (req: Request, res: Response) => {
  const category = req.query.category as string;
  const search = req.query.search as string;

  let filtered = [...productsStore];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.publisher?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, products: filtered });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = productsStore.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

app.post('/api/products', (req: Request, res: Response) => {
  const newProduct: Product = req.body;
  if (!newProduct.id || !newProduct.title) {
    return res.status(400).json({ success: false, message: 'Missing required product fields' });
  }
  productsStore.unshift(newProduct);
  securityLogsStore.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: `New Product Added: ${newProduct.title}`,
    ip: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });
  res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const index = productsStore.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  productsStore[index] = { ...productsStore[index], ...req.body };
  res.json({ success: true, product: productsStore[index] });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const index = productsStore.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const deleted = productsStore.splice(index, 1)[0];
  res.json({ success: true, product: deleted });
});

// 2. Currencies & Data
app.get('/api/currencies', (_req: Request, res: Response) => {
  res.json({ success: true, currencies: CURRENCIES });
});

app.get('/api/banners', (_req: Request, res: Response) => {
  res.json({ success: true, banners: HERO_BANNERS });
});

app.get('/api/blogs', (_req: Request, res: Response) => {
  res.json({ success: true, blogs: BLOG_ARTICLES });
});

// 3. User & Wallet
app.get('/api/user', (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: userStore,
    transactions: walletTransactionsStore,
  });
});

app.post('/api/wallet/deposit', (req: Request, res: Response) => {
  const { amountUSD, paymentMethod, reference } = req.body;
  const numAmount = parseFloat(amountUSD);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  }

  userStore.walletBalanceUSD = parseFloat((userStore.walletBalanceUSD + numAmount).toFixed(2));

  const transaction: WalletTransaction = {
    id: `wtx_${Date.now()}`,
    type: 'deposit',
    amount: numAmount,
    currency: 'USD',
    paymentMethod: paymentMethod || 'bKash',
    status: 'Completed',
    createdAt: new Date().toLocaleString(),
    reference: reference || `REF_${Math.floor(100000 + Math.random() * 900000)}`,
  };

  walletTransactionsStore.unshift(transaction);

  securityLogsStore.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: `Wallet Balance Loaded: +$${numAmount} via ${paymentMethod}`,
    ip: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    user: userStore,
    transaction,
    message: `Successfully added $${numAmount.toFixed(2)} to your Zenvo Wallet!`,
  });
});

// 4. Checkout & Orders
app.post('/api/checkout', (req: Request, res: Response) => {
  const { items, totalUSD, currency, paymentMethod, playerId, serverId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Check wallet balance if paymentMethod is Zenvo Wallet
  if (paymentMethod === 'Zenvo Wallet') {
    if (userStore.walletBalanceUSD < totalUSD) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Zenvo Wallet balance. Please load funds or choose another payment method.',
      });
    }
    userStore.walletBalanceUSD = parseFloat((userStore.walletBalanceUSD - totalUSD).toFixed(2));
    walletTransactionsStore.unshift({
      id: `wtx_${Date.now()}`,
      type: 'purchase',
      amount: totalUSD,
      currency: 'USD',
      paymentMethod: 'Zenvo Wallet',
      status: 'Completed',
      createdAt: new Date().toLocaleString(),
      reference: `ORD_${Date.now()}`,
    });
  }

  const orderNumber = `ZNG-${Math.floor(100000 + Math.random() * 900000)}`;
  const rateObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const paidAmountCurrency = parseFloat((totalUSD * rateObj.rateToUSD).toFixed(2));

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber,
    userId: userStore.id,
    userEmail: userStore.email,
    items,
    totalUSD,
    currency,
    paidAmountCurrency,
    paymentMethod,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Delivered', // Instant delivery
    playerId: playerId || 'PLAYER_DEFAULT',
    serverId: serverId || undefined,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    transactionId: `TXN_${paymentMethod.toUpperCase().replace(/\s+/g, '_')}_${Math.floor(100000 + Math.random() * 900000)}`,
  };

  ordersStore.unshift(newOrder);
  userStore.totalOrders += 1;

  securityLogsStore.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: `Order #${orderNumber} Fulfilled Instantly ($${totalUSD})`,
    ip: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    order: newOrder,
    user: userStore,
    message: 'Order processed successfully! Your top-up is delivered.',
  });
});

app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, orders: ordersStore });
});

app.get('/api/orders/track/:orderId', (req: Request, res: Response) => {
  const query = req.params.orderId.toUpperCase().trim();
  const order = ordersStore.find(
    (o) => o.id === query || o.orderNumber.toUpperCase() === query || o.transactionId.toUpperCase() === query
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found with that Order ID or Transaction ID' });
  }

  res.json({ success: true, order });
});

app.put('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const order = ordersStore.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  order.fulfillmentStatus = status;
  order.updatedAt = new Date().toLocaleString();
  res.json({ success: true, order });
});

// 5. Support Tickets
app.get('/api/tickets', (_req: Request, res: Response) => {
  res.json({ success: true, tickets: ticketsStore });
});

app.post('/api/tickets', (req: Request, res: Response) => {
  const { subject, category, priority, message } = req.body;

  const newTicket: SupportTicket = {
    id: `tkt_${Date.now()}`,
    ticketNumber: `TCK-2026-${Math.floor(100 + Math.random() * 900)}`,
    userId: userStore.id,
    userEmail: userStore.email,
    subject: subject || 'General Query',
    category: category || 'Top-Up Issue',
    status: 'Open',
    priority: priority || 'Medium',
    messages: [
      {
        id: `msg_1`,
        sender: 'user',
        senderName: userStore.name,
        message: message || '',
        timestamp: new Date().toLocaleString(),
      },
      {
        id: `msg_2`,
        sender: 'ai',
        senderName: 'Zenvo AI Auto-Response',
        message: `Thank you for reaching out! Ticket #${subject} has been assigned to our 24/7 priority dispatch queue. An agent or automated system is reviewing your Player ID payload.`,
        timestamp: new Date(Date.now() + 1000).toLocaleString(),
      },
    ],
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
  };

  ticketsStore.unshift(newTicket);
  res.json({ success: true, ticket: newTicket });
});

app.post('/api/tickets/:id/reply', (req: Request, res: Response) => {
  const { message, sender } = req.body;
  const ticket = ticketsStore.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  ticket.messages.push({
    id: `msg_${Date.now()}`,
    sender: sender || 'user',
    senderName: sender === 'support' ? 'Zenvo Support Admin' : userStore.name,
    message,
    timestamp: new Date().toLocaleString(),
  });
  ticket.updatedAt = new Date().toLocaleString();

  res.json({ success: true, ticket });
});

// 6. Gemini AI Assistant
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: `⚡ **Zenvo Cyber Assistant (Fallback Mode)**: I'm operating in offline mode. I can tell you that all Free Fire, PUBG, FC Mobile, and MLBB top-ups are **100% active with sub-30 second instant delivery**! Try selecting a game from the grid or loading your wallet via bKash/Nagad/Visa.`,
      });
    }

    const systemPrompt = `You are "Zenvo AI", the elite cybernetic assistant for Zenvo Games - the world's premier gaming top-up & e-commerce platform.
Your persona: Tech-savvy, gaming-enthusiast, ultra-helpful, professional, and swift.
Knowledge base:
- Games available: Free Fire MAX (Diamonds/Passes), PUBG Mobile (UC/Royale Pass), EA Sports FC Mobile (FC Points), Mobile Legends (Diamonds/Starlight), Genshin Impact (Genesis Crystals/Welkin), Blood Strike, StarMaker, IMO, Bigo Live, Steam Wallet Cards, Apple Gift Cards, Google Play, Netflix 4K profiles.
- Payment methods: bKash, Nagad, Rocket, Visa/Mastercard, Crypto (USDT), and Zenvo Wallet.
- Key highlights: Sub-30 second instant automated delivery, 24/7 support, 100% authorized Garena/Krafton/Moonton partners.
- Currency conversions supported: USD ($), BDT (৳, 1 USD = 120 BDT), EUR (€), INR (₹), GBP (£).

Rule: Keep answers clear, well-formatted with markdown and bullet points, gamer-friendly, and concise!`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
      ],
    });

    const replyText = response.text || 'I am ready to assist your gaming top-up needs!';
    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Gemini AI error:', error);
    res.json({
      success: true,
      reply: `⚡ **Zenvo Cyber Assistant**: I am currently verifying live game server gateways. All top-ups (Free Fire, PUBG UC, FC Points) are live and instant! How can I assist with your order?`,
    });
  }
});

// 7. Admin Analytics API
app.get('/api/admin/analytics', (_req: Request, res: Response) => {
  const totalRevenue = ordersStore.reduce((acc, o) => acc + o.totalUSD, 0);
  const totalOrdersCount = ordersStore.length;
  const activeProductsCount = productsStore.length;

  const salesByDay = [
    { day: 'Mon', revenue: 1420, orders: 120 },
    { day: 'Tue', revenue: 1890, orders: 165 },
    { day: 'Wed', revenue: 2300, orders: 210 },
    { day: 'Thu', revenue: 1980, orders: 180 },
    { day: 'Fri', revenue: 3120, orders: 290 },
    { day: 'Sat', revenue: 4200, orders: 380 },
    { day: 'Sun', revenue: 3850, orders: 340 },
  ];

  const categoryDistribution = [
    { name: 'Game Top-Up', value: 65, color: '#00ff66' },
    { name: 'Social Top-Up', value: 15, color: '#00e5ff' },
    { name: 'Gift Cards', value: 12, color: '#a855f7' },
    { name: 'Subscriptions', value: 8, color: '#f59e0b' },
  ];

  res.json({
    success: true,
    analytics: {
      totalRevenue: totalRevenue + 18450.00, // combined with mock baseline
      totalOrdersCount: totalOrdersCount + 1420,
      activeProductsCount,
      registeredUsersCount: 12840,
      walletFloatUSD: 38920.50,
      salesByDay,
      categoryDistribution,
      securityLogs: securityLogsStore,
    },
  });
});

// ==================== VITE & STATIC HANDLING ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zenvo Games server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
