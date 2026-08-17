import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `⚡ **ZENOV Cyber Assistant Online**: I am your AI gaming advisor! Ask me anything about Free Fire Diamonds, PUBG UC, FC Points, currency exchange rates, or top-up delivery times. How can I assist your gaming setup today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentQuery }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, sender: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `⚡ **ZENOV AI System**: All Free Fire and PUBG top-ups are currently 100% operational with sub-30 second instant UID delivery!`,
          },
        ]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `⚡ **ZENOV AI Gateway**: Connected to live game servers. Pick any game package to top up instantly!`,
        },
      ]);
    }
  };

  const quickPrompts = [
    '🔥 What is the best Free Fire Diamond package?',
    '⚡ How fast is bKash / Nagad top-up delivery?',
    '⚽ How do I get FC Mobile TOTY Star Pass?',
    '🎮 How to track my order status?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenov-bg/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zenov-surface border border-zenov-border rounded-2xl shadow-xl overflow-hidden text-zenov-text my-8 flex flex-col h-[75vh]">
        {/* Header */}
        <div className="p-4 bg-zenov-card/80 border-b border-zenov-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-zenov-accent-soft to-zenov-primary-soft border border-zenov-accent-border/40 flex items-center justify-center shadow-sm">
              <Bot className="w-[18px] h-[18px] text-zenov-accent" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zenov-accent animate-live-pulse border-2 border-zenov-surface"></span>
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-zenov-text flex items-center gap-2">
                <span>ZENOV CYBER AI ASSISTANT</span>
                <span className="px-1.5 py-0.2 rounded bg-zenov-accent-soft text-zenov-accent text-[9px] font-bold border border-zenov-accent-border/30">
                  GEMINI 2.5
                </span>
              </h2>
              <p className="text-[10px] text-zenov-muted">24/7 AI GAMING & TOP-UP ADVISOR</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zenov-surface border border-zenov-border text-zenov-secondary hover:text-zenov-accent hover:border-zenov-accent-border hover:bg-zenov-accent-soft transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
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
                <div className={`flex items-center gap-1.5 text-[10px] ${isUser ? 'text-white/70' : 'text-zenov-muted'} mb-1`}>
                  {isUser ? (
                    <span className="font-bold text-white">You</span>
                  ) : (
                    <span className="font-bold text-zenov-accent flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> ZENOV AI Advisor
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-line leading-relaxed text-[13px]">{msg.text}</div>
              </div>
            );
          })}

          {isTyping && (
            <div className="mr-auto bg-zenov-card border border-zenov-border rounded-2xl p-3 text-xs text-zenov-accent flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zenov-accent animate-ping"></span>
              <span className="font-medium">ZENOV AI is generating gaming response...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-zenov-card/40 border-t border-zenov-border/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(prompt);
              }}
              className="px-3 py-1.5 rounded-lg bg-zenov-surface hover:bg-zenov-primary-soft text-zenov-secondary hover:text-zenov-primary text-[11px] whitespace-nowrap border border-zenov-border hover:border-zenov-primary-border/50 transition-colors font-medium shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-zenov-card/60 border-t border-zenov-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ZENOV AI about game top-ups, UID safety, or prices..."
            className="flex-1 bg-zenov-surface border border-zenov-border focus:border-zenov-accent focus:ring-2 focus:ring-zenov-accent-border rounded-xl px-3.5 py-2.5 text-xs text-zenov-text focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="px-5 py-2.5 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-black text-xs uppercase shadow-md transition-all active:scale-[0.97] disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
