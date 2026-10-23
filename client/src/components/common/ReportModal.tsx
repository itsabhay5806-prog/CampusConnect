import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../../services/api';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment' | 'resource' | 'lost_found' | 'project' | 'user';
  targetId: string;
  targetTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState<string>('inappropriate');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post('/reports', {
        targetType,
        targetId,
        reason,
        details: details || `Reported for ${reason}`,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Content"
      description={targetTitle ? `Reporting: "${targetTitle.substring(0, 40)}..."` : undefined}
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 text-emerald-500 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Report Submitted</h4>
          <p className="text-xs text-slate-500 mt-1">Our moderation team will review this shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="spam">Spam or unwanted advertising</option>
              <option value="harassment">Harassment or bullying</option>
              <option value="inappropriate">Inappropriate or offensive content</option>
              <option value="impersonation">Impersonation or fake account</option>
              <option value="fraud">Fraud or suspicious activity</option>
              <option value="copyright">Copyright violation / unauthorized notes</option>
              <option value="other">Other campus guideline violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Details
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide context to help moderators evaluate this report..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
