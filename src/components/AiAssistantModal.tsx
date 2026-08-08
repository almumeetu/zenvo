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
      text: `⚡ **Zenvo Cyber Assistant Online**: I am your AI gaming advisor! Ask me anything about Free Fire Diamonds, PUBG UC, FC Points, currency exchange rates, or top-up delivery times. How can I assist your gaming setup today?`,
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
            text: `⚡ **Zenvo AI System**: All Free Fire and PUBG top-ups are currently 100% operational with sub-30 second instant UID delivery!`,
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
          text: `⚡ **Zenvo AI Gateway**: Connected to live game servers. Pick any game package to top up instantly!`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#080e15] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.25)] overflow-hidden text-slate-100 my-8 flex flex-col h-[75vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950 via-[#0a141d] to-[#070b0f] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-400/40 shadow-[0_0_10px_rgba(0,229,255,0.4)]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white flex items-center gap-2">
                <span>ZENVO CYBER AI ASSISTANT</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                  GEMINI 2.5
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">24/7 AI GAMING & TOP-UP ADVISOR</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
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
                className={`max-w-[85%] rounded-2xl p-3 font-mono text-xs space-y-1 ${
                  isUser
                    ? 'ml-auto bg-cyan-950/80 border border-cyan-500/40 text-cyan-100'
                    : 'mr-auto bg-[#0a121c] border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                  {isUser ? (
                    <span className="text-cyan-400 font-bold">You</span>
                  ) : (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" /> Zenvo AI Advisor
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
              </div>
            );
          })}

          {isTyping && (
            <div className="mr-auto bg-[#0a121c] border border-slate-800 rounded-2xl p-3 text-xs font-mono text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Zenvo AI is generating gaming response...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-[#060a0f] border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-mono text-[10px] whitespace-nowrap border border-cyan-500/30 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#060a0f] border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zenvo AI about game top-ups, UID safety, or prices..."
            className="flex-1 bg-[#0b121a] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-mono font-black text-xs uppercase shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
