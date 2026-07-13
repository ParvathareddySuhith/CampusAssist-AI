import { api } from '../lib/api';

/**
 * Fetch paginated list of students
 * @param {Object} params - { page, page_size, search, sort, order }
 */
export const getUsers = async (params = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/users/', {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch detailed student learning profile inspection metrics
 * @param {string} userId
 */
export const getUser = async (userId) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get(`/api/admin/users/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Enable or disable student login account status
 * @param {string} userId
 * @param {boolean} enabled - True for active, False for disabled
 */
export const updateUserStatus = async (userId, enabled) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.patch(`/api/admin/users/${userId}/status`, {
    enabled
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Send targeted student notification alert announcement
 * @param {string} userId
 * @param {Object} payload - { title, message, category, priority }
 */
export const sendNotification = async (userId, payload) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.post(`/api/admin/users/${userId}/notify`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};
