import React from 'react';

export default function PageHeader({ title, description, tag, icon: Icon }) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
      {tag && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{tag}</span>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
        {title}
      </h2>
      {description && (
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
