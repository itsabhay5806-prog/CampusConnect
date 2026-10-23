import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Code2,
  Plus,
  Search,
  Users,
  Bookmark,
  ExternalLink,
  Github,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  AlertCircle,
  Tag,
  Briefcase,
} from 'lucide-react';

interface ProjectRole {
  title: string;
  skillsNeeded: string[];
  slotsTotal: number;
  slotsFilled: number;
}

interface ProjectItem {
  _id: string;
  title: string;
  description: string;
  category?: string;
  tags: string[];
  rolesNeeded: ProjectRole[];
  githubUrl?: string;
  demoUrl?: string;
  status: 'recruiting' | 'in_progress' | 'completed';
  owner: {
    _id: string;
    name: string;
    avatarUrl?: string;
    department?: string;
  };
  members?: Array<{ user: { _id: string; name: string; avatarUrl?: string }; role: string }>;
  isSaved?: boolean;
  isOwner?: boolean;
  hasApplied?: boolean;
  createdAt: string;
}

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Create Project Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleSkills, setRoleSkills] = useState('');
  const [roleSlots, setRoleSlots] = useState('1');
  const [rolesList, setRolesList] = useState<ProjectRole[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (filterStatus !== 'all') queryParams.set('status', filterStatus);

      const res = await api.get(`/projects?${queryParams.toString()}`);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchProjects, 250);
    return () => clearTimeout(debounce);
  }, [search, filterStatus]);

  const handleAddRole = () => {
    if (!roleTitle.trim()) return;
    const skills = roleSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const slots = parseInt(roleSlots, 10) || 1;
    setRolesList((prev) => [
      ...prev,
      { title: roleTitle.trim(), skillsNeeded: skills, slotsTotal: slots, slotsFilled: 0 },
    ]);
    setRoleTitle('');
    setRoleSkills('');
    setRoleSlots('1');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!title.trim() || !description.trim()) {
      setModalError('Title and project description are required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        tags,
        rolesNeeded: rolesList.length > 0 ? rolesList : [{ title: 'Contributor', skillsNeeded: [], slotsTotal: 2, slotsFilled: 0 }],
        githubUrl: githubUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
      };

      const res = await api.post('/projects', payload);
      if (res.success && res.data) {
        setProjects([res.data, ...projects]);
        setCreateModalOpen(false);
        // Reset form
        setTitle('');
        setDescription('');
        setTagsInput('');
        setRolesList([]);
        setGithubUrl('');
        setDemoUrl('');
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to publish project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveToggle = async (projectId: string) => {
    try {
      const res = await api.post(`/projects/${projectId}/save`);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, isSaved: res.isSaved } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle save project:', err);
    }
  };

  const handleOpenApply = (proj: ProjectItem) => {
    setSelectedProject(proj);
    setSelectedRole(proj.rolesNeeded[0]?.title || 'Contributor');
    setApplicationMessage('');
    setPortfolioLink('');
    setApplySuccess(false);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setIsApplying(true);
    try {
      const res = await api.post(`/projects/${selectedProject._id}/apply`, {
        role: selectedRole,
        message: applicationMessage.trim(),
        portfolioUrl: portfolioLink.trim() || undefined,
      });
      if (res.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplyModalOpen(false);
          setApplySuccess(false);
        }, 1200);
      }
    } catch (err: any) {
      alert(err.message || 'Could not submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-indigo-200 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-brand-200 mb-3 border border-white/10">
              <Code2 className="w-3.5 h-3.5" />
              <span>Campus Project Matchmaker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Build & Collaborate with Peers
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Discover hackathon teams, open-source initiatives, capstone projects, and study squads across campus.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, tech stack (e.g., Python, React, AI)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-transparent focus:border-brand-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="recruiting">🚀 Recruiting Roles</option>
            <option value="in_progress">🔨 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No projects found"
          description="Be the first student to pitch a project idea or create a team!"
          actionLabel="Create Project Pitch"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        proj.owner?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          proj.owner?.name || 'User'
                        )}&background=1e3a8a&color=fff`
                      }
                      alt={proj.owner?.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{proj.owner?.name}</p>
                      <p className="text-[11px] text-slate-500">{proj.owner?.department || 'Student'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        proj.status === 'recruiting'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : proj.status === 'in_progress'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {proj.status === 'recruiting' ? '● Recruiting' : proj.status}
                    </span>
                    <button
                      onClick={() => handleSaveToggle(proj._id)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      title="Save project"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${proj.isSaved ? 'fill-brand-600 text-brand-600' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Tech Tags */}
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Roles Needed */}
                {proj.rolesNeeded && proj.rolesNeeded.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Open Roles Needed
                    </p>
                    <div className="space-y-1.5">
                      {proj.rolesNeeded.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                        >
                          <span className="font-semibold text-slate-800">{r.title}</span>
                          <span className="text-[11px] text-slate-500">
                            {r.slotsFilled}/{r.slotsTotal} filled
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {proj.status === 'recruiting' && proj.owner?._id !== user?._id && (
                  <button
                    onClick={() => handleOpenApply(proj)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Apply to Join</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Post a Campus Project or Team"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Campus Autonomous Rover or Smart Study Planner"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Goals</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the mission, tech stack, milestones, and what kind of commitment you're looking for..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react, fastapi, machine-learning, hackathon"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Add Open Role */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-800 mb-2">Add Open Role</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                placeholder="Role (e.g. Frontend Dev)"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
              <input
                type="text"
                placeholder="Skills (React, CSS)"
                value={roleSkills}
                onChange={(e) => setRoleSkills(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={roleSlots}
                  onChange={(e) => setRoleSlots(e.target.value)}
                  className="w-16 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="flex-1 px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
            </div>

            {rolesList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {rolesList.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-md"
                  >
                    {r.title} ({r.slotsTotal})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repo (optional)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Demo URL (optional)</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply to Project Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${selectedProject?.title}`}
      >
        {applySuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500">The project creator will review your pitch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
              >
                {selectedProject?.rolesNeeded?.map((r, i) => (
                  <option key={i} value={r.title}>
                    {r.title} ({r.slotsFilled}/{r.slotsTotal} filled)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pitch & Relevant Experience
              </label>
              <textarea
                required
                rows={3}
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Introduce yourself, what you can contribute, and previous projects..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio or GitHub Link</label>
              <input
                type="url"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="https://github.com/yourhandle"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isApplying}
                className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isApplying ? 'Sending...' : 'Submit Pitch'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
