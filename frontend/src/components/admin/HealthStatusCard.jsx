import React from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function HealthStatusCard({ name, status, latencyMs }) {
  const isHealthy = status?.toLowerCase() === 'healthy';

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 shadow-lg select-none ${isHealthy ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-rose-950/10 border-rose-900/30'}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="font-bold text-neutral-200 text-sm select-all">{name}</h4>
          {latencyMs !== undefined && latencyMs !== null && (
            <p className="text-[10px] text-neutral-500 font-bold select-none">
              Latency: <span className="text-neutral-400">{latencyMs}ms</span>
            </p>
          )}
        </div>
        
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase select-none ${isHealthy ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
          {isHealthy ? (
            <>
              <FaCheckCircle className="w-3 h-3 animate-pulse" />
              <span>Healthy</span>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="w-3 h-3" />
              <span>Degraded</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HealthStatusCard;
