import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const userData = await login(email, password);
      // Route user depending on role
      if (userData.role === 'mentor') {
        navigate('/mentor/dashboard', { replace: true });
      } else {
        navigate(from || '/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to pre-populate credentials for fast testing
  const handleQuickLogin = async (role) => {
  const demoEmail = role === 'student' ? 'demo.student@mentormeet.com' : 'demo.mentor@mentormeet.com';
  const demoPassword = 'demo1234';

  setEmail(demoEmail);
  setPassword(demoPassword);
  setError('');
  setIsSubmitting(true);

  try {
    const userData = await login(demoEmail, demoPassword);
    if (userData.role === 'mentor') {
      navigate('/mentor/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  } catch (err) {
    setError('Demo account unavailable right now.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex min-h-screen bg-brandBg font-sans">
      {/* Left panel - Navy Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brandNavy text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Decorative Grid Patterns */}
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

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-brandAccent/10 p-2 rounded-lg border border-slate-750">
            <Ticket className="w-6 h-6 text-brandAccent transform -rotate-12" style={{ color: '#4C3BCF' }} />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide">MentorMeet</span>
        </div>

        {/* Brand Headline */}
        <div className="my-auto max-w-xl relative z-10">
          <h1 className="font-serif text-5xl font-semibold leading-tight text-white mb-6">
            Bridge the gap between aspiration and expertise.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed font-sans">
            Schedule 1:1 sessions with engineering managers, staff developers, and design veterans. 
            Prepare for critical interviews, receive comprehensive portfolio teardowns, and scale your tech career.
          </p>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 text-xs text-slate-400 font-mono">
          © 2026 MentorMeet. Designed for professionals and graduates.
        </div>
      </div>

      {/* Right panel - Auth Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-brandBg">
        <div className="w-full max-w-[384px] bg-brandSurface p-8 rounded-2xl shadow-sm border border-slate-100/80">
          {/* Logo mark for mobile screens */}
          <div className="flex lg:hidden items-center gap-2 mb-6 justify-center">
            <Ticket className="w-6 h-6 text-brandAccent" />
            <span className="font-serif text-xl font-bold">MentorMeet</span>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-brandNavy">Welcome Back</h2>
            <p className="text-sm text-brandMuted mt-1">Please enter your credentials to login</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-brandBooked/20 rounded-lg flex items-start gap-2 text-xs text-brandBooked">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-brandNavy uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all pr-10"
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick login aids */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brandMuted block mb-2 text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-brandAccentSoft border border-slate-200 text-[11px] font-medium text-brandNavy rounded transition-all cursor-pointer text-center"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('mentor')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-brandAccentSoft border border-slate-200 text-[11px] font-medium text-brandNavy rounded transition-all cursor-pointer text-center"
              >
                Mentor Demo
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-brandMuted">
              Don't have an account?{' '}
              <Link to="/register" className="text-brandAccent hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
