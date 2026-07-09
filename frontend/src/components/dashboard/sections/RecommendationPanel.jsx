import React from "react";
import { useNavigate } from "react-router-dom";
import RecommendationSection from "../../recommendations/RecommendationSection";

function RecommendationPanel({ recommendations, error }) {
  const navigate = useNavigate();

  // If there's an explicit error from the recommendations subsystem
  const hasError = !!error || !!recommendations?.error;
  
  // Verify if there are any recommendation items at all
  const sections = ["topics", "documents", "study_tools", "placement", "next_questions"];
  const totalItems = sections.reduce((acc, sec) => acc + (recommendations?.[sec]?.length || 0), 0);
  const isEmpty = totalItems === 0;

  const handleCardClick = (action, title) => {
    if (action === "/assistant") {
      navigate(action, { state: { initialQuestion: `Teach me about ${title}` } });
    } else if (action === "/study-assistant") {
      navigate(action, { state: { initialQuestion: `I want to practice ${title}` } });
    } else if (action === "/placement-assistant") {
      navigate(action, { state: { initialQuestion: `Help me prepare for ${title}` } });
    } else if (action) {
      navigate(action);
    }
  };

  return (
    <section aria-label="Study & career recommendations" className="space-y-4 w-full">
      <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
        <span className="text-xl">🎯</span>
        <span>Personalized Recommendations</span>
      </h3>

      {hasError ? (
        <div className="p-5 bg-neutral-900/20 border border-neutral-800 rounded-xl select-none">
          <p className="text-sm text-neutral-400 italic">
            Recommendations are temporarily unavailable.
          </p>
        </div>
      ) : isEmpty ? (
        <div className="p-5 bg-neutral-900/20 border border-neutral-800 rounded-xl select-none">
          <p className="text-sm text-neutral-450 italic">
            No recommendations generated yet. Ask more questions to receive targeted study recommendations.
          </p>
        </div>
      ) : (
        <RecommendationSection 
          recommendations={recommendations} 
          onCardClick={handleCardClick} 
        />
      )}
    </section>
  );
}

export default RecommendationPanel;
