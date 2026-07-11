import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const extra = {};
      if (role === 'mentor') {
        extra.bio = bio;
        extra.skills = skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        extra.experience_years = experienceYears ? parseInt(experienceYears, 10) : 0;
      }

      const userData = await register(name, email, password, role, extra);
      if (userData.role === 'mentor') {
        navigate('/mentor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brandBg font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-brandNavy text-white flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-brandAccent/10 p-2 rounded-lg border border-slate-750">
            <Ticket className="w-6 h-6 text-brandAccent transform -rotate-12" style={{ color: '#4C3BCF' }} />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide">MentorMeet</span>
        </div>

        <div className="my-auto max-w-xl relative z-10">
          <h1 className="font-serif text-5xl font-semibold leading-tight text-white mb-6">
            Empower your growth with professional guidance.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed font-sans">
            Whether you are preparing for senior engineering interviews, learning high-impact design principles,
            or seeking structural guidance in your career, join a focused community of professionals.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-mono">
          © 2026 MentorMeet. Designed for professionals and graduates.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-brandBg overflow-y-auto">
        <div className="w-full max-w-[384px] bg-brandSurface p-8 rounded-2xl shadow-sm border border-slate-100/80 my-8">
          <div className="flex lg:hidden items-center gap-2 mb-6 justify-center">
            <Ticket className="w-6 h-6 text-brandAccent" />
            <span className="font-serif text-xl font-bold">MentorMeet</span>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-brandNavy">Create Account</h2>
            <p className="text-sm text-brandMuted mt-1">Get started by setting up your profile</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-brandBooked/20 rounded-lg flex items-start gap-2 text-xs text-brandBooked">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="role">
                Select Your Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm bg-white cursor-pointer transition-all"
              >
                <option value="student">Student (booking sessions)</option>
                <option value="mentor">Mentor (offering sessions)</option>
              </select>
            </div>

            {role === 'mentor' && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students a bit about your background..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="skills">
                    Skills (comma-separated)
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Python, System Design, Career Growth"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="experience">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brandNavy transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brandAccent hover:bg-brandAccent/95 text-white py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-brandMuted">
              Already have an account?{' '}
              <Link to="/login" className="text-brandAccent hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
