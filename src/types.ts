export type CategoryType = 'game-topup' | 'social-topup' | 'gift-card' | 'game-account' | 'subscription';

export interface ProductDenomination {
  id: string;
  name: string; // e.g. "100 Diamonds", "520+52 Diamonds", "60 UC", "Weekly Pass"
  amount: number; // base price in USD
  originalAmount?: number;
  bonus?: string; // e.g. "+10% Bonus"
  popular?: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: CategoryType;
  image: string;
  bannerImage?: string;
  publisher?: string;
  region?: string;
  deliveryType: 'Instant' | 'Manual (5-10 min)' | 'Pre-Order';
  inStock: boolean;
  isHot?: boolean;
  isNew?: boolean;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  description: string;
  instructions: string;
  playerIdLabel: string; // e.g. "Player ID / User ID" or "Character ID & Zone ID"
  hasServerId?: boolean;
  serverIdLabel?: string;
  denominations: ProductDenomination[];
  tags: string[];
}

export type CurrencyCode = 'USD' | 'BDT' | 'EUR' | 'INR' | 'GBP';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  rateToUSD: number; // 1 USD = rateToUSD target currency
}

export interface CartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  denomination: ProductDenomination;
  quantity: number;
  playerId: string;
  serverId?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'purchase' | 'refund' | 'bonus';
  amount: number; // in USD
  currency: CurrencyCode;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Failed';
  createdAt: string;
  reference?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  totalUSD: number;
  currency: CurrencyCode;
  paidAmountCurrency: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Visa/Mastercard' | 'Crypto/USDT' | 'Zenvo Wallet';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  fulfillmentStatus: 'Processing' | 'Delivered' | 'Pending Verification' | 'Refunded';
  playerId: string;
  serverId?: string;
  createdAt: string;
  updatedAt: string;
  transactionId: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  walletBalanceUSD: number;
  role: 'user' | 'admin';
  joinedDate: string;
  vipTier: 'Bronze' | 'Silver' | 'Gold' | 'Cyber Elite';
  totalOrders: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'Top-Up Issue' | 'Payment Delay' | 'Wallet Top-Up' | 'General Query';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  messages: {
    id: string;
    sender: 'user' | 'support' | 'ai';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gameId: string;
  image: string;
  bgGradient: string;
  ctaText: string;
}
