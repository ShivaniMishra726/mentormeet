import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, ChevronRight, SlidersHorizontal, BookOpen } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const MentorList = () => {
  const navigate = useNavigate();
  const [allMentors, setAllMentors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [error, setError] = useState('');

  const POPULAR_SKILLS = [
    "System Design",
    "Product Design",
    "Career Growth",
    "Resume Review",
    "Go",
    "Figma",
    "Algorithms"
  ];

  const fetchMentors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = selectedSkill ? { skill: selectedSkill } : {};
      const response = await axiosClient.get('/mentor', { params });
      setAllMentors(response.data);
    } catch (err) {
      setError('Could not retrieve the list of mentors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [selectedSkill]);

  // Client-side search on top of whatever the backend returned for the selected skill
  useEffect(() => {
    if (!search) {
      setMentors(allMentors);
      return;
    }
    const q = search.toLowerCase();
    setMentors(
      allMentors.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          (m.bio || '').toLowerCase().includes(q) ||
          (m.skills || []).some((s) => s.toLowerCase().includes(q))
      )
    );
  }, [search, allMentors]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedSkill('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-brandNavy">
          Find Your Mentor
        </h1>
        <p className="text-sm text-brandMuted mt-1">
          Connect 1:1 with seasoned engineering leads, designers, and managers for tailored advice.
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or skill..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent text-sm transition-all"
            />
          </div>

          {(search || selectedSkill) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-brandAccent hover:underline cursor-pointer py-2 px-3 hover:bg-brandAccentSoft rounded-lg transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-brandNavy flex items-center gap-1.5 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brandMuted" />
            Filter by Skill:
          </span>
          <button
            onClick={() => setSelectedSkill('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedSkill === ''
                ? 'bg-brandAccent text-white'
                : 'bg-slate-50 text-brandMuted hover:bg-slate-100 hover:text-brandNavy'
            }`}
          >
            All Skills
          </button>
          {POPULAR_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedSkill === skill
                  ? 'bg-brandAccent text-white'
                  : 'bg-brandAccentSoft/40 text-brandAccent hover:bg-brandAccentSoft'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-brandBooked">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-xl border border-slate-100 p-6 animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-16 w-full bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl max-w-xl mx-auto shadow-sm p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-brandNavy">No mentors found</h3>
          <p className="text-sm text-brandMuted mt-2 max-w-xs mx-auto">
            Try adjusting your search keywords or choosing a different skill tag category.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brandAccent hover:bg-brandAccent/95 text-white font-medium text-sm rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <span>Reset Search Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor) => {
            const initials = mentor.full_name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={mentor.id}
                onClick={() => navigate(`/student/mentors/${mentor.id}`)}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-5 group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-brandAccentSoft flex items-center justify-center text-brandAccent font-serif font-bold text-lg border-2 border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-bold text-brandNavy group-hover:text-brandAccent transition-colors">
                        {mentor.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-brandMuted mt-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate font-medium">
                          {mentor.experience_years} years experience
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-brandMuted leading-relaxed line-clamp-3">
                    {mentor.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(mentor.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-brandAccentSoft text-brandAccent text-[10px] font-semibold rounded-md border border-brandAccentSoft/40 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-4 flex items-center justify-end">
                  <span className="text-xs font-semibold text-brandAccent flex items-center gap-1 group-hover:underline">
                    <span>View Schedule & Book</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentorList;