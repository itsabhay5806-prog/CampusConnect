import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Settings,
  Lock,
  Eye,
  Shield,
  Bell,
  Check,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState<string>(
    user?.privacySettings?.profileVisibility || 'college'
  );
  const [showEmail, setShowEmail] = useState<boolean>(
    user?.privacySettings?.showEmail ?? false
  );
  const [allowDirectMessages, setAllowDirectMessages] = useState<boolean>(
    user?.privacySettings?.allowDirectMessages ?? true
  );
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post('/user/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({
        text: err.message || 'Failed to change password.',
        type: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSavingPrivacy(true);
    try {
      const res = await api.put('/user/profile', {
        privacySettings: {
          profileVisibility,
          showEmail,
          allowDirectMessages,
        },
      });
      if (res.success && res.user) {
        updateUser(res.user);
        setPrivacySuccess(true);
        setTimeout(() => setPrivacySuccess(false), 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update privacy settings');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, directory visibility, and interaction preferences.
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand-600" />
          Campus Privacy & Visibility
        </h2>

        {privacySuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Privacy settings updated!
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Profile Visibility</label>
            <select
              value={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            >
              <option value="college">Verified College Only (Default - Recommended)</option>
              <option value="public">CampusConnect Network (Cross-Campus)</option>
              <option value="private">Private (Only name visible in comments)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Show Email on Profile</p>
              <p className="text-slate-500 text-[11px]">
                Allow verified classmates to see your institutional email address.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showEmail}
              onChange={(e) => setShowEmail(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Allow Direct Messages</p>
              <p className="text-slate-500 text-[11px]">
                Receive 1-on-1 private messages from verified classmates.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowDirectMessages}
              onChange={(e) => setAllowDirectMessages(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSavePrivacy}
              disabled={isSavingPrivacy}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {isSavingPrivacy ? 'Saving...' : 'Save Privacy Preferences'}
            </button>
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" />
          Change Password
        </h2>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
