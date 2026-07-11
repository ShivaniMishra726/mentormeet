import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brandBg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brandAccent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-brandMuted">Loading MentorMeet...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Double check authorization: make sure students can't access mentor routes and vice versa
  const isStudent = user.role === 'student';
  const isMentorPath = location.pathname.startsWith('/mentor');
  const isStudentPath = location.pathname.startsWith('/student');

  if (isStudent && isMentorPath) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (!isStudent && isStudentPath) {
    return <Navigate to="/mentor/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-brandBg text-brandNavy font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
