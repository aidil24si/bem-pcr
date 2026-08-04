import React from 'react';

export function Card({ className, ...props }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white text-slate-600 shadow-xl transition-all duration-300 ${className || ''}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={`text-xl font-bold leading-none tracking-tight text-[#004B5F] ${className || ''}`}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={`text-sm text-slate-500 ${className || ''}`} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={`p-6 pt-0 ${className || ''}`} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={`flex items-center p-6 pt-0 ${className || ''}`} {...props} />;
}
