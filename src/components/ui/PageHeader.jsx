import React from 'react';

export default function PageHeader({ title, description, tag, icon: Icon }) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
      {tag && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#CCE7EF] bg-[#E6F3F7] text-[#004B5F] text-[10px] font-bold uppercase tracking-wider">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{tag}</span>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#004B5F]">
        {title}
      </h2>
      {description && (
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
