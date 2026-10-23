import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CampusConnectLogo } from '../common/CampusConnectLogo';
import {
  Search,
  Bell,
  CheckCircle2,
  LogOut,
  User,
  Settings,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isModOrAdmin = user?.role === 'moderator' || user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & College Badge */}
        <div className="flex items-center gap-4">
          <Link to="/app/feed" className="flex items-center">
            <CampusConnectLogo size="sm" />
          </Link>

          {user?.college && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200/60 rounded-full text-xs font-semibold text-brand-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span className="truncate max-w-[180px]">{user.college.name}</span>
            </div>
          )}
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, resources, projects, communities..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-brand-500 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 placeholder-slate-400"
          />
        </form>

        {/* Right: Actions & User Avatar Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/app/notifications"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <img
                src={
                  user?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1e3a8a&color=fff`
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100"
              />
              <span className="hidden lg:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-brand-50 text-brand-700">
                      {user?.role}
                    </span>
                  </div>

                  <Link
                    to="/app/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>

                  <Link
                    to="/app/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>

                  {isModOrAdmin && (
                    <Link
                      to="/app/moderation"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Moderation Dashboard
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
