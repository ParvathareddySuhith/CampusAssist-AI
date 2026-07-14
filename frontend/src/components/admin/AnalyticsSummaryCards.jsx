import React from 'react';
import { FaUsers, FaFilePdf, FaComments, FaBell } from 'react-icons/fa';

/**
 * Summary metrics panel displaying core administration totals
 */
function AnalyticsSummaryCards({ summary, loading }) {
  const cards = [
    {
      title: 'Total Students',
      value: summary?.students ?? 0,
      icon: <FaUsers className="text-xl text-violet-400" />,
      gradient: 'from-violet-500/10 to-purple-500/5',
      border: 'border-violet-500/20'
    },
    {
      title: 'Total Course PDFs',
      value: summary?.documents ?? 0,
      icon: <FaFilePdf className="text-xl text-rose-400" />,
      gradient: 'from-rose-500/10 to-pink-500/5',
      border: 'border-rose-500/20'
    },
    {
      title: 'Questions Answered',
      value: summary?.questions ?? 0,
      icon: <FaComments className="text-xl text-emerald-400" />,
      gradient: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Alerts Broadcasted',
      value: summary?.notifications ?? 0,
      icon: <FaBell className="text-xl text-amber-400" />,
      gradient: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border ${c.border} bg-gradient-to-br ${c.gradient} flex items-center justify-between shadow-lg hover:scale-[1.01] transition-transform duration-200 select-none`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {c.title}
            </span>
            <p className="text-2xl font-extrabold text-white">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-neutral-800 animate-pulse rounded" />
              ) : (
                c.value.toLocaleString()
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

export default AnalyticsSummaryCards;
