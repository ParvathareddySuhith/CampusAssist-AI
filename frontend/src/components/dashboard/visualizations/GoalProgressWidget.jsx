import React from "react";

function GoalProgressWidget({ percentage = 0, currentGoal }) {
  const clampedPct = Math.max(0, Math.min(100, Math.round(percentage)));

  // SVG Circle details
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~251.3
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  const topicName = currentGoal?.topic || "No Active Goal";
  const currentStep = currentGoal?.current_step?.title || "None";
  const nextStep = currentGoal?.next_step?.title || "None";

  return (
    <section 
      aria-label="Active goal and average completion dashboard widget"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">🎯</span>
          <span>Goal Progress</span>
        </h3>
        <p className="text-xs text-neutral-450 mt-2">
          Your active roadmap track and overall completion metrics.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Radial SVG Circle Indicator */}
        <div 
          role="img" 
          aria-label={`Radial progress indicator showing overall completion is ${clampedPct}%.`}
          className="relative w-28 h-28 flex items-center justify-center"
        >
          <svg className="w-full h-full transform -rotate-90 overflow-visible">
            {/* Background Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-neutral-850 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Progress Circle with Transition */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-blue-500 fill-none transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Centered Percentage Label */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white leading-none">
              {clampedPct}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold mt-1">
              Done
            </span>
          </div>
        </div>

        {/* Goal details text */}
        <div className="flex-1 space-y-3.5 sm:pl-4 sm:border-l sm:border-neutral-850">
          <div>
            <span className="text-[10px] text-neutral-450 uppercase font-black tracking-wider block">
              Current Target
            </span>
            <h4 className="text-sm font-bold text-white truncate max-w-[200px]" title={topicName}>
              {topicName}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-850 text-xs">
            <div>
              <span className="text-neutral-450 block font-medium">Active Step</span>
              <span className="font-semibold text-neutral-250 truncate block max-w-[100px]" title={currentStep}>
                {currentStep}
              </span>
            </div>
            <div>
              <span className="text-neutral-450 block font-medium">Next Step</span>
              <span className="font-semibold text-neutral-450 truncate block max-w-[100px]" title={nextStep}>
                {nextStep}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GoalProgressWidget;
