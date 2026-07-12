import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as service from '../../../services/adminAuthService';
import { AdminAuthProvider, useAdminAuth } from '../../../hooks/useAdminAuth';
import AdminLoginPage from '../../../pages/admin/AdminLoginPage';

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

// Mock the admin auth service
vi.mock('../../../services/adminAuthService', () => ({
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  getCurrentAdmin: vi.fn()
}));

const wrapper = ({ children }) => (
  <AdminAuthProvider>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </AdminAuthProvider>
);

describe('AdminAuth context and hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('restores administrator session from token on mount', async () => {
    localStorage.setItem('adminToken', 'mock-admin-token');
    service.getCurrentAdmin.mockResolvedValueOnce({
      id: 'admin123',
      username: 'testadmin',
      role: 'ADMIN',
      is_active: true
    });

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.authenticated).toBe(true);
    expect(result.current.admin).toEqual({
      id: 'admin123',
      username: 'testadmin',
      role: 'ADMIN',
      is_active: true
    });
    expect(service.getCurrentAdmin).toHaveBeenCalledTimes(1);
  });

  it('performs admin login and stores token', async () => {
    service.loginAdmin.mockResolvedValueOnce({
      token: 'new-admin-token',
      admin: {
        id: 'admin123',
        username: 'testadmin',
        role: 'ADMIN',
        is_active: true
      }
    });

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ username: 'testadmin', password: 'password123' });
    });

    expect(localStorage.getItem('adminToken')).toBe('new-admin-token');
    expect(result.current.authenticated).toBe(true);
    expect(result.current.admin.username).toBe('testadmin');
    expect(service.loginAdmin).toHaveBeenCalledWith({ username: 'testadmin', password: 'password123' });
  });

  it('performs logout and removes adminToken while keeping userToken', async () => {
    localStorage.setItem('adminToken', 'mock-admin-token');
    localStorage.setItem('userToken', 'mock-user-token');

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(localStorage.getItem('userToken')).toBe('mock-user-token'); // Keeps student token intact
    expect(result.current.authenticated).toBe(false);
    expect(result.current.admin).toBeNull();
  });
});

describe('AdminLoginPage component', () => {
  it('renders input elements and back button', () => {
    render(<AdminLoginPage />, { wrapper });

    expect(screen.getByPlaceholderText('Enter admin credentials')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter secure password')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Back to Student Login' })).toBeDefined();
  });
});
