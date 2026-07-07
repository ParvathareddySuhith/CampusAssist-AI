import React from "react";

function InsightCard({ title, message, priority }) {
  const getPriorityStyles = (prio) => {
    switch (prio) {
      case "HIGH":
        return {
          border: "border-l-rose-500",
          badge: "bg-rose-950/40 border-rose-500/30 text-rose-400"
        };
      case "MEDIUM":
        return {
          border: "border-l-amber-500",
          badge: "bg-amber-950/40 border-amber-500/30 text-amber-400"
        };
      case "LOW":
      default:
        return {
          border: "border-l-blue-500",
          badge: "bg-blue-950/40 border-blue-500/30 text-blue-400"
        };
    }
  };

  const styles = getPriorityStyles(priority);

  return (
    <div 
      className={`p-5 bg-neutral-900/40 border border-neutral-900 border-l-4 ${styles.border} rounded-xl hover:border-neutral-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-text`}
    >
      <div className="space-y-1.5 flex-1">
        <h4 className="text-sm font-bold text-white tracking-wide">
          {title}
        </h4>
        <p className="text-xs text-neutral-400 leading-relaxed">
          {message}
        </p>
      </div>
      
      <span className={`w-fit text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${styles.badge}`}>
        {priority}
      </span>
    </div>
  );
}

export default InsightCard;
