import React from 'react';

export function Select({ value, onValueChange, children, className, ...props }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`h-10 w-full appearance-none rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 pr-10 text-sm text-white shadow-sm ring-offset-background transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export function SelectItem({ value, children, ...props }) {
  return (
    <option value={value} className="bg-gray-950 text-white" {...props}>
      {children}
    </option>
  );
}
