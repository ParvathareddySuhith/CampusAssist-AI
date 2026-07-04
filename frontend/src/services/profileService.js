import { api } from '../lib/api';

/**
 * Retrieve user auth token from localStorage
 */
const getUserToken = () => {
  return localStorage.getItem('userToken');
};

/**
 * Fetch student profile details from the backend
 */
export const getProfile = async () => {
  const token = getUserToken();
  try {
    const response = await api.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('[Profile Service] Error getting profile:', error);
    throw error;
  }
};

/**
 * Update/Upsert student profile details in the database
 */
export const updateProfile = async (profileData) => {
  const token = getUserToken();
  try {
    const response = await api.put('/api/user/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('[Profile Service] Error updating profile:', error);
    throw error;
  }
};
