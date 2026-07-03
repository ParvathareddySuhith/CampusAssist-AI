import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from "./components/layout/AppLayout";
import Portal from "./components/Portal";
import AssistantPage from "./components/AssistantPage";
import DocumentsPage from "./components/DocumentsPage";
import ProfilePage from "./components/ProfilePage";
import SettingsPage from "./components/SettingsPage";
import LoginAdmin from './components/LoginAdmin';
import Admin from './components/Admin';
import UserLogin from './components/UserLogin';
import UserSignUp from './components/UserSignUp';

// Auth checks
const isAdminAuthenticated = () => localStorage.getItem('adminToken') !== null;

// Protected Route Component
const ProtectedRoute = ({ children, authCheck }) => {
  if (!authCheck()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirect to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Authenticated routes sharing the AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Portal />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* User auth routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignUp />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<LoginAdmin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute authCheck={isAdminAuthenticated}>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;