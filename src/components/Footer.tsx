import React from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Globe,
  ShieldCheck,
  Send,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05080c] border-t border-emerald-500/20 text-slate-400 font-sans pt-12 pb-8 relative overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent shadow-[0_0_15px_#00ff66]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-0.5">
              <div className="w-full h-full bg-[#080d12] rounded-[10px] flex items-center justify-center">
                <span className="font-black text-lg text-emerald-400 font-mono">Z</span>
              </div>
            </div>
            <span className="text-xl font-black text-white font-mono tracking-wider">
              ZENVO <span className="text-emerald-400">GAMES</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Next-generation gaming top-up & e-commerce platform. Enjoy sub-30 second instant digital fulfillment for Free Fire, PUBG, FC Mobile, and gift cards with 100% security guarantee.
          </p>

          <div className="flex items-center gap-3">
            {['Discord', 'YouTube', 'Telegram', 'Facebook'].map((platform, idx) => (
              <a
                key={idx}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-lg bg-[#0c1218] border border-slate-800 hover:border-emerald-400 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-colors font-mono text-xs"
              >
                {platform[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Contact Us */}
        <div>
          <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            CONTACT US
          </h4>
          <ul className="space-y-2.5 text-xs font-mono">
            <li className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Click to chat with us (WhatsApp)</span>
            </li>
            <li className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Hotline: +880 1302-058753</span>
            </li>
            <li className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>support@zenvogames.com</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Information & Links */}
        <div>
          <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            INFORMATION
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 transition-colors">
                Our Customer Reviews ⭐ 4.9/5
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 transition-colors">
                Refund & Return Policy
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 transition-colors">
                Privacy Policy & Cookie Usage
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 transition-colors">
                Terms and Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            GAMER NEWSLETTER
          </h4>
          <p className="text-xs text-slate-400 mb-3 font-sans">
            Subscribe for instant drop alerts, free diamond giveaways, and bonus codes.
          </p>
          <div className="flex items-center gap-1.5 bg-[#0c1218] border border-slate-800 rounded-xl p-1.5">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent text-xs text-white px-2 focus:outline-none font-mono"
            />
            <button className="px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-mono font-bold text-xs">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Logos Bar */}
      <div className="border-t border-slate-800/80 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          ACCEPTED OFFICIAL PAYMENT METHODS
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { name: 'bKash', color: 'bg-pink-950/60 text-pink-400 border-pink-500/40' },
            { name: 'Nagad', color: 'bg-orange-950/60 text-orange-400 border-orange-500/40' },
            { name: 'Rocket', color: 'bg-purple-950/60 text-purple-400 border-purple-500/40' },
            { name: 'VISA', color: 'bg-blue-950/60 text-blue-400 border-blue-500/40' },
            { name: 'Mastercard', color: 'bg-amber-950/60 text-amber-400 border-amber-500/40' },
            { name: 'USDT Crypto', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' },
            { name: 'Zenvo Wallet', color: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40' },
          ].map((pm, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-lg border font-mono font-bold text-xs ${pm.color} shadow-sm`}
            >
              {pm.name}
            </span>
          ))}
        </div>

        <p className="text-[11px] font-mono text-slate-500 pt-3">
          © 2026 <span className="text-emerald-400 font-bold">Zenvo Games</span>. All Rights Reserved. All game logos and trademarks belong to their respective publisher owners.
        </p>
      </div>
    </footer>
  );
};
