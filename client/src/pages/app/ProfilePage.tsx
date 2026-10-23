import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User,
  GraduationCap,
  Building,
  Mail,
  ShieldCheck,
  Edit3,
  Check,
  Sparkles,
  BookOpen,
  Code2,
  Users,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || 'Year 1');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
  const [interestsInput, setInterestsInput] = useState(user?.interests?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department || '');
      setAcademicYear(user.academicYear || 'Year 1');
      setBio(user.bio || '');
      setSkillsInput(user.skills?.join(', ') || '');
      setInterestsInput(user.interests?.join(', ') || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const interests = interestsInput
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      const res = await api.put('/user/profile', {
        name,
        department,
        academicYear,
        bio,
        skills,
        interests,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="h-32 bg-gradient-to-r from-brand-700 via-indigo-600 to-slate-800" />
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <img
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=1e3a8a&color=fff&size=128`
              }
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  <ShieldCheck className="w-3 h-3 text-brand-600" />
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                <span>{user?.college?.name}</span>
                <span>•</span>
                <span>{user?.department || 'Department unassigned'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Form / View */}
      {isEditing ? (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Edit Campus Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department / Major</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science, Mechanical Eng..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="Year 1">Year 1 (Freshman)</option>
                <option value="Year 2">Year 2 (Sophomore)</option>
                <option value="Year 3">Year 3 (Junior)</option>
                <option value="Year 4">Year 4 (Senior)</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell fellow students about your goals, hobbies, and interests..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Python, Figma, Circuit Design..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interests (Comma-separated)
            </label>
            <input
              type="text"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              placeholder="Robotics, Hackathons, Basketball, Photography..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Me</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {user?.bio || 'No bio shared yet. Click "Edit Profile" to tell your campus about yourself.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skills & Tech Stack
              </h3>
              {user?.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills added yet.</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interests & Activities
              </h3>
              {user?.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((i, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No interests added yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Academic Creds */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Academic Standing
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Building className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>{user?.college?.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>
                    {user?.department || 'Department pending'} ({user?.academicYear || 'Year 1'})
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Verified Student ID</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
