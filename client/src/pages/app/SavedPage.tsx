import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Bookmark, FileText, Code2, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'resources' | 'projects'>('posts');
  const [savedData, setSavedData] = useState<{
    posts: any[];
    resources: any[];
    projects: any[];
  }>({ posts: [], resources: [], projects: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/user/saved');
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
    fetchSaved();
  }, []);

  const currentItems = savedData[activeTab] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-600 fill-brand-600" />
          Saved Bookmarks
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quickly access the notes, past questions, feed posts, and projects you've bookmarked.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 border-b border-slate-100 pb-2">
          {[
            { id: 'posts', label: `Posts (${savedData.posts?.length || 0})` },
            { id: 'resources', label: `Study Materials (${savedData.resources?.length || 0})` },
            { id: 'projects', label: `Projects (${savedData.projects?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading saved bookmarks...</div>
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={`No saved ${activeTab}`}
          description={`Bookmark items from the campus feed, resource hub, or project board to see them here.`}
        />
      ) : (
        <div className="space-y-3">
          {activeTab === 'posts' &&
            savedData.posts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      post.author?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        post.author?.name || 'User'
                      )}&background=1e3a8a&color=fff`
                    }
                    alt={post.author?.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{post.author?.name}</p>
                    <p className="text-[10px] text-slate-400">{post.author?.department}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700">{post.content}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Link
                    to="/app/feed"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    View in Feed <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}

          {activeTab === 'resources' &&
            savedData.resources.map((res) => (
              <div
                key={res._id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{res.title}</h3>
                    <p className="text-[11px] text-slate-500">
                      {res.courseCode} • {res.department} • Semester {res.semester}
                    </p>
                  </div>
                </div>
                <Link
                  to="/app/resources"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Open Hub
                </Link>
              </div>
            ))}

          {activeTab === 'projects' &&
            savedData.projects.map((proj) => (
              <div
                key={proj._id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{proj.description}</p>
                  </div>
                </div>
                <Link
                  to="/app/projects"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  View Team
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
