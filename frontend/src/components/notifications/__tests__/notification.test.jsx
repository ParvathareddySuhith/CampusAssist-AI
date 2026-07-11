import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { formatRelativeTime } from '../../../utils/timeFormatter';
import * as service from '../../../services/notificationService';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationBell from '../NotificationBell';
import UnreadBadge from '../UnreadBadge';
import { CATEGORY_STYLES, PRIORITY_STYLES } from '../constants';

// Mock the notification service
vi.mock('../../../services/notificationService', () => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
  clearNotifications: vi.fn()
}));

describe('formatRelativeTime Utility', () => {
  it('formats relative timestamps correctly', () => {
    const now = new Date();
    
    // Just now
    expect(formatRelativeTime(now.toISOString())).toBe('Just now');
    
    // 5 minutes ago
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinsAgo.toISOString())).toBe('5 minutes ago');
    
    // 3 hours ago
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe('3 hours ago');
    
    // Yesterday
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday.toISOString())).toBe('Yesterday');
    
    // 3 days ago
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3 days ago');
    
    // Fallback/Invalid
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
  });
});

describe('UnreadBadge Component', () => {
  it('renders count correctly and hides when zero', () => {
    const { container, rerender } = render(<UnreadBadge count={0} />);
    expect(container.firstChild).toBeNull();

    rerender(<UnreadBadge count={5} />);
    expect(screen.getByText('5')).toBeDefined();

    rerender(<UnreadBadge count={100} />);
    expect(screen.getByText('99+')).toBeDefined();
  });
});

describe('useNotifications Custom Hook', () => {
  const mockNotifications = [
    { id: '1', title: 'Title 1', message: 'Msg 1', category: 'STUDY', priority: 'HIGH', is_read: false, created_at: new Date().toISOString() },
    { id: '2', title: 'Title 2', message: 'Msg 2', category: 'SYSTEM', priority: 'LOW', is_read: true, created_at: new Date().toISOString() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles lazy loading and caches fetch results', async () => {
    service.getNotifications.mockResolvedValue({
      notifications: mockNotifications,
      unread_count: 1
    });

    const { result } = renderHook(() => useNotifications());
    
    // Initial states
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.notifications).toEqual([]);

    // Trigger load
    await act(async () => {
      await result.current.loadNotifications();
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.unreadCount).toBe(1);
    expect(service.getNotifications).toHaveBeenCalledTimes(1);

    // Call load again, should NOT trigger another fetch (cached)
    await act(async () => {
      await result.current.loadNotifications();
    });
    expect(service.getNotifications).toHaveBeenCalledTimes(1);
  });

  it('performs optimistic mark as read and rolls back on failure', async () => {
    service.getNotifications.mockResolvedValue({
      notifications: mockNotifications,
      unread_count: 1
    });
    service.markNotificationRead.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useNotifications());
    
    await act(async () => {
      await result.current.loadNotifications();
    });
    
    expect(result.current.notifications[0].is_read).toBe(false);
    expect(result.current.unreadCount).toBe(1);

    // Trigger markRead (should optimistically mark as read)
    let markReadPromise;
    act(() => {
      markReadPromise = result.current.markRead('1');
    });

    // Verify optimistic state change
    expect(result.current.notifications[0].is_read).toBe(true);
    expect(result.current.unreadCount).toBe(0);

    // Await API response (which rejects)
    await act(async () => {
      await markReadPromise;
    });

    // State should have rolled back
    expect(result.current.notifications[0].is_read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.error).toBe('Failed to update notification. Please try again.');
  });

  it('performs optimistic delete and rolls back on failure', async () => {
    service.getNotifications.mockResolvedValue({
      notifications: mockNotifications,
      unread_count: 1
    });
    service.deleteNotification.mockRejectedValue(new Error('Delete Error'));

    const { result } = renderHook(() => useNotifications());
    
    await act(async () => {
      await result.current.loadNotifications();
    });

    expect(result.current.notifications).toHaveLength(2);

    // Trigger delete
    let deletePromise;
    act(() => {
      deletePromise = result.current.deleteNotification('1');
    });

    // Optimistically removed
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('2');

    await act(async () => {
      await deletePromise;
    });

    // Rolled back
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0].id).toBe('1');
  });

  it('prevents duplicate action calls while actionPending is true', async () => {
    service.getNotifications.mockResolvedValue({
      notifications: mockNotifications,
      unread_count: 1
    });
    // Create an API call that resolves slowly
    let resolveApi;
    const slowApiPromise = new Promise(resolve => {
      resolveApi = resolve;
    });
    service.markNotificationRead.mockReturnValue(slowApiPromise);

    const { result } = renderHook(() => useNotifications());
    
    await act(async () => {
      await result.current.loadNotifications();
    });

    // Trigger action
    act(() => {
      result.current.markRead('1');
    });

    expect(result.current.actionPending).toBe(true);

    // Try to trigger delete or another markRead (should be blocked)
    act(() => {
      result.current.deleteNotification('2');
    });

    // Notification 2 should NOT be removed (actions blocked)
    expect(result.current.notifications.find(n => n.id === '2')).toBeDefined();
    expect(service.deleteNotification).not.toHaveBeenCalled();

    // Resolve original action
    await act(async () => {
      resolveApi({});
      await slowApiPromise;
    });

    expect(result.current.actionPending).toBe(false);
  });

  it('is resilient to unmounting while async call is in flight', async () => {
    let resolveApi;
    const slowApiPromise = new Promise(resolve => {
      resolveApi = resolve;
    });
    service.getNotifications.mockReturnValue(slowApiPromise);

    const { result, unmount } = renderHook(() => useNotifications());

    // Trigger fetch
    act(() => {
      result.current.loadNotifications();
    });

    // Unmount hook
    unmount();

    // Resolve API (should not cause state updates or warnings)
    await act(async () => {
      resolveApi({ notifications: [], unread_count: 0 });
      await slowApiPromise;
    });
  });
});

