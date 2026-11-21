'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import { SupportTicket, Order } from '@/types';
import {
  MessageSquare,
  Bot,
  Headphones,
  X,
  Send,
  Sparkles,
  User as UserIcon,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowLeft,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Search,
  Package,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface AiMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: '💎 Free Fire Diamonds', query: 'How do I top up Free Fire diamonds?' },
  { label: '⚡ PUBG Mobile UC', query: 'What are the PUBG Mobile UC packages?' },
  { label: '📦 Track My Order', query: 'How do I track my order status?' },
  { label: '💳 bKash / Nagad', query: 'What are the bKash and Nagad payment methods?' },
  { label: '👑 VIP Cashbacks', query: 'Tell me about VIP tiers and rewards' },
  { label: '👨‍💻 Talk to Admin', query: 'I want to speak with a human support agent' },
];

// Lightweight zero-dependency Web Audio synthesizer for pleasant notifications
function playSoundNotification(type: 'send' | 'receive') {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      // Pleasant double chime for agent reply
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    }
  } catch {}
}

export const SupportChatWidget: React.FC = () => {
  const pathname = usePathname();
  const {
    user,
    orders,
    tickets,
    siteSettings,
    createTicket,
    replyTicket,
    refreshTickets,
    searchOrder,
  } = useApp();

  // Widget Open State
  const [isOpen, setIsOpen] = useState(false);
  // View mode: 'home' (welcoming hub) | 'chat' (active conversation) | 'track' (instant order tracker)
  const [view, setView] = useState<'home' | 'chat' | 'track'>('home');
  // Chat sub-tab: 'admin' (human agent desk) | 'ai' (AI chatbot)
  const [chatTab, setChatTab] = useState<'admin' | 'ai'>('admin');

  // Sound Mute Toggle
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Tooltip greeting bubble
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);

  // --- AI Chat State ---
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      id: 'ai_welcome',
      sender: 'ai',
      text: `👋 Hey! I'm **ZENOV AI**, your 24/7 Gaming Concierge.\n\nAsk me anything about **Free Fire Diamonds**, **PUBG UC**, **Order Tracking**, or **bKash/Nagad payments**.\n\nPrefer a human? You can switch to the **"Live Admin Desk"** tab anytime!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // --- Live Admin State ---
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [adminInput, setAdminInput] = useState('');
  const [isSendingAdmin, setIsSendingAdmin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTicketList, setShowTicketList] = useState(false);

  // Track unread messages from admin
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);
  const lastSeenMsgCountRef = useRef<Record<string, number>>({});

  // --- Inline Order Tracker State ---
  const [trackQuery, setTrackQuery] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  const aiChatScrollRef = useRef<HTMLDivElement>(null);
  const adminChatScrollRef = useRef<HTMLDivElement>(null);

  // Hide widget completely on /admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // Get user's latest order for smart suggestion
  const latestUserOrder = useMemo(() => {
    return orders && orders.length > 0 ? orders[0] : null;
  }, [orders]);

  // Filter user's tickets
  const userTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (user.id && user.id !== 'guest' && t.userId === user.id) return true;
      if (user.email && t.userEmail === user.email) return true;
      return true; // allow guest sessions to see local tickets
    });
  }, [tickets, user.id, user.email]);

  const activeTicket = useMemo(() => {
    if (activeTicketId) {
      const found = tickets.find((t) => t.id === activeTicketId || (t as any)._id === activeTicketId);
      if (found) return found;
    }
    return userTickets[0] || null;
  }, [tickets, activeTicketId, userTickets]);

  // Load sound setting and active ticket on mount
  useEffect(() => {
    try {
      const savedMute = localStorage.getItem('zenov_chat_mute');
      if (savedMute !== null) setIsSoundMuted(savedMute === 'true');

      const savedTicketId = localStorage.getItem('zenov_active_support_ticket_id');
      if (savedTicketId) setActiveTicketId(savedTicketId);
    } catch {}

    const timer = setTimeout(() => {
      setShowWelcomeTooltip(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Update active ticket
  useEffect(() => {
    if (!activeTicketId && userTickets.length > 0) {
      setActiveTicketId(userTickets[0].id);
    }
  }, [userTickets, activeTicketId]);

  // Detect new admin replies and play chime
  useEffect(() => {
    if (!activeTicket) return;
    const msgCount = activeTicket.messages?.length || 0;
    const lastCount = lastSeenMsgCountRef.current[activeTicket.id] || 0;

    if (msgCount > lastCount && lastCount > 0) {
      const latestMsg = activeTicket.messages[msgCount - 1];
      if (latestMsg && latestMsg.sender === 'support') {
        if (!isSoundMuted) playSoundNotification('receive');
        if (!isOpen) {
          setUnreadAdminCount((prev) => prev + 1);
        }
      }
    }

    if (isOpen && view === 'chat' && chatTab === 'admin') {
      lastSeenMsgCountRef.current[activeTicket.id] = msgCount;
      setUnreadAdminCount(0);
    }
  }, [activeTicket, isOpen, view, chatTab, isSoundMuted]);

  // Auto-poll tickets when widget is open and on admin tab
  useEffect(() => {
    if (!isOpen || view !== 'chat' || chatTab !== 'admin') return;
    const poll = async () => {
      try {
        await refreshTickets();
      } catch {}
    };
    const intervalId = setInterval(poll, 5000);
    return () => clearInterval(intervalId);
  }, [isOpen, view, chatTab, refreshTickets]);

  // Auto scroll AI chat
  useEffect(() => {
    if (chatTab === 'ai' && view === 'chat') {
      aiChatScrollRef.current?.scrollTo({
        top: aiChatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [aiMessages, aiLoading, chatTab, view]);

  // Auto scroll Admin chat
  useEffect(() => {
    if (chatTab === 'admin' && view === 'chat') {
      adminChatScrollRef.current?.scrollTo({
        top: adminChatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeTicket?.messages, chatTab, view]);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    try {
      localStorage.setItem('zenov_chat_mute', String(next));
    } catch {}
  };

  // ── SEND AI MESSAGE ──
  const handleSendAi = async (textToSend?: string) => {
    const text = (textToSend || aiInput).trim();
    if (!text || aiLoading) return;

    // Check if user is asking for human admin
    const lower = text.toLowerCase();
    if (
      lower.includes('admin') ||
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('talk to admin') ||
      lower.includes('live support') ||
      lower.includes('manush')
    ) {
      const userMsg: AiMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages((prev) => [...prev, userMsg]);
      setAiInput('');
      setAiLoading(true);

      setTimeout(() => {
        setAiLoading(false);
        setAiMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `Transferring you to **Live Admin Support**! 🚀\n\nI have connected your chat to our human support desk. Type your message below to speak directly with an active admin!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setChatTab('admin');
        setView('chat');
      }, 600);
      return;
    }

    const userMsg: AiMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    if (!isSoundMuted) playSoundNotification('send');

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setAiLoading(false);

      if (data.success && data.reply) {
        setAiMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (!isSoundMuted) playSoundNotification('receive');
      }
    } catch {
      setAiLoading(false);
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `⚡ **ZENOV AI Gateway**: All game top-ups are automated with instant sub-30s delivery! Switch to the Live Admin tab if you want to chat with our support team.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // ── SEND MESSAGE TO ADMIN (ZERO FORMS - SEAMLESS CREATION) ──
  const handleSendAdminMessage = async (textToSend?: string) => {
    const text = (textToSend || adminInput).trim();
    if (!text || isSendingAdmin) return;

    setAdminInput('');
    setIsSendingAdmin(true);
    if (!isSoundMuted) playSoundNotification('send');

    try {
      if (activeTicket) {
        // Reply to existing ticket
        await replyTicket(activeTicket.id, text);
      } else {
        // Auto-create ticket seamlessly in background with NO form!
        const autoSubject = text.length > 45 ? text.slice(0, 45) + '...' : text;
        const newTkt = await createTicket(autoSubject, 'General Query', 'Medium', text);
        if (newTkt && newTkt.id) {
          setActiveTicketId(newTkt.id);
          try {
            localStorage.setItem('zenov_active_support_ticket_id', newTkt.id);
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error sending support message:', err);
    } finally {
      setIsSendingAdmin(false);
    }
  };

  // Start fresh conversation (clear active ticket to start anew)
  const handleStartNewChat = () => {
    setActiveTicketId(null);
    try {
      localStorage.removeItem('zenov_active_support_ticket_id');
    } catch {}
    setShowTicketList(false);
    setView('chat');
    setChatTab('admin');
  };

  // Instant order search
  const handleQuickTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setIsTracking(true);
    setTrackError('');
    setTrackedOrder(null);

    try {
      const order = await searchOrder(trackQuery.trim());
      if (order) {
        setTrackedOrder(order);
      } else {
        setTrackError('Order not found. Please double-check your Order Number (e.g. ZNG-XXXXXX).');
      }
    } catch {
      setTrackError('Could not verify order at this time. Please try again.');
    } finally {
      setIsTracking(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshTickets();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  // WhatsApp click handler
  const whatsappUrl = siteSettings?.whatsappLink || (
    siteSettings?.whatsappNumber
      ? `https://wa.me/${siteSettings.whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hi ZENOV Games Support, I need assistance with my order.')}`
      : null
  );

  if (isAdminRoute) return null;

  return (
    <>
      {/* ── STICKY FLOATING TRIGGER BUTTON (BOTTOM RIGHT) ── */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center">
        {/* Animated Greeting Pill */}
        {!isOpen && showWelcomeTooltip && (
          <div className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-950/95 text-slate-100 text-xs font-semibold py-2 px-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Need Help? Chat with us live! 👋</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeTooltip(false);
              }}
              className="text-slate-400 hover:text-white ml-1 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowWelcomeTooltip(false);
            if (!isOpen) {
              setUnreadAdminCount(0);
            }
          }}
          aria-label={isOpen ? 'Close Support Chat' : 'Open Support Chat'}
          className={`relative p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-2xl active:scale-95 group cursor-pointer flex items-center justify-center ${
            isOpen
              ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rotate-90'
              : 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 border border-cyan-300/40 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:scale-105'
          }`}
        >
          {/* Pulsing glow */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-cyan-400 opacity-30 group-hover:opacity-75 blur-md transition-opacity pointer-events-none" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 -rotate-90 transition-transform" />
          ) : (
            <>
              <Headphones className="w-6 h-6 transition-transform group-hover:scale-110 drop-shadow" />
              {/* Online Green Indicator */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
              </span>

              {/* Unread Counter Badge */}
              {unreadAdminCount > 0 && (
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] shadow-lg animate-bounce border-2 border-slate-950">
                  {unreadAdminCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* ── CHAT WINDOW DRAWER ── */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[410px] h-[610px] max-h-[85vh] rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* ══════════════════════════════════════════════════
              HEADER BAR (GLOBAL)
          ══════════════════════════════════════════════════ */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border-b border-cyan-500/20 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {view !== 'home' ? (
                  <button
                    onClick={() => setView('home')}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer mr-0.5"
                    title="Back to Support Hub"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : null}

                {/* Overlapping Agent Avatars */}
                <div className="flex -space-x-2 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white shadow">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5 tracking-tight">
                    <span>ZENOV 24/7 Support</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    Typically replies in ~2 minutes
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                {view === 'chat' && chatTab === 'admin' && (
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    title="Refresh Live Messages"
                    className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                )}

                <button
                  onClick={toggleSound}
                  title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
                  className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs (Shown when in Chat view) */}
            {view === 'chat' && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mt-2.5">
                <button
                  onClick={() => setChatTab('admin')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    chatTab === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Live Admin</span>
                  {unreadAdminCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold">
                      {unreadAdminCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setChatTab('ai')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    chatTab === 'ai'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Concierge</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              VIEW 1: WELCOME HUB / HOME (ZERO CLUTTER)
          ══════════════════════════════════════════════════ */}
          {view === 'home' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
              <div className="space-y-3">
                {/* Greeting Hero Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
                  <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    How can we help you today?
                  </p>
                  <h4 className="text-base font-black text-white leading-snug">
                    Instant Top-Ups, Order Inquiries &amp; 24/7 Human Help
                  </h4>
                </div>

                {/* Smart Order Suggestion Banner (If user has recent orders) */}
                {latestUserOrder && (
                  <button
                    onClick={() => {
                      setView('chat');
                      setChatTab('admin');
                      setAdminInput(`Hi, I need assistance with Order #${latestUserOrder.orderNumber}`);
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 text-xs flex items-center justify-between gap-2 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-white">Recent Order: #{latestUserOrder.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 block">Status: {latestUserOrder.fulfillmentStatus} • Tap to ask agent</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                )}

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Card 1: Chat with Live Human Admin */}
                  <button
                    onClick={() => {
                      setView('chat');
                      setChatTab('admin');
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Chat with Support Admin
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          ONLINE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ask about order delivery, bKash payments or refunds.
                      </p>
                    </div>
                  </button>

                  {/* Card 2: Chat with AI Concierge */}
                  <button
                    onClick={() => {
                      setView('chat');
                      setChatTab('ai');
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Ask Zenvo AI Concierge
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-400/20">
                          INSTANT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Immediate 24/7 answers for Free Fire, PUBG &amp; gift cards.
                      </p>
                    </div>
                  </button>

                  {/* Card 3: Track My Order */}
                  <button
                    onClick={() => setView('track')}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Quick Order Tracker
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Check real-time delivery status using your Order ID.
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  {/* Card 4: WhatsApp Direct Chat (If enabled in settings) */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left p-3 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 text-xs flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <FaWhatsapp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-300">Chat on WhatsApp</p>
                          <p className="text-[10px] text-slate-400">Direct message our verified support line</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>

              {/* Fast Direct Message Composer on Home Screen */}
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Send us a quick message:
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!adminInput.trim()) return;
                    setView('chat');
                    setChatTab('admin');
                    handleSendAdminMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={adminInput}
                    onChange={(e) => setAdminInput(e.target.value)}
                    placeholder="Type your question or issue..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!adminInput.trim()}
                    className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white disabled:opacity-40 shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 2: CHAT INTERFACE (AI OR LIVE ADMIN)
          ══════════════════════════════════════════════════ */}
          {view === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60">
              
              {/* ── SUB-TAB: LIVE ADMIN DESK ── */}
              {chatTab === 'admin' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Status Bar */}
                  <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      {activeTicket ? (
                        <>
                          <span className="font-mono font-bold text-cyan-400">{activeTicket.ticketNumber}</span>
                          <span className="text-slate-600">•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              activeTicket.status === 'Open'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : activeTicket.status === 'In Progress'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {activeTicket.status}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-medium">New Support Conversation</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {userTickets.length > 1 && (
                        <button
                          onClick={() => setShowTicketList(!showTicketList)}
                          className="text-[10.5px] text-slate-400 hover:text-cyan-400 font-bold underline cursor-pointer"
                        >
                          {showTicketList ? 'Close List' : `All Chats (${userTickets.length})`}
                        </button>
                      )}
                      <button
                        onClick={handleStartNewChat}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 cursor-pointer"
                        title="Start New Conversation"
                      >
                        + New Chat
                      </button>
                    </div>
                  </div>

                  {/* Previous Ticket Dropdown List */}
                  {showTicketList && (
                    <div className="p-3 bg-slate-900 border-b border-slate-800 max-h-40 overflow-y-auto space-y-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Previous Conversations:</p>
                      {userTickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveTicketId(t.id);
                            setShowTicketList(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl border text-xs transition-all ${
                            activeTicket?.id === t.id
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono font-bold text-cyan-400">{t.ticketNumber}</span>
                            <span className="text-slate-500">{t.updatedAt}</span>
                          </div>
                          <p className="text-xs font-bold truncate text-slate-200 mt-0.5">{t.subject}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Stream */}
                  <div
                    ref={adminChatScrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-950 via-slate-900/20 to-slate-950"
                  >
                    {/* Welcome message if fresh chat */}
                    {(!activeTicket || activeTicket.messages?.length === 0) && (
                      <div className="flex gap-2.5 mr-auto max-w-[88%]">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed text-slate-200 shadow-sm">
                          👋 <strong>Welcome to ZENOV Live Support!</strong>
                          <p className="mt-1 text-slate-300">
                            Our support desk is online. Send us your inquiry or order details and an active agent will assist you shortly!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {activeTicket?.messages?.map((msg) => {
                      const isSupport = msg.sender === 'support';
                      const isUser = msg.sender === 'user';

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                              isUser
                                ? 'bg-cyan-500 text-black'
                                : isSupport
                                  ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md'
                                  : 'bg-slate-800 text-cyan-400'
                            }`}
                          >
                            {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-bold text-slate-400">
                              <span className={isSupport ? 'text-indigo-400 font-extrabold' : ''}>
                                {isSupport ? '🛡️ ZENOV Support Admin' : 'You'}
                              </span>
                              <span>•</span>
                              <span>{msg.timestamp}</span>
                            </div>

                            <div
                              className={`p-3 rounded-2xl text-[12.5px] leading-relaxed whitespace-pre-wrap break-words ${
                                isUser
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                                  : isSupport
                                    ? 'bg-slate-900 border border-indigo-500/40 text-slate-100 rounded-tl-none shadow-sm'
                                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isSendingAdmin && (
                      <div className="text-right text-[10px] text-cyan-400 italic">Sending message to support...</div>
                    )}
                  </div>

                  {/* Smart Attachment Pill (If user has an order) */}
                  {latestUserOrder && (
                    <div className="px-3 py-1.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] text-slate-400 shrink-0">Quick attach:</span>
                      <button
                        onClick={() => setAdminInput((prev) => `${prev} Order #${latestUserOrder.orderNumber}`.trim())}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10.5px] text-cyan-300 border border-slate-700 whitespace-nowrap cursor-pointer shrink-0"
                      >
                        Attach #{latestUserOrder.orderNumber}
                      </button>
                    </div>
                  )}

                  {/* Admin Composer */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAdminMessage();
                    }}
                    className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={adminInput}
                      onChange={(e) => setAdminInput(e.target.value)}
                      placeholder="Write message to support admin..."
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSendingAdmin || !adminInput.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* ── SUB-TAB: AI CONCIERGE ── */}
              {chatTab === 'ai' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div
                    ref={aiChatScrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950"
                  >
                    {aiMessages.map((msg) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                              isUser
                                ? 'bg-cyan-500 text-black'
                                : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm'
                            }`}
                          >
                            {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>

                          <div className="flex flex-col">
                            <div
                              className={`p-3 rounded-2xl text-[12.5px] leading-relaxed whitespace-pre-wrap break-words ${
                                isUser
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none shadow-md'
                                  : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                              }`}
                            >
                              {msg.text.split('**').map((part, idx) =>
                                idx % 2 === 1 ? (
                                  <strong key={idx} className="font-black text-cyan-300">
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                )
                              )}
                            </div>

                            <div className={`flex items-center gap-1.5 mt-1 text-[9px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                              <span>{msg.timestamp}</span>
                              {!isUser && (
                                <>
                                  <button
                                    onClick={() => copyToClipboard(msg.text, msg.id)}
                                    className="text-slate-500 hover:text-cyan-400 p-0.5 cursor-pointer"
                                    title="Copy response"
                                  >
                                    {isCopied === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setChatTab('admin');
                                      setAdminInput(msg.text.slice(0, 100));
                                    }}
                                    className="text-[9px] text-indigo-400 hover:underline cursor-pointer ml-1"
                                  >
                                    Talk to Human
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {aiLoading && (
                      <div className="flex gap-2.5 mr-auto">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Quick Prompts Chips */}
                  <div className="px-3 py-2 bg-slate-900/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {QUICK_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendAi(p.query)}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/50 text-[11px] font-semibold text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* AI Composer */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAi();
                    }}
                    className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask Zenvo AI (English or বাংলা)..."
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiInput.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-40 transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 3: INSTANT INLINE ORDER TRACKER
          ══════════════════════════════════════════════════ */}
          {view === 'track' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" />
                    Live Order Tracker
                  </h4>
                  <button
                    onClick={() => setView('home')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <form onSubmit={handleQuickTrack} className="flex gap-2">
                  <input
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="Enter Order # (e.g. ZNG-894102)"
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isTracking || !trackQuery.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold disabled:opacity-40 shadow cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" /> Track
                  </button>
                </form>

                {trackError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{trackError}</span>
                  </div>
                )}

                {trackedOrder && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        #{trackedOrder.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          trackedOrder.fulfillmentStatus === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : trackedOrder.fulfillmentStatus === 'Processing'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {trackedOrder.fulfillmentStatus}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Game / Product:</span>
                        <span className="text-white font-medium truncate max-w-[180px]">
                          {trackedOrder.items?.[0]?.productTitle || 'Game Top-Up'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Payment Gateway:</span>
                        <span className="text-white font-medium">{trackedOrder.paymentMethod} ({trackedOrder.paymentStatus})</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total Paid:</span>
                        <span className="text-cyan-400 font-bold">{trackedOrder.paidAmountCurrency || trackedOrder.totalUSD} {trackedOrder.currency}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setView('chat');
                        setChatTab('admin');
                        setAdminInput(`Inquiry about Order #${trackedOrder.orderNumber}: status is ${trackedOrder.fulfillmentStatus}.`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Headphones className="w-3.5 h-3.5" /> Ask Support Agent About This Order
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom return to chat button */}
              <button
                onClick={() => {
                  setView('chat');
                  setChatTab('admin');
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" /> Return to Chat
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
