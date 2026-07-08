import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Search, LogOut, Ticket } from "lucide-react";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isStudent = user?.role === "student";
  const dashboardPath = isStudent ? "/student/dashboard" : "/mentor/dashboard";

  const navItems = [
    { path: dashboardPath, label: "Dashboard", icon: LayoutDashboard },
    ...(isStudent ? [{ path: "/mentors", label: "Find a Mentor", icon: Search }] : []),
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      <aside
        className="w-64 flex flex-col justify-between p-6"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-10">
            <Ticket className="text-white" size={24} />
            <span className="font-display text-white text-xl font-semibold">
              MentorMeet
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-white/50 text-xs mb-2 font-mono">{user?.email}</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}