import React, { createContext, useContext } from 'react';

const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, children, className, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`space-y-4 ${className || ''}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, ...props }) {
  return (
    <div
      className={`inline-flex h-11 items-center justify-center rounded-lg bg-gray-950 p-1 border border-gray-800 text-gray-400 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, ...props }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used inside a Tabs component');

  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? 'bg-purple-600 text-white shadow-sm font-semibold'
          : 'hover:bg-gray-900 hover:text-gray-200'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className, ...props }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used inside a Tabs component');

  if (context.value !== value) return null;

  return (
    <div
      className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
