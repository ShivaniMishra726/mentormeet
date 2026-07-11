import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MentorList from './pages/MentorList';
import MentorDetail from './pages/MentorDetail';
import MentorDashboard from './pages/MentorDashboard';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brandBg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brandAccent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-brandMuted">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'mentor' 
    ? <Navigate to="/mentor/dashboard" replace /> 
    : <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Sidebar Layout */}
          <Route element={<Layout />}>
            {/* Student views */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/mentors" element={<MentorList />} />
            <Route path="/student/mentors/:id" element={<MentorDetail />} />

            {/* Mentor views */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          </Route>

          {/* Root Redirect & Fallbacks */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
