import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const MentorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const pad = (n) => String(n).padStart(2, '0');

  const fetchMentorDetail = async () => {
    try {
      const [mentorRes, slotsRes] = await Promise.all([
        axiosClient.get(`/mentor/${id}`),
        axiosClient.get(`/mentor/${id}/slots`),
      ]);
      setMentor(mentorRes.data);

      const mappedSlots = slotsRes.data.map((s) => {
        const start = new Date(s.start_datetime);
        const end = new Date(s.end_datetime);
        const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
        const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
        return {
          id: s.id,
          date: dateStr,
          time: timeStr,
          status: s.status,
        };
      });
      setSlots(mappedSlots);
    } catch (err) {
      setError('Could not retrieve the mentor profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorDetail();
  }, [id]);

 const handleBookSlotClick = (slot) => {
  if (slot.status !== 'available') return;

  if (mentor?.email === 'demo.mentor@mentormeet.com') {
    setError('This is a demo mentor profile for preview purposes only — booking is disabled. Browse other mentors to book a real session.');
    return;
  }

  setBookingSlot(slot);
  setBookingSuccess(false);
};


  const handleConfirmBooking = async () => {
    if (!bookingSlot || !user) return;
    setBookingLoading(true);
    setError('');

    try {
      await axiosClient.post(`/bookings/${bookingSlot.id}`);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSlot(null);
        setBookingSuccess(false);
        fetchMentorDetail();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book slot. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const groupSlotsByDate = (slotList) => {
    if (!slotList) return {};
    return slotList.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});
  };

  const formattedDateHeader = (dateStr) => {
    try {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brandAccent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-brandMuted">Loading profile details...</span>
        </div>
      </div>
    );
  }

  if (error && !mentor) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-brandBooked">
          {error}
        </div>
        <button
          onClick={() => navigate('/student/mentors')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-brandNavy font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mentor Search</span>
        </button>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(slots);
  const initials = mentor.full_name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      <div>
        <button
          onClick={() => navigate('/student/mentors')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brandAccent hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Mentor Directory</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-brandBooked/20 rounded-xl flex items-center gap-3 text-sm text-brandBooked">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-brandAccentSoft flex items-center justify-center text-brandAccent font-serif font-bold text-3xl border-4 border-slate-50 shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-brandNavy">{mentor.full_name}</h2>
              <div className="flex items-center justify-center gap-2 text-xs text-brandMuted mt-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="font-medium">{mentor.experience_years} years experience</span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 pt-4 text-left">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brandNavy mb-2">Skills & Focus</h4>
              <div className="flex flex-wrap gap-1.5">
                {(mentor.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-brandAccentSoft text-brandAccent text-[10px] font-semibold rounded-md border border-brandAccentSoft/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-serif text-xl font-bold text-brandNavy">About {mentor.full_name.split(' ')[0]}</h3>
            <p className="text-sm text-brandMuted leading-relaxed">
              {mentor.bio}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Calendar className="w-5 h-5 text-brandAccent" />
              <h3 className="font-serif text-xl font-bold text-brandNavy">Available Time Slots</h3>
            </div>

            <div className="space-y-6">
              {Object.keys(groupedSlots).length === 0 ? (
                <p className="text-sm text-brandMuted">No scheduled slots currently available.</p>
              ) : (
                Object.keys(groupedSlots).sort().map((dateStr) => (
                  <div key={dateStr} className="space-y-3">
                    <h4 className="font-serif text-md font-bold text-brandNavy bg-slate-50/50 py-1.5 px-3 rounded-lg border-l-2 border-brandAccent">
                      {formattedDateHeader(dateStr)}
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {groupedSlots[dateStr].map((slot) => {
                        let btnStyle = "";
                        let disabled = false;

                        if (slot.status === 'available') {
                          btnStyle = "border-brandAvailable bg-green-50/20 hover:bg-brandAvailable hover:text-white text-brandAvailable cursor-pointer active:scale-[0.98]";
                        } else if (slot.status === 'booked') {
                          btnStyle = "border-brandBooked/10 bg-red-50/20 text-brandBooked cursor-not-allowed opacity-80";
                          disabled = true;
                        } else {
                          btnStyle = "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50";
                          disabled = true;
                        }

                        return (
                          <button
                            key={slot.id}
                            disabled={disabled}
                            onClick={() => handleBookSlotClick(slot)}
                            className={`border px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all text-center ${btnStyle}`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-4 text-xs font-medium justify-end text-brandMuted">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brandAvailable"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brandBooked"></span>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brandUnavailable"></span>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {bookingSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-xl border border-slate-100 shadow-xl space-y-5 animate-scale-up">
            {!bookingSuccess ? (
              <>
                <div className="text-center space-y-2">
                  <Calendar className="w-10 h-10 text-brandAccent mx-auto" />
                  <h3 className="font-serif text-xl font-bold text-brandNavy">Confirm Booking</h3>
                  <p className="text-xs text-brandMuted max-w-xs mx-auto">
                    You are requesting a 1:1 mentorship coaching session with {mentor.full_name}.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brandMuted font-medium">Date:</span>
                    <span className="text-brandNavy font-semibold">{formattedDateHeader(bookingSlot.date)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brandMuted font-medium">Time:</span>
                    <span className="text-brandNavy font-mono font-semibold">{bookingSlot.time}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brandMuted font-medium">Mentorship Fee:</span>
                    <span className="text-brandNavy font-semibold">Complimentary</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={bookingLoading}
                    onClick={() => setBookingSlot(null)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-brandNavy rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={bookingLoading}
                    onClick={handleConfirmBooking}
                    className="flex-1 py-2.5 bg-brandAccent hover:bg-brandAccent/95 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {bookingLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Confirm Appointment</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brandAvailable mx-auto animate-bounce" />
                <h3 className="font-serif text-xl font-bold text-brandNavy">Booking Confirmed!</h3>
                <p className="text-xs text-brandMuted">
                  Your seat is reserved. The session has been added to your dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDetail;
