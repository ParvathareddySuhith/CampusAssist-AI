import React from "react";

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-neutral-900/30 border border-neutral-900 h-36 rounded-xl p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-neutral-800 rounded"></div>
                <div className="h-8 w-16 bg-neutral-800 rounded"></div>
              </div>
              <div className="w-10 h-10 bg-neutral-800 rounded-lg"></div>
            </div>
            <div className="h-3 w-32 bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Intent Distribution Skeleton */}
        <div className="bg-neutral-900/30 border border-neutral-900 h-96 rounded-xl p-6 space-y-6">
          <div className="h-5 w-40 bg-neutral-800 rounded"></div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3.5 w-28 bg-neutral-800 rounded"></div>
                  <div className="h-3.5 w-10 bg-neutral-800 rounded"></div>
                </div>
                <div className="h-2.5 w-full bg-neutral-850 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Topics Skeleton */}
        <div className="bg-neutral-900/30 border border-neutral-900 h-96 rounded-xl p-6 space-y-6">
          <div className="h-5 w-36 bg-neutral-800 rounded"></div>
          <div className="flex flex-wrap gap-3 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-28 bg-neutral-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Skeleton */}
      <div className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-6 space-y-6">
        <div className="h-5 w-32 bg-neutral-800 rounded"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 w-full bg-neutral-800/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
