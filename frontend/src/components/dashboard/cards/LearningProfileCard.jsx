import React from "react";

function LearningProfileCard({ learningProfile }) {
  const favoriteTopics = learningProfile?.favorite_topics || [];
  const weakTopics = learningProfile?.weak_topics || [];
  const streak = learningProfile?.study_streak || 0;
  const mode = learningProfile?.preferred_mode || "Quiz";
  const assistant = learningProfile?.preferred_assistant || "Study Assistant";
  const readiness = learningProfile?.placement_readiness || "Beginner";
  
  // Calculate confidence bar
  const confidence = learningProfile?.confidence !== undefined ? learningProfile.confidence : 0.0;
  const confidencePct = Math.round(confidence * 100);
  const filledBlocks = Math.round(confidence * 10);
  const emptyBlocks = 10 - filledBlocks;
  const confidenceBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  return (
    <section 
      aria-label="Learning Profile"
      className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl backdrop-blur-md hover:border-neutral-700 transition-all select-none"
    >
      <h3 className="text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-4">
        Adaptive Learning Profile
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Side Details */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <span>🔥</span> Study Streak
            </span>
            <span className="font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              {streak} {streak === 1 ? "day" : "days"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Preferred Mode</span>
            <span className="font-semibold text-neutral-200">{mode}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Preferred Assistant</span>
            <span className="font-semibold text-neutral-200">{assistant}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Placement Readiness</span>
            <span className="font-semibold text-neutral-200">{readiness}</span>
          </div>

          {/* Confidence Score Bar */}
          <div className="pt-2 border-t border-neutral-800/40">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-neutral-400">Adaptive Confidence</span>
              <span className="font-bold text-blue-400">{confidencePct}%</span>
            </div>
            <div 
              aria-label={`Confidence level: ${confidencePct}%`}
              className="text-neutral-600 font-mono tracking-tight select-none text-base"
            >
              {confidenceBar}
            </div>
          </div>
        </div>

        {/* Right Side Favorite/Weak Topics */}
        <div className="space-y-4 pt-4 sm:pt-0 sm:pl-4 sm:border-l sm:border-neutral-800/40 flex flex-col justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block mb-1.5">Strongest Topics</span>
            <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto pr-1">
              {favoriteTopics.length > 0 ? (
                favoriteTopics.map((topic, i) => (
                  <span key={i} className="text-[11px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-500 italic">No topics analyzed yet</span>
              )}
            </div>
          </div>

          <div className="mt-2.5">
            <span className="text-xs text-neutral-400 font-medium block mb-1.5">Focus Areas (Weaknesses)</span>
            <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto pr-1">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic, i) => (
                  <span key={i} className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-500 italic">No weaknesses detected</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LearningProfileCard;
