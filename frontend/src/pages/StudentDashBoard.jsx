import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, BookOpen, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import TicketStub from '../components/TicketStub';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const pad = (n) => String(n).padStart(2, '0');

  const fetchBookings = async () => {
    try {
      const response = await axiosClient.get('/bookings/student/me');

      const now = new Date();
      const mapped = response.data.map((b) => {
        const start = new Date(b.slot_start);
        const end = new Date(b.slot_end);

        let status;
        if (b.status === 'cancelled') {
          status = 'cancelled';
        } else if (start < now) {
          status = 'past';
        } else {
          status = 'upcoming';
        }

        const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
        const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;

        return {
          id: b.id,
          mentorName: b.mentor_name,
          date: dateStr,
          time: timeStr,
          status,
        };
      });

      setBookings(mapped);
    } catch (err) {
      setError('Could not fetch your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this mentorship session?")) {
      return;
    }

    setCancellingId(bookingId);
    setError('');

    try {
      await axiosClient.post(`/bookings/${bookingId}/cancel`);
      await fetchBookings();
    } catch (err) {
      setError('Failed to cancel the session. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const historyBookings = bookings.filter(b => b.status === 'past' || b.status === 'cancelled');

  const mentorCounts = {};
  upcomingBookings.forEach((b) => {
    mentorCounts[b.mentorName] = (mentorCounts[b.mentorName] || 0) + 1;
  });
  const chartData = Object.entries(mentorCounts).map(([mentor, count]) => ({ mentor, count }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-brandNavy">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-sm text-brandMuted mt-1">
            Manage your scheduled mentorship sessions or coordinate new bookings.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/mentors')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brandAccent hover:bg-brandAccent/95 text-white font-medium text-sm rounded-lg transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Find a Mentor</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-brandBooked/20 rounded-xl flex items-center gap-3 text-sm text-brandBooked">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-brandAccent text-brandAccent'
              : 'border-transparent text-brandMuted hover:text-brandNavy'
          }`}
        >
          Upcoming Sessions ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-brandAccent text-brandAccent'
              : 'border-transparent text-brandMuted hover:text-brandNavy'
          }`}
        >
          Past & Cancelled ({historyBookings.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-28 bg-white rounded-xl border border-slate-100 p-6 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-40 bg-slate-100 rounded"></div>
              <div className="h-8 w-24 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : activeTab === 'upcoming' ? (
        upcomingBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-xl max-w-xl mx-auto shadow-sm p-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-brandNavy">No upcoming bookings</h3>
            <p className="text-sm text-brandMuted mt-2 max-w-xs mx-auto">
              Get 1:1 guidance from industry staff engineers and designers. Schedule a session today.
            </p>
            <button
              onClick={() => navigate('/student/mentors')}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brandAccent hover:bg-brandAccent/95 text-white font-medium text-sm rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Browse Mentors</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <TicketStub
                key={booking.id}
                title={booking.mentorName}
                subtitle="Mentor Coach"
                date={booking.date}
                time={booking.time}
                status={booking.status}
                onAction={() => handleCancelBooking(booking.id)}
                isLoading={cancellingId === booking.id}
              />
            ))}
          </div>
        )
      ) : (
        historyBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-xl max-w-xl mx-auto shadow-sm p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-brandNavy">No session history</h3>
            <p className="text-sm text-brandMuted mt-2 max-w-xs mx-auto">
              Completed and revoked bookings will be logged here for your reference.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyBookings.map((booking) => (
              <TicketStub
                key={booking.id}
                title={booking.mentorName}
                subtitle="Mentor Coach"
                date={booking.date}
                time={booking.time}
                status={booking.status}
              />
            ))}
          </div>
        )
      )}

      <div>
        <h2 className="font-serif text-xl font-bold text-brandNavy mt-4 mb-3">Sessions by Mentor</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-brandMuted">No activity yet.</p>
        ) : (
          <div className="h-64 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="mentor" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#4C3BCF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
