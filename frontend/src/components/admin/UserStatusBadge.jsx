import React from 'react';

function UserStatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
      isActive 
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
        : "bg-neutral-500/10 border-neutral-800 text-neutral-500"
    }`}>
      {isActive ? 'Active' : 'Disabled'}
    </span>
  );
}

export default UserStatusBadge;
