import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { CampusConnectLogo } from '../../components/common/CampusConnectLogo';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Mail,
  Lock,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronDown,
  PlusCircle,
  Globe,
  MapPin,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';

interface CollegeOption {
  _id: string;
  name: string;
  code: string;
  domains: string[];
  city: string;
  district?: string;
  state: string;
  website?: string;
  institutionType?: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Colleges list & search states
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Registration Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Suggestion Modal States
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestCity, setSuggestCity] = useState('Mathura');
  const [suggestDistrict, setSuggestDistrict] = useState('');
  const [suggestState, setSuggestState] = useState('Uttar Pradesh');
  const [suggestWebsite, setSuggestWebsite] = useState('');
  const [suggestDomain, setSuggestDomain] = useState('');
  const [suggestSubmitterEmail, setSuggestSubmitterEmail] = useState('');
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Colleges from Backend
  useEffect(() => {
    async function loadColleges() {
      try {
        const res = await api.get('/auth/colleges');
        if (res.success && res.colleges) {
          setColleges(res.colleges);
          if (res.colleges.length > 0 && !selectedCollegeId) {
            setSelectedCollegeId(res.colleges[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load colleges:', err);
      }
    }
    loadColleges();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCollege = colleges.find((c) => c._id === selectedCollegeId);

  // Filtered colleges by City and Search Query
  const filteredColleges = colleges.filter((c) => {
    const matchesCity =
      selectedCityFilter === 'All' ||
      c.city.toLowerCase() === selectedCityFilter.toLowerCase();

    const query = collegeSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      (c.district && c.district.toLowerCase().includes(query)) ||
      c.domains.some((d) => d.toLowerCase().includes(query));

    return matchesCity && matchesSearch;
  });

  // Real-time email domain validation helper
  const enteredEmailDomain = email.includes('@') ? email.split('@')[1]?.toLowerCase().trim() : '';
  const isDomainMatching =
    selectedCollege && enteredEmailDomain
      ? selectedCollege.domains.some(
          (d) =>
            enteredEmailDomain === d.toLowerCase() ||
            enteredEmailDomain.endsWith(`.${d.toLowerCase()}`)
        )
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCollegeId) {
      setError('Please select your college or university from the list.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the CampusConnect Community Guidelines & Terms.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        collegeId: selectedCollegeId,
      });

      if (res.success) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your college email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSuggestionModal = (prefillName = '') => {
    setSuggestName(prefillName || collegeSearch);
    setSuggestSubmitterEmail(email || '');
    setSuggestError(null);
    setSuggestSuccess(false);
    setIsDropdownOpen(false);
    setSuggestionModalOpen(true);
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestError(null);
    setSuggestSubmitting(true);

    try {
      const res = await api.post('/auth/college-suggestions', {
        name: suggestName,
        city: suggestCity,
        district: suggestDistrict || undefined,
        state: suggestState,
        website: suggestWebsite || undefined,
        domain: suggestDomain || undefined,
        submitterEmail: suggestSubmitterEmail,
      });

      if (res.success) {
        setSuggestSuccess(true);
        setTimeout(() => {
          setSuggestionModalOpen(false);
          setSuggestSuccess(false);
          setSuggestName('');
          setSuggestWebsite('');
          setSuggestDomain('');
        }, 2200);
      }
    } catch (err: any) {
      setSuggestError(err.message || 'Failed to submit suggestion.');
    } finally {
      setSuggestSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <Link to="/" className="inline-block mb-3">
          <CampusConnectLogo size="lg" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Join Your Verified Campus Community
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto">
          Official student-exclusive network for colleges across Mathura, Noida, Greater Noida, and beyond.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Searchable College Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your College / University
              </label>

              {/* Selected Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full pl-3.5 pr-9 py-2.5 text-left text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Building className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  {selectedCollege ? (
                    <span className="font-semibold text-slate-900 truncate">
                      {selectedCollege.name} ({selectedCollege.city})
                    </span>
                  ) : (
                    <span className="text-slate-400">Search or select institution...</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>

              {/* Dropdown Menu Overlay */}
              {isDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* City Filter Pills */}
                  <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                    {['All', 'Mathura', 'Noida', 'Greater Noida'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCityFilter(city)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex-shrink-0 ${
                          selectedCityFilter === city
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {city === 'All' ? 'All Campuses' : city}
                      </button>
                    ))}
                  </div>

                  {/* Search Input Inside Dropdown */}
                  <div className="p-2.5 border-b border-slate-100 relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      placeholder="Type college name, code, or city (e.g. GLA, JIIT, Sharda)..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                    />
                  </div>

                  {/* List of Colleges */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredColleges.length === 0 ? (
                      <div className="p-4 text-center space-y-2">
                        <p className="text-xs text-slate-500">No matching colleges found.</p>
                        <button
                          type="button"
                          onClick={() => handleOpenSuggestionModal(collegeSearch)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-semibold transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Suggest "{collegeSearch || 'My College'}"</span>
                        </button>
                      </div>
                    ) : (
                      filteredColleges.map((c) => {
                        const isSelected = c._id === selectedCollegeId;
                        return (
                          <div
                            key={c._id}
                            onClick={() => {
                              setSelectedCollegeId(c._id);
                              setIsDropdownOpen(false);
                            }}
                            className={`p-3 cursor-pointer text-left transition-colors flex items-start justify-between gap-3 ${
                              isSelected ? 'bg-brand-50/80' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {c.name}
                                </span>
                                {c.code && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                    {c.code}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{c.city}, {c.state}</span>
                                {c.institutionType && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-400">{c.institutionType}</span>
                                  </>
                                )}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {c.domains.map((d) => (
                                  <span
                                    key={d}
                                    className="px-1.5 py-0.2 bg-brand-50 text-brand-700 text-[10px] font-medium rounded border border-brand-100"
                                  >
                                    @{d}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Missing College Action Footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Cannot find your campus?</span>
                    <button
                      type="button"
                      onClick={() => handleOpenSuggestionModal()}
                      className="text-brand-600 hover:text-brand-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>My college isn't listed</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Selected College Domain Badge & Website */}
              {selectedCollege && (
                <div className="mt-2 p-2.5 rounded-xl bg-brand-50/70 border border-brand-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-brand-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                    <span>
                      Approved Domains:{' '}
                      <strong className="font-bold">
                        {selectedCollege.domains.map((d) => `@${d}`).join(', ')}
                      </strong>
                    </span>
                  </div>
                  {selectedCollege.website && (
                    <a
                      href={selectedCollege.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-1 self-start sm:self-auto text-[10px]"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Official Site</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 transition-colors"
                />
              </div>
            </div>

            {/* College Email with live domain validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Institutional College Email
                </label>
                <span className="text-[10px] text-slate-400 font-normal">
                  Must end in @{selectedCollege?.domains[0] || 'domain.edu'}
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student@${selectedCollege?.domains[0] || 'apex.edu'}`}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 transition-colors"
                />
              </div>

              {/* Dynamic email domain validation feedback */}
              {enteredEmailDomain && selectedCollege && (
                <div className="mt-1.5">
                  {isDomainMatching ? (
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Valid institutional email format for {selectedCollege.name}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        Domain "@{enteredEmailDomain}" does not match approved domains:{' '}
                        {selectedCollege.domains.map((d) => `@${d}`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Honor Code Checkbox */}
            <div className="flex items-start gap-2 pt-1.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-slate-300"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight">
                I agree to the{' '}
                <span className="font-semibold text-slate-800">CampusConnect Honor Code</span>, Student
                Safety Guidelines, and Institutional Verification Policies.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{isLoading ? 'Verifying Institution...' : 'Continue to Email Verification'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <p className="text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
                Sign in here
              </Link>
            </p>
            <button
              type="button"
              onClick={() => handleOpenSuggestionModal()}
              className="text-slate-500 hover:text-brand-600 text-[11px] flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Missing your university?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggest College Modal */}
      <Modal
        isOpen={suggestionModalOpen}
        onClose={() => setSuggestionModalOpen(false)}
        title="Suggest Your College or University"
        description="Help us expand CampusConnect. Submitted institutions are reviewed and verified by campus administrators."
      >
        {suggestSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Institution Submitted for Review</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you! Our administrative team will verify the institutional domains and add your campus
              to the directory.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitSuggestion} className="space-y-3.5">
            {suggestError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{suggestError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Official College / University Name *
              </label>
              <input
                type="text"
                required
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                placeholder="e.g., Rajiv Gandhi Institute of Technology"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={suggestCity}
                  onChange={(e) => setSuggestCity(e.target.value)}
                  placeholder="e.g., Mathura, Noida, Greater Noida"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District / Region</label>
                <input
                  type="text"
                  value={suggestDistrict}
                  onChange={(e) => setSuggestDistrict(e.target.value)}
                  placeholder="e.g., Mathura or Gautam Buddha Nagar"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Website (optional)</label>
                <input
                  type="url"
                  value={suggestWebsite}
                  onChange={(e) => setSuggestWebsite(e.target.value)}
                  placeholder="https://www.college.ac.in"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email Domain
                </label>
                <input
                  type="text"
                  value={suggestDomain}
                  onChange={(e) => setSuggestDomain(e.target.value)}
                  placeholder="e.g., college.ac.in or college.edu.in"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Contact Email (for updates) *
              </label>
              <input
                type="email"
                required
                value={suggestSubmitterEmail}
                onChange={(e) => setSuggestSubmitterEmail(e.target.value)}
                placeholder="your.email@college.ac.in"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSuggestionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={suggestSubmitting}
                className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {suggestSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
