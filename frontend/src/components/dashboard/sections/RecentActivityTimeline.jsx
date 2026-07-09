import React from "react";

const INTENT_COLORS = {
  ACADEMIC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PLACEMENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CAMPUS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DOCUMENT: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  GENERAL: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  SMALL_TALK: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
};

const getRelativeTime = (timestampStr) => {
  if (!timestampStr) return "—";
  try {
    // Standardize timestamp: strip ' UTC' for standard JS Date parsing
    const cleaned = timestampStr.replace(" UTC", "");
    const date = new Date(cleaned);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const seconds = Math.floor(diffMs / 1000);

    if (isNaN(seconds) || seconds < 0) {
      return timestampStr; // Fallback
    }

    if (seconds < 60) return "Just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    return date.toLocaleDateString();
  } catch (err) {
    return timestampStr;
  }
};

function RecentActivityTimeline({ activities }) {
  const hasActivities = Array.isArray(activities) && activities.length > 0;

  return (
    <section aria-label="Recent learning activity timeline" className="space-y-4 w-full">
      <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
        <span className="text-xl">⏳</span>
        <span>Recent Activity</span>
      </h3>

      {!hasActivities ? (
        <div className="p-5 bg-neutral-900/20 border border-neutral-800 rounded-xl text-center select-none">
          <p className="text-sm text-neutral-450 italic">
            No recent activity recorded. Ask the AI assistant a question to begin.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-neutral-800 space-y-6">
          {activities.map((activity, idx) => {
            const intent = activity.intent?.toUpperCase() || "GENERAL";
            const topic = activity.topic || "General Query";
            const timestamp = activity.timestamp;
            const respType = activity.response_type || "LLM";
            
            // Resolve badge color class
            const badgeClass = INTENT_COLORS[intent] || INTENT_COLORS.GENERAL;
            const relativeTimeStr = getRelativeTime(timestamp);

            return (
              <article 
                key={idx}
                className="relative select-none"
              >
                {/* Timeline Dot Indicator */}
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Topic Name */}
                    <span className="text-sm font-bold text-neutral-250 truncate max-w-[200px]" title={topic}>
                      {topic}
                    </span>
                    {/* Intent Badge */}
                    <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                      {intent}
                    </span>
                  </div>
                  {/* Timestamp / Time-ago */}
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    {relativeTimeStr}
                  </span>
                </div>

                <div className="text-xs text-neutral-450 mt-1 flex items-center space-x-1.5">
                  <span>Resolved via</span>
                  <span className="font-semibold text-neutral-350">{respType} Engine</span>
                  {activity.metadata?.question && (
                    <>
                      <span className="text-neutral-600 font-bold">•</span>
                      <span className="italic truncate max-w-[280px]" title={activity.metadata.question}>
                        "{activity.metadata.question}"
                      </span>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecentActivityTimeline;
export { getRelativeTime };
