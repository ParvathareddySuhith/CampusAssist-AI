import React from "react";
import RecommendationCard from "./RecommendationCard";

function RecommendationSection({ recommendations, onCardClick }) {
  if (!recommendations) return null;

  // Define section configuration mappings
  const sections = [
    { key: "topics", title: "Recommended Topics", icon: "💡" },
    { key: "documents", title: "Reference Documents", icon: "📚" },
    { key: "study_tools", title: "Study Tools", icon: "📝" },
    { key: "placement", title: "Placement Assistant", icon: "🎯" },
    { key: "next_questions", title: "Suggested Follow-ups", icon: "❓" }
  ];

  // Helper to verify if section holds valid non-empty items
  const hasItems = (key) => {
    return Array.isArray(recommendations[key]) && recommendations[key].length > 0;
  };

  // If all sections are empty, return nothing
  const totalItems = sections.reduce((acc, sec) => acc + (recommendations[sec.key]?.length || 0), 0);
  if (totalItems === 0) return null;

  return (
    <div className="space-y-4 mt-3 pt-3 border-t border-neutral-800/60 w-full">
      {sections.map((section) => {
        if (!hasItems(section.key)) return null;

        return (
          <div key={section.key} className="space-y-2">
            {/* Header */}
            <div className="flex items-center text-xs font-semibold text-blue-400/90 uppercase tracking-wider select-none">
              <span className="mr-1.5">{section.icon}</span>
              {section.title}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations[section.key].map((item) => (
                <RecommendationCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  priority={item.priority}
                  action={item.action}
                  onClick={() => onCardClick(item.action, item.title)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RecommendationSection;
