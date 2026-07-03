import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Portal from "./components/Portal";
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
        {/* Main portal route */}
        <Route path="/" element={<Portal />} />
        
        {/* User routes */}
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