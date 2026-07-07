import { api } from '../lib/api';

/**
 * Retrieve user auth token from localStorage
 */
const getUserToken = () => {
  return localStorage.getItem('userToken');
};

/**
 * Fetch student learning analytics summary from the backend
 * @param {string|null} sessionId - Optional session ID to filter active session stats
 * @returns {Promise<Object>} Backend analytics summary payload
 */
export const getSummary = async (sessionId = null) => {
  const token = getUserToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    if (sessionId) {
      config.params = { session_id: sessionId };
    }
    
    const response = await api.get('/api/analytics/summary', config);
    return response.data;
  } catch (error) {
    console.error('[Analytics Service] Error fetching analytics summary:', error);
    throw error;
  }
};
