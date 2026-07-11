import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Ticket, LayoutDashboard, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isStudent = user?.role === 'student';

  return (
    <aside className="w-64 bg-brandNavy text-white flex flex-col min-h-screen shrink-0 border-r border-slate-800">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-850 flex items-center gap-3">
        <div className="bg-brandAccent/10 p-2 rounded-lg">
          <Ticket className="w-6 h-6 text-brandAccent transform -rotate-12" style={{ color: '#4C3BCF' }} />
        </div>
        <span className="font-serif text-xl font-bold tracking-wide text-white">MentorMeet</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {isStudent ? (
          <>
            <NavLink
              to="/student/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brandAccent text-white shadow-md shadow-brandAccent/20 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/student/mentors"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brandAccent text-white shadow-md shadow-brandAccent/20 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`
              }
            >
              <Search className="w-5 h-5 shrink-0" />
              <span>Find a Mentor</span>
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/mentor/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brandAccent text-white shadow-md shadow-brandAccent/20 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Dashboard</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom Profile and Logout */}
      <div className="p-5 border-t border-slate-850 flex flex-col gap-4">
        <div className="flex flex-col bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans font-semibold">User Account</span>
          <span className="text-xs font-mono text-slate-300 break-all mt-1">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-transparent hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-all cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
