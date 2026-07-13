import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as userService from '../../../services/adminUserService';
import AdminUserManagement from '../../../pages/admin/AdminUserManagement';

// Mock localStorage globally for testing environment safety
const localStorageMock = (() => {
  let store = {};
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

// Mock browser confirm and alert windows
global.confirm = vi.fn(() => true);
global.alert = vi.fn();

// Mock the admin user service
vi.mock('../../../services/adminUserService', () => ({
  getUsers: vi.fn(),
  getUser: vi.fn(),
  updateUserStatus: vi.fn(),
  sendNotification: vi.fn()
}));

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('AdminUserManagement page and operations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.confirm.mockReturnValue(true);
  });

  const mockUsersList = {
    users: [
      {
        id: 'user-123',
        username: 'suhith_student',
        email: 'suhith@student.com',
        full_name: 'Suhith Reddy',
        department: 'Computer Science and Engineering',
        semester: 6,
        is_active: true,
        last_active: '2026-07-13T10:00:00Z'
      }
    ],
    pagination: {
      page: 1,
      page_size: 20,
      total: 1,
      pages: 1
    }
  };

  it('renders loading skeleton and then student users table', async () => {
    userService.getUsers.mockResolvedValueOnce(mockUsersList);

    render(<AdminUserManagement />, { wrapper });

    expect(screen.getByText('User Management')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Suhith Reddy')).toBeDefined();
    });

    expect(screen.getByText('suhith@student.com')).toBeDefined();
    expect(screen.getByText('Computer Science and Engineering')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('triggers search when text is entered into the search input', async () => {
    userService.getUsers.mockResolvedValue(mockUsersList);

    render(<AdminUserManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Suhith Reddy')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search by name, email, roll...');
    fireEvent.change(searchInput, { target: { value: 'suhith' } });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        search: 'suhith'
      }));
    });
  });

  it('handles optimistic toggling and rolls back if update status API fails', async () => {
    userService.getUsers.mockResolvedValueOnce(mockUsersList);
    userService.updateUserStatus.mockRejectedValueOnce(new Error('Connection error'));

    render(<AdminUserManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Suhith Reddy')).toBeDefined();
    });

    // Click toggle button (disable)
    const toggleButtons = screen.getAllByRole('button', { name: /Disable Account|Enable Account/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(toggleButtons[0]);
    expect(global.confirm).toHaveBeenCalled();

    // Verify it rolls back or alerts
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to update student'));
    });
  });

  it('opens sliding drawer on clicking View Profile action', async () => {
    userService.getUsers.mockResolvedValueOnce(mockUsersList);
    userService.getUser.mockResolvedValueOnce({
      id: 'user-123',
      username: 'suhith_student',
      email: 'suhith@student.com',
      is_active: true,
      student: {
        full_name: 'Suhith Reddy',
        department: 'CSE',
        semester: 6,
        year: 3,
        roll_number: 'CS2023001',
        cgpa: '9.2'
      },
      learning_profile: {
        preferred_mode: 'Quiz Mode',
        study_streak: 5,
        preferred_assistant: 'Academic Tutor',
        placement_readiness: 'Intermediate',
        favorite_topics: ['DBMS', 'OS'],
        weak_topics: ['Networks']
      },
      progress: [
        {
          topic: 'Database Management Systems',
          completion_percentage: 75,
          current_step_index: 3
        }
      ],
      analytics: {
        total_questions: 10,
        academic_questions: 6,
        placement_questions: 2,
        campus_questions: 1,
        general_questions: 1
      }
    });

    render(<AdminUserManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Suhith Reddy')).toBeDefined();
    });

    const viewButtons = screen.getAllByRole('button', { name: /View Details/i });
    fireEvent.click(viewButtons[0]);

    // Drawer should open and fetch detailed metrics
    await waitFor(() => {
      expect(userService.getUser).toHaveBeenCalledWith('user-123');
    });

    await waitFor(() => {
      expect(screen.getByText('Profile Information')).toBeDefined();
      expect(screen.getByText('Learning Progress')).toBeDefined();
      expect(screen.getByText('Telemetry Analytics')).toBeDefined();
      expect(screen.getByText('Academic Assistance')).toBeDefined();
    });

    // Close inspector
    const closeBtn = screen.getByRole('button', { name: /Close Inspector/i });
    fireEvent.click(closeBtn);
  });

  it('opens notification center and sends customized announcements successfully', async () => {
    userService.getUsers.mockResolvedValueOnce(mockUsersList);
    userService.sendNotification.mockResolvedValueOnce({ success: true });

    render(<AdminUserManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Suhith Reddy')).toBeDefined();
    });

    const notifyButtons = screen.getAllByRole('button', { name: /Send Notification/i });
    fireEvent.click(notifyButtons[0]);

    expect(screen.getByText('Send Alert Notification')).toBeDefined();

    // Fill details
    const titleInput = screen.getByPlaceholderText('Announcement Title');
    const messageInput = screen.getByPlaceholderText('Enter alert message details...');
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(messageInput, { target: { value: 'Test message notification content' } });

    const submitBtn = screen.getByRole('button', { name: /Send Alert/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(userService.sendNotification).toHaveBeenCalledWith('user-123', expect.objectContaining({
        title: 'Test Title',
        message: 'Test message notification content'
      }));
    });
  });
});
