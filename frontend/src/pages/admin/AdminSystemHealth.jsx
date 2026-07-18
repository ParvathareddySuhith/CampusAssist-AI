import React, { useState, useEffect, useCallback } from 'react';
import { FaSync, FaHeartbeat, FaInfoCircle } from 'react-icons/fa';
import GradientText from '../../components/ui/GradientText';
import * as systemService from '../../services/adminSystemService';
import ServiceHealthGrid from '../../components/admin/ServiceHealthGrid';
import SystemMetricsPanel from '../../components/admin/SystemMetricsPanel';

/**
 * Live administrative panel monitoring cluster components and storage size usage
 */
function AdminSystemHealth() {
  const [healthData, setHealthData] = useState({ services: [] });
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealthAndMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [health, metrics] = await Promise.all([
        systemService.getSystemHealth(),
        systemService.getSystemMetrics()
      ]);

      setHealthData(health);
      setMetricsData(metrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load system dashboard:', err);
      setError('Failed to fetch system operations data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchHealthAndMetrics();
  }, [fetchHealthAndMetrics]);

  // Auto refresh every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchHealthAndMetrics();
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchHealthAndMetrics]);

  const handleManualRefresh = () => {
    fetchHealthAndMetrics();
  };

  const getRefreshTimeText = () => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString();
  };

  const degradedServices = healthData?.services?.filter(s => s.status?.toLowerCase() !== 'healthy') || [];
  const hasDegraded = degradedServices.length > 0;

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header bar */}
      <div className="flex justify-between items-center select-none">
        <div>
          <GradientText className="text-3xl font-extrabold tracking-tight">
            System Health
          </GradientText>
          <p className="text-xs text-neutral-400">
            Monitor operational health states and storage metrics.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              Last updated: {getRefreshTimeText()}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 text-xs font-semibold text-neutral-200 transition-all cursor-pointer shadow-lg"
          >
            <FaSync className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Degradation Warning Banner */}
      {hasDegraded && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center space-x-3 text-rose-400 text-sm select-none">
          <FaInfoCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <div className="font-semibold">
            Operational warning: The following services report degraded status: {degradedServices.map(s => s.name).join(', ')}.
          </div>
        </div>
      )}

      {/* Error State Banner */}
      {error && (
        <div className="p-8 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center text-rose-400 text-sm font-semibold select-none">
          {error}
        </div>
      )}

      {/* Health Grid Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-2 select-none">
          <FaHeartbeat className="text-emerald-400" />
          <span>Dependencies Status</span>
        </h3>
        
        {loading && healthData.services.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-24 bg-neutral-900/40 border border-neutral-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <ServiceHealthGrid services={healthData.services} />
        )}
      </div>

      {/* Metrics Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-2 select-none">
          <FaHeartbeat className="text-violet-400" />
          <span>System Metrics</span>
        </h3>
        
        {loading && !metricsData ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(idx => (
              <div key={idx} className="h-28 bg-neutral-900/40 border border-neutral-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <SystemMetricsPanel metrics={metricsData} />
        )}
      </div>
    </div>
  );
}

export default AdminSystemHealth;
