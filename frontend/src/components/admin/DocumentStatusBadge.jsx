import React from 'react';

function DocumentStatusBadge({ status }) {
  const normalizedStatus = (status || '').toUpperCase();

  const config = {
    READY: {
      label: 'Ready',
      classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    },
    INDEXING: {
      label: 'Indexing',
      classes: 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
    },
    FAILED: {
      label: 'Failed',
      classes: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    }
  };

  const current = config[normalizedStatus] || {
    label: normalizedStatus || 'Unknown',
    classes: 'bg-neutral-500/10 border-neutral-500/30 text-neutral-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${current.classes}`}>
      {current.label}
    </span>
  );
}

export default DocumentStatusBadge;