describe('NotificationBell UI Component', () => {
  const mockNotifications = [
    { id: '1', title: 'Class Cancelled', message: 'OS class is cancelled today.', category: 'SYSTEM', priority: 'HIGH', is_read: false, created_at: new Date().toISOString() },
    { id: '2', title: 'New Quiz', message: 'DBMS Quiz 3 is now live.', category: 'STUDY', priority: 'MEDIUM', is_read: false, created_at: new Date().toISOString() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    service.getNotifications.mockResolvedValue({
      notifications: mockNotifications,
      unread_count: 2
    });
  });

  it('renders and opens dropdown list on click', async () => {
    render(<NotificationBell />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    expect(bellButton).toBeDefined();

    // Dropdown initially not present
    expect(screen.queryByRole('dialog')).toBeNull();

    // Click to open
    fireEvent.click(bellButton);

    // Verify loading and then content
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Class Cancelled')).toBeDefined();
      expect(screen.getByText('New Quiz')).toBeDefined();
    });

    expect(service.getNotifications).toHaveBeenCalledTimes(1);
  });

  it('closes dropdown on click outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside Area</div>
        <NotificationBell />
      </div>
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));

    // Dropdown should close
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes dropdown on Escape key press', async () => {
    render(<NotificationBell />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Dropdown should close and return focus
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(bellButton);
  });

  it('enforces a focus trap when Tab navigation is used', async () => {
    render(<NotificationBell />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    const dialog = screen.getByRole('dialog');
    const focusableButtons = dialog.querySelectorAll('button');
    const firstButton = focusableButtons[0];
    const lastButton = focusableButtons[focusableButtons.length - 1];

    // Focus last element
    lastButton.focus();

    // Press Tab (should wrap to first element)
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(firstButton);

    // Press Shift + Tab on first element (should wrap to last element)
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastButton);
  });
});
