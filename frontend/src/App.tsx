import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Tasks from './pages/Tasks';
import Timeline from './pages/Timeline';
import Login from './pages/Login';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center text-gray-400">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mb-4" />
        Loading...
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="timeline" element={<Timeline />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
