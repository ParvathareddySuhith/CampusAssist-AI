import React, { useState, useEffect, useCallback } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import AnalyticsSummaryCards from '../../components/admin/AnalyticsSummaryCards';
import DepartmentDistributionChart from '../../components/admin/DepartmentDistributionChart';
import QuestionDistributionChart from '../../components/admin/QuestionDistributionChart';
import DocumentStatisticsCard from '../../components/admin/DocumentStatisticsCard';
import NotificationStatisticsCard from '../../components/admin/NotificationStatisticsCard';
import RecentActivityTimeline from '../../components/admin/RecentActivityTimeline';
import GradientText from '../../components/ui/GradientText';
import * as adminAnalyticsService from '../../services/adminAnalyticsService';

/**
 * Main Administration Analytics Control Center view
 */
function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Real-time relative last updated timestamps
  const [relativeTime, setRelativeTime] = useState('');

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    setError('');
    try {
      const snapshot = await adminAnalyticsService.getDashboard(forceRefresh);
      setData(snapshot);
    } catch (err) {
      console.error('Failed to load dashboard analytics snapshot:', err);
      setError('Unable to load administration dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial request load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Relative timestamp calculation loop
  useEffect(() => {
    if (!data?.generated_at) return;

    const updateRelativeTime = () => {
      const diffMs = new Date() - new Date(data.generated_at);
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds < 5) {
        setRelativeTime('just now');
      } else if (diffSeconds < 60) {
        setRelativeTime(`${diffSeconds} seconds ago`);
      } else {
        const mins = Math.floor(diffSeconds / 60);
        setRelativeTime(`${mins} min${mins > 1 ? 's' : ''} ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 1000);
    return () => clearInterval(interval);
  }, [data?.generated_at]);

  const formatLocalTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '';
    }
  };

  const hasErrors = data?.errors && Object.keys(data.errors).length > 0;

  return (
    <div className="space-y-6 text-white min-h-full font-sans pb-12 relative select-none">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <GradientText className="text-2xl font-extrabold tracking-tight">
            Analytics Overview
          </GradientText>
          <p className="text-xs text-neutral-400 mt-1">
            Aggregated workspace stats, student intents, and document synchronizations.
          </p>
        </div>

        {/* Sync Controls and Timers */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {data?.generated_at && (
            <div className="text-[10px] text-right font-semibold text-neutral-400">
              <span className="block text-neutral-500 uppercase tracking-widest text-[9px] mb-0.5">Last updated</span>
              <span className="text-neutral-300 font-bold">{formatLocalTime(data.generated_at)}</span>
              {relativeTime && <span className="text-violet-400 ml-1">({relativeTime})</span>}
            </div>
          )}

          <button
            onClick={() => loadDashboardData(true)}
            disabled={loading || refreshing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-xl shadow-lg transition-all text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <FaSyncAlt className={`text-[10px] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Reload Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Resilient Subsystem Failure Warnings Banner */}
      {hasErrors && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs space-y-1 select-none">
          <div className="font-bold flex items-center space-x-1.5">
            <span>⚠️</span>
            <span>Partial Metrics Offline</span>
          </div>
          <ul className="list-disc pl-5 font-medium text-[11px] text-neutral-300">
            {Object.entries(data.errors).map(([key, err]) => (
              <li key={key}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Global Connection / Fetch Failure Panel */}
      {error && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-neutral-900/20 border border-rose-500/25 backdrop-blur-xl">
          <span className="text-2xl mb-2">❌</span>
          <h4 className="text-white font-semibold text-base mb-1">Failed to load analytics</h4>
          <p className="text-neutral-400 text-xs max-w-sm mb-6">{error}</p>
          <button
            onClick={() => loadDashboardData(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-lg transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Core Summary Cards */}
      {!error && (
        <AnalyticsSummaryCards summary={data?.summary} loading={loading} />
      )}

      {/* Subsystem Charts Grid */}
      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: distributions */}
          <div className="space-y-6">
            <DepartmentDistributionChart data={data?.departments} loading={loading} />
            <QuestionDistributionChart data={data?.questions_distribution} loading={loading} />
          </div>

          {/* Right Column: statistics & timelines */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DocumentStatisticsCard documents={data?.documents} loading={loading} />
              <NotificationStatisticsCard notifications={data?.notifications} loading={loading} />
            </div>
            <RecentActivityTimeline activity={data?.recent_activity} loading={loading} />
          </div>

        </div>
      )}

    </div>
  );
}

export default AdminAnalyticsPage;
