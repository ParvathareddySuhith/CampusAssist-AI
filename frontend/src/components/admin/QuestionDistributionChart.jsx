import React from 'react';

/**
 * Circular SVG donut chart displaying distribution of chatbot intents
 */
function QuestionDistributionChart({ data = {}, loading }) {
  const categories = Object.entries(data).map(([key, val]) => ({
    label: key.toUpperCase(),
    count: val
  }));

  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const isEmpty = total === 0;

  const colors = [
    'stroke-violet-500 text-violet-400',
    'stroke-emerald-500 text-emerald-400',
    'stroke-sky-500 text-sky-400',
    'stroke-amber-500 text-amber-400',
    'stroke-rose-500 text-rose-400'
  ];

  const fillColors = [
    'bg-violet-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-amber-500',
    'bg-rose-500'
  ];

  // SVG Circle math
  const radius = 24;
  const circumference = 2 * Math.PI * radius; // ~150.796
  let accumulatedPercent = 0;

  const chartSegments = categories.map((cat, i) => {
    const percent = total > 0 ? (cat.count / total) * 100 : 0;
    const strokeLength = (percent / 100) * circumference;
    const strokeOffset = circumference - strokeLength;
    const rotationAngle = (accumulatedPercent / 100) * 360 - 90; // Start at top (-90deg)
    
    accumulatedPercent += percent;

    return {
      ...cat,
      percent: Math.round(percent),
      strokeLength,
      strokeOffset,
      rotationAngle,
      colorClass: colors[i % colors.length],
      fillClass: fillColors[i % fillColors.length]
    };
  });

  return (
    <section
      aria-label="Student Query Intent Categories Distribution"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">💬</span>
          <span>Query Intent Share</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-2">
          Dynamic intent classifications logged by RAG routing engines.
        </p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center w-full h-32">
            <div className="w-24 h-24 rounded-full border-4 border-neutral-800 border-t-violet-500 animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="text-center text-xs text-neutral-500 py-10 italic w-full">
            No query analytics events logged yet.
          </div>
        ) : (
          <>
            {/* SVG Donut Circle */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 64 64"
                className="transform -scale-x-1"
                role="img"
                aria-label={`Donut chart showing query intent distribution. Total questions answered: ${total}`}
              >
                <title>Query Intent Distribution Chart</title>
                {/* Background track circle */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="transparent"
                  stroke="#171717"
                  strokeWidth="8"
                />
                
                {/* Segments */}
                {chartSegments.map((segment, idx) => (
                  <circle
                    key={segment.label}
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="transparent"
                    className={`transition-all duration-500 ${segment.colorClass.split(' ')[0]}`}
                    strokeWidth="8"
                    strokeDasharray={`${segment.strokeLength} ${circumference}`}
                    strokeDashoffset={segment.strokeOffset}
                    transform={`rotate(${segment.rotationAngle} 32 32)`}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
              
              {/* Inner Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total</span>
                <span className="text-base font-extrabold text-white">{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Legends */}
            <div className="flex-1 space-y-2 w-full">
              {chartSegments.map((seg) => (
                <div key={seg.label} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${seg.fillClass} flex-shrink-0`} />
                    <span className="text-neutral-300 font-semibold uppercase">{seg.label}</span>
                  </div>
                  <div className="space-x-1.5 font-bold">
                    <span className="text-neutral-400">{seg.count}</span>
                    <span className={`text-[10px] ${seg.colorClass.split(' ')[1]}`}>({seg.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default QuestionDistributionChart;
