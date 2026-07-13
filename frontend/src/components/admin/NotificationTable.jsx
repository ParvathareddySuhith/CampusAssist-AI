import React from 'react';
import { FaTrashAlt, FaBell } from 'react-icons/fa';
import NotificationTargetBadge from './NotificationTargetBadge';

/**
 * List table displaying sent notifications history and stats metrics
 */
function NotificationTable({ 
  notifications, 
  loading, 
  onDelete, 
  onCreateClick 
}) {
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW':
        default:
          return 'text-neutral-400 bg-neutral-800/40 border-neutral-700/30';
    }
  };

  const handleDeleteClick = (notification) => {
    const confirmMessage = "Delete this broadcast? This will remove the notification for all recipients.";
    if (window.confirm(confirmMessage)) {
      onDelete(notification.id);
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto w-full border border-neutral-900 rounded-2xl bg-neutral-900/10 backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              {['Title', 'Category', 'Priority', 'Target', 'Sent By', 'Created', 'Recipients', 'Delivered', 'Read', 'Actions'].map((h, i) => (
                <th key={i} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-neutral-900/50">
                <td className="p-4" colSpan={10}>
                  <div className="h-6 bg-neutral-900/50 animate-pulse rounded-lg w-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-neutral-900/20 border border-neutral-900 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-neutral-900/60 flex items-center justify-center border border-neutral-800 mb-4 text-neutral-500 shadow-inner">
          <FaBell className="text-2xl" />
        </div>
        <h4 className="text-white font-semibold text-base mb-1">No notifications sent yet</h4>
        <p className="text-neutral-400 text-xs max-w-sm mb-6">
          Use broadcasts to send important academic bulletins, event updates, and alerts to students.
        </p>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer"
        >
          Create Broadcast
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full border border-neutral-900 rounded-2xl bg-neutral-900/10 backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-900 text-[10px] uppercase font-bold text-neutral-400 tracking-wider select-none bg-neutral-950/20">
            <th className="p-4 font-extrabold">Title</th>
            <th className="p-4 font-extrabold">Category</th>
            <th className="p-4 font-extrabold">Priority</th>
            <th className="p-4 font-extrabold">Target</th>
            <th className="p-4 font-extrabold text-center">Sent By</th>
            <th className="p-4 font-extrabold">Created At</th>
            <th className="p-4 font-extrabold text-right">Recipients</th>
            <th className="p-4 font-extrabold text-right">Delivered</th>
            <th className="p-4 font-extrabold text-right">Read</th>
            <th className="p-4 font-extrabold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900/30 text-sm">
          {notifications.map((n) => (
            <tr 
              key={n.id} 
              className="hover:bg-neutral-900/25 transition-colors group"
            >
              <td className="p-4 max-w-xs">
                <div className="font-semibold text-white truncate" title={n.title}>
                  {n.title}
                </div>
                <div className="text-[11px] text-neutral-400 truncate max-w-xs mt-0.5" title={n.message}>
                  {n.message}
                </div>
              </td>
              <td className="p-4 text-xs font-semibold text-neutral-300">
                {n.category}
              </td>
              <td className="p-4 select-none">
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getPriorityClass(n.priority)}`}>
                  {n.priority}
                </span>
              </td>
              <td className="p-4">
                <NotificationTargetBadge type={n.target_type} value={n.target_value} />
              </td>
              <td className="p-4 text-xs font-semibold text-neutral-300 text-center">
                {n.sender_name}
              </td>
              <td className="p-4 text-xs text-neutral-400 whitespace-nowrap">
                {formatDate(n.created_at)}
              </td>
              <td className="p-4 text-right font-semibold text-white whitespace-nowrap">
                {n.recipients}
              </td>
              <td className="p-4 text-right font-semibold text-emerald-400 whitespace-nowrap">
                {n.delivered}
              </td>
              <td className="p-4 text-right font-semibold text-violet-400 whitespace-nowrap">
                {n.read}
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleDeleteClick(n)}
                  title="Delete broadcast for all recipients"
                  className="p-2 rounded bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 cursor-pointer hover:bg-rose-500/5 transition-all"
                >
                  <FaTrashAlt className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NotificationTable;
