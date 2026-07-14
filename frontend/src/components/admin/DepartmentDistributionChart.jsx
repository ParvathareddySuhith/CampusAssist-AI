import React from 'react';

/**
 * Horizontal progress-bar distribution of student department enrollment
 */
function DepartmentDistributionChart({ data = [], loading }) {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  const isEmpty = !data || data.length === 0;

  const colorGradients = [
    'from-blue-500 to-indigo-500',
    'from-purple-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500'
  ];

  return (
    <section
      aria-label="Department Enrollment Distribution"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">🏢</span>
          <span>Department Shares</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-2">
          Breakdown of student registrations grouped by department.
        </p>
      </div>

      <div
        role="img"
        aria-label={`Department distribution list. Total registered students: ${total}`}
        className="flex-1 flex flex-col justify-center space-y-4 py-2"
      >
        <title>Department Enrollment Chart</title>
        {loading ? (
          [1, 2, 3].map((x) => (
            <div key={x} className="space-y-1.5">
              <div className="h-4 bg-neutral-800 animate-pulse rounded w-1/3" />
              <div className="h-3 bg-neutral-900 animate-pulse rounded w-full" />
            </div>
          ))
        ) : isEmpty ? (
          <div className="text-center text-xs text-neutral-500 py-10 italic">
            No department data available yet.
          </div>
        ) : (
          data.map((item, idx) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const gradient = colorGradients[idx % colorGradients.length];

            return (
              <div key={item.department} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-300">{item.department}</span>
                  <div className="space-x-1.5">
                    <span className="text-neutral-400">{item.count}</span>
                    <span className="text-neutral-500 text-[10px]">({percentage}%)</span>
                  </div>
                </div>
                {/* Horizontal progress track */}
                <div className="w-full h-3 rounded-full bg-neutral-950/60 overflow-hidden border border-neutral-850">
                  <div
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default DepartmentDistributionChart;
