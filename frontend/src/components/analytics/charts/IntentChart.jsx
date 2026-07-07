import React from "react";
import ProgressBar from "../ProgressBar";

function IntentChart({ dashboardModel }) {
  const {
    totalQuestions = 0,
    academicQuestions = 0,
    placementQuestions = 0,
    campusQuestions = 0,
    documentQuestions = 0,
    generalQuestions = 0,
  } = dashboardModel;

  const hasData = totalQuestions > 0;

  // Configuration for each category bar
  const categories = [
    {
      label: "Academic Helper",
      value: academicQuestions,
      percentage: hasData ? (academicQuestions / totalQuestions) * 100 : 0,
      color: "bg-blue-500"
    },
    {
      label: "Placement Prep",
      value: placementQuestions,
      percentage: hasData ? (placementQuestions / totalQuestions) * 100 : 0,
      color: "bg-emerald-500"
    },
    {
      label: "Campus Guide",
      value: campusQuestions,
      percentage: hasData ? (campusQuestions / totalQuestions) * 100 : 0,
      color: "bg-amber-500"
    },
    {
      label: "Document Search",
      value: documentQuestions,
      percentage: hasData ? (documentQuestions / totalQuestions) * 100 : 0,
      color: "bg-indigo-500"
    },
    {
      label: "General Chat",
      value: generalQuestions,
      percentage: hasData ? (generalQuestions / totalQuestions) * 100 : 0,
      color: "bg-neutral-500"
    }
  ];

  return (
    <div className="bg-neutral-900/40 border border-neutral-900/80 p-6 rounded-xl space-y-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">📊</span>
          <span>Intent Distribution</span>
        </h3>
        <p className="text-xs text-neutral-450 mt-2">
          Breakdown of your queries resolved across different AI routing handlers.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4 py-2">
        {hasData ? (
          categories.map((cat, idx) => (
            <ProgressBar
              key={idx}
              label={cat.label}
              value={cat.value}
              percentage={cat.percentage}
              color={cat.color}
            />
          ))
        ) : (
          <div className="text-center py-12 text-sm text-neutral-500 bg-neutral-950/20 border border-dashed border-neutral-900/60 rounded-xl flex flex-col items-center justify-center space-y-2">
            <span className="text-2xl opacity-60">📈</span>
            <p className="font-medium text-neutral-400">No learning data yet.</p>
            <p className="text-xs text-neutral-600 max-w-[200px]">
              Query data will populate here as you interact with the assistant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntentChart;
