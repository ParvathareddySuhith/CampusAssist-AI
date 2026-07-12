import { api } from '../lib/api';

/**
 * Perform administrator login
 * @param {Object} credentials - { username, password } or { email, password }
 */
export const loginAdmin = async (credentials) => {
  const response = await api.post('/api/admin/login', credentials);
  return response.data ?? {};
};

/**
 * Perform stateless administrator logout
 */
export const logoutAdmin = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.post('/api/admin/logout', {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch authenticated administrator details
 */
export const getCurrentAdmin = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};
