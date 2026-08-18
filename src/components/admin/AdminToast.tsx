'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface AdminToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss: () => void;
}

export function AdminToast({ type, message, onDismiss }: AdminToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      bg: 'bg-emerald-950/90 border-emerald-500/40',
      text: 'text-emerald-200',
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
      bg: 'bg-red-950/90 border-red-500/40',
      text: 'text-red-200',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
      bg: 'bg-blue-950/90 border-blue-500/40',
      text: 'text-blue-200',
    },
  }[type];

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[9999] max-w-sm w-full
        flex items-start gap-3 px-4 py-3.5 rounded-xl border
        backdrop-blur-sm shadow-2xl shadow-black/60
        transition-all duration-300
        ${config.bg} ${config.text}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="alert"
    >
      {config.icon}
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
