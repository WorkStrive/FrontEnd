import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/project/:id" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectDetails />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect root to dashboard (which will redirect to login if not authenticated) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;