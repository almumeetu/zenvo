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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#080e15] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden text-slate-100 my-8 flex flex-col md:flex-row h-[80vh]">
        {/* Left Sidebar: Ticket List */}
        <div className="w-full md:w-80 bg-[#060a0f] border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">24/7 SUPPORT CENTER</h3>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-mono text-[11px] font-bold transition-colors flex items-center gap-1"
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
                className={`w-full p-3 rounded-xl border text-left font-mono text-xs transition-colors ${
                  selectedTicket?.id === tkt.id && !isCreating
                    ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'bg-[#090f16] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-emerald-400 font-bold">{tkt.ticketNumber}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-slate-400">
                    {tkt.status}
                  </span>
                </div>
                <h4 className="font-bold text-white line-clamp-1">{tkt.subject}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{tkt.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Main Panel: Ticket Messages or New Ticket Form */}
        <div className="flex-1 flex flex-col bg-[#080d13] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {isCreating ? (
            /* Create New Ticket Form */
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider">
                SUBMIT NEW SUPPORT DISPATCH TICKET
              </h3>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Free Fire Diamond top-up delay on Order #ZNG-894102"
                  className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="Top-Up Issue">Top-Up Issue</option>
                    <option value="Payment Delay">Payment Delay</option>
                    <option value="Wallet Top-Up">Wallet Top-Up</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent 🔥</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Detailed Message / Order UID</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={5}
                  placeholder="Include your Order ID, Player UID, payment receipt reference number..."
                  className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          ) : selectedTicket ? (
            /* Ticket Discussion Thread */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-[#060a0f]">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                  <Shield className="w-4 h-4" />
                  <span>TICKET #{selectedTicket.ticketNumber}</span>
                  <span>•</span>
                  <span className="text-slate-400">{selectedTicket.category}</span>
                </div>
                <h3 className="text-base font-bold font-mono text-white mt-1">{selectedTicket.subject}</h3>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedTicket.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-2xl p-3 font-mono text-xs space-y-1 ${
                        isUser
                          ? 'ml-auto bg-emerald-950/80 border border-emerald-500/30 text-emerald-100'
                          : 'mr-auto bg-[#0c141f] border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-emerald-400">{msg.senderName}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReplySubmit} className="p-3 border-t border-slate-800 bg-[#060a0f] flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type message reply to support agent..."
                  className="flex-1 bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
              Select a ticket or submit a new dispatch ticket.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
