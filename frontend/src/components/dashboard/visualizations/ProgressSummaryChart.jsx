import React from "react";

function ProgressSummaryChart({ progressList = [] }) {
  const hasProgress = Array.isArray(progressList) && progressList.length > 0;

  return (
    <section 
      aria-label="Academic Subject Progress Chart"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">📈</span>
          <span>Topic Completion Progress</span>
        </h3>
        <p className="text-xs text-neutral-450 mt-2">
          Comparative completions across all active study roadmaps.
        </p>
      </div>

      <div 
        role="img" 
        aria-label="Topic completion progress bars"
        className="flex-1 flex flex-col justify-center space-y-4 py-2"
      >
        {!hasProgress ? (
          <div className="text-center text-sm text-neutral-500 py-10 italic">
            No activity available yet.
          </div>
        ) : (
          progressList.map((progress, idx) => {
            const topic = progress?.topic || "Unknown Topic";
            const percent = progress?.completion_percentage ?? 0;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-300">{topic}</span>
                  <span className="text-blue-400">{percent}%</span>
                </div>
                {/* Horizontal Progress Track */}
                <div className="w-full h-2.5 rounded-full bg-neutral-950/60 overflow-hidden border border-neutral-850">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
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

export default ProgressSummaryChart;
