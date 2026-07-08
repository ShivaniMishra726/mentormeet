import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { Search } from "lucide-react";

export default function StudentDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    const res = await api.get("/bookings/student/me");
    setBookings(res.data);
    setLoading(false);
  }

  async function handleCancel(bookingId) {
    await api.post(`/bookings/${bookingId}/cancel`);
    loadBookings();
  }

  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "cancelled");

  function TicketCard({ b, cancellable }) {
    return (
      <div
        className="relative bg-white rounded-xl border overflow-hidden flex"
        style={{ borderColor: "var(--color-unavailable)" }}
      >
        <div
          className="w-2"
          style={{ backgroundColor: cancellable ? "var(--color-accent)" : "var(--color-unavailable)" }}
        />
        <div className="flex-1 p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Booking #{b.id}</p>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--color-ink-muted)" }}>
              {b.status.toUpperCase()}
            </p>
          </div>
          {cancellable && (
            <button
              onClick={() => handleCancel(b.id)}
              className="text-sm px-3 py-1.5 rounded-lg border transition hover:opacity-80"
              style={{ borderColor: "var(--color-booked)", color: "var(--color-booked)" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="p-10 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">Your Sessions</h1>
            <p style={{ color: "var(--color-ink-muted)" }}>Manage your upcoming and past bookings</p>
          </div>
          <Link
            to="/mentors"
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <Search size={16} />
            Find a Mentor
          </Link>
        </div>

        <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
        {loading ? (
          <p style={{ color: "var(--color-ink-muted)" }}>Loading...</p>
        ) : upcoming.length === 0 ? (
          <p style={{ color: "var(--color-ink-muted)" }}>No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <TicketCard key={b.id} b={b} cancellable />
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold mt-10 mb-3">Cancelled / Past</h2>
        {past.length === 0 ? (
          <p style={{ color: "var(--color-ink-muted)" }}>Nothing here yet.</p>
        ) : (
          <div className="space-y-3 opacity-60">
            {past.map((b) => (
              <TicketCard key={b.id} b={b} cancellable={false} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}