import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import CompanyManagement from './components/CompanyManagement';
import DepartmentManagement from './components/DepartmentManagement';
import UserManagement from './components/UserManagement';
import { getCurrentUser } from './lib/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        const isAuth = !!userData.user;
        setIsAuthenticated(isAuth);
        if (isAuth) {
          setUserProfile(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to update auth state when login occurs
  const handleLoginSuccess = async () => {
    try {
      const userData = await getCurrentUser();
      setIsAuthenticated(!!userData.user);
      if (userData.user) {
        setUserProfile(userData);
      }
    } catch (error) {
      console.error('Failed to get user after login:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        
        {/* Protected routes with Layout */}
        <Route path="/" element={isAuthenticated ? <Layout userProfile={userProfile} /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/company" element={<CompanyManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/team" element={<UserManagement />} />
          <Route path="/billing" element={<CompanyManagement />} />
          <Route path="/admin/logs" element={<Dashboard />} />
          <Route path="/admin/superadmin" element={<Dashboard />} />
          <Route path="/admin/owner" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Route>
        
        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;