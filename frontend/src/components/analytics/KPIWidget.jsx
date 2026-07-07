import React from "react";
import SpotlightCard from "../ui/SpotlightCard";

function KPIWidget({ title, value, icon: Icon, color = "rgba(59, 130, 246, 0.15)", subtitle }) {
  return (
    <SpotlightCard 
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl hover:border-neutral-700/60 transition-all flex flex-col justify-between h-36 select-text cursor-default group focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      spotlightColor={color}
      tabIndex={0}
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ""}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {title}
          </span>
          <h4 className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-[1.01] transition-transform duration-300">
            {value}
          </h4>
        </div>
        <div className="p-2.5 bg-neutral-950/60 border border-neutral-900 rounded-lg text-neutral-450 group-hover:text-white transition-colors">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-neutral-450 font-medium">
          {subtitle}
        </p>
      )}
    </SpotlightCard>
  );
}

export default KPIWidget;
