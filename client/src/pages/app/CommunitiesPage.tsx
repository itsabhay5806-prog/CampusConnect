import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Plus,
  Search,
  Check,
  Shield,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CommunityItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  memberCount: number;
  avatarUrl?: string;
  rules: string[];
  isPrivate: boolean;
  isMember?: boolean;
  isCreator?: boolean;
  creator?: {
    name: string;
    avatarUrl?: string;
  };
}

export const CommunitiesPage: React.FC = () => {
  const { user } = useAuth();

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Community details modal
  const [activeCommunity, setActiveCommunity] = useState<CommunityItem | null>(null);

  // Create community modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coding');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory !== 'all') q.append('category', selectedCategory);
      if (search.trim()) q.append('search', search.trim());

      const res = await api.get(`/communities?${q.toString()}`);
      if (res.success && res.communities) {
        setCommunities(res.communities);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCommunities();
  };

  const handleToggleJoin = async (communityId: string) => {
    try {
      const res = await api.post(`/communities/${communityId}/join`);
      if (res.success) {
        setCommunities((prev) =>
          prev.map((c) =>
            c._id === communityId
              ? {
                  ...c,
                  isMember: res.isMember,
                  memberCount: res.memberCount,
                }
              : c
          )
        );

        if (activeCommunity && activeCommunity._id === communityId) {
          setActiveCommunity({
            ...activeCommunity,
            isMember: res.isMember,
            memberCount: res.memberCount,
          });
        }
      }
    } catch (err) {
      console.error('Join/leave error:', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsSubmitting(true);

    try {
      const rulesArray = rules
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await api.post('/communities', {
        name: name.trim(),
        category,
        description: description.trim(),
        rules: rulesArray,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (res.success && res.community) {
        setCommunities((prev) => [res.community, ...prev]);
        setCreateModalOpen(false);
        setName('');
        setDescription('');
        setRules('');
        setAvatarUrl('');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'all',
    'Coding',
    'AI/ML',
    'Design',
    'Placement Prep',
    'Entrepreneurship',
    'Cultural',
    'Sports',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Student Communities & Clubs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connect with interest-based student organizations, build jams, and department study circles.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Start a Community</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === 'all' ? 'All Communities' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          />
        </form>
      </div>

      {/* Communities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : communities.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No communities match your criteria"
          description="Start an interest club for your branch, hackathon squads, or placement study groups."
          actionLabel="Create a Community"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={
                      c.avatarUrl ||
                      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150'
                    }
                    alt={c.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 flex-shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {c.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate mt-1">{c.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveCommunity(c)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleToggleJoin(c._id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                    c.isMember
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {c.isMember ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Joined ({c.memberCount})</span>
                    </>
                  ) : (
                    <span>Join Club ({c.memberCount})</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Detail Modal */}
      {activeCommunity && (
        <Modal
          isOpen={Boolean(activeCommunity)}
          onClose={() => setActiveCommunity(null)}
          title={activeCommunity.name}
          description={`Category: ${activeCommunity.category} • ${activeCommunity.memberCount} active members`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">About This Community</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {activeCommunity.description}
              </p>
            </div>

            {activeCommunity.rules && activeCommunity.rules.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-600" />
                  <span>Community Guidelines & Rules</span>
                </h4>
                <ul className="space-y-1.5">
                  {activeCommunity.rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50/70 p-2 rounded-lg"
                    >
                      <span className="font-bold text-brand-600 text-[11px]">{idx + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Created by {activeCommunity.creator?.name || 'Student Admin'}
              </span>

              <button
                onClick={() => handleToggleJoin(activeCommunity._id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeCommunity.isMember
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {activeCommunity.isMember ? 'Leave Community' : 'Join Community'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Community Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Start a Student Community"
        description="Launch an interest group for coding, design, research, or sports."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Community Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Robotics & Drone Builders"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            >
              <option value="Coding">Coding & Software</option>
              <option value="AI/ML">AI & Machine Learning</option>
              <option value="Design">UI/UX & Design</option>
              <option value="Placement Prep">Placement & Interview Prep</option>
              <option value="Entrepreneurship">Entrepreneurship & Startups</option>
              <option value="Cultural">Cultural & Arts</option>
              <option value="Sports">Sports & Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description & Purpose
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will members work on, discuss, or build together?"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Community Rules (One per line)
            </label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Respect members&#10;No commercial advertising&#10;Share constructive feedback"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Banner / Icon Image URL (Optional)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
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
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Launch Community'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
