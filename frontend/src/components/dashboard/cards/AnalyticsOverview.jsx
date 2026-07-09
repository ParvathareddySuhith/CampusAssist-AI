import React from "react";

function AnalyticsOverview({ analytics }) {
  const cards = [
    {
      count: analytics?.questions ?? 0,
      label: "Questions Asked",
      style: "from-blue-500/10 to-indigo-500/5 hover:border-blue-500/40 text-blue-400"
    },
    {
      count: analytics?.academic ?? 0,
      label: "Academic Questions",
      style: "from-violet-500/10 to-purple-500/5 hover:border-violet-500/40 text-violet-400"
    },
    {
      count: analytics?.placement ?? 0,
      label: "Placement Assistance",
      style: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/40 text-emerald-400"
    },
    {
      count: analytics?.campus ?? 0,
      label: "Campus Information",
      style: "from-orange-500/10 to-amber-500/5 hover:border-orange-500/40 text-orange-400"
    },
    {
      count: analytics?.general ?? 0,
      label: "General & Small Talk",
      style: "from-neutral-500/10 to-neutral-600/5 hover:border-neutral-500/40 text-neutral-400"
    }
  ];

  return (
    <section 
      aria-label="Analytics Overview"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full"
    >
      {cards.map((card, idx) => (
        <div 
          key={idx}
          className={`p-5 bg-gradient-to-br border border-neutral-800/80 rounded-xl hover:bg-neutral-900/20 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between select-none ${card.style}`}
        >
          <span className="text-3xl font-black text-white leading-none mb-2 block">
            {card.count}
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase opacity-80 text-neutral-300">
            {card.label}
          </span>
        </div>
      ))}
    </section>
  );
}

export default AnalyticsOverview;
