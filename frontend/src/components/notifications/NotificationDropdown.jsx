import React from 'react';
import NotificationItem from './NotificationItem';

/**
 * Dropdown list container for displaying notification list, loader, error retry state,
 * and bulk action controls.
 */
const NotificationDropdown = ({
  notifications,
  unreadCount,
  loading,
  error,
  actionPending,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
  onRetry,
  dropdownRef
}) => {
  const handleClearAllClick = () => {
    if (window.confirm("Clear all notifications?")) {
      onClearAll();
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-950 border border-neutral-900 rounded-xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all duration-200"
      role="dialog"
      aria-label="Notification Center"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md flex justify-between items-center select-none">
        <div>
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>
        
        <div className="flex space-x-2 text-xs">
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || actionPending}
            className="text-blue-400 hover:text-blue-300 disabled:text-neutral-600 disabled:hover:text-neutral-600 font-semibold cursor-pointer transition-colors"
          >
            Mark all read
          </button>
          <span className="text-neutral-800">|</span>
          <button
            onClick={handleClearAllClick}
            disabled={notifications.length === 0 || actionPending}
            className="text-red-400 hover:text-red-300 disabled:text-neutral-600 disabled:hover:text-neutral-600 font-semibold cursor-pointer transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="max-h-96 overflow-y-auto divide-y divide-neutral-900 bg-neutral-950/20"
        role="list"
      >
        {loading && (
          <div className="p-8 text-center text-xs text-neutral-400 select-none animate-pulse">
            Loading notifications...
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center space-y-2 select-none">
            <p className="text-xs text-red-400">Unable to load notifications.</p>
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-xs text-white rounded cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-500 select-none">
            You're all caught up.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          notifications.map(item => (
            <NotificationItem 
              key={item.id}
              item={item}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
