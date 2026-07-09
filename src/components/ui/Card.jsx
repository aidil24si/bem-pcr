import React from 'react';

export function Card({ className, ...props }) {
  return (
    <div
      className={`rounded-xl border border-white/5 bg-gray-950/60 backdrop-blur-md text-gray-100 shadow-xl transition-all duration-300 ${className || ''}`}
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
      className={`text-xl font-bold leading-none tracking-tight text-white ${className || ''}`}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={`text-sm text-gray-400 ${className || ''}`} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={`p-6 pt-0 ${className || ''}`} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={`flex items-center p-6 pt-0 ${className || ''}`} {...props} />;
}
