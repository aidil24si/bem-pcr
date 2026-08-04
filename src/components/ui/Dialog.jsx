import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      {/* Content Container */}
      <div className="z-50 w-full max-w-lg transform overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#004B5F]"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className, ...props }) {
  return <div className={`mt-4 ${className || ''}`} {...props}>{children}</div>;
}

export function DialogHeader({ className, ...props }) {
  return <div className={`flex flex-col space-y-1.5 text-left ${className || ''}`} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={`text-xl font-bold tracking-tight text-[#004B5F] ${className || ''}`} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={`text-sm text-slate-500 ${className || ''}`} {...props} />;
}
