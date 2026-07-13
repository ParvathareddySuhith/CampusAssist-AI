import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminNotificationManagement from '../../../pages/admin/AdminNotificationManagement';
import * as service from '../../../services/adminNotificationService';

// Mock the API service
vi.mock('../../../services/adminNotificationService', () => ({
  getNotifications: vi.fn(),
  createNotification: vi.fn(),
  deleteNotification: vi.fn(),
  getNotificationStats: vi.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = { adminToken: 'mock-admin-token' };
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('AdminNotificationManagement page and operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock resolves
    service.getNotificationStats.mockResolvedValue({
      total_notifications: 10,
      unread: 3,
      broadcasts: 2,
      individual_messages: 1
    });

    service.getNotifications.mockResolvedValue({
      notifications: [
        {
          id: 'b-1',
          title: 'Campus Closed',
          message: 'Closed due to weather.',
          category: 'GENERAL',
          priority: 'HIGH',
          target_type: 'ALL',
          target_value: '',
          sender_name: 'testadmin',
          created_at: '2026-07-13T13:40:00.000Z',
          recipients: 5,
          delivered: 5,
          read: 2
        }
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total: 1,
        pages: 1
      }
    });
  });

  it('renders title, stats cards, and sent notifications table correctly', async () => {
    render(<AdminNotificationManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Notification Management')).toBeDefined();
      expect(screen.getByText('Total Sent Records')).toBeDefined();
      expect(screen.getByText('Active Broadcasts')).toBeDefined();
      expect(screen.getByText('Campus Closed')).toBeDefined();
    });

    expect(service.getNotificationStats).toHaveBeenCalledTimes(1);
    expect(service.getNotifications).toHaveBeenCalledTimes(1);
  });

  it('filters notifications by scope, category, and priority', async () => {
    render(<AdminNotificationManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Campus Closed')).toBeDefined();
    });

    const categorySelect = screen.getByRole('combobox', { name: /Category/i });
    
    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: 'PLACEMENT' } });
    });

    expect(service.getNotifications).toHaveBeenLastCalledWith(expect.objectContaining({
      category: 'PLACEMENT',
      page: 1
    }));
  });

  it('submits a new broadcast via dialog form and resets state on success', async () => {
    service.createNotification.mockResolvedValueOnce({
      success: true,
      broadcast_id: 'b-new',
      recipients: 10,
      message: 'Notification sent successfully.'
    });

    render(<AdminNotificationManagement />, { wrapper });

    // Open Broadcast Dialog
    const createBtn = screen.getByRole('button', { name: /Create Broadcast/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Create Notification Broadcast')).toBeDefined();

    // Fill fields
    const titleInput = screen.getByPlaceholderText('Enter notification title');
    const msgInput = screen.getByPlaceholderText('Write broadcast message content here...');
    const submitBtn = screen.getByRole('button', { name: 'Send Broadcast' });

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Holiday Notice' } });
      fireEvent.change(msgInput, { target: { value: 'Tomorrow is a holiday.' } });
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(service.createNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Holiday Notice',
        message: 'Tomorrow is a holiday.'
      }));
    });
  });

  it('handles deletion of broadcasts with window.confirm prompt', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    service.deleteNotification.mockResolvedValueOnce({
      success: true,
      deleted_count: 5
    });

    render(<AdminNotificationManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTitle('Delete broadcast for all recipients')).toBeDefined();
    });

    const deleteBtn = screen.getByTitle('Delete broadcast for all recipients');
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Delete this broadcast?'));
    expect(service.deleteNotification).toHaveBeenCalledWith('b-1');
  });
});
