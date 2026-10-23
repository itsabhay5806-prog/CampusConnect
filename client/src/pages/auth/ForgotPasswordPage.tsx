import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CampusConnectLogo } from '../../components/common/CampusConnectLogo';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.devToken) {
        setDevToken(res.devToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4">
          <CampusConnectLogo size="lg" />
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter your registered college email to receive a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Check Your Email</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                If an account matches <span className="font-semibold text-slate-700">{email}</span>, we have sent instructions to reset your password.
              </p>

              {devToken && (
                <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-xl text-left">
                  <p className="text-[11px] font-bold text-brand-900">Local Dev Testing Reset Link:</p>
                  <Link
                    to={`/reset-password?token=${devToken}&email=${encodeURIComponent(email)}`}
                    className="text-xs font-semibold text-brand-600 underline break-all mt-1 block"
                  >
                    Click to proceed with dev password reset →
                  </Link>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered College Email
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel and return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
