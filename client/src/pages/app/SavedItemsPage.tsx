import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Bookmark, FileText, Code2, MessageSquare, Download } from 'lucide-react';

export const SavedItemsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'resources' | 'projects'>('posts');
  const [savedData, setSavedData] = useState<{
    posts: any[];
    resources: any[];
    projects: any[];
  }>({
    posts: [],
    resources: [],
    projects: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/saved');
      if (res.success && res.savedItems) {
        setSavedData(res.savedItems);
      }
    } catch (err) {
      console.error('Failed to load saved items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Saved Collection</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Your bookmarked campus announcements, study materials, and project listings.
        </p>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Saved Posts ({savedData.posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'resources'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Study Notes ({savedData.resources?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Projects ({savedData.projects?.length || 0})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading saved items...</div>
      ) : (
        <div>
          {activeTab === 'posts' && (
            savedData.posts.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved posts"
                description="Bookmark important announcements or campus discussions to access them quickly here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedData.posts.map((post) => (
                  <div key={post._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card">
                    <span className="text-[10px] font-bold uppercase rounded bg-brand-50 text-brand-700 px-2 py-0.5">
                      {post.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5">{post.title || 'Campus Post'}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{post.content}</p>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">By {post.author?.name}</span>
                      <Link to="/app/feed" className="font-bold text-brand-600 hover:text-brand-700">
                        View in Feed →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'resources' && (
            savedData.resources.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved study resources"
                description="Save lecture notes, previous papers, or study guides to review before exams."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedData.resources.map((res) => (
                  <div key={res._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card">
                    <span className="text-[10px] font-bold uppercase rounded bg-tealAccent-50 text-tealAccent-700 px-2 py-0.5">
                      {res.resourceType}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{res.title}</h3>
                    <p className="text-[11px] text-slate-500">{res.subject}</p>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{res.downloadsCount} downloads</span>
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'projects' && (
            savedData.projects.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved projects"
                description="Bookmark promising hackathon ideas or research projects to apply later."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedData.projects.map((proj) => (
                  <div key={proj._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card">
                    <span className="text-[10px] font-bold uppercase rounded bg-violetAccent-50 text-violetAccent-700 px-2 py-0.5">
                      {proj.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5">{proj.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{proj.problemStatement}</p>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{proj.openRoles?.length || 0} open roles</span>
                      <Link to="/app/projects" className="font-bold text-brand-600 hover:text-brand-700">
                        View Project →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
