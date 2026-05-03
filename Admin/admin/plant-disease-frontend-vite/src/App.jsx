import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admins from './pages/Admins';
import Notifications from './pages/Notifications';
import Layout from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admins" element={<Admins />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;