import { api } from '../lib/api';

/**
 * Fetch paginated sent notifications with filtering and search options
 * @param {Object} params - Query filters (page, page_size, search, category, priority, target_type)
 */
export const getNotifications = async (params) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/notifications', {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Dispatch/broadcast a new notification targeting a group of students
 * @param {Object} payload - Broadcast input properties
 */
export const createNotification = async (payload) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.post('/api/admin/notifications', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Permanently delete a broadcast or notification from recipient feeds
 * @param {string} id - The broadcast_id or notification ID
 */
export const deleteNotification = async (id) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.delete(`/api/admin/notifications/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch total, unread, broadcasts, and individual notification counters
 */
export const getNotificationStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/notifications/stats', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};
