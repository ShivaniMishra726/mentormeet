import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    const res = await api.get("/bookings/mentor/me");
    setBookings(res.data);
    setLoading(false);
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const confirmed = bookings.filter((b) => b.status === "confirmed");

  const today = confirmed.filter((b) => {
    const start = new Date(b.slot_start);
    return start >= startOfToday && start < endOfToday;
  });

  const upcoming = confirmed.filter((b) => new Date(b.slot_start) >= endOfToday);

  const past = confirmed.filter((b) => new Date(b.slot_start) < startOfToday);

  // Build simple activity data: bookings count per day (confirmed only)
  const activityMap = {};
  for (const b of confirmed) {
    const day = new Date(b.slot_start).toLocaleDateString();
    activityMap[day] = (activityMap[day] || 0) + 1;
  }
  const chartData = Object.entries(activityMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  function formatTime(dt) {
    return new Date(dt).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.full_name || "Mentor"}!</p>
        </div>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-3">Today's Sessions</h2>
          {today.length === 0 ? (
            <p className="text-gray-500">No sessions today.</p>
          ) : (
            <div className="space-y-2">
              {today.map((b) => (
                <div key={b.id} className="border rounded p-3">
                  <p className="font-medium">{b.student_name}</p>
                  <p className="text-sm text-gray-500">{formatTime(b.slot_start)}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold mt-8 mb-3">Upcoming Sessions</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming sessions.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((b) => (
                <div key={b.id} className="border rounded p-3">
                  <p className="font-medium">{b.student_name}</p>
                  <p className="text-sm text-gray-500">{formatTime(b.slot_start)}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold mt-8 mb-3">Past Sessions</h2>
          {past.length === 0 ? (
            <p className="text-gray-500">No past sessions.</p>
          ) : (
            <div className="space-y-2">
              {past.map((b) => (
                <div key={b.id} className="border rounded p-3 opacity-60">
                  <p className="font-medium">{b.student_name}</p>
                  <p className="text-sm text-gray-500">{formatTime(b.slot_start)}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold mt-8 mb-3">Booking Activity</h2>
          {chartData.length === 0 ? (
            <p className="text-gray-500">No activity yet.</p>
          ) : (
            <div className="h-64 border rounded p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}