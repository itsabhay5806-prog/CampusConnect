import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageCircle,
  Users,
  Code2,
  BookOpen,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-brand-600" />;
      case 'project':
        return <Code2 className="w-4 h-4 text-purple-600" />;
      case 'moderation':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            Activity & Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Stay up to date with interactions on your posts and campus peers.</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When other students upvote your notes, reply to your questions, or comment on your posts, you'll see them here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200/80'
                  : 'bg-brand-50/50 border-brand-200/80 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs flex-shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-brand-600 mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
