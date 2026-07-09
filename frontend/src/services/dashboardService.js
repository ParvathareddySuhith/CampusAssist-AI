import { api } from '../lib/api';

/**
 * Retrieve user auth token from localStorage
 */
const getUserToken = () => {
  return localStorage.getItem('userToken');
};

/**
 * Helper to get authorization headers config
 */
const getHeadersConfig = () => {
  const token = getUserToken();
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

/**
 * Fetch unified student dashboard summary aggregation
 * @returns {Promise<Object>} Dashboard summary payload
 */
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/api/dashboard/summary', getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error('[Dashboard Service] Error fetching summary:', error);
    throw error;
  }
};

/**
 * Fetch standalone profile aggregation details
 * @returns {Promise<Object>} Aggregated profile details
 */
export const getDashboardProfile = async () => {
  try {
    const response = await api.get('/api/dashboard/profile', getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error('[Dashboard Service] Error fetching profile:', error);
    throw error;
  }
};

/**
 * Fetch standalone recent learning activity feed
 * @returns {Promise<Array>} Chronological list of learning events
 */
export const getDashboardActivity = async () => {
  try {
    const response = await api.get('/api/dashboard/activity', getHeadersConfig());
    return response.data ?? [];
  } catch (error) {
    console.error('[Dashboard Service] Error fetching activity:', error);
    throw error;
  }
};

/**
 * Fetch standalone personalized recommendation results
 * @returns {Promise<Object>} Structured recommendation objects
 */
export const getDashboardRecommendations = async () => {
  try {
    const response = await api.get('/api/dashboard/recommendations', getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error('[Dashboard Service] Error fetching recommendations:', error);
    throw error;
  }
};
