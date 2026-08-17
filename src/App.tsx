import React, { useState, useEffect } from 'react';
import { Product, CategoryType, CurrencyCode, UserProfile, CartItem, Order, SupportTicket, WalletTransaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_USER, INITIAL_ORDERS, INITIAL_TICKETS, HERO_BANNERS, BLOG_ARTICLES } from './data/initialData';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { NewArrivalMarquee } from './components/NewArrivalMarquee';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductGrid } from './components/ProductGrid';
import { QuickTopUpModal } from './components/QuickTopUpModal';
import { WhyChooseUs } from './components/WhyChooseUs';
import { PromotionsBlog } from './components/PromotionsBlog';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WalletModal } from './components/WalletModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { SupportTicketModal } from './components/SupportTicketModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Headphones, Bot, Clock, Sparkles } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isSupportTicketOpen, setIsSupportTicketOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load products from Express backend
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch(() => {});

    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setWalletTransactions(data.transactions || []);
        }
      })
      .catch(() => {});
  }, []);

  // Cart Handlers
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const handleUpdateCartQuantity = (productId: string, denominationId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.denomination.id === denominationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string, denominationId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.denomination.id === denominationId)
      )
    );
  };

  // Direct Checkout API Call
  const handleDirectCheckout = async (
    item: CartItem,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Crypto/USDT' | 'Zenov Wallet'
  ) => {
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
        setOrders((prev) => [data.order, ...prev]);
        if (data.user) setUser(data.user);
        return { success: true, orderNumber: data.order.orderNumber, message: data.message };
      } else {
        return { success: false, message: data.message || 'Payment failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server communication error' };
    }
  };

  // Deposit Wallet API Call
  const handleDepositWallet = async (amountUSD: number, method: string, reference: string) => {
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD, paymentMethod: method, reference }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setWalletTransactions((prev) => [data.transaction, ...prev]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Deposit request failed' };
    }
  };

  // Track Order API Search
  const handleSearchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/track/${orderId}`);
      const data = await res.json();
      if (data.success) return data.order;
      return null;
    } catch (err) {
      return null;
    }
  };

  // Create Ticket API
  const handleCreateTicket = async (
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
      if (data.success) {
        setTickets((prev) => [data.ticket, ...prev]);
      }
    } catch (err) {}
  };

  const handleReplyTicket = async (ticketId: string, message: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender: 'user' }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? data.ticket : t))
        );
      }
    } catch (err) {}
  };

  // Admin Product Operations
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    }).catch(() => {});
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Processing' | 'Delivered' | 'Refunded') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: status } : o))
    );
    fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-zenov-bg text-zenov-text font-sans">
      {/* Header */}
      <Header
        products={products}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        user={user}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectProduct={(product: Product) => setSelectedProductForModal(product)}
      />

      {/* Main Content Area */}
      <main>
        {/* Animated Hero Carousel Banner */}
        <HeroBanner
          banners={HERO_BANNERS}
          selectedCurrency={selectedCurrency}
          onSelectGame={(gameId) => {
            const found = products.find((p) => p.id === gameId);
            if (found) setSelectedProductForModal(found);
          }}
        />

        {/* Live Top-Up Ticker Marquee */}
        <NewArrivalMarquee />

        {/* Category Tabs Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Product Grids */}
        <div id="shop-products">
          <ProductGrid
            products={products}
            selectedCategory={selectedCategory}
            selectedCurrency={selectedCurrency}
            onSelectProduct={(product: Product) => setSelectedProductForModal(product)}
          />
        </div>

        {/* "Why Choose Us" Cockpit Features */}
        <div id="why-choose-us">
          <WhyChooseUs />
        </div>

        {/* Promotions & Gaming Blog Posts */}
        <div id="blog-section">
          <PromotionsBlog articles={BLOG_ARTICLES} />
        </div>
      </main>

      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
        <button
          onClick={() => setIsSupportTicketOpen(true)}
          className="p-3 rounded-2xl bg-zenov-card border border-zenov-border text-zenov-text-secondary hover:text-zenov-primary hover:border-zenov-primary-border hover:bg-zenov-primary-soft shadow-md hover:shadow-primary transition-all duration-200 group"
          title="24/7 Live Support"
        >
          <Headphones className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="p-3 rounded-2xl bg-zenov-card border border-zenov-border text-zenov-text-secondary hover:text-zenov-accent hover:border-zenov-accent-border hover:bg-zenov-accent-soft shadow-md hover:shadow-accent transition-all duration-200 group relative"
          title="Zenvo AI Gaming Assistant"
        >
          <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-zenov-accent rounded-full animate-live-pulse" />
        </button>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <QuickTopUpModal
        product={selectedProductForModal}
        selectedCurrency={selectedCurrency}
        user={user}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCart}
        onDirectCheckout={handleDirectCheckout}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        selectedCurrency={selectedCurrency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          if (cartItems[0]) {
            const prod = products.find((p) => p.id === cartItems[0].productId);
            if (prod) setSelectedProductForModal(prod);
          }
        }}
      />

      <WalletModal
        isOpen={isWalletOpen}
        user={user}
        transactions={walletTransactions}
        selectedCurrency={selectedCurrency}
        onClose={() => setIsWalletOpen(false)}
        onDeposit={handleDepositWallet}
      />

      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        orders={orders}
        selectedCurrency={selectedCurrency}
        onClose={() => setIsOrderTrackerOpen(false)}
        onSearchOrder={handleSearchOrder}
        user={user}
      />

      <SupportTicketModal
        isOpen={isSupportTicketOpen}
        tickets={tickets}
        user={user}
        onClose={() => setIsSupportTicketOpen(false)}
        onCreateTicket={handleCreateTicket}
        onReplyTicket={handleReplyTicket}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        user={user}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(updatedUser) => setUser(updatedUser)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        products={products}
        orders={orders}
        selectedCurrency={selectedCurrency}
        onClose={() => setIsAdminOpen(false)}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
