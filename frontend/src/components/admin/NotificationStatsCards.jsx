import React from 'react';
import { FaBell, FaEnvelope, FaGlobe, FaEnvelopeOpen } from 'react-icons/fa';

/**
 * Summary metrics cards for administrative notifications overview
 */
function NotificationStatsCards({ stats, loading }) {
  const cards = [
    {
      title: "Total Sent Records",
      value: stats?.total_notifications ?? 0,
      icon: <FaBell className="text-xl text-violet-400" />,
      gradient: "from-violet-500/10 to-purple-500/5",
      border: "border-violet-500/20"
    },
    {
      title: "Unread Feeds",
      value: stats?.unread ?? 0,
      icon: <FaEnvelope className="text-xl text-fuchsia-400" />,
      gradient: "from-fuchsia-500/10 to-pink-500/5",
      border: "border-fuchsia-500/20"
    },
    {
      title: "Active Broadcasts",
      value: stats?.broadcasts ?? 0,
      icon: <FaGlobe className="text-xl text-emerald-400" />,
      gradient: "from-emerald-500/10 to-teal-500/5",
      border: "border-emerald-500/20"
    },
    {
      title: "Individual Messages",
      value: stats?.individual_messages ?? 0,
      icon: <FaEnvelopeOpen className="text-xl text-sky-400" />,
      gradient: "from-sky-500/10 to-blue-500/5",
      border: "border-sky-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border ${c.border} bg-gradient-to-br ${c.gradient} flex items-center justify-between shadow-lg relative overflow-hidden hover:scale-[1.01] transition-all duration-200 select-none`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {c.title}
            </span>
            <p className="text-2xl font-extrabold text-white">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-neutral-800 animate-pulse rounded" />
              ) : (
                c.value
              )}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 shadow-inner">
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationStatsCards;
