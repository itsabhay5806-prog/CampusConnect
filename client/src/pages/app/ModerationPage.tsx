import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  EyeOff,
  UserX,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ReportItem {
  _id: string;
  itemType: 'post' | 'comment' | 'resource' | 'lost_found' | 'user';
  itemId: string;
  reason: string;
  details?: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export const ModerationPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/queue');
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleTakeAction = async (reportId: string, action: string) => {
    setActionInProgress(reportId);
    try {
      const res = await api.post(`/reports/${reportId}/action`, {
        action,
        notes: `Action taken by ${user?.name} (${user?.role})`,
      });
      if (res.success) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-amber-500/10 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Campus Moderation Center</h1>
          <p className="text-xs text-slate-600 mt-1">
            Review reported items, enforce campus code of conduct, and ensure a constructive, safe
            student environment.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading moderation queue...</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All clear! Zero pending flags"
          description="The campus moderation queue is empty. Good job keeping the community safe!"
        />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r._id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  {r.itemType.replace('_', ' ')} flag
                </span>
                <span className="text-xs text-slate-400">
                  Reported {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">Reason: {r.reason}</p>
                {r.details && (
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{r.details}"
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-2">
                  Reported by: <span className="text-slate-600">{r.reporter?.name}</span> ({r.reporter?.email})
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                <button
                  disabled={actionInProgress === r._id}
                  onClick={() => handleTakeAction(r._id, 'dismiss')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Dismiss Flag
                </button>
                <button
                  disabled={actionInProgress === r._id}
                  onClick={() => handleTakeAction(r._id, 'hide_content')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Content</span>
                </button>
                <button
                  disabled={actionInProgress === r._id}
                  onClick={() => handleTakeAction(r._id, 'warn_user')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Warn Poster</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
