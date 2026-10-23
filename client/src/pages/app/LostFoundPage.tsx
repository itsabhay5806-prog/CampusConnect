import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { ReportModal } from '../../components/common/ReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  SearchCheck,
  Plus,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Image as ImageIcon,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface LostFoundItem {
  _id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: 'electronics' | 'id_cards' | 'keys' | 'books' | 'clothing' | 'other';
  campusLocation: string;
  incidentDate: string;
  imageUrl?: string;
  contactPreference: 'in_app_chat' | 'moderator_desk';
  status: 'open' | 'matched' | 'resolved';
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
    department?: string;
  };
  createdAt: string;
  isAuthor?: boolean;
}

export const LostFoundPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('open');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create Listing Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [listingType, setListingType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingCategory, setListingCategory] = useState<string>('electronics');
  const [campusLocation, setCampusLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // In-app Inquiry Modal
  const [contactModalItem, setContactModalItem] = useState<LostFoundItem | null>(null);
  const [inquiryText, setInquiryText] = useState('');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  // Report Modal
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string } | null>(null);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (activeTab !== 'all') q.append('type', activeTab);
      if (category !== 'all') q.append('category', category);
      if (status !== 'all') q.append('status', status);
      if (search.trim()) q.append('search', search.trim());

      const res = await api.get(`/lost-found?${q.toString()}`);
      if (res.success && res.listings) {
        setItems(res.listings);
      }
    } catch (err) {
      console.error('Failed to load lost and found items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [activeTab, category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/lost-found', {
        type: listingType,
        title: title.trim(),
        description: description.trim(),
        category: listingCategory,
        campusLocation: campusLocation.trim(),
        incidentDate,
        imageUrl: imageUrl.trim() || undefined,
        contactPreference: 'in_app_chat',
      });

      if (res.success && res.listing) {
        setItems((prev) => [res.listing, ...prev]);
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setCampusLocation('');
        setImageUrl('');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to report listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async (itemId: string) => {
    try {
      const res = await api.patch(`/lost-found/${itemId}/status`, { status: 'resolved' });
      if (res.success) {
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? { ...item, status: 'resolved' } : item))
        );
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactModalItem) return;

    setIsSendingInquiry(true);
    try {
      const res = await api.post(`/lost-found/${contactModalItem._id}/contact`, {
        messageText: inquiryText.trim(),
      });
      if (res.success) {
        setContactModalItem(null);
        setInquiryText('');
        navigate('/app/messages');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch inquiry.');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <SearchCheck className="w-5 h-5 text-coralAccent-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Campus Lost and Found
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Report missing possessions or post items found across campus grounds.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-coralAccent-600 hover:bg-coralAccent-700 rounded-xl shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Safe Contact Workflow Notice */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/70 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Student Privacy Protected:</span> Phone numbers and personal emails are never exposed publicly. Inquiries are handled seamlessly via authenticated in-app student chat.
        </p>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type Toggle Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'lost', label: '🔍 Lost Items' },
            { id: 'found', label: '📦 Found Items' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item, location (e.g. Library, AirPods)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          />
        </form>

        {/* Category & Status Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="id_cards">ID Cards & Wallets</option>
            <option value="keys">Keys & Lanyards</option>
            <option value="books">Books & Notebooks</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Only</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={SearchCheck}
          title="No lost or found items reported"
          description="Everything seems to be accounted for! If you lost or found something on campus, report it here."
          actionLabel="Report An Item"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isLost = item.type === 'lost';
            const isResolved = item.status === 'resolved';

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between ${
                  isResolved ? 'opacity-70 border-slate-200' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isLost
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {item.type} Item
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>

                      <button
                        onClick={() => setReportTarget({ id: item._id, title: item.title })}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Report suspicious listing"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.campusLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{new Date(item.incidentDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {item.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden h-36 border border-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">By {item.author?.name}</span>

                  <div className="flex items-center gap-2">
                    {item.isAuthor ? (
                      !isResolved && (
                        <button
                          onClick={() => handleMarkResolved(item._id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Resolved</span>
                        </button>
                      )
                    ) : (
                      !isResolved && (
                        <button
                          onClick={() => {
                            setContactModalItem(item);
                            setInquiryText(
                              `Hi ${item.author?.name}, I am reaching out regarding your ${item.type} item listing: "${item.title}".`
                            );
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contact Owner</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Listing Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Report Lost or Found Item"
        description="Help return lost items to students safely."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Listing Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setListingType('lost')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  listingType === 'lost'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                I Lost An Item
              </button>
              <button
                type="button"
                onClick={() => setListingType('found')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  listingType === 'found'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                I Found An Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Item Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apple AirPods Pro (Black Spigen Case)"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={listingCategory}
                onChange={(e) => setListingCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              >
                <option value="electronics">Electronics (Laptop, Phone, Headphones)</option>
                <option value="id_cards">College ID / Wallet / Cards</option>
                <option value="keys">Keys & Lanyards</option>
                <option value="books">Books & Notebooks</option>
                <option value="clothing">Jackets & Clothing</option>
                <option value="other">Other Items</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Approximate Date
              </label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Campus Location
            </label>
            <input
              type="text"
              required
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              placeholder="e.g. Central Library 2nd Floor, or Student Union Cafeteria"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Detailed Description & Distinguishing Features
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, stickers, scratch marks, or where it can be claimed..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Photo URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
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
              className="px-4 py-2 text-xs font-bold text-white bg-coralAccent-600 hover:bg-coralAccent-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Inquire / Contact Owner */}
      <Modal
        isOpen={Boolean(contactModalItem)}
        onClose={() => setContactModalItem(null)}
        title="Contact Listing Owner"
        description={contactModalItem ? `Regarding "${contactModalItem.title}"` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Send an inquiry to <span className="font-bold text-slate-900">{contactModalItem?.author?.name}</span>. A private conversation thread will be established in your Messages.
          </p>

          <textarea
            rows={3}
            required
            value={inquiryText}
            onChange={(e) => setInquiryText(e.target.value)}
            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          />

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setContactModalItem(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSendingInquiry}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isSendingInquiry ? 'Sending...' : 'Send Inquiry'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType="lost_found"
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  );
};
