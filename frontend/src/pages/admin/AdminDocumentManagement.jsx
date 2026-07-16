import React, { useState, useEffect } from 'react';
import GradientText from '../../components/ui/GradientText';
import * as docService from '../../services/adminDocumentService';

/**
 * live statistics view showing backend API integrations for Admin Document Management
 */
function AdminDocumentManagement() {
  const [stats, setStats] = useState({ total: 0, indexed: 0, processing: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await docService.getAdminDocumentStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load document stats:', err);
        setError('Failed to connect to stats API.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 select-none">
      <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl max-w-md shadow-2xl space-y-6">
        <span className="text-4xl">📁</span>
        
        <div className="space-y-1">
          <GradientText className="text-3xl font-extrabold tracking-tight">
            Document Management
          </GradientText>
          <p className="text-xs text-neutral-400">
            Sprint 14 - Task 18B: Document listing metrics
          </p>
        </div>

        {loading ? (
          <div className="text-sm font-semibold text-neutral-400 animate-pulse py-4">
            Loading metrics...
          </div>
        ) : error ? (
          <div className="text-sm font-semibold text-rose-400 py-4">
            {error}
          </div>
        ) : (
          <div className="bg-neutral-950/50 rounded-xl p-6 border border-neutral-900 shadow-inner text-left space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center text-neutral-300">
              <span>Total Documents:</span>
              <span className="font-bold text-white">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>Indexed:</span>
              <span className="font-bold">{stats.indexed}</span>
            </div>
            <div className="flex justify-between items-center text-amber-400">
              <span>Processing:</span>
              <span className="font-bold">{stats.processing}</span>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span>Failed:</span>
              <span className="font-bold">{stats.failed}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDocumentManagement;
