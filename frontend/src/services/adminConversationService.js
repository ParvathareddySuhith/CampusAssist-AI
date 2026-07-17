import { api } from '../lib/api';

/**
 * Fetch paginated list of student conversations
 */
export const getAdminConversations = async (page = 1, pageSize = 20, search = '', department = '') => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/admin/conversations', {
    params: { page, page_size: pageSize, search, department },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Fetch detailed chronological message log for a single conversation
 */
export const getAdminConversation = async (conversationId) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get(`/api/admin/conversations/${conversationId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};
