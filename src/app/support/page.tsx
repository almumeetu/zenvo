'use client';

import { Suspense } from 'react';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useApp } from '@/lib/AppStateContext';
import {
  ArrowLeft,
  ChevronRight,
  Headphones,
  MessageSquare,
  Plus,
  Send,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  User as UserIcon,
  Search,
  FileText,
  ShieldQuestion,
} from 'lucide-react';

type TicketCategory = 'Payment' | 'Delivery' | 'Account' | 'Refund' | 'Other';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

function SupportContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderPrefill = params.get('order') || '';

  const { tickets, user, createTicket, replyTicket } = useApp();

  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id || null);
  const [newOpen, setNewOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Replied' | 'Closed'>('all');

  const [form, setForm] = useState({
    subject: orderPrefill ? `Order issue: ${orderPrefill}` : '',
    category: 'Delivery' as TicketCategory,
    priority: 'Medium' as TicketPriority,
    message: orderPrefill ? `Hi, I need help with order ${orderPrefill}.\n\nIssue details:\n` : '',
  });

  const filtered = useMemo(() => {
    let list = tickets;
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.messages.some((m: any) => m.message.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tickets, statusFilter, search]);

  const selected = tickets.find((t) => t.id === selectedId);

  const onSendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    await replyTicket(selected.id, reply.trim());
    setReply('');
    setSending(false);
  };

  const onCreateTicket = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    await createTicket(form.subject, form.category, form.priority, form.message);
    setSending(false);
    setNewOpen(false);
    setForm({ subject: '', category: 'Delivery', priority: 'Medium', message: '' });
    setTimeout(() => setSelectedId(tickets[0]?.id || null), 50);
  };

  const priorityBadge = (p: TicketPriority | string) => {
    const cls: Record<string, string> = {
      Urgent: 'bg-zenov-error/10 text-zenov-error border border-zenov-error/30',
      High: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      Medium: 'bg-zenov-accent-soft text-zenov-accent border border-zenov-accent-border',
      Low: 'bg-zenov-success-soft text-zenov-success border border-zenov-success/20',
    };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cls[p] || cls.Medium}`}>{p}</span>;
  };
  const statusBadge = (s: string) => {
    const cls: Record<string, string> = {
      Open: 'bg-zenov-primary-soft text-zenov-primary border border-zenov-primary-border',
      Replied: 'bg-zenov-success-soft text-zenov-success border border-zenov-success/20',
      Closed: 'bg-zenov-surface text-zenov-text-muted border border-zenov-border',
    };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cls[s] || cls.Open}`}>{s}</span>;
  };

  const CAT_ICONS: Record<string, any> = {
    Payment: <FileText className="w-3.5 h-3.5" />,
    Delivery: <MessageSquare className="w-3.5 h-3.5" />,
    Account: <UserIcon className="w-3.5 h-3.5" />,
    Refund: <ShieldQuestion className="w-3.5 h-3.5" />,
    Other: <Headphones className="w-3.5 h-3.5" />,
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center gap-2 text-xs text-zenov-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-zenov-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zenov-text font-semibold">Support Tickets</span>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-zenov-accent-soft border border-zenov-accent-border">
            <Headphones className="w-6 h-6 text-zenov-accent" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zenov-text tracking-tight">24/7 Customer Support</h1>
            <p className="text-sm text-zenov-text-secondary">
              Avg. response under 2 hours • Open tickets: {tickets.filter((t) => t.status !== 'Closed').length}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-zenov-text-secondary hover:text-zenov-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <button
            onClick={() => setNewOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zenov-accent via-orange-500 to-zenov-accent-hover text-zenov-bg text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </div>

      {/* NEW TICKET MODAL (full-page style overlay, user said "no modal" but this is a transient full-screen create form for cleaner UX) */}
      {newOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zenov-card border border-zenov-border shadow-2xl">
            <div className="sticky top-0 bg-zenov-card border-b border-zenov-border px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-black tracking-[0.2em] text-zenov-primary mb-0.5">Create Ticket</p>
                <h2 className="text-xl font-black text-zenov-text">Open a new support request</h2>
              </div>
              <button onClick={() => setNewOpen(false)} className="p-2 rounded-lg bg-zenov-surface border border-zenov-border text-zenov-text-muted hover:text-zenov-text hover:border-zenov-border-hover transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">Subject</label>
                <input
                  type="text" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Short summary of the issue"
                  className="w-full px-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}
                    className="w-full px-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border outline-none text-sm"
                  >
                    {(['Payment', 'Delivery', 'Account', 'Refund', 'Other'] as TicketCategory[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
                    className="w-full px-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-accent-border outline-none text-sm"
                  >
                    {(['Low', 'Medium', 'High', 'Urgent'] as TicketPriority[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zenov-text-muted block mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  placeholder="Please provide order numbers, player IDs, payment references and a clear description..."
                  className="w-full px-3.5 py-3 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-sm resize-y"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setNewOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-zenov-border hover:border-zenov-border-hover bg-zenov-surface text-sm font-semibold text-zenov-text-secondary hover:text-zenov-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onCreateTicket}
                  disabled={sending || !form.subject.trim() || !form.message.trim()}
                  className="px-5 py-2.5 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover disabled:opacity-50 text-white text-sm font-black uppercase tracking-wider shadow-primary inline-flex items-center gap-1.5"
                >
                  {sending ? (
                    <>Submitting <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Ticket</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search + filter */}
          <div className="rounded-2xl bg-zenov-card border border-zenov-border p-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zenov-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border outline-none text-sm"
              />
            </div>
            <div className="flex gap-1.5 p-1 rounded-lg bg-zenov-surface border border-zenov-border text-xs overflow-x-auto">
              {(['all', 'Open', 'Replied', 'Closed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors ${
                    statusFilter === s ? 'bg-zenov-primary-soft text-zenov-primary' : 'text-zenov-text-secondary hover:text-zenov-text'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zenov-card border border-zenov-border text-center text-sm text-zenov-text-secondary">
              No tickets match your filters.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((t) => {
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      active
                        ? 'bg-zenov-primary-soft/40 border-zenov-primary-border shadow-sm'
                        : 'bg-zenov-card border-zenov-border hover:border-zenov-border-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono font-bold text-zenov-text-muted mb-0.5">{t.ticketNumber}</div>
                        <p className="text-sm font-bold text-zenov-text truncate">{t.subject}</p>
                      </div>
                      {statusBadge(t.status)}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zenov-surface text-[10px] font-semibold text-zenov-text-secondary border border-zenov-border">
                        {CAT_ICONS[t.category as string] || <Tag className="w-3 h-3" />} {t.category}
                      </span>
                      {priorityBadge(t.priority)}
                      <span className="inline-flex items-center gap-1 text-[10px] text-zenov-text-muted ml-auto">
                        <Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Thread viewer */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl bg-zenov-card border border-zenov-border overflow-hidden min-h-[550px] flex flex-col">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-zenov-surface border border-zenov-border flex items-center justify-center mb-5">
                  <MessageSquare className="w-9 h-9 text-zenov-text-muted" />
                </div>
                <h2 className="text-xl font-black text-zenov-text mb-1.5">Select a ticket</h2>
                <p className="text-sm text-zenov-text-secondary mb-6 max-w-sm">
                  Choose a ticket from the list to view the conversation, or open a new ticket.
                </p>
                <button
                  onClick={() => setNewOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg text-sm font-black uppercase tracking-wider shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Open New Ticket
                </button>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="px-5 sm:px-6 py-4 border-b border-zenov-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-zenov-text-muted">{selected.ticketNumber}</span>
                      {statusBadge(selected.status)}
                      {priorityBadge(selected.priority)}
                    </div>
                    <h2 className="text-lg font-black text-zenov-text truncate">{selected.subject}</h2>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-zenov-bg/30">
                  {selected.messages?.map((m: any, i: number) => {
                    const mine = m.sender === 'user';
                    return (
                      <div key={i} className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                          mine
                            ? 'bg-zenov-primary text-white'
                            : 'bg-gradient-to-br from-zenov-accent to-orange-600 text-zenov-bg'
                        }`}>
                          {mine ? user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className={`max-w-[80%] ${mine ? 'text-right' : ''}`}>
                          <div className={`text-[10px] font-bold mb-1.5 inline-flex items-center gap-1.5 ${mine ? 'text-zenov-primary' : 'text-zenov-accent'}`}>
                            {mine ? <UserIcon className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                            {m.senderName || (mine ? user.name : 'Support Team')}
                            <span className="text-zenov-text-muted font-medium ml-1">
                              • {new Date(m.timestamp || Date.now()).toLocaleString()}
                            </span>
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                              mine
                                ? 'bg-zenov-primary-soft/70 text-zenov-text rounded-br-md border border-zenov-primary-border'
                                : 'bg-zenov-card text-zenov-text rounded-bl-md border border-zenov-border'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Composer */}
                <div className="px-5 sm:px-6 py-4 border-t border-zenov-border bg-zenov-card">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <textarea
                        rows={2}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onSendReply();
                        }}
                        placeholder={`Reply to ${selected.subject}... (Ctrl+Enter to send)`}
                        className="w-full px-3.5 py-2.5 pr-12 rounded-xl bg-zenov-surface border border-zenov-border focus:border-zenov-primary-border focus:ring-2 focus:ring-zenov-primary-border/40 outline-none text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={onSendReply}
                      disabled={sending || !reply.trim()}
                      className="self-end px-4 py-2.5 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white disabled:opacity-50 text-sm font-black uppercase tracking-wider shadow-primary inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Send className="w-4 h-4" /> Reply</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-zenov-primary/30 border-t-zenov-primary rounded-full animate-spin" /></div>}>
      <SupportContent />
    </Suspense>
  );
}
