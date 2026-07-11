import React from 'react';
import { FaCheck, FaTrash } from 'react-icons/fa';
import { CATEGORY_STYLES, PRIORITY_STYLES } from './constants';
import { formatRelativeTime } from '../../utils/timeFormatter';

/**
 * Individual Notification row item displaying category, priority, details, and actions.
 */
const NotificationItem = ({ item, onMarkRead, onDelete }) => {
  // Safe fallbacks in case categories/priorities are invalid or customized in future
  const cat = CATEGORY_STYLES[item.category] || { 
    bg: "bg-neutral-500/10", 
    text: "text-neutral-400", 
    border: "border-neutral-500/20", 
    label: item.category 
  };
  const pri = PRIORITY_STYLES[item.priority] || { 
    bg: "bg-neutral-500/10", 
    text: "text-neutral-400", 
    border: "border-neutral-500/20", 
    label: item.priority 
  };
  
  return (
    <div 
      className={`p-4 border-b border-neutral-900 transition-colors flex flex-col space-y-2 relative ${
        item.is_read 
          ? 'bg-neutral-950/40 hover:bg-neutral-950/80 text-neutral-400' 
          : 'bg-neutral-900/60 hover:bg-neutral-900 border-l-2 border-l-blue-500 text-white'
      }`}
      role="listitem"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-1.5 items-center select-none">
          {/* Category Badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${cat.bg} ${cat.text} ${cat.border}`}>
            {cat.label}
          </span>
          {/* Priority Badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${pri.bg} ${pri.text} ${pri.border}`}>
            {pri.label}
          </span>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center space-x-2">
          {!item.is_read && (
            <button
              onClick={() => onMarkRead(item.id)}
              className="text-neutral-500 hover:text-blue-400 p-1 rounded transition-colors cursor-pointer"
              title="Mark as read"
              aria-label="Mark notification as read"
            >
              <FaCheck className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Title & message */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold select-none leading-snug">{item.title}</h4>
        <p className="text-xs text-neutral-400 leading-relaxed select-none">{item.message}</p>
      </div>
      
      {/* Timestamp */}
      <div className="text-[10px] text-neutral-500 select-none">
        {formatRelativeTime(item.created_at)}
      </div>
    </div>
  );
};

export default NotificationItem;
