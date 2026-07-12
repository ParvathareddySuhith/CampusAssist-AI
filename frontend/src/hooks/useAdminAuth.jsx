import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAdmin = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await adminAuthService.getCurrentAdmin();
      setAdmin(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
      // Clean invalid token
      localStorage.removeItem('adminToken');
      setAdmin(null);
      setLoading(false);
      setError(err.response?.data?.error || 'Invalid administrator session');
      return null;
    }
  }, []);

  // Restore session on initial mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      refreshAdmin();
    } else {
      setLoading(false);
    }
  }, [refreshAdmin]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAuthService.loginAdmin(credentials);
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        if (data.admin) {
          setAdmin(data.admin);
        } else {
          await refreshAdmin();
        }
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.error || 'Invalid credentials';
      setError(errMsg);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await adminAuthService.logoutAdmin();
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      localStorage.removeItem('adminToken');
      setAdmin(null);
      setLoading(false);
    }
  };

  const value = {
    admin,
    loading,
    error,
    authenticated: !!admin,
    login,
    logout,
    refreshAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
