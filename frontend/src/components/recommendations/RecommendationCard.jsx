import React from "react";

function RecommendationCard({ title, description, icon, priority, action, onClick }) {
  // Determine badge colors based on priority level
  const getPriorityBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "MEDIUM":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "LOW":
      default:
        return "bg-neutral-700/30 text-neutral-400 border-neutral-700/50";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col justify-between p-4 rounded-xl border border-neutral-700/40 bg-neutral-900/40 backdrop-blur-md hover:bg-neutral-800/50 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent select-none"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          {/* Icon */}
          <span className="text-2xl mr-2 filter drop-shadow-sm select-none" aria-hidden="true">
            {icon || "💡"}
          </span>
          {/* Priority Badge */}
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(priority)}`}>
            {priority}
          </span>
        </div>
        
        {/* Title */}
        <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-blue-400 transition-colors duration-200 line-clamp-1 mb-1">
          {title}
        </h4>
        
        {/* Description */}
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Subtle indicator arrow */}
      <div className="flex justify-end items-center mt-3 text-neutral-500 group-hover:text-blue-400 transition-colors duration-200">
        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default RecommendationCard;
