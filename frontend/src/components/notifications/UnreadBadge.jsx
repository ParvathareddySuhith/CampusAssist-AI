import React from 'react';

/**
 * Reusable badge representing the count of unread items.
 * Displays counts up to 99, or "99+" for anything higher.
 */
const UnreadBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  
  const displayCount = count > 99 ? '99+' : count;
  
  return (
    <span 
      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1.5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center border border-neutral-950 select-none shadow-md pointer-events-none"
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
};

export default UnreadBadge;
