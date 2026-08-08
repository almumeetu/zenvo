import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onLoginSuccess: (updatedUser: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, user, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      ...user,
      name: name || 'CyberGamer_99',
      email: email || 'gamer@zenvogames.com',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#080e15] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden text-slate-100 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto font-mono font-black text-xl shadow-[0_0_15px_#00ff66]">
            Z
          </div>
          <h2 className="text-xl font-black font-mono text-white uppercase">
            {isRegister ? 'JOIN ZENVO COCKPIT' : 'GAMER AUTHENTICATION'}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {isRegister ? 'Create an account for instant VIP cashback & order logs' : 'Welcome back, Commander'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {isRegister && (
            <div>
              <label className="text-slate-400 block mb-1">Gamer Handle / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b121a] border border-slate-700 focus:border-emerald-400 rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.5)] hover:shadow-[0_0_30px_rgba(0,255,102,0.8)] transition-all flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'REGISTER GAMER ACCOUNT' : 'LOG IN TO COCKPIT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center space-y-3 font-mono text-xs">
          <p className="text-slate-500">OR CONTINUE WITH</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-[#0b121a] border border-slate-700 hover:border-emerald-400 text-slate-200 flex items-center gap-2"
            >
              <span>🌐 Google</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-[#0b121a] border border-slate-700 hover:border-emerald-400 text-slate-200 flex items-center gap-2"
            >
              <span>📘 Facebook</span>
            </button>
          </div>

          <p className="text-slate-400 pt-2">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-400 font-bold underline ml-1"
            >
              {isRegister ? 'Login' : 'Register Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
