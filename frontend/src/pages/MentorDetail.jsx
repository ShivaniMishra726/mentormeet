import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function MentorDetail() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [mentorId]);

  async function loadData() {
    setLoading(true);
    const [mentorRes, slotsRes] = await Promise.all([
      api.get(`/mentor/${mentorId}`),
      api.get(`/mentor/${mentorId}/slots`),
    ]);
    setMentor(mentorRes.data);
    setSlots(slotsRes.data);
    setLoading(false);
  }

  async function handleBook(slotId) {
    setMessage("");
    try {
      await api.post(`/bookings/${slotId}`);
      setMessage("Booked successfully!");
      loadData(); // refresh slots so the booked one turns red
    } catch (err) {
      setMessage(err.response?.data?.detail || "Booking failed");
    }
  }

  function colorFor(status) {
    if (status === "available") return "bg-green-500 hover:bg-green-600 cursor-pointer";
    if (status === "booked") return "bg-red-400 cursor-not-allowed";
    return "bg-gray-300 cursor-not-allowed";
  }

  function groupByDate(slots) {
    const groups = {};
    for (const slot of slots) {
      const date = new Date(slot.start_datetime).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(slot);
    }
    return groups;
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!mentor) return <div className="p-8">Mentor not found.</div>;

  const grouped = groupByDate(slots);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4">
        ← Back
      </button>

      <h1 className="text-2xl font-bold">{mentor.full_name}</h1>
      <p className="text-gray-600 mt-2">{mentor.bio}</p>
      <p className="text-sm text-gray-500 mt-1">{mentor.experience_years} years experience</p>
      <div className="flex gap-2 mt-2">
        {(mentor.skills || []).map((s) => (
          <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {s}
          </span>
        ))}
      </div>

      {message && <p className="mt-4 font-medium">{message}</p>}

      <h2 className="text-xl font-semibold mt-8 mb-4">Available Slots</h2>

      <div className="flex gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 inline-block rounded"></span> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 inline-block rounded"></span> Booked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 inline-block rounded"></span> Unavailable</span>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p>No slots available yet.</p>
      ) : (
        Object.entries(grouped).map(([date, dateSlots]) => (
          <div key={date} className="mb-4">
            <h3 className="font-medium mb-2">{date}</h3>
            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot) => {
                const time = new Date(slot.start_datetime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <button
                    key={slot.id}
                    disabled={slot.status !== "available"}
                    onClick={() => handleBook(slot.id)}
                    className={`text-white text-sm px-3 py-2 rounded ${colorFor(slot.status)}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}