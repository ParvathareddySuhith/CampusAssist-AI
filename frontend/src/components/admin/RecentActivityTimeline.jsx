import React from 'react';
import { FaUserPlus, FaCloudUploadAlt, FaPaperPlane } from 'react-icons/fa';

/**
 * Timeline widget displaying chronological administrative activity logs
 */
function RecentActivityTimeline({ activity = [], loading }) {
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'USER_REGISTERED':
        return (
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FaUserPlus className="text-sm" />
          </div>
        );
      case 'PDF_UPLOADED':
        return (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <FaCloudUploadAlt className="text-sm" />
          </div>
        );
      case 'BROADCAST_SENT':
        return (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FaPaperPlane className="text-sm" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400">
            <FaPaperPlane className="text-sm" />
          </div>
        );
    }
  };

  const isEmpty = !activity || activity.length === 0;

  return (
    <section
      aria-label="Recent Platform Activity Feed"
      className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col h-full select-none"
    >
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">🕒</span>
          <span>Recent Activity</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-2">
          Real-time log of administrative events and student signups.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[320px] pr-1 space-y-4">
        {loading ? (
          [1, 2, 3].map((x) => (
            <div key={x} className="flex space-x-3 items-center">
              <div className="w-8 h-8 bg-neutral-800 animate-pulse rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-neutral-850 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-neutral-900/60 animate-pulse rounded w-1/4" />
              </div>
            </div>
          ))
        ) : isEmpty ? (
          <div className="text-center text-xs text-neutral-500 py-16 italic">
            No activity logs found.
          </div>
        ) : (
          activity.map((event, idx) => (
            <div key={idx} className="flex space-x-3.5 items-start group">
              {getActivityIcon(event.type)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors truncate">
                  {event.description}
                </p>
                <span className="text-[10px] text-neutral-500 font-medium">
                  {formatDate(event.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default RecentActivityTimeline;
