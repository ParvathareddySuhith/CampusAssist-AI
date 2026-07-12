import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading, authenticated } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-3 relative text-white">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neutral-400 text-sm animate-pulse">Verifying administrator credentials...</p>
      </div>
    );
  }

  // Ensure administrator is authenticated and matches the role
  if (!authenticated || !admin || admin.role !== 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
