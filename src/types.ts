export type CategoryType = 'game-topup' | 'social-topup' | 'gift-card' | 'game-account' | 'subscription' | string;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  badge?: string;
  active?: boolean;
  itemCount?: number;
}

export interface UnitItem {
  id: string;
  name: string; // e.g. "Diamonds", "UC (Unknown Cash)", "Gift Card ($)", "Coins", "Points", "Subscription (Days/Months)"
  symbol?: string; // e.g. "💎", "🪙", "🎟️", "👑", "⚡"
  category: string; // e.g. "game-topup", "gift-card", "subscription", etc.
  description?: string;
  defaultStep?: number;
}

export interface ProductDenomination {
  id: string;
  name: string; // e.g. "100 Diamonds", "520+52 Diamonds", "60 UC", "Weekly Pass"
  label?: string; // alias for name, used in some pages
  amount: number; // base price in USD
  priceBDT?: number; // Custom price in BDT
  originalAmount?: number;
  bonus?: string; // e.g. "+10% Bonus"
  bonusLabel?: string; // alias for bonus
  bonusAmount?: number;
  popular?: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: CategoryType;
  unitId?: string;
  unitName?: string;
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
  playerIdPlaceholder?: string;
  howToFindPlayerId?: string[];
  hasServerId?: boolean;
  requiresServerId?: boolean; // alias for hasServerId
  serverIdLabel?: string;
  denominations: ProductDenomination[];
  tags: string[];
}

export type CurrencyCode = 'USD' | 'BDT';

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
  userId?: string;
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
  customerName?: string;
  customerPhone?: string;
  senderNumber?: string;
  ipAddress?: string;
  items: CartItem[];
  totalUSD: number;
  currency: CurrencyCode;
  paidAmountCurrency: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Crypto/USDT' | 'Zenov Wallet';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Pending Verification';
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
  phone?: string;
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
  slug?: string;
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

export interface SocialLinks {
  facebook?: string;
  youtube?: string;
  telegram?: string;
  discord?: string;
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  whatsappLink?: string;
  address: string;
  aboutText: string;
  copyrightText: string;
  socialLinks: SocialLinks;
  updatedAt?: string;
}
