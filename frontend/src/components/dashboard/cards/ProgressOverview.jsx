import React from "react";

function ProgressOverview({ progressList }) {
  const hasProgress = Array.isArray(progressList) && progressList.length > 0;

  return (
    <section aria-label="Learning Progress tracks" className="space-y-4 w-full">
      <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
        <span className="text-xl">📊</span>
        <span>Learning Progress</span>
      </h3>

      {!hasProgress ? (
        <div className="p-6 bg-neutral-900/20 border border-neutral-800 rounded-xl text-center select-none">
          <p className="text-sm text-neutral-450 italic">
            No learning progress yet. Start a quiz or study topic to begin tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressList.map((progress, idx) => {
            const topic = progress?.topic || "Unknown Topic";
            const percent = progress?.completion_percentage ?? 0;
            const completedCount = progress?.completed_count ?? 0;
            const totalSteps = progress?.total_steps ?? 0;
            const currentStep = progress?.current_step?.title || "Completed";
            const nextStep = progress?.next_step?.title || "None";

            return (
              <div 
                key={idx}
                className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl hover:border-neutral-700/80 transition-all select-none flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{topic}</h4>
                      <p className="text-xs text-neutral-400">
                        {completedCount} of {totalSteps} steps completed
                      </p>
                    </div>
                    <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div 
                    className="w-full h-2 rounded-full bg-neutral-850 overflow-hidden mb-4"
                    aria-label={`${topic} progress: ${percent}%`}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800/40 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-450 font-medium">Active Step</span>
                    <span className="font-semibold text-neutral-250 truncate max-w-[200px]" title={currentStep}>
                      {currentStep}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-450 font-medium">Next Up</span>
                    <span className="font-semibold text-neutral-450 truncate max-w-[200px]" title={nextStep}>
                      {nextStep}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProgressOverview;
