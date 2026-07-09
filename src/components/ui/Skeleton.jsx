import React from 'react';

// Base pulse wrapper
export function SkeletonPulse({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-800/40 ${className}`}
      {...props}
    />
  );
}

// 1. News/Galeri Card Grid Skeleton
export function CardGridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="border border-gray-900 bg-gray-950/40 rounded-2xl p-4 space-y-4">
          <SkeletonPulse className="h-44 w-full rounded-xl" />
          <div className="space-y-2">
            <SkeletonPulse className="h-4 w-1/4" />
            <SkeletonPulse className="h-6 w-3/4" />
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-5/6" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <SkeletonPulse className="h-5 w-24 rounded-full" />
            <SkeletonPulse className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 2. Proker/Ministry list Skeleton
export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-5 border border-gray-900 bg-gray-950/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="space-y-2 flex-grow">
            <SkeletonPulse className="h-5 w-1/3" />
            <SkeletonPulse className="h-4 w-2/3" />
          </div>
          <SkeletonPulse className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// 3. Room Scheduler Table Calendar Skeleton
export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-900">
        <SkeletonPulse className="h-6 w-32" />
        <SkeletonPulse className="h-6 w-16 rounded-full" />
      </div>
      <div className="border border-gray-900 bg-gray-950/20 rounded-2xl overflow-hidden divide-y divide-gray-900">
        {/* Table Head */}
        <div className="bg-gray-950/50 p-4 flex gap-4">
          <SkeletonPulse className="h-5 w-20" />
          <SkeletonPulse className="h-5 w-40" />
          <SkeletonPulse className="h-5 w-40" />
          <SkeletonPulse className="h-5 w-40" />
        </div>
        {/* Table Rows */}
        {Array.from({ length: 6 }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex gap-4 items-center">
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-10 w-40 rounded-lg" />
            <SkeletonPulse className="h-4 w-8" />
            <SkeletonPulse className="h-10 w-40 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
