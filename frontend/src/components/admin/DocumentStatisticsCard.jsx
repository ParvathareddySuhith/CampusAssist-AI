import React from 'react';
import { FaFilePdf, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Breakdown panel indicating indexing, processing, and failed PDF materials
 */
function DocumentStatisticsCard({ documents = {}, loading }) {
  const total = documents?.total ?? 0;
  const indexed = documents?.indexed ?? 0;
  const processing = documents?.processing ?? 0;
  const failed = documents?.failed ?? 0;

  const indexedPercent = total > 0 ? Math.round((indexed / total) * 100) : 0;
  const processingPercent = total > 0 ? Math.round((processing / total) * 100) : 0;
  const failedPercent = total > 0 ? Math.round((failed / total) * 100) : 0;

  return (
    <div className="p-6 bg-neutral-900/40 border border-neutral-900/80 rounded-xl space-y-6 flex flex-col justify-between h-full select-none">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-3">
          <span className="text-xl">📁</span>
          <span>Knowledge Base Sync</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-2">
          Index status breakdown for uploaded course-material documents.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3.5 py-2">
        {loading ? (
          [1, 2, 3].map((x) => (
            <div key={x} className="h-10 bg-neutral-900/40 animate-pulse rounded-lg w-full" />
          ))
        ) : (
          <>
            {/* Indexed Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
                  <FaCheckCircle className="text-emerald-400 text-sm" />
                  <span>Indexed (Ready)</span>
                </div>
                <span className="font-bold text-white">{indexed} <span className="text-[10px] text-emerald-400">({indexedPercent}%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${indexedPercent}%` }}
                />
              </div>
            </div>

            {/* Processing Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
                  <FaSpinner className="text-amber-400 text-sm animate-spin" />
                  <span>Processing (Indexing)</span>
                </div>
                <span className="font-bold text-white">{processing} <span className="text-[10px] text-amber-400">({processingPercent}%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${processingPercent}%` }}
                />
              </div>
            </div>

            {/* Failed Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
                  <FaExclamationTriangle className="text-rose-400 text-sm" />
                  <span>Failed (Errors)</span>
                </div>
                <span className="font-bold text-white">{failed} <span className="text-[10px] text-rose-400">({failedPercent}%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${failedPercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentStatisticsCard;
