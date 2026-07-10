import React from "react";

function IntentDistributionChart({ data }) {
  const academic = data?.academic ?? 0;
  const placement = data?.placement ?? 0;
  const campus = data?.campus ?? 0;
  const document = data?.document ?? 0;
  const general = data?.general ?? 0;

  const total = academic + placement + campus + document + general;
  const isEmpty = total === 0;

  const intentItems = [
    { label: "Academic", count: academic, color: "from-blue-500 to-indigo-500", text: "text-blue-400" },
    { label: "Placement", count: placement, color: "from-purple-500 to-violet-500", text: "text-purple-400" },
    { label: "Campus", count: campus, color: "from-emerald-500 to-teal-500", text: "text-emerald-400" },
    { label: "Document", count: document, color: "from-orange-500 to-amber-500", text: "text-orange-400" },
    { label: "General", count: general, color: "from-neutral-500 to-neutral-600", text: "text-neutral-400" }
  ];

  return (
    <section 
      aria-label="Query Intent Distribution"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">📊</span>
          <span>Intent Distribution</span>
        </h3>
        <p className="text-xs text-neutral-450 mt-2">
          Breakdown of query subjects mapped to support assistants.
        </p>
      </div>

      <div 
        role="img" 
        aria-label={`Intent distribution chart. Total questions: ${total}.`}
        className="flex-1 flex flex-col justify-center space-y-4 py-2"
      >
        {isEmpty ? (
          <div className="text-center text-sm text-neutral-500 py-10 italic">
            No activity available yet.
          </div>
        ) : (
          intentItems.map((item, idx) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-300">{item.label}</span>
                  <div className="space-x-1.5">
                    <span className="text-neutral-400">{item.count}</span>
                    <span className={`opacity-80 text-[10px] ${item.text}`}>({percentage}%)</span>
                  </div>
                </div>
                {/* Horizontal Bar Track */}
                <div className="w-full h-3 rounded-full bg-neutral-950/60 overflow-hidden border border-neutral-850">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
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

export default IntentDistributionChart;
