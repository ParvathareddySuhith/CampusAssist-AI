import { api } from '../lib/api';

/**
 * Fetch live operational health state of all system components
 */
export const getSystemHealth = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/system/health', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch system database aggregation metrics
 */
export const getSystemMetrics = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/system/metrics', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};
