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
 * Fetch list of active notifications and the unread count
 * @returns {Promise<Object>} Object containing notifications array and unread_count
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/api/notifications', getHeadersConfig());
    
    // Normalize response: fallback to safe defaults if response data is missing
    const data = response.data ?? {};
    return {
      notifications: data.notifications ?? [],
      unread_count: data.unread_count ?? 0
    };
  } catch (error) {
    console.error('[Notification Service] Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {string} id - The notification ID
 * @returns {Promise<Object>} Updated notification object
 */
export const markNotificationRead = async (id) => {
  try {
    const response = await api.patch(`/api/notifications/${id}/read`, {}, getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error(`[Notification Service] Error marking notification ${id} read:`, error);
    throw error;
  }
};

/**
 * Mark all notifications as read for the student
 * @returns {Promise<Object>} Success status response
 */
export const markAllNotificationsRead = async () => {
  try {
    const response = await api.patch('/api/notifications/read-all', {}, getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error('[Notification Service] Error marking all read:', error);
    throw error;
  }
};

/**
 * Delete a single notification
 * @param {string} id - The notification ID
 * @returns {Promise<Object>} Success status response
 */
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/api/notifications/${id}`, getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error(`[Notification Service] Error deleting notification ${id}:`, error);
    throw error;
  }
};

/**
 * Clear all notifications for the student
 * @returns {Promise<Object>} Success status response
 */
export const clearNotifications = async () => {
  try {
    const response = await api.delete('/api/notifications', getHeadersConfig());
    return response.data ?? {};
  } catch (error) {
    console.error('[Notification Service] Error clearing notifications:', error);
    throw error;
  }
};
