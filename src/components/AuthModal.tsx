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
      email: email || 'gamer@zenovgames.com',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zenov-bg/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zenov-surface border border-zenov-border rounded-2xl shadow-xl overflow-hidden text-zenov-text p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zenov-card border border-zenov-border text-zenov-secondary hover:text-zenov-primary hover:border-zenov-primary-border hover:bg-zenov-primary-soft transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2.5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zenov-primary to-zenov-accent text-zenov-bg flex items-center justify-center mx-auto font-black text-xl shadow-md mb-1">
            Z
          </div>
          <h2 className="text-xl font-black text-zenov-text uppercase tracking-tight">
            {isRegister ? 'JOIN ZENOV COCKPIT' : 'GAMER AUTHENTICATION'}
          </h2>
          <p className="text-xs text-zenov-muted">
            {isRegister ? 'Create an account for instant VIP cashback & order logs' : 'Welcome back, Commander'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="text-zenov-secondary block mb-1.5 font-medium">Gamer Handle / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zenov-primary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-zenov-text focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-zenov-secondary block mb-1.5 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zenov-primary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-zenov-text focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-zenov-secondary block mb-1.5 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zenov-primary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zenov-card border border-zenov-border focus:border-zenov-primary focus:ring-2 focus:ring-zenov-primary-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-zenov-text focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-zenov-accent hover:bg-zenov-accent-hover text-zenov-bg font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'REGISTER GAMER ACCOUNT' : 'LOG IN TO COCKPIT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zenov-border/60 text-center space-y-3 text-xs">
          <p className="text-zenov-muted font-bold uppercase tracking-wider text-[10px]">OR CONTINUE WITH</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-zenov-card border border-zenov-border hover:border-zenov-primary-border/50 text-zenov-text hover:bg-zenov-primary-soft/50 transition-all flex items-center gap-2 font-medium"
            >
              <span>🌐 Google</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-zenov-card border border-zenov-border hover:border-zenov-primary-border/50 text-zenov-text hover:bg-zenov-primary-soft/50 transition-all flex items-center gap-2 font-medium"
            >
              <span>📘 Facebook</span>
            </button>
          </div>

          <p className="text-zenov-secondary pt-2 text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-zenov-primary font-bold underline-offset-2 hover:underline ml-1"
            >
              {isRegister ? 'Login' : 'Register Now'}
            </button>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zenov-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zenov-success" />
            <span>256-bit SSL Encrypted • Secure Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
