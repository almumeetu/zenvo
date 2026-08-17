import React, { useState } from 'react';
import { SupportTicket, UserProfile } from '../types';
import { Headphones, X, MessageSquare, Plus, Send, CheckCircle2, Shield } from 'lucide-react';

interface SupportTicketModalProps {
  isOpen: boolean;
  tickets: SupportTicket[];
  user: UserProfile;
  onClose: () => void;
  onCreateTicket: (
    subject: string,
    category: 'Top-Up Issue' | 'Payment Delay' | 'Wallet Top-Up' | 'General Query',
    priority: 'Low' | 'Medium' | 'High' | 'Urgent',
    message: string
  ) => Promise<void>;
  onReplyTicket: (ticketId: string, message: string) => Promise<void>;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  tickets,
  user,
  onClose,
  onCreateTicket,
  onReplyTicket,
}) => {
  if (!isOpen) return null;

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Top-Up Issue' | 'Payment Delay' | 'Wallet Top-Up' | 'General Query'>('Top-Up Issue');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newMessage, setNewMessage] = useState('');

  // Reply input state
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent': return 'bg-zenov-error-soft text-zenov-error border-zenov-error/30';
      case 'High': return 'bg-zenov-warning-soft text-zenov-warning border-zenov-warning/30';
      case 'Medium': return 'bg-zenov-primary-soft text-zenov-primary border-zenov-primary-border/40';
      default: return 'bg-zenov-card text-zenov-secondary border-zenov-border';
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !newMessage.trim()) return;

    setIsSubmitting(true);
    await onCreateTicket(subject, category, priority, newMessage);
    setIsSubmitting(false);

    setSubject('');
    setNewMessage('');
    setIsCreating(false);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSubmitting(true);
    await onReplyTicket(selectedTicket.id, replyMessage);
    setIsSubmitting(false);

    setReplyMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenov-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zenov-surface border border-zenov-border rounded-2xl shadow-xl overflow-hidden text-zenov-text my-8 flex flex-col md:flex-row h-[80vh] max-h-[85vh]">
        {/* Left Sidebar: Ticket List */}
        <div className="w-full md:w-80 bg-zenov-card/50 border-r border-zenov-border flex flex-col">
          <div className="p-4 border-b border-zenov-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zenov-primary-soft text-zenov-primary flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-zenov-text uppercase">24/7 SUPPORT CENTER</h3>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-2.5 py-1 rounded-lg bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-bold text-[11px] transition-colors flex items-center gap-1 active:scale-[0.97]"
            >
              <Plus className="w-3 h-3" /> New Ticket
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tickets.map((tkt) => (
              <button
                key={tkt.id}
                onClick={() => {
                  setSelectedTicket(tkt);
                  setIsCreating(false);
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all active:scale-[0.99] ${
                  selectedTicket?.id === tkt.id && !isCreating
                    ? 'bg-zenov-primary-soft/40 border-zenov-primary-border text-zenov-text'
                    : 'bg-zenov-surface border-zenov-border text-zenov-secondary hover:border-zenov-primary-border/50 hover:text-zenov-text'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-zenov-primary font-bold font-mono">{tkt.ticketNumber}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] border font-bold ${getPriorityBadge(tkt.priority)}`}>
                    {tkt.status}
                  </span>
                </div>
                <h4 className="font-bold text-zenov-text line-clamp-1 text-sm">{tkt.subject}</h4>
                <p className="text-[10px] text-zenov-muted mt-1">{tkt.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Main Panel: Ticket Messages or New Ticket Form */}
        <div className="flex-1 flex flex-col bg-zenov-surface relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-zenov-card border border-zenov-border text-zenov-secondary hover:text-zenov-primary hover:border-zenov-primary-border hover:bg-zenov-primary-soft transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {isCreating ? (
            /* Create New Ticket Form */
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-zenov-primary uppercase tracking-wider">
                SUBMIT NEW SUPPORT DISPATCH TICKET
              </h3>

              <div>
                <label className="text-xs text-zenov-secondary block mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Free Fire Diamond top-up delay on Order #ZNG-894102"
                  className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zenov-secondary block mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none transition-all"
                  >
                    <option value="Top-Up Issue">Top-Up Issue</option>
                    <option value="Payment Delay">Payment Delay</option>
                    <option value="Wallet Top-Up">Wallet Top-Up</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zenov-secondary block mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent 🔥</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zenov-secondary block mb-1 font-medium">Detailed Message / Order UID</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={5}
                  placeholder="Include your Order ID, Player UID, payment receipt reference number..."
                  className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl p-3 text-xs text-zenov-text focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-zenov-surface border border-zenov-border hover:bg-zenov-card text-zenov-text font-bold text-xs transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-zenov-primary hover:bg-zenov-primary-hover text-white font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          ) : selectedTicket ? (
            /* Ticket Discussion Thread */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-zenov-border bg-zenov-card/60 pr-16">
                <div className="flex items-center gap-2 text-zenov-primary text-xs font-medium">
                  <Shield className="w-4 h-4" />
                  <span className="font-mono font-bold">TICKET #{selectedTicket.ticketNumber}</span>
                  <span className="text-zenov-border">•</span>
                  <span className="text-zenov-muted">{selectedTicket.category}</span>
                  <span className="ml-auto">
                    <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority} Priority
                    </span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-zenov-text mt-1">{selectedTicket.subject}</h3>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedTicket.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-1 ${
                        isUser
                          ? 'ml-auto bg-zenov-primary text-white border border-zenov-primary-border/50'
                          : 'mr-auto bg-zenov-card border border-zenov-border text-zenov-text'
                      }`}
                    >
                      <div className={`flex items-center justify-between text-[10px] mb-1 ${isUser ? 'text-white/70' : 'text-zenov-muted'}`}>
                        <span className={`font-bold ${isUser ? 'text-white' : 'text-zenov-primary'}`}>{msg.senderName}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReplySubmit} className="p-3 border-t border-zenov-border bg-zenov-card/40 flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type message reply to support agent..."
                  className="flex-1 bg-zenov-surface border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-bold text-xs transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-zenov-muted text-xs">
              Select a ticket or submit a new dispatch ticket.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
