import React from 'react';
import { FaGlobe, FaEnvelope, FaEye } from 'react-icons/fa';

/**
 * Breakdown panel indicating notification broadcast targets and read engagement rate
 */
function NotificationStatisticsCard({ notifications = {}, loading }) {
  const broadcasts = notifications?.broadcasts ?? 0;
  const individual = notifications?.individual ?? 0;
  const readRate = notifications?.read_rate ?? 0.0;

  return (
    <div className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">📢</span>
          <span>Broadcast Statistics</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-2">
          Aggregated student engagement details on sent bulletins.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4 py-2">
        {loading ? (
          [1, 2, 3].map((x) => (
            <div key={x} className="h-10 bg-neutral-900/40 animate-pulse rounded-lg w-full" />
          ))
        ) : (
          <>
            {/* Broadcasts Count */}
            <div className="flex justify-between items-center p-2 rounded-xl bg-neutral-950/45 border border-neutral-900 shadow-inner">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <FaGlobe className="text-sm" />
                </div>
                <span className="text-xs font-semibold text-neutral-300">Active Broadcasts</span>
              </div>
              <span className="text-sm font-extrabold text-white">{broadcasts}</span>
            </div>

            {/* Individual Messages Count */}
            <div className="flex justify-between items-center p-2 rounded-xl bg-neutral-950/45 border border-neutral-900 shadow-inner">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-400">
                  <FaEnvelope className="text-sm" />
                </div>
                <span className="text-xs font-semibold text-neutral-300">Individual Alerts</span>
              </div>
              <span className="text-sm font-extrabold text-white">{individual}</span>
            </div>

            {/* Read Rate Gauge */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
                  <FaEye className="text-violet-400 text-sm" />
                  <span>Student Read Rate</span>
                </div>
                <span className="font-extrabold text-violet-400">{readRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-850">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${readRate}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationStatisticsCard;
