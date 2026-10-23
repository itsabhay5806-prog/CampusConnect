import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Compass,
  Search,
  Users,
  Calendar,
  Code2,
  BookOpen,
  SearchCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'communities' | 'events' | 'projects' | 'resources' | 'lostFound'>('all');
  const [results, setResults] = useState<any>({
    communities: [],
    events: [],
    projects: [],
    resources: [],
    lostFound: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscovery = async (searchTerm = '') => {
    setIsLoading(true);
    try {
      const endpoint = searchTerm.trim()
        ? `/discover?q=${encodeURIComponent(searchTerm.trim())}`
        : '/discover';
      const res = await api.get(endpoint);
      if (res.success && res.results) {
        setResults(res.results);
      }
    } catch (err) {
      console.error('Discover error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscovery(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
    fetchDiscovery(query);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-tealAccent-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-tealAccent-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Exploration Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover What’s Happening
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-brand-100/90 leading-relaxed">
            Search across student communities, hackathon opportunities, academic notes, campus
            events, and lost items in one place.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-5 relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, subject, club name, or skill..."
              className="w-full pl-10 pr-24 py-2.5 text-xs text-slate-900 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-tealAccent-400 shadow-md"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'communities', label: `Communities (${results.communities?.length || 0})` },
          { id: 'projects', label: `Projects & Teams (${results.projects?.length || 0})` },
          { id: 'resources', label: `Academic Resources (${results.resources?.length || 0})` },
          { id: 'events', label: `Events & Updates (${results.events?.length || 0})` },
          { id: 'lostFound', label: `Lost & Found (${results.lostFound?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Communities */}
          {(activeTab === 'all' || activeTab === 'communities') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-slate-900">Student Communities</h3>
                </div>
                <Link to="/app/communities" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>

              {results.communities?.length === 0 ? (
                <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-100">
                  No matching student communities found.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.communities.map((c: any) => (
                    <div key={c._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={c.avatarUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150'}
                          alt={c.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-100"
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                          <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                            {c.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-2">{c.description}</p>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{c.memberCount} members</span>
                        <Link to="/app/communities" className="font-bold text-brand-600 hover:text-brand-700">
                          Explore →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Projects */}
          {(activeTab === 'all' || activeTab === 'projects') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-violetAccent-600" />
                  <h3 className="text-sm font-bold text-slate-900">Project & Hackathon Opportunities</h3>
                </div>
                <Link to="/app/projects" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>

              {results.projects?.length === 0 ? (
                <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-100">
                  No active projects match this query.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.projects.map((p: any) => (
                    <div key={p._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-bold uppercase rounded bg-violetAccent-50 text-violetAccent-700 px-2 py-0.5">
                            {p.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">{p.openRoles?.length || 0} Open Roles</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{p.problemStatement || p.description}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">By {p.creator?.name}</span>
                        <Link to="/app/projects" className="font-bold text-brand-600 hover:text-brand-700">
                          View & Apply →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Academic Resources */}
          {(activeTab === 'all' || activeTab === 'resources') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-tealAccent-600" />
                  <h3 className="text-sm font-bold text-slate-900">Academic Study Material</h3>
                </div>
                <Link to="/app/resources" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Browse library →
                </Link>
              </div>

              {results.resources?.length === 0 ? (
                <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-100">
                  No academic resources found for this search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.resources.map((r: any) => (
                    <div key={r._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
                      <span className="text-[10px] font-bold uppercase rounded bg-tealAccent-50 text-tealAccent-700 px-2 py-0.5">
                        {r.resourceType}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1.5">{r.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{r.subject} • {r.department}</p>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{r.downloadsCount} downloads</span>
                        <Link to="/app/resources" className="font-bold text-brand-600 hover:text-brand-700">
                          Download →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Lost & Found */}
          {(activeTab === 'all' || activeTab === 'lostFound') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SearchCheck className="w-4 h-4 text-coralAccent-600" />
                  <h3 className="text-sm font-bold text-slate-900">Lost and Found Board</h3>
                </div>
                <Link to="/app/lost-found" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  View board →
                </Link>
              </div>

              {results.lostFound?.length === 0 ? (
                <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-100">
                  No active lost or found items match this search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.lostFound.map((item: any) => (
                    <div key={item._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-[11px] text-slate-400">{item.campusLocation}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{item.description}</p>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{item.category}</span>
                        <Link to="/app/lost-found" className="font-bold text-brand-600 hover:text-brand-700">
                          Inquire →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
