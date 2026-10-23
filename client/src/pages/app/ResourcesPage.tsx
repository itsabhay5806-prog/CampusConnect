import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { ReportModal } from '../../components/common/ReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BookOpen,
  Upload,
  Download,
  Bookmark,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface ResourceItem {
  _id: string;
  title: string;
  description?: string;
  department: string;
  academicYear: string;
  subject: string;
  resourceType: 'notes' | 'pyq' | 'study_guide' | 'syllabus' | 'reference';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadsCount: number;
  uploader: {
    _id: string;
    name: string;
    avatarUrl?: string;
    department?: string;
  };
  createdAt: string;
  isSaved?: boolean;
  isUploader?: boolean;
}

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [department, setDepartment] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadDept, setUploadDept] = useState(user?.department || 'Computer Science');
  const [uploadYear, setUploadYear] = useState('Year 3');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('notes');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Report modal state
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string } | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (department !== 'all') q.append('department', department);
      if (resourceType !== 'all') q.append('resourceType', resourceType);
      if (search.trim()) q.append('search', search.trim());

      const res = await api.get(`/resources?${q.toString()}`);
      if (res.success && res.resources) {
        setResources(res.resources);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [department, resourceType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const handleSaveToggle = async (resourceId: string) => {
    try {
      setResources((prev) =>
        prev.map((r) => (r._id === resourceId ? { ...r, isSaved: !r.isSaved } : r))
      );
      await api.post(`/resources/${resourceId}/save`);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDownload = async (resource: ResourceItem) => {
    try {
      await api.post(`/resources/${resource._id}/download`);
      setResources((prev) =>
        prev.map((r) =>
          r._id === resource._id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r
        )
      );
      window.open(resource.fileUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      setResources((prev) => prev.filter((r) => r._id !== resourceId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setIsUploading(true);

    try {
      let finalFileUrl = externalUrl;
      let finalFileName = 'External_Resource_Link.pdf';
      let finalFileSize = 1024 * 500;
      let finalMimeType = 'application/pdf';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/upload?folder=resources', formData);
        if (uploadRes.success && uploadRes.file) {
          finalFileUrl = uploadRes.file.url;
          finalFileName = uploadRes.file.originalName;
          finalFileSize = uploadRes.file.size;
          finalMimeType = uploadRes.file.mimeType;
        }
      }

      if (!finalFileUrl) {
        throw new Error('Please select a file to upload or enter a resource link.');
      }

      const res = await api.post('/resources', {
        title: title.trim(),
        description: description.trim(),
        department: uploadDept,
        academicYear: uploadYear,
        subject: subject.trim(),
        resourceType: type,
        fileUrl: finalFileUrl,
        fileName: finalFileName,
        fileSize: finalFileSize,
        mimeType: finalMimeType,
      });

      if (res.success && res.resource) {
        setResources((prev) => [res.resource, ...prev]);
        setUploadModalOpen(false);
        setTitle('');
        setDescription('');
        setSubject('');
        setFile(null);
        setExternalUrl('');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload academic resource.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isModOrAdmin = user?.role === 'moderator' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Academic Resources Library
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Searchable notes, previous-year question papers (PYQs), and study guides contributed by
            students of {user?.college?.name}.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Copyright Guidance Alert */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Academic Integrity & Copyright:</span> Please upload only student-authored notes, study summaries, and authorized reference materials. Do not distribute copyrighted textbook scans or confidential examination content.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject name, title, or exam codes (e.g. CS302, Calculus)..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          />
        </form>

        {/* Department Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
          </select>

          {/* Resource Type Filter */}
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          >
            <option value="all">All Types</option>
            <option value="notes">Notes</option>
            <option value="pyq">Past Year Papers (PYQ)</option>
            <option value="study_guide">Study Guides</option>
            <option value="syllabus">Syllabus & Lab Manuals</option>
            <option value="reference">Reference Links</option>
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study resources uploaded yet"
          description="Help your fellow classmates by uploading course notes, syllabus guides, or past solved papers."
          actionLabel="Upload First Resource"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const typeLabels: Record<string, { label: string; color: string }> = {
              notes: { label: 'Lecture Notes', color: 'bg-brand-50 text-brand-700 border-brand-200' },
              pyq: { label: 'Past Papers (PYQ)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              study_guide: { label: 'Study Guide', color: 'bg-tealAccent-50 text-tealAccent-700 border-tealAccent-200' },
              syllabus: { label: 'Syllabus / Lab', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              reference: { label: 'Reference Material', color: 'bg-slate-100 text-slate-700 border-slate-200' },
            };

            const typeConfig = typeLabels[res.resourceType] || typeLabels.notes;

            return (
              <div
                key={res._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeConfig.color}`}
                    >
                      {typeConfig.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSaveToggle(res._id)}
                        className={`p-1 transition-colors ${
                          res.isSaved ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
                        }`}
                        title="Save resource"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${res.isSaved ? 'fill-brand-600 text-brand-600' : ''}`}
                        />
                      </button>

                      <button
                        onClick={() => setReportTarget({ id: res._id, title: res.title })}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Report resource"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>

                      {(res.isUploader || isModOrAdmin) && (
                        <button
                          onClick={() => handleDeleteResource(res._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{res.title}</h3>
                  <p className="text-[11px] font-semibold text-brand-700 mt-0.5">{res.subject}</p>
                  <p className="text-[11px] text-slate-500">
                    {res.department} • {res.academicYear}
                  </p>

                  {res.description && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <p className="truncate max-w-[120px]">By {res.uploader?.name}</p>
                    <p>{formatFileSize(res.fileSize)}</p>
                  </div>

                  <button
                    onClick={() => handleDownload(res)}
                    className="px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-600" />
                    <span>Download ({res.downloadsCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Resource Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Academic Study Material"
        description="Share course notes, syllabus guidelines, or previous exams with your college."
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resource Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS302 Distributed Systems: Midterm Summary Notes"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={uploadDept}
                onChange={(e) => setUploadDept(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Year / Semester
              </label>
              <select
                value={uploadYear}
                onChange={(e) => setUploadYear(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject Name or Course Code
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Distributed Systems (CS302)"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              >
                <option value="notes">Lecture Notes</option>
                <option value="pyq">Past Year Exam Papers (PYQ)</option>
                <option value="study_guide">Study Guide / Cheatsheet</option>
                <option value="syllabus">Course Syllabus / Lab Manual</option>
                <option value="reference">Reference Link</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this document cover? Mention specific units or exam dates..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Document File (PDF, DOCX, ZIP, Max 15MB)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Or Reference URL Link (Optional)
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://arxiv.org/..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Publish to Library'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType="resource"
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  );
};
