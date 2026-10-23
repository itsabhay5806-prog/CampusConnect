import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { ReportModal } from '../../components/common/ReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { PostSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Pin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Send,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface PostAuthor {
  _id: string;
  name: string;
  avatarUrl?: string;
  department?: string;
  academicYear?: string;
  role: string;
  isVerified: boolean;
}

interface PostComment {
  _id: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
  isAuthor?: boolean;
}

interface PostItem {
  _id: string;
  title?: string;
  content: string;
  category: 'announcement' | 'event' | 'academic' | 'general';
  images: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  pinned: boolean;
  author: PostAuthor;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isAuthor?: boolean;
}

export const FeedPage: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Create post modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('general');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postPinned, setPostPinned] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Comments modal state
  const [commentModalPost, setCommentModalPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Reporting state
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string } | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (category !== 'all') queryParams.append('category', category);
      if (search.trim()) queryParams.append('search', search.trim());

      const res = await api.get(`/posts?${queryParams.toString()}`);
      if (res.success && res.posts) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts();
  };

  const handleLikeToggle = async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const newLiked = !p.isLiked;
            return {
              ...p,
              isLiked: newLiked,
              likesCount: newLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
            };
          }
          return p;
        })
      );
      await api.post(`/posts/${postId}/like`);
    } catch (err) {
      console.error('Like error:', err);
      loadPosts(); // rollback
    }
  };

  const handleSaveToggle = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, isSaved: !p.isSaved } : p))
      );
      const res = await api.post(`/posts/${postId}/save`);
      showToast(res.message || 'Saved items updated.');
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleOpenComments = async (post: PostItem) => {
    setCommentModalPost(post);
    try {
      const res = await api.get(`/posts/${post._id}/comments`);
      if (res.success && res.comments) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentModalPost || !newComment.trim()) return;

    setIsSendingComment(true);
    try {
      const res = await api.post(`/posts/${commentModalPost._id}/comments`, {
        content: newComment.trim(),
      });
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment('');
        // Update comments count on post
        setPosts((prev) =>
          prev.map((p) =>
            p._id === commentModalPost._id ? { ...p, commentsCount: p.commentsCount + 1 } : p
          )
        );
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      showToast('Post deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSharePost = (post: PostItem) => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Post link copied to clipboard!');
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    try {
      const tagsArray = postTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const res = await api.post('/posts', {
        title: postTitle.trim() || undefined,
        content: postContent.trim(),
        category: postCategory,
        images: postImageUrl.trim() ? [postImageUrl.trim()] : [],
        tags: tagsArray,
        pinned: postPinned,
      });

      if (res.success && res.post) {
        setPosts((prev) => [res.post, ...prev]);
        setCreateModalOpen(false);
        setPostTitle('');
        setPostContent('');
        setPostImageUrl('');
        setPostTags('');
        setPostPinned(false);
        showToast('Your campus update has been published!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish post.');
    } finally {
      setIsPosting(false);
    }
  };

  const isModOrAdmin = user?.role === 'moderator' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Top Banner / Create Post Trigger Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex items-center gap-3">
        <img
          src={
            user?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1e3a8a&color=fff`
          }
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-100 flex-shrink-0"
        />
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-500 rounded-xl text-xs font-medium transition-colors"
        >
          Share an announcement, event, or question with your campus...
        </button>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Categories & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'event', label: 'Events' },
            { id: 'academic', label: 'Academic' },
            { id: 'general', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feed Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter feed..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200/80 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          />
        </form>
      </div>

      {/* Feed Stream */}
      {isLoading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No campus updates yet"
          description="Start the conversation! Share announcements, study group requests, or campus events."
          actionLabel="Create First Post"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const categoryColors: Record<string, string> = {
              announcement: 'bg-rose-50 text-rose-700 border-rose-200',
              event: 'bg-amber-50 text-amber-700 border-amber-200',
              academic: 'bg-brand-50 text-brand-700 border-brand-200',
              general: 'bg-slate-100 text-slate-700 border-slate-200',
            };

            return (
              <article
                key={post._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        post.author?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Student')}&background=1e3a8a&color=fff`
                      }
                      alt={post.author?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{post.author?.name}</span>
                        {post.author?.isVerified && (
                          <span
                            title="Verified College Domain"
                            className="inline-flex items-center text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            Verified
                          </span>
                        )}
                        {post.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Pin className="w-3 h-3 text-amber-600" />
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {post.author?.department || 'Student'} •{' '}
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                        categoryColors[post.category] || categoryColors.general
                      }`}
                    >
                      {post.category}
                    </span>

                    {(post.isAuthor || isModOrAdmin) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Title & Content */}
                {post.title && (
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{post.title}</h3>
                )}
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {/* Optional Image */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-3 rounded-xl overflow-hidden max-h-80 border border-slate-100">
                    <img
                      src={post.images[0]}
                      alt="Post visual"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions Bar */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-slate-500 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeToggle(post._id)}
                      className={`flex items-center gap-1.5 transition-colors font-semibold ${
                        post.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                      <span>{post.likesCount}</span>
                    </button>

                    <button
                      onClick={() => handleOpenComments(post)}
                      className="flex items-center gap-1.5 hover:text-brand-600 transition-colors font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </button>

                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSaveToggle(post._id)}
                      className={`p-1 transition-colors ${
                        post.isSaved ? 'text-brand-600' : 'hover:text-brand-600'
                      }`}
                      title={post.isSaved ? 'Saved' : 'Save post'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${post.isSaved ? 'fill-brand-600 text-brand-600' : ''}`}
                      />
                    </button>

                    <button
                      onClick={() =>
                        setReportTarget({ id: post._id, title: post.title || post.content })
                      }
                      className="p-1 hover:text-rose-500 transition-colors text-slate-400"
                      title="Report post"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: Create Post */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Campus Post"
        description="Share official news, questions, or upcoming events."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePostSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Post Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'general', label: 'General' },
                { id: 'announcement', label: 'Announcement' },
                { id: 'event', label: 'Event' },
                { id: 'academic', label: 'Academic' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPostCategory(c.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    postCategory === c.id
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Headline / Title (Optional)
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Midterm Review Session"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Post Content</label>
            <textarea
              rows={4}
              required
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening on campus? Provide specifics, dates, and locations..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Image URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={postImageUrl}
                onChange={(e) => setPostImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={postTags}
              onChange={(e) => setPostTags(e.target.value)}
              placeholder="e.g. CS302, Hackathon, StudyGroup"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          {isModOrAdmin && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <input
                type="checkbox"
                id="pinCheck"
                checked={postPinned}
                onChange={(e) => setPostPinned(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="pinCheck" className="font-semibold cursor-pointer">
                Pin this post to the top of the campus feed (Moderator action)
              </label>
            </div>
          )}

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
              disabled={isPosting}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isPosting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Comments Drawer */}
      <Modal
        isOpen={Boolean(commentModalPost)}
        onClose={() => setCommentModalPost(null)}
        title="Discussion & Comments"
        description={commentModalPost ? `On "${commentModalPost.title || commentModalPost.content.substring(0, 30)}..."` : ''}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
            {comments.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">
                No comments yet. Be the first to start the conversation!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{c.author?.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700">{c.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={isSendingComment || !newComment.trim()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </Modal>

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType="post"
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  );
};
