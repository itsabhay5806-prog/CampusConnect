import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CampusConnectLogo } from '../../components/common/CampusConnectLogo';
import { Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';

const availableSkills = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'FastAPI',
  'Tailwind CSS',
  'UI/UX Design',
  'Figma',
  'Machine Learning',
  'PyTorch',
  'Docker',
  'SQL',
  'MongoDB',
  'C++',
  'Rust',
  'Embedded Systems',
];

const availableInterests = [
  'Hackathons',
  'Open Source',
  'AI & Deep Learning',
  'Web Development',
  'Product Design',
  'Robotics & Hardware',
  'Competitive Coding',
  'Placement Prep',
  'Cultural & Arts',
  'Sports & Fitness',
];

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const OnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [department, setDepartment] = useState('Computer Science');
  const [academicYear, setAcademicYear] = useState('Year 3');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript']);
  const [interests, setInterests] = useState<string[]>(['Hackathons', 'Web Development']);
  const [avatarUrl, setAvatarUrl] = useState(presetAvatars[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/onboarding', {
        department,
        academicYear,
        bio: bio.trim(),
        skills,
        interests,
        avatarUrl,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        navigate('/app/feed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CampusConnectLogo size="md" className="justify-center mb-3" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Student Profile
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Tell your peers what you study, your technical skills, and what kind of projects you want
            to build.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-card border border-slate-200/80">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-3">
                {presetAvatars.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === url
                        ? 'border-brand-600 ring-2 ring-brand-300 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-brand-600/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Department / Branch
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Digital Media & Design">Digital Media & Design</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Year / Standing
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                >
                  <option value="Year 1 (Freshman)">Year 1 (Freshman)</option>
                  <option value="Year 2 (Sophomore)">Year 2 (Sophomore)</option>
                  <option value="Year 3 (Junior)">Year 3 (Junior)</option>
                  <option value="Year 4 (Senior)">Year 4 (Senior)</option>
                  <option value="Graduate / Masters">Graduate / Masters</option>
                  <option value="PhD Candidate">PhD Candidate</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bio / About You
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionate about web apps and hackathons. Always looking to collaborate!"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            {/* Technical Skills Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Your Skills (Powers Hackathon Teammate Matching)
                </label>
                <span className="text-[11px] text-brand-600 font-bold">{skills.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((sk) => {
                  const isSelected = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Campus Interests</label>
                <span className="text-[11px] text-tealAccent-700 font-bold">
                  {interests.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableInterests.map((item) => {
                  const isSelected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-tealAccent-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${item}` : `+ ${item}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Complete Onboarding & Enter Campus'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
