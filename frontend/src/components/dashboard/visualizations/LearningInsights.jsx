import React from "react";

function LearningInsights({ insights, streak, mode }) {
  const mostStudied = insights?.mostStudiedTopic || "Not set";
  const weakest = insights?.weakestTopic || "None identified";
  const progressPct = insights?.progressPercentage ?? 0;
  const mostActive = insights?.mostActiveIntent || "None";
  const avgQ = insights?.averageQuestionsPerDay ?? 0;

  const cards = [
    {
      icon: "📚",
      title: "Primary Focus",
      value: mostStudied,
      desc: "Topic you query or study most frequently.",
      style: "border-blue-500/20 text-blue-400"
    },
    {
      icon: "⚠️",
      title: "Current Challenge",
      value: weakest,
      desc: "Identified weak topic that needs practice.",
      style: "border-purple-500/20 text-purple-400"
    },
    {
      icon: "🔥",
      title: "Current Streak",
      value: `${streak} ${streak === 1 ? "day" : "days"}`,
      desc: "Consecutive days studying with CampusAssist.",
      style: "border-orange-500/20 text-orange-400"
    },
    {
      icon: "🎯",
      title: "Active Intent",
      value: mostActive,
      desc: `Your most requested assistant tier is ${mostActive}.`,
      style: "border-emerald-500/20 text-emerald-400"
    },
    {
      icon: "💬",
      title: "Daily Queries",
      value: `${avgQ} queries/day`,
      desc: "Average conversational count on active days.",
      style: "border-neutral-500/20 text-neutral-400"
    },
    {
      icon: "📈",
      title: "Overall Progress",
      value: `${progressPct}%`,
      desc: "Average completion across study roadmaps.",
      style: "border-indigo-500/20 text-indigo-400"
    }
  ];

  return (
    <section aria-label="Learning insights panel" className="space-y-4 w-full select-none">
      <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
        <span className="text-xl">💡</span>
        <span>Learning Insights</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <article 
            key={idx}
            className={`p-5 bg-neutral-900/40 border rounded-xl hover:border-neutral-700/80 transition-all flex flex-col justify-between ${card.style}`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="text-xl">{card.icon}</span>
              </div>
              <h4 className="text-lg font-bold text-white leading-tight truncate mb-1" title={card.value}>
                {card.value}
              </h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2 border-t border-neutral-800/40 pt-2">
              {card.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LearningInsights;
