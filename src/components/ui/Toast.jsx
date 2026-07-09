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
      bg: 'bg-emerald-950/90 border-emerald-800/80 text-emerald-300',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
    },
    error: {
      bg: 'bg-red-950/90 border-red-800/80 text-red-300',
      icon: <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
    },
    info: {
      bg: 'bg-blue-950/90 border-blue-800/80 text-blue-300',
      icon: <Info className="h-5 w-5 text-blue-400 shrink-0" />
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
          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded-lg hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
