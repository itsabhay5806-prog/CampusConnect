import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CampusConnectLogo } from '../../components/common/CampusConnectLogo';
import { KeyRound, ArrowRight, AlertCircle, RefreshCw, Sparkles, CheckCircle2, Mail } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Dev OTP inspect helper
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleFetchDevOtp = async (targetEmail?: string) => {
    const queryEmail = (targetEmail || email).trim().toLowerCase();
    if (!queryEmail) return;
    try {
      const res = await api.get(`/auth/dev-otp?email=${encodeURIComponent(queryEmail)}`);
      if (res.alreadyVerified) {
        setSuccessMsg('Account is already verified! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      if (res.otp) {
        setDevOtp(res.otp);
        setOtp(res.otp);
      } else {
        setDevOtp(null);
      }
    } catch {
      setDevOtp(null);
    }
  };

  // Auto-fetch dev OTP on mount if email parameter is supplied
  useEffect(() => {
    if (email) {
      handleFetchDevOtp(email);
    }
  }, [email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setError('Please provide your college email address.');
      return;
    }
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        setSuccessMsg(res.message || 'Email successfully verified!');
        setTimeout(() => {
          if (res.user.isOnboarded) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (cooldown > 0 || !cleanEmail) return;
    setError(null);
    try {
      const res = await api.post('/auth/resend-otp', { email: cleanEmail });
      setSuccessMsg(res.message || 'Fresh verification code dispatched.');
      setCooldown(60);
      setTimeout(() => handleFetchDevOtp(cleanEmail), 400);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4">
          <CampusConnectLogo size="lg" />
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Verify College Email
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          We sent a 6-digit verification code to confirm your institutional email.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Development Helper Box */}
        <div className="mb-4 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-start gap-2 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Development Mode (Local Test)</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {devOtp ? (
                  <>Your verification code is: <strong className="font-mono bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950 font-bold tracking-widest text-xs">{devOtp}</strong></>
                ) : (
                  'Code logged to server terminal & Ethereal test inbox.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (devOtp) {
                setOtp(devOtp);
              } else {
                handleFetchDevOtp();
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition shadow-xs flex-shrink-0 text-center"
          >
            {devOtp ? 'Auto-Fill Code' : 'Fetch Dev Code'}
          </button>
        </div>

        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email Address
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (text) {
                      e.preventDefault();
                      setOtp(text);
                    }
                  }}
                  placeholder="123456"
                  className="w-full pl-9 pr-3.5 py-2.5 text-center tracking-[0.5em] font-mono text-base font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Confirm Verification'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Didn’t get the email?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

