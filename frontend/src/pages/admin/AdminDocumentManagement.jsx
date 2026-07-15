import React from 'react';
import GradientText from '../../components/ui/GradientText';

/**
 * Navigation scaffold view for Admin Document Management
 */
function AdminDocumentManagement() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 select-none">
      <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl max-w-md shadow-2xl space-y-4">
        <span className="text-4xl">📁</span>
        <GradientText className="text-3xl font-extrabold tracking-tight">
          Document Management
        </GradientText>
        <p className="text-sm font-semibold text-violet-400">
          Coming in Sprint 14 - Task 18B
        </p>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          We are preparing this module to allow course material indexing, vector database syncing, and knowledge base settings.
        </p>
      </div>
    </div>
  );
}

export default AdminDocumentManagement;
