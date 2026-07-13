import React from 'react';

/**
 * Visual badge representation of notification target scope
 */
function NotificationTargetBadge({ type, value }) {
  let classes = "bg-neutral-900 border-neutral-800 text-neutral-400";
  let text = type || "ALL";

  switch (type?.toUpperCase()) {
    case 'ALL':
      classes = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      text = "All Students";
      break;
    case 'DEPARTMENT':
      classes = "bg-violet-500/10 border-violet-500/20 text-violet-400";
      text = `Dept: ${value}`;
      break;
    case 'SEMESTER':
      classes = "bg-amber-500/10 border-amber-500/20 text-amber-400";
      text = `Semester ${value}`;
      break;
    case 'INDIVIDUAL':
      classes = "bg-sky-500/10 border-sky-500/20 text-sky-400";
      text = `User: ${value}`;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wider select-none ${classes}`}>
      {text}
    </span>
  );
}

export default NotificationTargetBadge;
