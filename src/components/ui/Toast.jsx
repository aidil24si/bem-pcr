import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600 shrink-0" />
    }
  };

  const current = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${current.bg}`}>
        {current.icon}
        <div className="flex-grow space-y-1">
          <p className="text-xs font-bold leading-normal">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5 rounded-lg hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
