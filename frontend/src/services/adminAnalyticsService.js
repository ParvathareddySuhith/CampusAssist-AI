import { api } from '../lib/api';

/**
 * Fetch the complete dashboard metrics snapshot
 * @param {boolean} refresh - Force invalidation and regeneration of the cache
 */
export const getDashboard = async (refresh = false) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/analytics/dashboard', {
    params: { refresh },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch student enrollment counts grouped by department
 */
export const getDepartments = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/analytics/departments', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? [];
};

/**
 * Fetch chatbot questions distribution grouped by intent categories
 */
export const getQuestionStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/analytics/questions', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch uploaded documents status metrics
 */
export const getDocumentStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/analytics/documents', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch notification read-rates and broadcast totals
 */
export const getNotificationStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/analytics/notifications', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch chronological platform activity log
 */
export const getRecentActivity = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/analytics/activity', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? [];
};
