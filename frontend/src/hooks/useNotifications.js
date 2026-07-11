import { useState, useEffect, useRef, useCallback } from 'react';
import * as service from '../services/notificationService';

/**
 * Custom React hook for managing user notifications with optimistic updates,
 * unmount safety, caching, and throttled actions.
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const mountedRef = useRef(true);

  // Set up mount / unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Fetch user notifications from API (Lazy loaded)
   * @param {boolean} force - Force refetch even if already loaded
   */
  const loadNotifications = useCallback(async (force = false) => {
    if (isLoaded && !force) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await service.getNotifications();
      if (!mountedRef.current) return;
      
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      setIsLoaded(true);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to load notifications.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isLoaded]);

  /**
   * Mark a single notification as read optimistically with rollback on failure
   * @param {string} id - The notification ID
   */
  const markRead = useCallback(async (id) => {
    if (actionPending) return;
    
    const targetIdx = notifications.findIndex(n => n.id === id);
    if (targetIdx === -1) return;
    
    const target = notifications[targetIdx];
    if (target.is_read) return; // Already read

    // Snapshot for rollback
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic Update: toggle read state locally
    const updatedNotifications = [...notifications];
    updatedNotifications[targetIdx] = { ...target, is_read: true };
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
    setActionPending(true);
    setError(null);

    try {
      await service.markNotificationRead(id);
    } catch (err) {
      // Rollback on failure
      if (mountedRef.current) {
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
        setError('Failed to update notification. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setActionPending(false);
      }
    }
  }, [notifications, unreadCount, actionPending]);

  /**
   * Delete a notification optimistically with rollback on failure
   * @param {string} id - The notification ID
   */
  const deleteNotification = useCallback(async (id) => {
    if (actionPending) return;

    const target = notifications.find(n => n.id === id);
    if (!target) return;

    // Snapshot for rollback
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic Update: remove notification from local state
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!target.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setActionPending(true);
    setError(null);

    try {
      await service.deleteNotification(id);
    } catch (err) {
      // Rollback on failure
      if (mountedRef.current) {
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
        setError('Failed to delete notification. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setActionPending(false);
      }
    }
  }, [notifications, unreadCount, actionPending]);

  /**
   * Mark all notifications read optimistically with rollback on failure
   */
  const markAllRead = useCallback(async () => {
    if (actionPending) return;
    if (unreadCount === 0) return;

    // Snapshot for rollback
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic Update: mark all notifications as read locally
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setActionPending(true);
    setError(null);

    try {
      await service.markAllNotificationsRead();
    } catch (err) {
      // Rollback on failure
      if (mountedRef.current) {
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
        setError('Failed to mark all as read. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setActionPending(false);
      }
    }
  }, [notifications, unreadCount, actionPending]);

  /**
   * Clear all notifications optimistically with rollback on failure
   */
  const clearAll = useCallback(async () => {
    if (actionPending) return;
    if (notifications.length === 0) return;

    // Snapshot for rollback
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic Update: clear all notifications locally
    setNotifications([]);
    setUnreadCount(0);
    setActionPending(true);
    setError(null);

    try {
      await service.clearNotifications();
    } catch (err) {
      // Rollback on failure
      if (mountedRef.current) {
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
        setError('Failed to clear notifications. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setActionPending(false);
      }
    }
  }, [notifications, unreadCount, actionPending]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isLoaded,
    actionPending,
    loadNotifications,
    markRead,
    deleteNotification,
    markAllRead,
    clearAll
  };
};
export default useNotifications;
