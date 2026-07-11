import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Users, Clock, TrendingUp, AlertCircle, Sparkles, Plus, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import TicketStub from '../components/TicketStub';

const MentorDashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('today');

  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [availError, setAvailError] = useState('');
  const [availSuccess, setAvailSuccess] = useState(false);
  const [availSubmitting, setAvailSubmitting] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileBio, setProfileBio] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileExperience, setProfileExperience] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const pad = (n) => String(n).padStart(2, '0');

  const fetchDashboardData = async () => {
    try {
      const res = await axiosClient.get('/bookings/mentor/me');

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const mapped = res.data.map((b) => {
        const start = new Date(b.slot_start);
        const end = new Date(b.slot_end);
        const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
        const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;

        let status;
        if (b.status === 'cancelled') {
          status = 'cancelled';
        } else if (start < now && dateStr !== todayStr) {
          status = 'past';
        } else {
          status = 'upcoming';
        }

        return {
          id: b.id,
          studentName: b.student_name,
          date: dateStr,
          time: timeStr,
          status,
        };
      });

      setBookings(mapped);
    } catch (err) {
      setError('Could not retrieve dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    try {
      const res = await axiosClient.get('/mentor');
      const mine = res.data.find((m) => m.user_id === user.id);
      if (mine) {
        setProfileBio(mine.bio || '');
        setProfileSkills((mine.skills || []).join(', '));
        setProfileExperience(mine.experience_years?.toString() || '');
      }
    } catch (e) {
      // silent fail
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      loadProfile();
    }
  }, [user]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setAvailError('');

    if (user?.email === 'demo.mentor@mentormeet.com') {
  setAvailError('This is a demo mentor account — changes cannot be saved. Register with a real account to continue.');
  return;
}

    setAvailSubmitting(true);
    try {
      await axiosClient.post('/mentor/availability', {
        day_of_week: parseInt(dayOfWeek, 10),
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      });
      setAvailSuccess(true);
      setTimeout(() => setAvailSuccess(false), 3000);
    } catch (err) {
      setAvailError(err.response?.data?.detail || 'Failed to add availability.');
    } finally {
      setAvailSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (user?.email === 'demo.mentor@mentormeet.com') {
  setProfileError('This is a demo mentor account — changes cannot be saved. Register with a real account to continue.');
  return;
}

    setProfileSubmitting(true);
    try {
      await axiosClient.put('/mentor/profile', {
        bio: profileBio,
        skills: profileSkills.split(',').map((s) => s.trim()).filter(Boolean),
        experience_years: profileExperience ? parseInt(profileExperience, 10) : 0,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

  const todaySessions = bookings.filter(b => b.date === todayStr && b.status === 'upcoming');
  const upcomingSessions = bookings.filter(b => b.date > todayStr && b.status === 'upcoming');
  const pastSessions = bookings.filter(b => b.status === 'past' || b.status === 'cancelled');

  const totalCompleted = bookings.filter(b => b.status === 'past').length;
  const totalUpcoming = bookings.filter(b => b.status === 'upcoming').length;

  const activityMap = {};
  bookings
    .filter((b) => b.status !== 'cancelled')
    .forEach((b) => {
      activityMap[b.date] = (activityMap[b.date] || 0) + 1;
    });
  const stats = Object.entries(activityMap)
    .map(([date, bookings]) => ({ date, bookings }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-brandNavy">
          Mentor Console
        </h1>
        <p className="text-sm text-brandMuted mt-1">
          Review student bookings, track career sessions, and check scheduling statistics.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <button
          onClick={() => setShowAddAvailability(!showAddAvailability)}
          className="flex items-center gap-2 text-sm font-semibold text-brandAccent hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddAvailability ? 'Hide' : 'Add Weekly Availability'}</span>
        </button>

        {showAddAvailability && (
          <form onSubmit={handleAddAvailability} className="space-y-4 pt-2 border-t border-slate-100">
            {availError && (
              <div className="p-3 bg-red-50 border border-brandBooked/20 rounded-lg text-xs text-brandBooked">
                {availError}
              </div>
            )}
            {availSuccess && (
              <div className="p-3 bg-green-50 border border-brandAvailable/20 rounded-lg text-xs text-brandAvailable">
                Availability added! New slots have been generated for the next 4 weeks.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  <option value="0">Monday</option>
                  <option value="1">Tuesday</option>
                  <option value="2">Wednesday</option>
                  <option value="3">Thursday</option>
                  <option value="4">Friday</option>
                  <option value="5">Saturday</option>
                  <option value="6">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={availSubmitting}
              className="bg-brandAccent hover:bg-brandAccent/95 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {availSubmitting ? 'Adding...' : 'Add Availability'}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <button
          onClick={() => setShowEditProfile(!showEditProfile)}
          className="flex items-center gap-2 text-sm font-semibold text-brandAccent hover:underline cursor-pointer"
        >
          <UserCog className="w-4 h-4" />
          <span>{showEditProfile ? 'Hide' : 'Edit Profile (Bio, Skills, Experience)'}</span>
        </button>

        {showEditProfile && (
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2 border-t border-slate-100">
            {profileError && (
              <div className="p-3 bg-red-50 border border-brandBooked/20 rounded-lg text-xs text-brandBooked">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 bg-green-50 border border-brandAvailable/20 rounded-lg text-xs text-brandAvailable">
                Profile updated successfully.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5">
                Bio
              </label>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={profileSkills}
                onChange={(e) => setProfileSkills(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={profileExperience}
                onChange={(e) => setProfileExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={profileSubmitting}
              className="bg-brandAccent hover:bg-brandAccent/95 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {profileSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-brandBooked/20 rounded-xl flex items-center gap-3 text-sm text-brandBooked">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-brandAccentSoft p-3 rounded-lg text-brandAccent">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-brandMuted block font-medium">Pending Appointments</span>
            <span className="text-2xl font-serif font-bold text-brandNavy">{totalUpcoming}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 text-brandAvailable p-3 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-brandMuted block font-medium">Completed Sessions</span>
            <span className="text-2xl font-serif font-bold text-brandNavy">{totalCompleted}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-750 p-3 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-brandMuted block font-medium">Coached Students</span>
            <span className="text-2xl font-serif font-bold text-brandNavy">
              {new Set(bookings.map(b => b.studentName)).size}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brandAccent" />
          <h3 className="font-serif text-lg font-bold text-brandNavy">Booking Activity History</h3>
        </div>
        <p className="text-xs text-brandMuted">Daily booking count for active coaching slots</p>

        {loading ? (
          <div className="h-[250px] bg-slate-50 animate-pulse rounded-lg"></div>
        ) : stats.length === 0 ? (
          <p className="text-sm text-brandMuted py-8 text-center">No activity yet.</p>
        ) : (
          <div className="h-[250px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#5C6B7A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#5C6B7A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#16233C',
                    borderColor: '#16233C',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Inter',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: '#ECEAFB', opacity: 0.4 }}
                />
                <Bar
                  dataKey="bookings"
                  fill="#4C3BCF"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'border-brandAccent text-brandAccent'
                : 'border-transparent text-brandMuted hover:text-brandNavy'
            }`}
          >
            Today ({todaySessions.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'border-brandAccent text-brandAccent'
                : 'border-transparent text-brandMuted hover:text-brandNavy'
            }`}
          >
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'border-brandAccent text-brandAccent'
                : 'border-transparent text-brandMuted hover:text-brandNavy'
            }`}
          >
            Past Sessions ({pastSessions.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 bg-slate-50 animate-pulse rounded-lg"></div>
          </div>
        ) : activeTab === 'today' ? (
          todaySessions.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-100 rounded-xl p-6">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-serif text-md font-bold text-brandNavy">No classes scheduled today</h4>
              <p className="text-xs text-brandMuted mt-1">Students will book open slots directly from their browser.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySessions.map((booking) => (
                <TicketStub
                  key={booking.id}
                  title={booking.studentName}
                  subtitle="Student"
                  date={booking.date}
                  time={booking.time}
                  status={booking.status}
                />
              ))}
            </div>
          )
        ) : activeTab === 'upcoming' ? (
          upcomingSessions.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-100 rounded-xl p-6">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-serif text-md font-bold text-brandNavy">No upcoming appointments</h4>
              <p className="text-xs text-brandMuted mt-1 font-sans">Open slots can be configured via your profile settings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((booking) => (
                <TicketStub
                  key={booking.id}
                  title={booking.studentName}
                  subtitle="Student"
                  date={booking.date}
                  time={booking.time}
                  status={booking.status}
                />
              ))}
            </div>
          )
        ) : (
          pastSessions.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-100 rounded-xl p-6">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-serif text-md font-bold text-brandNavy">No historical sessions log</h4>
              <p className="text-xs text-brandMuted mt-1">Logs of completed or revoked sessions will list here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((booking) => (
                <TicketStub
                  key={booking.id}
                  title={booking.studentName}
                  subtitle="Student"
                  date={booking.date}
                  time={booking.time}
                  status={booking.status}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
