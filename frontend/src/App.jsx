import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from "./components/layout/AppLayout";
import Portal from "./components/Portal";
import AssistantPage from "./components/AssistantPage";
import DocumentsPage from "./components/DocumentsPage";
import ProfilePage from "./components/ProfilePage";
import SettingsPage from "./components/SettingsPage";
import UserLogin from './components/UserLogin';
import UserSignUp from './components/UserSignUp';
import StudyAssistantPage from "./components/StudyAssistantPage";
import PlacementAssistantPage from "./components/PlacementAssistantPage";
import LearningDashboardPage from "./components/dashboard/LearningDashboardPage";

// Admin imports
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDocumentManagement from "./pages/admin/AdminDocumentManagement";
import AdminUserManagement from "./pages/admin/AdminUserManagement";

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
    <AdminAuthProvider>
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
            <Route path="/study-assistant" element={<StudyAssistantPage />} />
            <Route path="/placement-assistant" element={<PlacementAssistantPage />} />
            <Route path="/learning-dashboard" element={<LearningDashboardPage />} />
          </Route>
          
          {/* User auth routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignUp />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route 
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            } 
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/documents" element={<AdminDocumentManagement />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
          </Route>
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;