import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Compass,
  BookOpen,
  SearchCheck,
  Users,
  Code2,
  MessageSquare,
  Bell,
  Bookmark,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isModOrAdmin = user?.role === 'moderator' || user?.role === 'admin';

  const navLinks = [
    { name: 'Campus Feed', to: '/app/feed', icon: Home },
    { name: 'Discover', to: '/app/discover', icon: Compass },
    { name: 'Academic Resources', to: '/app/resources', icon: BookOpen },
    { name: 'Lost & Found', to: '/app/lost-found', icon: SearchCheck },
    { name: 'Communities', to: '/app/communities', icon: Users },
    { name: 'Projects & Teams', to: '/app/projects', icon: Code2 },
    { name: 'Messages', to: '/app/messages', icon: MessageSquare },
    { name: 'Notifications', to: '/app/notifications', icon: Bell },
    { name: 'Saved Items', to: '/app/saved', icon: Bookmark },
    { name: 'My Profile', to: '/app/profile', icon: User },
    { name: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {isModOrAdmin && (
          <div className="pt-3 mt-3 border-t border-slate-100">
            <span className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Moderation
            </span>
            <NavLink
              to="/app/moderation"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 mt-1 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-800 font-bold'
                    : 'text-amber-700 hover:bg-amber-50/60'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Safety & Reports</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* College Info Card */}
      <div className="mt-auto pt-4">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
          <p className="text-[11px] font-bold text-slate-700 truncate">{user?.college?.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified Student Domain</p>
        </div>
      </div>
    </aside>
  );
};
