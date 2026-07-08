import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Ticket } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { email, password, full_name: fullName, role });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <div className="flex items-center gap-2">
          <Ticket size={24} />
          <span className="font-display text-xl font-semibold">MentorMeet</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight mb-4">
            Join as a student
            <br />
            or a mentor.
          </h1>
          <p className="text-white/60 max-w-sm">
            One platform, two roles — students book sessions, mentors set their own hours.
          </p>
        </div>
        <p className="text-white/40 text-sm font-mono">est. 2026</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: "var(--color-bg)" }}>
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold mb-1">Create your account</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-ink-muted)" }}>
            Get started with MentorMeet
          </p>

          {error && (
            <p className="text-sm mb-4 px-3 py-2 rounded" style={{ backgroundColor: "#FBEAEA", color: "var(--color-booked)" }}>
              {error}
            </p>
          )}

          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            style={{ borderColor: "var(--color-unavailable)" }}
            required
          />

          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            style={{ borderColor: "var(--color-unavailable)" }}
            required
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            style={{ borderColor: "var(--color-unavailable)" }}
            required
          />

          <label className="block text-sm font-medium mb-1">I am a...</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-6"
            style={{ borderColor: "var(--color-unavailable)" }}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>

          <button
            type="submit"
            className="w-full text-white py-2.5 rounded-lg font-medium transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Register
          </button>

          <p className="mt-6 text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "var(--color-accent)" }}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}