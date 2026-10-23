import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CampusConnectLogo } from '../../components/common/CampusConnectLogo';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        if (!res.user.isOnboarded) {
          navigate('/onboarding');
        } else {
          navigate('/app/feed');
        }
      }
    } catch (err: any) {
      if (err.data?.needsVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(err.data.email)}`);
      } else {
        setError(err.message || 'Invalid college email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo account quick filler for easy review
  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4">
          <CampusConnectLogo size="lg" />
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Campus
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter your verified college email address to access your campus dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Demo Fast-Login Toolbar */}
        <div className="mb-4 p-3 bg-brand-50/80 border border-brand-200/60 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Quick Demo Credentials (Password: Password123!)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('alex.chen@apex.edu')}
              className="px-2 py-1.5 bg-white border border-brand-200 hover:bg-brand-100/50 rounded-lg text-left truncate transition-colors"
            >
              <span className="font-bold text-brand-900">Student Alex</span>
              <p className="text-[10px] text-slate-500 truncate">alex.chen@apex.edu</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('maya.patel@apex.edu')}
              className="px-2 py-1.5 bg-white border border-brand-200 hover:bg-brand-100/50 rounded-lg text-left truncate transition-colors"
            >
              <span className="font-bold text-brand-900">Student Maya (UI/UX)</span>
              <p className="text-[10px] text-slate-500 truncate">maya.patel@apex.edu</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('moderator@apex.edu')}
              className="px-2 py-1.5 bg-white border border-amber-200 hover:bg-amber-100/50 rounded-lg text-left truncate transition-colors"
            >
              <span className="font-bold text-amber-900">Peer Moderator</span>
              <p className="text-[10px] text-slate-500 truncate">moderator@apex.edu</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@apex.edu')}
              className="px-2 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-left truncate transition-colors"
            >
              <span className="font-bold text-slate-900">Campus Admin</span>
              <p className="text-[10px] text-slate-500 truncate">admin@apex.edu</p>
            </button>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@apex.edu"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to CampusConnect?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                Join your college community
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
