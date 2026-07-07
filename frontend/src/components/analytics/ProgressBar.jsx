import React from "react";

function ProgressBar({ label, value, percentage, color = "bg-blue-500" }) {
  // Ensure percentage is bounded between 0 and 100
  const widthPercentage = Math.min(Math.max(0, percentage), 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-neutral-300">{label}</span>
        <span className="text-neutral-450">
          {value} ({widthPercentage.toFixed(0)}%)
        </span>
      </div>
      
      {/* Track container */}
      <div 
        className="w-full h-2.5 bg-neutral-950 border border-neutral-900 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={widthPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${label} progress: ${widthPercentage.toFixed(0)}%`}
      >
        {/* Progress Fill */}
        <div 
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
