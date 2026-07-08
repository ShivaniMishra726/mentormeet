import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Ticket } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
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
            Your next mentorship session,
            <br />
            reserved in seconds.
          </h1>
          <p className="text-white/60 max-w-sm">
            Find the right mentor, pick an open slot, and lock it in — no back-and-forth,
            no double-booking.
          </p>
        </div>
        <p className="text-white/40 text-sm font-mono">est. 2026</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: "var(--color-bg)" }}>
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-ink-muted)" }}>
            Log in to your account
          </p>

          {error && (
            <p className="text-sm mb-4 px-3 py-2 rounded" style={{ backgroundColor: "#FBEAEA", color: "var(--color-booked)" }}>
              {error}
            </p>
          )}

          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4 outline-none focus:ring-2"
            style={{ borderColor: "var(--color-unavailable)" }}
            required
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-6 outline-none focus:ring-2"
            style={{ borderColor: "var(--color-unavailable)" }}
            required
          />

          <button
            type="submit"
            className="w-full text-white py-2.5 rounded-lg font-medium transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Log In
          </button>

          <p className="mt-6 text-sm text-center">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium" style={{ color: "var(--color-accent)" }}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}