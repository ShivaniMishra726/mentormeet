import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { Search } from "lucide-react";

export default function MentorList() {
  const [mentors, setMentors] = useState([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors(skill = "") {
    setLoading(true);
    const params = skill ? { skill } : {};
    const res = await api.get("/mentor", { params });
    setMentors(res.data);
    setLoading(false);
  }

  function handleFilter(e) {
    e.preventDefault();
    fetchMentors(skillFilter);
  }

  return (
    <AppShell>
      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-semibold mb-1">Find a Mentor</h1>
        <p className="mb-6" style={{ color: "var(--color-ink-muted)" }}>
          Search by skill and book an open slot
        </p>

        <form onSubmit={handleFilter} className="mb-8 flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-ink-muted)" }}
            />
            <input
              type="text"
              placeholder="e.g. Python, System Design"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-3 py-2.5"
              style={{ borderColor: "var(--color-unavailable)" }}
            />
          </div>
          <button
            type="submit"
            className="text-white px-5 py-2.5 rounded-lg font-medium transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Search
          </button>
        </form>

        {loading ? (
          <p style={{ color: "var(--color-ink-muted)" }}>Loading...</p>
        ) : mentors.length === 0 ? (
          <p style={{ color: "var(--color-ink-muted)" }}>No mentors found.</p>
        ) : (
          <div className="space-y-4">
            {mentors.map((mentor) => (
              <Link
                key={mentor.id}
                to={`/mentor/${mentor.id}`}
                className="block bg-white rounded-xl p-5 border transition hover:shadow-md"
                style={{ borderColor: "var(--color-unavailable)" }}
              >
                <h2 className="font-display text-lg font-semibold">{mentor.full_name}</h2>
                <p className="mt-1" style={{ color: "var(--color-ink-muted)" }}>{mentor.bio}</p>
                <p className="text-sm mt-1 font-mono" style={{ color: "var(--color-ink-muted)" }}>
                  {mentor.experience_years} yrs experience
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {(mentor.skills || []).map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}